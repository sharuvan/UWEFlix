from decimal import Decimal
from rest_framework import serializers
from .models import User, Club, Account, AccountStatement, Transaction, Payment

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'password', 'user_type', 'first_name', 'last_name',
            'landline_phone', 'mobile_phone', 'email_address', 'date_of_birth', 'street_number', 'street', 'city', 'post_code', 
            'email', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'
        ]
        extra_kwargs = {'password': {'write_only': True, 'required': False}, 'username': {'required': False}}

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super(UserSerializer, self).create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        user = super().update(instance, validated_data)
        password = validated_data.get('password', None)
        if password:
            user.set_password(password)
            user.save()
        return user

class ClubSerializer(serializers.ModelSerializer):
    class Meta:
        model = Club
        fields = '__all__'

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = '__all__'
        read_only_fields = ('account_number', 'user',)

class AccountStatementSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountStatement
        fields = '__all__'

class TransactionSerializer(serializers.ModelSerializer):
    account_title = serializers.CharField(source='account.account_title')
    quantity = serializers.IntegerField(source='ticket.quantity')
    # price = serializers.DecimalField(source='ticket.showing.ticket_price', max_digits=10, decimal_places=2)
    # discount = serializers.DecimalField(source='ticket.showing.discount', max_digits=10, decimal_places=2)
    total_amount = serializers.SerializerMethodField()

    details = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = ['id', 'date', 'quantity', 'details', 'account_title', 'cancel_requested', 'discount_request_amount', 'total_amount']

    def get_details(self, obj):
        return f"{obj.ticket.quantity}x Ticket for {obj.ticket.showing.film.title} on {obj.ticket.showing.show_time}"

    def get_total_amount(self, obj):
        price = obj.ticket.showing.ticket_price
        discount = obj.ticket.showing.discount
        quantity = obj.ticket.quantity
        final_price = (price - discount) * quantity
        if obj.discount_amount: final_price -= obj.discount_amount
        return final_price

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['total_amount'] = str(Decimal(representation['total_amount']))
        return representation

class PaymentSerializer(serializers.ModelSerializer):
    account_title = serializers.CharField(source='account.account_title')
    class Meta:
        model = Payment
        fields = ['account_title', 'amount', 'payment_date', 'status', 'transaction_id']