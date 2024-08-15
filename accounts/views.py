import json
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render, redirect
from .forms import UserLoginForm, CreditTopUpForm
from .models import User, Club, Account, AccountStatement, Transaction, Payment
from .serializers import UserSerializer, ClubSerializer, AccountSerializer, \
    AccountStatementSerializer, TransactionSerializer, PaymentSerializer
from cinema.models import Ticket, Seat
from rest_framework import viewsets, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework import status, permissions
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from datetime import datetime
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import action
from datetime import date, timedelta
from django.db.models import Sum, Max, F
from django.contrib.auth.models import Group
import random, string
from django.contrib.auth import logout

@api_view(['GET'])
def validate_token(request):
    return Response({'detail': 'Token is valid'}, status=200)

class IsAccountManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'account_manager'

class IsCinemaManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'cinema_manager'

class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Optionally restricts the returned users by filtering against 'user_type'
        query parameter in the URL.
        """
        queryset = User.objects.all()
        user_type = self.request.query_params.get('user_type', None)
        if user_type is not None:
            queryset = queryset.filter(user_type=user_type)
        return queryset

class UserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsCinemaManager]

    def generate_password(self, length=8):
        return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

    def generate_username(self, user_type):
        prefix = 'student' if user_type == 'student' else 'clubmanager'
        # Fetch the maximum ID of the users of that type, defaulting to 0 if none exist
        max_id = User.objects.filter(user_type=user_type).aggregate(max_id=Max('id'))['max_id'] or 0
        return f'{prefix}{max_id + 1}'

    def perform_create(self, serializer):
        user_type = self.request.data.get('user_type')
        if not user_type:
            raise ValueError("user_type is required.")

        username = self.generate_username(user_type)
        password = self.generate_password()

        user = serializer.save(username=username)
        user.set_password(password)
        user.save()

        self.username = username
        self.password = password

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        response.data['username'] = self.username
        response.data['password'] = self.password
        return response

class UserUpdateView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class UserDeleteView(generics.DestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class ClubViewSet(viewsets.ModelViewSet):
    queryset = Club.objects.all()
    serializer_class = ClubSerializer
    permission_classes = [IsCinemaManager]

    def perform_create(self, serializer):
        club_manager_id = self.request.data.get('club_manager')
        club_manager = User.objects.get(id=club_manager_id, user_type='club_manager')
        serializer.save(club_manager=club_manager)

    def perform_update(self, serializer):
        club_manager_id = self.request.data.get('club_manager')
        if club_manager_id:
            club_manager = User.objects.get(id=club_manager_id, user_type='club_manager')
            serializer.save(club_manager=club_manager)
        else:
            serializer.save()
    
class AccountListCreateView(generics.ListCreateAPIView):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [IsAccountManager]

    def perform_create(self, serializer):
        user_id = self.request.data.get('user_id')
        user = User.objects.get(id=user_id)
        serializer.save(user=user)

class AccountDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [IsAccountManager]

    def perform_update(self, serializer):
        if 'user_id' in self.request.data:
            user_id = self.request.data['user_id']
            user = User.objects.get(id=user_id)
            serializer.save(user=user)
        else:
            serializer.save()

class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)

        if user is not None:
            if User.objects.filter(username=username).exists():
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user_type': user.user_type,
                })
            else:
                return Response({'error': 'User does not exist in the database'}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token is None:
                return Response({"detail": "Refresh token is required."},
                    status=status.HTTP_400_BAD_REQUEST)
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            logout(request)
            
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except TokenError:
            return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(user_type__in=['student', 'club_manager'])
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class ClubViewSet(viewsets.ModelViewSet):
    queryset = Club.objects.all()
    serializer_class = ClubSerializer
    permission_classes = [permissions.IsAuthenticated, IsCinemaManager]

    def perform_create(self, serializer):
        club_manager_id = self.request.data.get('club_manager')
        club_manager = User.objects.get(id=club_manager_id, user_type='club_manager')
        serializer.save(club_manager=club_manager)

    def perform_update(self, serializer):
        club_manager_id = self.request.data.get('club_manager')
        if club_manager_id:
            club_manager = User.objects.get(id=club_manager_id, user_type='club_manager')
            serializer.save(club_manager=club_manager)
        else:
            serializer.save()

class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['get'])
    def statements(self, request, pk=None):
        account = self.get_object()

        first_day_of_last_month = (date.today().replace(day=1) - timedelta(days=1)).replace(day=1)
        last_day_of_last_month = (date.today().replace(day=1) - timedelta(days=1))

        credit_transactions = Transaction.objects.filter(
            account=account,
            date__range=[first_day_of_last_month, last_day_of_last_month]
        )

        debit_transactions = Payment.objects.filter(
            account=account,
            payment_date__range=[first_day_of_last_month, last_day_of_last_month]
        )

        total_credit = sum(transaction.ticket.showing.ticket_price for transaction in credit_transactions)
        total_debit = sum(payment.amount for payment in debit_transactions)
        
        credit_serializer = TransactionSerializer(credit_transactions, many=True)
        debit_serializer = PaymentSerializer(debit_transactions, many=True)

        response_data = {
            'account_title': account.account_title,
            'total_credit': total_credit,
            'total_debit': total_debit,
            'credit_transactions': credit_serializer.data,
            'debit_transactions': debit_serializer.data
        }

        return Response(response_data)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_account(self, request):
        account = Account.objects.get(user=request.user)
        serializer = AccountSerializer(account)
        return Response(serializer.data)
        
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_transactions(self, request):
        account = Account.objects.get(user=request.user)
        transactions = Transaction.objects.filter(account=account)
        payments = Payment.objects.filter(account=account)
        
        transactions_serializer = TransactionSerializer(transactions, many=True)
        payments_serializer = PaymentSerializer(payments, many=True)
        
        return Response({
            "transactions": transactions_serializer.data,
            "payments": payments_serializer.data
        })
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_tickets(self, request):
        account = Account.objects.get(user=request.user)
        tickets = Ticket.objects.filter(user=account.user)

        def format_ticket(ticket):
            seats = Seat.objects.filter(ticket=ticket)
            seat_numbers = [f"{seat.row}-{seat.column}" for seat in seats]
            return {
                'id': ticket.id,
                'date': ticket.purchase_date,
                'total_amount': ticket.showing.ticket_price * ticket.quantity,
                'details': {
                    'film_title': ticket.showing.film.title,
                    'show_time': ticket.showing.show_time,
                    'seats': seat_numbers,
                }
            }

        tickets_data = [format_ticket(ticket) for ticket in tickets]

        return Response({
            "tickets": tickets_data
        })

    @action(detail=False, methods=['get'])
    def daily_transactions(self, request):
        today = datetime.now()
        transactions = Transaction.objects.filter(date=today)
        payments = Payment.objects.filter(payment_date__date=today)

        transaction_serializer = TransactionSerializer(transactions, many=True)
        payment_serializer = PaymentSerializer(payments, many=True)

        return Response({
            'transactions': transaction_serializer.data,
            'payments': payment_serializer.data
        })

    @action(detail=False, methods=['get'])
    def monthly_report(self, request):
        first_day = date.today().replace(day=1)
        transactions = Transaction.objects.filter(date__gte=first_day)
        payments = Payment.objects.filter(payment_date__gte=first_day)

        transactions = transactions.annotate(total_price=F('ticket__showing__ticket_price') * F('ticket__quantity'))

        total_credits = transactions.aggregate(Sum('total_price'))['total_price__sum'] or 0
        total_debits = payments.aggregate(Sum('amount'))['amount__sum'] or 0

        return Response({
            'total_credits': total_credits,
            'total_debits': total_debits,
            'transactions': TransactionSerializer(transactions, many=True).data,
            'payments': PaymentSerializer(payments, many=True).data
        })

    @action(detail=False, methods=['get'])
    def annual_report(self, request):
        first_day = date.today().replace(day=1, month=1)
        transactions = Transaction.objects.filter(date__gte=first_day)
        payments = Payment.objects.filter(payment_date__gte=first_day)

        transactions = transactions.annotate(total_price=F('ticket__showing__ticket_price') * F('ticket__quantity'))

        total_credits = transactions.aggregate(Sum('total_price'))['total_price__sum'] or 0
        total_debits = payments.aggregate(Sum('amount'))['amount__sum'] or 0

        return Response({
            'total_credits': total_credits,
            'total_debits': total_debits,
            'transactions': TransactionSerializer(transactions, many=True).data,
            'payments': PaymentSerializer(payments, many=True).data
        })

class AccountStatementViewSet(viewsets.ModelViewSet):
    queryset = AccountStatement.objects.all()
    serializer_class = AccountStatementSerializer
    permission_classes = [permissions.IsAuthenticated]

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def request_cancel(self, request, pk=None):
        try:
            transaction = self.get_object()
            transaction.cancel_requested = True
            transaction.save()
            return Response({'status': 'cancel request received'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def request_discount(self, request, pk=None):
        try:
            discount_amount = request.data.get('discount_amount')
            transaction = self.get_object()
            transaction.discount_request_amount = discount_amount
            # transaction.discount_request_status = 'requested'
            transaction.save()
            return Response({'status': 'discount request received'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def all_transactions(self, request):
        transactions = Transaction.objects.all()
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def approve_discount(self, request, pk=None):
        try:
            transaction = self.get_object()
            discount_amount = request.data.get('discount_amount')
            transaction.discount_amount = discount_amount
            transaction.discount_request_status = 'approved'
            transaction.save()
            return Response({'status': 'discount approved'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def cancel_transaction(self, request, pk=None):
        try:
            transaction = self.get_object()
            transaction.delete()
            return Response({'status': 'transaction cancelled'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

def user_login(request):
    if request.method == 'POST':
        form = UserLoginForm(request, data=request.POST)
        if form.is_valid() or True:
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(request, username=username, password=password)
            print(type(user))
            if user is not None and isinstance(user, User):
                login(request, user)
                return redirect('home')
            else:
                form.add_error(None, 'Invalid username or password')
    else:
        form = UserLoginForm()
    return render(request, 'login.html', {'form': form})

def user_logout(request):
    logout(request)
    return redirect('home')

@require_http_methods(["GET"])
def get_transactions(request):
    account_number = request.GET.get('account_number')
    if not account_number.isdigit():
        return JsonResponse({'error': 'Invalid account number format'}, status=400)

    account = get_object_or_404(Account, account_number=int(account_number))
    current_month = datetime.now().month

    transactions = Transaction.objects.filter(account=account, date__month=current_month)
    transactions_data = [
        {
            'id': transaction.id,
            'date': transaction.date,
            'description': f'Ticket for {transaction.ticket.showing.film.title} at {transaction.ticket.showing.show_time}',
            'amount': transaction.ticket.showing.ticket_price * transaction.ticket.quantity
        }
        for transaction in transactions
    ]

    return JsonResponse({'data': transactions_data})

@require_http_methods(["GET"])
def get_outstanding_balance(request, account_number):
    if not account_number.isdigit():
        return JsonResponse({'error': 'Invalid account number format'}, status=400)
    
    account = get_object_or_404(Account, account_number=int(account_number))
    outstanding_balance = account.balance
    return JsonResponse({'balance': outstanding_balance})

@csrf_exempt
@require_http_methods(["POST"])
def authorize_payment(request, account_number):
    try:
        data = json.loads(request.body.decode('utf-8'))
        amount = data.get("amount")
        if amount is None or not isinstance(amount, (int, float)):
            return JsonResponse({'error': 'Invalid or missing amount'}, status=400)

        if not account_number.isdigit():
            return JsonResponse({'error': 'Invalid account number format'}, status=400)

        account = get_object_or_404(Account, account_number=int(account_number))

        payment = Payment.objects.create(
            account=account,
            amount=amount,
            status='completed'
        )

        account.balance += amount
        account.save()

        return JsonResponse({'success': True, 'payment_id': payment.id, 'transaction_id': payment.transaction_id})

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)