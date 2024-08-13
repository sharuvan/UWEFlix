from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from accounts.models import User
from cinema.models import Film, Screen, Showing

class FilmTests(APITestCase):
    def setUp(self):
        self.cinema_manager = User.objects.create_user(
            username="cinemamanager",
            password="password123",
            user_type="cinema_manager"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.cinema_manager)

    def test_create_film(self):
        url = reverse('film-list')
        data = {
            "title": "Inception",
            "age_rating": "PG-13",
            "duration": 148,
            "trailer_description": "A mind-bending thriller",
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Inception')


class ShowingTests(APITestCase):
    def setUp(self):
        self.cinema_manager = User.objects.create_user(
            username="cinemamanager",
            password="password123",
            user_type="cinema_manager"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.cinema_manager)
        self.film = Film.objects.create(
            title="Inception",
            age_rating="PG-13",
            duration=148,
            trailer_description="A mind-bending thriller"
        )
        self.screen = Screen.objects.create(
            number="1",
            seat_rows=10,
            seat_columns=10
        )

    def test_create_showing(self):
        url = reverse('showing-list')
        data = {
            "film": self.film.id,
            "screen": self.screen.id,
            "show_time": "2024-08-01T20:00:00Z",
            "ticket_price": 10.00
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['film']['id'], self.film.id)
        self.assertEqual(response.data['screen']['id'], self.screen.id)