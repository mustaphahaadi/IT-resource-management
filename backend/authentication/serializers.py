from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils import timezone
from .models import CustomUser, EmailVerificationToken, PasswordResetToken
import re


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = CustomUser
        fields = [
            'username', 'email', 'password', 'confirm_password',
            'first_name', 'last_name', 'phone_number', 'department',
            'employee_id'
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True},
        }
    
    def validate_email(self, value):
        """Validate email format and uniqueness"""
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        
        # Basic email format validation
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, value):
            raise serializers.ValidationError("Enter a valid email address.")
        
        return value
    
    def validate_username(self, value):
        """Validate username"""
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long.")
        
        if not re.match(r'^[a-zA-Z0-9_]+$', value):
            raise serializers.ValidationError("Username can only contain letters, numbers, and underscores.")
        
        return value
    
    def validate_phone_number(self, value):
        """Validate phone number format"""
        if value:
            phone_pattern = r'^\+?1?\d{9,15}$'
            if not re.match(phone_pattern, value):
                raise serializers.ValidationError("Enter a valid phone number.")
        return value
    
    def validate_employee_id(self, value):
        """Validate employee ID uniqueness"""
        if value and CustomUser.objects.filter(employee_id=value).exists():
            raise serializers.ValidationError("A user with this employee ID already exists.")
        return value
    
    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        return attrs
    
    def create(self, validated_data):
        """Create new user"""
        validated_data.pop('confirm_password')
        user = CustomUser.objects.create_user(**validated_data)
        user.is_active = True  # User can login but needs approval for full access
        user.save()
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login (accepts email or username in 'email' field)"""
    email = serializers.CharField()  # accepts either email or username identifier
    password = serializers.CharField(write_only=True)
    remember_me = serializers.BooleanField(default=False)
    
    def validate(self, attrs):
        identifier = attrs.get('email')
        password = attrs.get('password')
        
        if identifier and password:
            # Resolve identifier to a user by email or username
            user_obj = None
            try:
                if '@' in identifier:
                    user_obj = CustomUser.objects.get(email=identifier)
                else:
                    user_obj = CustomUser.objects.get(username=identifier)
            except CustomUser.DoesNotExist:
                raise serializers.ValidationError("Invalid email/username or password.")
            
            # Check if account is locked
            if user_obj.is_account_locked():
                raise serializers.ValidationError("Account is temporarily locked due to multiple failed login attempts.")
            
            # Authenticate using the account's primary identifier (email)
            user = authenticate(username=user_obj.email, password=password)
            if not user:
                # Increment failed login attempts
                try:
                    user_obj.failed_login_attempts += 1
                    if user_obj.failed_login_attempts >= 5:
                        user_obj.lock_account()
                    user_obj.save()
                except Exception:
                    pass
                
                raise serializers.ValidationError("Invalid email/username or password.")
            
            if not user.is_active:
                raise serializers.ValidationError("Account is disabled.")
            
            # Reset failed login attempts on successful login
            user.failed_login_attempts = 0
            user.last_login = timezone.now()
            user.save()
            
            attrs['user'] = user
        else:
            raise serializers.ValidationError("Must include email and password.")
        
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile, consolidating all user-related data for API responses."""
    permissions = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    is_superuser = serializers.BooleanField(read_only=True)
    is_staff = serializers.BooleanField(read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'department', 'phone_number', 'employee_id',
            'is_email_verified', 'is_approved', 'is_staff', 'is_superuser',
            'created_at', 'last_login', 'permissions'
        ]
        read_only_fields = [
            'id', 'username', 'created_at', 'last_login', 'is_approved',
            'is_staff', 'is_superuser'
        ]

    def get_permissions(self, obj):
        """Get all user permissions, including from groups."""
        if obj.is_superuser:
            return ['superuser']
        return list(obj.get_all_permissions())

    def get_full_name(self, obj):
        """Get user's full name."""
        return obj.get_full_name()

    def get_role(self, obj):
        """Determine user role based on attributes and group membership."""
        if hasattr(obj, 'role') and obj.role:
            return obj.role
        if obj.is_superuser:
            return 'system_admin'
        if obj.is_staff:
            return 'it_manager'
        # Fallback based on group name if direct role attribute is missing
        if obj.groups.filter(name='IT Staff').exists():
            return 'staff'
        if obj.groups.filter(name='Technicians').exists():
            return 'technician'
        return 'user'


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for password change"""
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    
    def validate_current_password(self, value):
        """Validate current password"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value
    
    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError("New passwords do not match.")
        return attrs
    
    def save(self):
        """Change user password"""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request"""
    email = serializers.EmailField()
    
    def validate_email(self, value):
        """Validate email exists"""
        try:
            user = CustomUser.objects.get(email=value)
            if not user.is_active:
                raise serializers.ValidationError("Account is disabled.")
        except CustomUser.DoesNotExist:
            # Don't reveal if email exists or not for security
            pass
        return value


class PasswordResetSerializer(serializers.Serializer):
    """Serializer for password reset"""
    token = serializers.UUIDField()
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    
    def validate_token(self, value):
        """Validate reset token"""
        try:
            token = PasswordResetToken.objects.get(token=value, is_used=False)
            if token.is_expired():
                raise serializers.ValidationError("Reset token has expired.")
            self.context['reset_token'] = token
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError("Invalid or expired reset token.")
        return value
    
    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        return attrs
    
    def save(self):
        """Reset user password"""
        token = self.context['reset_token']
        user = token.user
        user.set_password(self.validated_data['new_password'])
        user.failed_login_attempts = 0
        user.account_locked_until = None
        user.save()
        
        # Mark token as used
        token.is_used = True
        token.save()
        
        return user


class EmailVerificationSerializer(serializers.Serializer):
    """Serializer for email verification"""
    token = serializers.UUIDField()
    
    def validate_token(self, value):
        """Validate verification token"""
        try:
            token = EmailVerificationToken.objects.get(token=value, is_used=False)
            if token.is_expired():
                raise serializers.ValidationError("Verification token has expired.")
            self.context['verification_token'] = token
        except EmailVerificationToken.DoesNotExist:
            raise serializers.ValidationError("Invalid or expired verification token.")
        return value
    
    def save(self):
        """Verify user email"""
        token = self.context['verification_token']
        user = token.user
        user.is_email_verified = True
        user.save()
        
        # Mark token as used
        token.is_used = True
        token.save()
        
        return user
