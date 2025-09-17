from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import uuid

class CustomUser(AbstractUser):
    """Extended user model with additional fields for hospital IT system"""
    
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('staff', 'IT Staff'),
        ('user', 'Regular User'),
        ('technician', 'Technician'),
        ('manager', 'Manager'),
    ]
    
    DEPARTMENT_CHOICES = [
        ('it', 'Information Technology'),
        ('admin', 'Administration'),
        ('medical', 'Medical'),
        ('nursing', 'Nursing'),
        ('pharmacy', 'Pharmacy'),
        ('laboratory', 'Laboratory'),
        ('radiology', 'Radiology'),
        ('maintenance', 'Maintenance'),
        ('security', 'Security'),
        ('other', 'Other'),
    ]
    
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    department = models.CharField(max_length=20, choices=DEPARTMENT_CHOICES, default='other')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    employee_id = models.CharField(max_length=20, unique=True, blank=True, null=True)
    is_email_verified = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)  # Admin approval required
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login_ip = models.GenericIPAddressField(blank=True, null=True)
    failed_login_attempts = models.IntegerField(default=0)
    account_locked_until = models.DateTimeField(blank=True, null=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    def is_account_locked(self):
        """Check if account is currently locked"""
        if self.account_locked_until:
            return timezone.now() < self.account_locked_until
        return False
    
    def lock_account(self, duration_minutes=30):
        """Lock account for specified duration"""
        self.account_locked_until = timezone.now() + timezone.timedelta(minutes=duration_minutes)
        self.save()
    
    def unlock_account(self):
        """Unlock account and reset failed attempts"""
        self.account_locked_until = None
        self.failed_login_attempts = 0
        self.save()
    
    def can_access_admin(self):
        """Check if user can access admin features"""
        return self.role in ['admin', 'manager'] and self.is_approved
    
    def can_manage_users(self):
        """Check if user can manage other users"""
        return self.role == 'admin' and self.is_approved


class EmailVerificationToken(models.Model):
    """Token for email verification"""
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Email verification for {self.user.email}"
    
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(hours=24)
        super().save(*args, **kwargs)


class PasswordResetToken(models.Model):
    """Token for password reset"""
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Password reset for {self.user.email}"
    
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(hours=1)
        super().save(*args, **kwargs)


class LoginAttempt(models.Model):
    """Track login attempts for security"""
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    success = models.BooleanField(default=False)
    attempted_username = models.CharField(max_length=150, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        status = "Success" if self.success else "Failed"
        return f"{status} login attempt for {self.attempted_username} from {self.ip_address}"


class UserSession(models.Model):
    """Track active user sessions"""
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    session_key = models.CharField(max_length=40, unique=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-last_activity']
    
    def __str__(self):
        return f"Session for {self.user.email} from {self.ip_address}"
