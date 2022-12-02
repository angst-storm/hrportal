import json

from django.test import TestCase, Client

from .test_reg_auth import UserData
from ..models import *


class DepartmentTests(TestCase):
    employee_data = UserData('employee', 'employee@hrportal.com', 'password')
    manager_data = UserData('manager', 'manager@hrportal.com', 'password')
    admin_data = UserData('admin', 'admin@hrportal.com', 'password')

    @classmethod
    def setUpTestData(cls):
        User.objects.create_user(**cls.employee_data.__dict__)
        manager = User.objects.create_user(**cls.manager_data.__dict__)
        User.objects.create_superuser(**cls.admin_data.__dict__)
        Department.objects.create(name="department").save()
        Department.objects.create(name="department_with_manager", manager=manager).save()

    def setUp(self):
        self.client = Client()

    def test_GetDepartments_ShouldRaise403_onUnauthorizedClient(self):
        response = self.client.get('/departments/')

        self.assertEqual(response.status_code, 403)
        detail = json.loads(*response)['detail']
        self.assertEqual(detail, 'Authentication credentials were not provided.')

    def test_GetDepartments_ShouldGetDepartmentsInfo(self):
        self.login_user(self.client, self.employee_data)

        response = self.client.get('/departments/')

        self.assertEqual(response.status_code, 200)

    def test_PostDepartments_ShouldRaise403_onUnauthorizedClient(self):
        response = self.client.post('/departments/')

        self.assertEqual(response.status_code, 403)
        detail = json.loads(*response)['detail']
        self.assertEqual(detail, 'Authentication credentials were not provided.')

    def test_PostDepartments_ShouldRaise403_onManager(self):
        self.login_user(self.client, self.manager_data)

        response = self.client.post('/departments/')

        self.assertEqual(response.status_code, 403)
        detail = json.loads(*response)['detail']
        self.assertEqual(detail, 'You do not have permission to perform this action.')

    def test_PostDepartments_ShouldRaiseValidationError_onBlankData(self):
        self.login_user(self.client, self.admin_data)

        response = self.client.post('/departments/')

        self.assertEqual(response.status_code, 400)
        errors = json.loads(*response)
        self.assertEqual(errors['name'][0], 'This field is required.')

    def test_PostDepartments_ShouldRaiseValidationError_OnUserWhoIsAlreadyManager(self):
        manager = User.objects.get(email=self.manager_data.email)
        self.login_user(self.client, self.admin_data)

        response = self.client.post('/departments/', {
            'name': 'test_PostDepartments_ShouldRaiseValidationError_WithUserWhoIsAlreadyManager',
            'managerId': manager.id})

        self.assertEqual(response.status_code, 400)
        errors = json.loads(*response)
        self.assertEqual(errors['managerId'][0], '')

    def test_PostDepartments_ShouldRaiseValidationError_OnNonExistentUser(self):
        non_existent_id = User.objects.all().last().id + 1
        self.login_user(self.client, self.admin_data)

        response = self.client.post('/departments/', {
            'name': 'test_PostDepartments_ShouldRaiseValidationError_WithUserWhoIsAlreadyManager',
            'managerId': non_existent_id})

        self.assertEqual(response.status_code, 400)
        errors = json.loads(*response)
        self.assertEqual(errors['managerId'][0], '')

    def test_PostDepartments_ShouldCreateDepartment_WithoutManager(self):
        self.login_user(self.client, self.admin_data)

        response = self.client.post('/departments/',
                                    {'name': 'test_PostDepartments_ShouldCreateDepartment_WithoutManager'})

        self.assertEqual(response.status_code, 201)
        department = Department.objects.last()
        self.assertEqual(department.name, 'test_PostDepartments_ShouldCreateDepartment_WithoutManager')
        self.assertIsNone(department.manager)
        department.delete()

    def test_PostDepartments_ShouldCreateDepartment_OnUserWhoIsNotManager(self):
        employee = User.objects.get(email=self.employee_data.email)
        self.login_user(self.client, self.admin_data)

        response = self.client.post('/departments/',
                                    {'name': 'test_PostDepartments_ShouldCreateDepartment_WithUserWhoIsNotManager',
                                     'managerId': employee.id})

        self.assertEqual(response.status_code, 201)
        self.assertTrue(hasattr(employee, 'department'))
        self.assertEqual(employee.department.name,
                         'test_PostDepartments_ShouldCreateDepartment_WithUserWhoIsNotManager')
        employee.department.delete()

    def test_GetDepartmentByPk_ShouldRaise403_OnUnauthorizedClient(self):
        response = self.client.get(f'/departments/{self.get_existing_department_id()}/')

        self.assertEqual(response.status_code, 403)
        detail = json.loads(*response)['detail']
        self.assertEqual(detail, 'Authentication credentials were not provided.')

    def test_GetDepartmentByPk_ShouldRaise403_onManager(self):
        self.login_user(self.client, self.manager_data)

        response = self.client.post('/departments/')

        self.assertEqual(response.status_code, 403)
        detail = json.loads(*response)['detail']
        self.assertEqual(detail, 'You do not have permission to perform this action.')

    def test_GetDepartmentByPk_ShouldRaise404_onNonExistentDepartment(self):
        self.login_user(self.client, self.admin_data)

        response = self.client.get(f'/departments/{self.get_nonexistent_department_id()}/')

        self.assertEqual(response.status_code, 404)
        detail = json.loads(*response)['detail']
        self.assertEqual(detail, 'Not found.')

    def test_GetDepartmentByPk_ShouldGetDepartmentInfo(self):
        self.login_user(self.client, self.admin_data)

        response = self.client.get(f'/departments/{self.get_existing_department_id()}/')

        self.assertEqual(response.status_code, 200)

    def test_DeleteDepartmentByPk_ShouldRaise403_OnUnauthorizedClient(self):
        response = self.client.delete(f'/departments/{self.get_existing_department_id()}/')

        self.assertEqual(response.status_code, 403)
        detail = json.loads(*response)['detail']
        self.assertEqual(detail, 'Authentication credentials were not provided.')

    def test_DeleteDepartmentByPk_ShouldRaise403_onManager(self):
        self.login_user(self.client, self.manager_data)

        response = self.client.delete(f'/departments/{self.get_existing_department_id()}/')

        self.assertEqual(response.status_code, 403)
        detail = json.loads(*response)['detail']
        self.assertEqual(detail, 'You do not have permission to perform this action.')

    def test_DeleteDepartmentByPk_ShouldRaise404_onNonExistentDepartment(self):
        self.login_user(self.client, self.admin_data)

        response = self.client.delete(f'/departments/{self.get_nonexistent_department_id()}/')

        self.assertEqual(response.status_code, 404)
        detail = json.loads(*response)['detail']
        self.assertEqual(detail, 'Not found.')

    def test_DeleteDepartmentByPk_ShouldDeleteDepartment(self):
        department = Department.objects.create(name='test_DeleteDepartmentByPk_ShouldDeleteDepartment')
        department.save()
        self.login_user(self.client, self.admin_data)

        response = self.client.delete(f'/departments/{department.id}/')

        self.assertEqual(response.status_code, 204)
        try:
            department = Department.objects.get(id=department.id)
        except Department.DoesNotExist:
            department = None
        self.assertIsNone(department)

    @staticmethod
    def get_existing_department_id():
        return Department.objects.all().first().id

    @staticmethod
    def get_nonexistent_department_id():
        return Department.objects.all().last().id + 1

    @staticmethod
    def login_user(client, user_data):
        login_data = {'email': user_data.email, 'password': user_data.password}
        client.post('/login/', login_data)
