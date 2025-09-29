from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import uuid

class CustomUser(AbstractUser):
    """Extended user model with additional fields for hospital IT system"""
    
    ROLE_CHOICES = [
        ('end_user', 'End User'),
        ('technician', 'Technician'),
        ('senior_technician', 'Senior Technician'),
        ('it_manager', 'IT Manager'),
        ('system_admin', 'System Administrator'),
    ]
    
    DEPARTMENT_CHOICES = [
        ('it', 'Information Technology'),
        ('administration', 'Administration'),
        ('human_resources', 'Human Resources'),
        ('finance', 'Finance'),
        ('operations', 'Operations'),
        ('marketing', 'Marketing'),
        ('sales', 'Sales'),
        ('customer_service', 'Customer Service'),
        ('legal', 'Legal'),
        ('facilities', 'Facilities'),
        ('other', 'Other'),
    ]
    
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='end_user')
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
        # Superusers always have access
        if getattr(self, 'is_superuser', False):
            return True
        # System admin role gets access without additional approval checks
        if self.role == 'system_admin':
            return True
        # IT managers require explicit approval
        if self.role == 'it_manager':
            return self.is_approved is True
        return False
    
    def can_manage_users(self):
        """Check if user can manage other users"""
        return self.role == 'system_admin' and self.is_approved
    
    def get_role_hierarchy_level(self):
        """Get numeric role hierarchy level for permissions"""
        hierarchy = {
            'end_user': 1,
            'technician': 2,
            'senior_technician': 3,
            'it_manager': 4,
            'system_admin': 5
        }
        return hierarchy.get(self.role, 0)
    
    def can_view_all_departments(self):
        """Check if user can view data from all departments"""
        return self.role in ['it_manager', 'system_admin']
    
    def can_assign_tickets(self):
        """Check if user can assign tickets to others"""
        return self.role in ['senior_technician', 'it_manager', 'system_admin']
    
    def can_escalate_tickets(self):
        """Check if user can escalate tickets"""
        return self.role in ['technician', 'senior_technician', 'it_manager', 'system_admin']
    
    def can_close_tickets(self):
        """Check if user can close tickets"""
        return self.role in ['technician', 'senior_technician', 'it_manager', 'system_admin']
    
    def can_manage_equipment(self):
        """Check if user can manage equipment"""
        return self.role in ['senior_technician', 'it_manager', 'system_admin']
    
    def get_accessible_departments(self):
        """Get list of departments this user can access"""
        if self.can_view_all_departments():
            return [choice[0] for choice in self.DEPARTMENT_CHOICES]
        elif self.role == 'technician' and self.department != 'it':
            # Technicians can see their department + IT
            return [self.department, 'it']
        else:
            return [self.department]


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
