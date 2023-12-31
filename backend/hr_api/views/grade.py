from django.utils.decorators import method_decorator
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .shared import forbidden_response, not_found_response, response_with_detail, detail_schema
from ..models import Grade
from ..permissions import IsManagerUser, IsEmployeeOwner
from ..serializers import GradeSerializer, GradePostDataSerializer, GradePatchDataSerializer


@method_decorator(name='list', decorator=swagger_auto_schema(
    tags=['Грейд'],
    operation_summary='Все грейды',
    responses={
        403: forbidden_response
    }
))
@method_decorator(name='create', decorator=swagger_auto_schema(
    tags=['Грейд'],
    operation_summary='Создает грейд',
    responses={
        200: GradeSerializer,
        403: forbidden_response
    }
))
@method_decorator(name='retrieve', decorator=swagger_auto_schema(
    tags=['Грейд'],
    operation_summary='Грейд по ID',
    responses={
        403: forbidden_response,
        404: not_found_response,
    }
))
@method_decorator(name='partial_update', decorator=swagger_auto_schema(
    tags=['Грейд'],
    operation_summary='Изменить грейд по ID',
    responses={
        200: GradeSerializer,
        403: forbidden_response,
        404: not_found_response,
    }
))
@method_decorator(name='destroy', decorator=swagger_auto_schema(
    tags=['Грейд'],
    operation_summary='Удалить грейд по ID',
    responses={
        403: forbidden_response,
        404: not_found_response,
    }
))
class GradeView(ModelViewSet):
    queryset = Grade.objects.all()
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get_permissions(self):
        if self.request.method == 'GET':
            return [(IsEmployeeOwner | IsManagerUser | IsAdminUser)()]
        else:
            return [(IsManagerUser | IsAdminUser)()]

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return GradeSerializer
        elif self.action == 'create':
            return GradePostDataSerializer
        elif self.action == 'partial_update':
            return GradePatchDataSerializer
        else:
            return None

    @swagger_auto_schema(
        tags=['Грейд'],
        operation_summary='Завершает грейд (inWork = false)',
        responses={
            200: 'OK',
            400: openapi.Response(
                'Не удалось завершить грейд, есть незаконченные активности',
                detail_schema
            ),
            403: forbidden_response,
            404: not_found_response
        })
    @action(methods=['patch'], detail=True, url_path='complete', url_name='complete')
    def complete(self, request, pk):
        grade = get_object_or_404(Grade, id=pk)
        if grade.complete():
            return Response(status=status.HTTP_200_OK)
        return response_with_detail('Failed to complete grade', status.HTTP_400_BAD_REQUEST)
