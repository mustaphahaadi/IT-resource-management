from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from .models import (
    CustomUser, EmailVerificationToken, PasswordResetToken, 
    LoginAttempt, UserSession
)


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    """Admin interface for CustomUser"""
    
    list_display = [
        'email', 'username', 'get_full_name', 'role', 'department', 
        'is_approved', 'is_email_verified', 'is_active', 'created_at'
    ]
    list_filter = [
        'role', 'department', 'is_approved', 'is_email_verified', 
        'is_active', 'is_staff', 'created_at'
    ]
    search_fields = ['email', 'username', 'first_name', 'last_name', 'employee_id']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {
            'fields': ('username', 'password')
        }),
        ('Personal info', {
            'fields': ('first_name', 'last_name', 'email', 'phone_number', 'employee_id')
        }),
        ('Hospital info', {
            'fields': ('role', 'department')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'is_approved', 'is_email_verified', 'groups', 'user_permissions'),
        }),
        ('Important dates', {
            'fields': ('last_login', 'date_joined', 'created_at', 'updated_at')
        }),
        ('Security', {
            'fields': ('failed_login_attempts', 'account_locked_until', 'last_login_ip'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'last_login_ip']
    
    actions = ['approve_users', 'disapprove_users', 'unlock_accounts', 'send_verification_email']
    
    def approve_users(self, request, queryset):
        """Approve selected users"""
        count = queryset.update(is_approved=True)
        self.message_user(request, f'{count} users approved successfully.')
    approve_users.short_description = "Approve selected users"
    
    def disapprove_users(self, request, queryset):
        """Disapprove selected users"""
        count = queryset.update(is_approved=False)
        self.message_user(request, f'{count} users disapproved.')
    disapprove_users.short_description = "Disapprove selected users"
    
    def unlock_accounts(self, request, queryset):
        """Unlock selected accounts"""
        count = 0
        for user in queryset:
            if user.is_account_locked():
                user.unlock_account()
                count += 1
        self.message_user(request, f'{count} accounts unlocked.')
    unlock_accounts.short_description = "Unlock selected accounts"


@admin.register(EmailVerificationToken)
class EmailVerificationTokenAdmin(admin.ModelAdmin):
    """Admin interface for EmailVerificationToken"""
    
    list_display = ['user', 'token', 'created_at', 'expires_at', 'is_used', 'is_expired_display']
    list_filter = ['is_used', 'created_at']
    search_fields = ['user__email', 'user__username']
    readonly_fields = ['token', 'created_at', 'expires_at']
    
    def is_expired_display(self, obj):
        """Display if token is expired"""
        if obj.is_expired():
            return format_html('<span style="color: red;">Expired</span>')
        return format_html('<span style="color: green;">Valid</span>')
    is_expired_display.short_description = 'Status'


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    """Admin interface for PasswordResetToken"""
    
    list_display = ['user', 'token', 'created_at', 'expires_at', 'is_used', 'is_expired_display']
    list_filter = ['is_used', 'created_at']
    search_fields = ['user__email', 'user__username']
    readonly_fields = ['token', 'created_at', 'expires_at']
    
    def is_expired_display(self, obj):
        """Display if token is expired"""
        if obj.is_expired():
            return format_html('<span style="color: red;">Expired</span>')
        return format_html('<span style="color: green;">Valid</span>')
    is_expired_display.short_description = 'Status'


@admin.register(LoginAttempt)
class LoginAttemptAdmin(admin.ModelAdmin):
    """Admin interface for LoginAttempt"""
    
    list_display = ['attempted_username', 'ip_address', 'success', 'timestamp', 'user']
    list_filter = ['success', 'timestamp']
    search_fields = ['attempted_username', 'ip_address', 'user__email']
    readonly_fields = ['user', 'ip_address', 'user_agent', 'success', 'attempted_username', 'timestamp']
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    """Admin interface for UserSession"""
    
    list_display = ['user', 'ip_address', 'is_active', 'created_at', 'last_activity']
    list_filter = ['is_active', 'created_at', 'last_activity']
    search_fields = ['user__email', 'ip_address']
    readonly_fields = ['user', 'session_key', 'ip_address', 'user_agent', 'created_at', 'last_activity']
    
    actions = ['deactivate_sessions']
    
    def deactivate_sessions(self, request, queryset):
        """Deactivate selected sessions"""
        count = queryset.update(is_active=False)
        self.message_user(request, f'{count} sessions deactivated.')
    deactivate_sessions.short_description = "Deactivate selected sessions"
    
    def has_add_permission(self, request):
        return False
