from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group
from .models import User, Account, Club, AccountStatement, Transaction

class AccountInline(admin.StackedInline):
    model = Account
    can_delete = False

class UserAdmin(BaseUserAdmin):
    inlines = (AccountInline,)
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'landline_phone', 'mobile_phone', 'email_address', 'date_of_birth')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
        ('Additional info', {'fields': ('user_type',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'user_type', 'password1', 'password2'),
        }),
    )

admin.site.register(User, UserAdmin)

class AccountAdmin(admin.ModelAdmin):
    list_display = ('user', 'balance', 'discount_rate')
    search_fields = ('user__username',)

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('account', 'ticket', 'date')
    search_fields = ('account__account_title', 'ticket__id', 'date')

admin.site.register(Account, AccountAdmin)
admin.site.unregister(Group)

admin.site.register(Club)
admin.site.register(AccountStatement)
