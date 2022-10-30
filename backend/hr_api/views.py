from django.contrib.auth import authenticate
from rest_framework import status, exceptions, generics
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .authentication import JWTAuthentication
from .permissions import IsManagerUser
from .serializers import *


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def registration_view(request):
    serializer = RegistrationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response(status=status.HTTP_201_CREATED)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def login_view(request):
    serializer = AuthSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = authenticate(username=request.data['email'], password=request.data['password'])

    if user is None:
        return response_with_detail('A user with this email and password was not found.',
                                    status.HTTP_401_UNAUTHORIZED)

    if not user.is_active:
        return response_with_detail('This user has been deactivated.', status.HTTP_401_UNAUTHORIZED)

    add_auth(request, user)

    return Response(status=status.HTTP_200_OK)


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def logout_view(request):
    request.session.flush()
    return Response(status=status.HTTP_200_OK)


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def authorized_view(request):
    result = False
    try:
        auth_result = JWTAuthentication().authenticate(request)
        if auth_result is not None:
            result = True
    except exceptions.AuthenticationFailed:
        pass
    return Response({'authorized': result}, status=status.HTTP_200_OK)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def unique_email_view(request):
    serializer = UniqueEmailSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    result = True
    try:
        User.objects.get(email=request.data['email'])
        result = False
    except User.DoesNotExist:
        pass
    return Response({'unique': result}, status=status.HTTP_200_OK)


class UserList(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = GetUserSerializer
    permission_classes = [IsManagerUser | IsAdminUser]


class UserDetail(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = GetUserSerializer
    permission_classes = [IsManagerUser | IsAdminUser]


class AuthorizedUserView(APIView):
    @staticmethod
    def get(request):
        serializer = GetUserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @staticmethod
    def patch(request):
        user = request.user
        put_serializer = PatchUserSerializer(user, data=request.data)
        put_serializer.is_valid(raise_exception=True)
        put_serializer.save()

        add_auth(request, user)
        get_serializer = GetUserSerializer(user)
        return Response(get_serializer.data, status=status.HTTP_200_OK)


class DepartmentList(generics.ListCreateAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        else:
            return [IsAdminUser()]


class DepartmentDetail(generics.RetrieveDestroyAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAdminUser]


class SkillList(generics.ListCreateAPIView):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        else:
            return [IsAdminUser()]


class SkillDetail(generics.RetrieveDestroyAPIView):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsAdminUser]


class ResumeList(generics.ListAPIView):
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer
    permission_classes = [IsManagerUser | IsAdminUser]


class ResumeDetail(generics.RetrieveAPIView):
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer
    permission_classes = [IsManagerUser | IsAdminUser]


class UserResumeView(APIView):
    @staticmethod
    def get(request):
        try:
            resume = request.user.resume
            serializer = ResumeSerializer(resume)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Resume.DoesNotExist:
            return response_with_detail("This employee doesn't have a resume", status.HTTP_404_NOT_FOUND)

    @staticmethod
    def post(request):
        try:
            _ = request.user.resume
            return response_with_detail('This employee already has a resume', status.HTTP_409_CONFLICT)
        except Resume.DoesNotExist:
            request.data['employeeId'] = request.user.id
            serializer = ResumeSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

    @staticmethod
    def patch(request):
        try:
            resume = request.user.resume
            patch_serializer = PatchResumeSerializer(resume, data=request.data)
            patch_serializer.is_valid(raise_exception=True)
            patch_serializer.save()
            serializer = ResumeSerializer(resume)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Resume.DoesNotExist:
            return response_with_detail("This employee doesn't have a resume", status.HTTP_404_NOT_FOUND)

    @staticmethod
    def delete(request):
        try:
            resume = request.user.resume
            resume.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Resume.DoesNotExist:
            return response_with_detail("This employee doesn't have a resume", status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsManagerUser | IsAdminUser])
def resume_response(request, pk):
    resume = Resume.objects.get(id=pk)
    if resume is None:
        return response_with_detail('Resume not found', status.HTTP_404_NOT_FOUND)
    result = sent_resume_response(resume, request.user)
    return response_with_detail(result, status.HTTP_200_OK)


def sent_resume_response(resume, manager):
    text = f"Cотруднику по имени {resume.employee.fullname} с ID={resume.employee.id} " \
           f"отправлен отклик на его резюме на должность {resume.desired_position} с ID={resume.id} " \
           f"от руководителя отдела '{manager.department.name}' c ID={manager.department.id} " \
           f"по имени {manager.fullname} с ID={manager.id}"
    return text


def add_auth(request, user):
    request.session['Authorization'] = f'Bearer {user.token}'


def response_with_detail(message, response_status):
    return Response({'detail': message}, status=response_status)
