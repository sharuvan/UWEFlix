from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
import uuid
from django.conf import settings

class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ('customer', 'Customer'),
        ('student', 'Student'),
        ('club_manager', 'Club Manager'),
        ('cinema_manager', 'Cinema Manager'),
        ('account_manager', 'Account Manager'),
    )
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)
    landline_phone = models.CharField(max_length=15, blank=True, null=True)
    mobile_phone = models.CharField(max_length=15, blank=True, null=True)
    email_address = models.EmailField(blank=True, null=True)
    first_name = models.CharField(max_length=30, blank=True, null=True)
    last_name = models.CharField(max_length=30, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    street_number = models.CharField(max_length=10, blank=True, null=True)
    street = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=50, blank=True, null=True)
    post_code = models.CharField(max_length=10, blank=True, null=True)

    groups = models.ManyToManyField(
        Group,
        related_name='custom_user_set',
        blank=True
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='custom_user_set',
        blank=True
    )

class Club(models.Model):
    name = models.CharField(max_length=255)
    club_manager = models.ForeignKey(settings.AUTH_USER_MODEL, limit_choices_to={'user_type': 'club_manager'}, on_delete=models.CASCADE)

class Account(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    account_number = models.AutoField(primary_key=True)
    account_title = models.CharField(max_length=255)
    card_number = models.CharField(max_length=16)
    expiry_date = models.DateField()
    discount_rate = models.FloatField(default=0.0)
    balance = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.account_title
    
class AccountStatement(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)
    debit = models.DecimalField(max_digits=10, decimal_places=2)
    credit = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"Statement for {self.account} on {self.date}"

class Transaction(models.Model):
    account = models.ForeignKey('accounts.Account', null=True, blank=True, on_delete=models.CASCADE)
    ticket = models.ForeignKey('cinema.Ticket', on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)
    cancel_requested = models.BooleanField(default=False)
    discount_request_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f'Transaction on {self.date} for Account {self.account.account_title}'

class Payment(models.Model):
    account = models.ForeignKey('accounts.Account', null=True, blank=True, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[('pending', 'Pending'), ('completed', 'Completed'), ('failed', 'Failed')])
    transaction_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    def __str__(self):
        return f'Payment of {self.amount} on {self.payment_date} with status {self.status}'