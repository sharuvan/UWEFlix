"""
URL configuration for UWEFlix project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from cinema.views import FilmViewSet, ScreenViewSet, ShowingViewSet, TicketViewSet
from accounts.views import UserViewSet, ClubViewSet, AccountViewSet, AccountStatementViewSet, \
    TransactionViewSet, LoginView, LogoutView, validate_token, AccountListCreateView, \
    AccountDetailView, UserListView, get_transactions, get_outstanding_balance, authorize_payment, \
    UserCreateView, UserUpdateView, UserDeleteView
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'film', FilmViewSet)
router.register(r'screen', ScreenViewSet)
router.register(r'showing', ShowingViewSet)
router.register(r'ticket', TicketViewSet)

router.register(r'user', UserViewSet)
router.register(r'club', ClubViewSet)
router.register(r'account', AccountViewSet)
router.register(r'accountStatement', AccountStatementViewSet)
router.register(r'transaction', TransactionViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # path('api/book/', book_ticket),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/logout/', LogoutView.as_view(), name='logout'),
    path('api/validate_token/', validate_token),
    path('api/accounts/', AccountListCreateView.as_view(), name='account-list-create'),
    path('api/accounts/<int:pk>/', AccountDetailView.as_view(), name='account-detail'),
    path('api/users/', UserListView.as_view(), name='user-list'),
    path('api/users/create/', UserCreateView.as_view(), name='user-create'),
    path('api/users/<int:pk>/edit/', UserUpdateView.as_view(), name='user-edit'),
    path('api/users/<int:pk>/delete/', UserDeleteView.as_view(), name='user-delete'),
    path('api/transactions/', get_transactions, name='get_transactions'),
    path('api/accounts/<str:account_number>/balance/', get_outstanding_balance, name='get_outstanding_balance'),
    path('api/accounts/<str:account_number>/authorize_payment/', authorize_payment, name='authorize_payment'),
    path('api/accounts/daily_transactions/', AccountViewSet.as_view({'get': 'daily_transactions'}), name='daily-transactions'),
    path('api/accounts/monthly_report/', AccountViewSet.as_view({'get': 'monthly_report'}), name='monthly-report'),
    path('api/accounts/annual_report/', AccountViewSet.as_view({'get': 'annual_report'}), name='annual-report'),
    path('api/accounts/<int:pk>/statements/', AccountViewSet.as_view({'get': 'statements'}), name='account-statements'),
    path('api/showings/nextTwoWeeks/', ShowingViewSet.as_view({'get': 'next_two_weeks'}), name='next-two-weeks-showings'),
    # path('', include('cinema.urls')),
    # path('accounts/', include('accounts.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)