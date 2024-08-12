from django.contrib.auth import get_user
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.utils.functional import SimpleLazyObject
from .models import Film, Showing, Ticket, Screen, Seat
# from .forms import TicketForm, BlockTicketForm, ClubForm, AccountForm, FilmForm
from accounts.models import Account, AccountStatement, Club, Transaction, Payment
from decimal import Decimal
from django.http import JsonResponse
from datetime import datetime, timedelta
from .serializers import FilmSerializer, ScreenSerializer, ShowingSerializer, \
    TicketSerializer, SeatSerializer
from rest_framework import viewsets, status, permissions

from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django.conf import settings
from rest_framework.exceptions import ValidationError

class IsAccountManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'account_manager'

class IsCinemaManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'cinema_manager'

def process_payment(cardholder_name, card_number, expiry_date, security_code):
    if not len(cardholder_name): return False
    if not len(card_number): return False
    if not len(expiry_date): return False
    if not len(security_code): return False
    return True

class FilmViewSet(viewsets.ModelViewSet):
    queryset = Film.objects.all()
    serializer_class = FilmSerializer
    permission_classes = [IsCinemaManager]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if Showing.objects.filter(film=instance).exists():
            return Response({
                "error": "Cannot delete film with scheduled showings."
            }, status=status.HTTP_400_BAD_REQUEST)
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

class ScreenViewSet(viewsets.ModelViewSet):
    queryset = Screen.objects.all()
    serializer_class = ScreenSerializer
    permission_classes = [IsCinemaManager]

class ShowingViewSet(viewsets.ModelViewSet):
    queryset = Showing.objects.all()
    serializer_class = ShowingSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        date_str = self.request.query_params.get('date', None)
        if date_str:
            try:
                date = datetime.strptime(date_str, '%Y-%m-%d').date()
                queryset = queryset.filter(show_time__date=date)
            except ValueError:
                raise ValidationError({"error": "Invalid date format. Use YYYY-MM-DD."})
        return queryset

    def perform_create(self, serializer):
        film_id = self.request.data.get('film')
        if not film_id:
            raise ValidationError({"error": "Film ID is required."})

        screen_id = self.request.data.get('screen')
        if not screen_id:
            raise ValidationError({"error": "Screen ID is required."})

        film = get_object_or_404(Film, id=film_id)
        screen = get_object_or_404(Screen, id=screen_id)

        try:
            serializer.save(film=film, screen=screen)
        except Exception as e:
            raise ValidationError({"error": str(e)})

    def perform_update(self, serializer):
        film_id = self.request.data.get('film')
        if not film_id:
            raise ValidationError({"error": "Film ID is required."})

        screen_id = self.request.data.get('screen')
        if not screen_id:
            raise ValidationError({"error": "Screen ID is required."})

        film = get_object_or_404(Film, id=film_id)
        screen = get_object_or_404(Screen, id=screen_id)

        try:
            serializer.save(film=film, screen=screen)
        except Exception as e:
            raise ValidationError({"error": str(e)})
    
    @action(detail=True, methods=['get'])
    def seat_availability(self, request, pk=None):
        showing = self.get_object()
        seats = Seat.objects.filter(ticket__showing=showing)
        unavailable_seats = set((seat.row, seat.column) for seat in seats)

        screen = showing.screen
        rows = range(1, screen.seat_rows + 1)
        columns = range(1, screen.seat_columns + 1)

        result = []

        for row in rows:
            for col in columns:
                if (row, col) in unavailable_seats:
                    status = 'unavailable'
                elif screen.is_social_distancing_on and (
                    (row % 2 == 1 and col % 2 == 0) or (row % 2 == 0 and col % 2 == 1)):
                    status = 'distanced'
                else:
                    status = 'available'
                result.append({'row': row, 'column': col, 'status': status})

        return Response(result)
    
    @action(detail=False, methods=['get'])
    def next_two_weeks(self, request):
        start_date = datetime.now()
        end_date = start_date + timedelta(days=14)
        showings = Showing.objects.filter(show_time__range=[start_date, end_date]).select_related('film')
        serializer = self.get_serializer(showings, many=True)
        return Response(serializer.data)

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        data = request.data
        user = request.user if request.user.is_authenticated else None

        if not user:
            cardholder_name = data.get('cardholder_name')
            card_number = data.get('card_number')
            expiry_date = data.get('expiry_date')
            security_code = data.get('security_code')

            payment_successful = process_payment(cardholder_name, card_number, expiry_date, security_code)
            if not payment_successful:
                return Response({'error': 'Payment failed. Check the payment details'}, status=status.HTTP_200_OK)
            
        showing = Showing.objects.get(id=data['showing'])
        seats = data.get('seats', [])
        quantity = len(seats)
        total_capacity = showing.screen.capacity
        tickets_sold = showing.tickets_sold
        if tickets_sold + int(quantity) > total_capacity:
            return Response({'error': 'Insufficient seats available'}, status=status.HTTP_200_OK)

        ticket = Ticket.objects.create(
            showing=showing,
            user=request.user if not request.user.is_anonymous else None,
            ticket_type=data['ticket_type'],
            quantity=quantity,
        )

        if user:
            try:
                account = Account.objects.get(user=user)
            except Account.DoesNotExist:
                return Response({'error': 'No associated account found for the user'},
                    status=status.HTTP_200_OK)
            Transaction.objects.create(
                account=account,
                ticket=ticket,
            )

        showing.tickets_sold += int(quantity)
        showing.save()

        booked_seats = []
        for seat in seats:
            booked_seats.append(Seat.objects.create(
                row=seat['row'],
                column=seat['column'],
                ticket=ticket
            ))

        response_data = self.get_serializer(ticket).data
        response_data['seats'] = SeatSerializer(booked_seats, many=True).data

        return Response(response_data, status=201)