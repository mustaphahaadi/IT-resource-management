from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from django.db import transaction
from .models import CustomUser, EmailVerificationToken, PasswordResetToken, LoginAttempt
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer,
    PasswordChangeSerializer, PasswordResetRequestSerializer, PasswordResetSerializer,
    EmailVerificationSerializer
)
import logging

logger = logging.getLogger(__name__)


def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def log_login_attempt(request, user=None, success=False, attempted_username=''):
    """Log login attempt for security monitoring"""
    try:
        LoginAttempt.objects.create(
            user=user,
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            success=success,
            attempted_username=attempted_username
        )
    except Exception as e:
        logger.error(f"Failed to log login attempt: {e}")


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    """Register a new user"""
    serializer = UserRegistrationSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            with transaction.atomic():
                user = serializer.save()
                
                # Create email verification token
                verification_token = EmailVerificationToken.objects.create(user=user)
                
                # Send verification email (in production, use proper email service)
                try:
                    send_verification_email(user, verification_token)
                except Exception as e:
                    logger.error(f"Failed to send verification email: {e}")
                
                return Response({
                    'message': 'Registration successful. Please check your email to verify your account.',
                    'user_id': user.id,
                    'email': user.email
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            logger.error(f"Registration failed: {e}")
            return Response({
                'error': 'Registration failed. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_user(request):
    """Login user and return token"""
    serializer = UserLoginSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        remember_me = serializer.validated_data.get('remember_me', False)
        
        try:
            # Create or get token
            token, created = Token.objects.get_or_create(user=user)
            
            # Update user's last login IP
            user.last_login_ip = get_client_ip(request)
            user.save()
            
            # Log successful login
            log_login_attempt(request, user=user, success=True, attempted_username=user.email)
            
            # Prepare response data
            user_data = UserProfileSerializer(user).data
            
            response_data = {
                'token': token.key,
                'user': user_data,
                'message': 'Login successful'
            }
            
            # Add approval status message
            if not user.is_approved:
                response_data['warning'] = 'Your account is pending approval from an administrator.'
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Login failed: {e}")
            return Response({
                'error': 'Login failed. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Log failed login attempt
    email = request.data.get('email', '')
    log_login_attempt(request, success=False, attempted_username=email)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_user(request):
    """Logout user and delete token"""
    try:
        request.user.auth_token.delete()
        return Response({
            'message': 'Logged out successfully'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Logout failed: {e}")
        return Response({
            'error': 'Logout failed'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_profile(request):
    """Get current user profile"""
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_user_profile(request):
    """Update user profile"""
    serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Profile updated successfully',
            'user': serializer.data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    """Change user password"""
    serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        try:
            serializer.save()
            
            # Delete all existing tokens to force re-login
            Token.objects.filter(user=request.user).delete()
            
            return Response({
                'message': 'Password changed successfully. Please login again.'
            })
        except Exception as e:
            logger.error(f"Password change failed: {e}")
            return Response({
                'error': 'Password change failed'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def request_password_reset(request):
    """Request password reset"""
    serializer = PasswordResetRequestSerializer(data=request.data)
    
    if serializer.is_valid():
        email = serializer.validated_data['email']
        
        try:
            user = CustomUser.objects.get(email=email, is_active=True)
            
            # Create password reset token
            reset_token = PasswordResetToken.objects.create(user=user)
            
            # Send reset email
            try:
                send_password_reset_email(user, reset_token)
            except Exception as e:
                logger.error(f"Failed to send password reset email: {e}")
            
        except CustomUser.DoesNotExist:
            # Don't reveal if email exists or not
            pass
        
        # Always return success message for security
        return Response({
            'message': 'If an account with this email exists, a password reset link has been sent.'
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def reset_password(request):
    """Reset password with token"""
    serializer = PasswordResetSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            user = serializer.save()
            
            # Delete all existing tokens to force re-login
            Token.objects.filter(user=user).delete()
            
            return Response({
                'message': 'Password reset successful. Please login with your new password.'
            })
        except Exception as e:
            logger.error(f"Password reset failed: {e}")
            return Response({
                'error': 'Password reset failed'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_email(request):
    """Verify user email with token"""
    serializer = EmailVerificationSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            user = serializer.save()
            return Response({
                'message': 'Email verified successfully.',
                'user_id': user.id
            })
        except Exception as e:
            logger.error(f"Email verification failed: {e}")
            return Response({
                'error': 'Email verification failed'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def resend_verification_email(request):
    """Resend email verification"""
    user = request.user
    
    if user.is_email_verified:
        return Response({
            'message': 'Email is already verified.'
        })
    
    try:
        # Delete existing unused tokens
        EmailVerificationToken.objects.filter(user=user, is_used=False).delete()
        
        # Create new token
        verification_token = EmailVerificationToken.objects.create(user=user)
        
        # Send verification email
        send_verification_email(user, verification_token)
        
        return Response({
            'message': 'Verification email sent successfully.'
        })
    except Exception as e:
        logger.error(f"Failed to resend verification email: {e}")
        return Response({
            'error': 'Failed to send verification email'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def send_verification_email(user, token):
    """Send email verification email"""
    subject = 'Verify your Hospital IT System account'
    message = f"""
    Hello {user.get_full_name()},
    
    Please click the following link to verify your email address:
    http://localhost:3000/verify-email/{token.token}
    
    This link will expire in 24 hours.
    
    If you didn't create this account, please ignore this email.
    
    Best regards,
    Hospital IT System Team
    """
    
    # In production, use proper email service
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )


def send_password_reset_email(user, token):
    """Send password reset email"""
    subject = 'Reset your Hospital IT System password'
    message = f"""
    Hello {user.get_full_name()},
    
    You requested a password reset for your Hospital IT System account.
    
    Please click the following link to reset your password:
    http://localhost:3000/reset-password/{token.token}
    
    This link will expire in 1 hour.
    
    If you didn't request this reset, please ignore this email.
    
    Best regards,
    Hospital IT System Team
    """
    
    # In production, use proper email service
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )
