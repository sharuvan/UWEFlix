from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from accounts.models import User, Account

class UserTests(APITestCase):
    def setUp(self):
        self.cinema_manager = User.objects.create_user(
            username="cinemamanager",
            password="password123",
            user_type="cinema_manager"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.cinema_manager)

    def test_user_creation(self):
        url = reverse('user-create')
        data = {
            "username": "newuser",
            "password": "password123",
            "user_type": "student"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('username', response.data)
        self.assertIn('password', response.data)

class AuthenticationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            password="password123",
            user_type="student"
        )
        self.client = APIClient()

    def test_login(self):
        url = reverse('login')
        data = {
            "username": "testuser",
            "password": "password123",
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_logout(self):
        refresh = self.client.post(reverse('login'), {
            "username": self.user.username,
            "password": "password123"
        }).data["refresh"]
        url = reverse('logout')
        response = self.client.post(url, {"refresh": refresh}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
