from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
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

# In-memory user preferences store (stub). Replace with a proper model in production.
USER_PREFERENCES_STORE = {}


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def test_endpoint(request):
    """Simple test endpoint to check if API is working"""
    return Response({
        'status': 'success',
        'message': 'API is working',
        'timestamp': timezone.now().isoformat()
    })


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
    verify_link = f"{settings.FRONTEND_URL.rstrip('/')}/verify-email/{token.token}"
    message = f"""
    Hello {user.get_full_name()},
    
    Please click the following link to verify your email address:
    {verify_link}
    
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


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_stats(request):
    """Return basic activity stats for the current user. Safe defaults if related apps unavailable."""
    try:
        user = request.user
        requests_created = 0
        tasks_completed = 0
        equipment_managed = 0
        reports_generated = 0

        try:
            from requests_system.models import SupportRequest
            requests_created = SupportRequest.objects.filter(requester=user).count()
        except Exception:
            pass

        try:
            from tasks.models import Task
            tasks_completed = Task.objects.filter(assigned_to=user, status='completed').count()
        except Exception:
            pass

        try:
            from inventory.models import Equipment
            equipment_managed = Equipment.objects.filter(assigned_to=user).count()
        except Exception:
            pass

        return Response({
            'member_since': getattr(user, 'date_joined', None),
            'last_login': getattr(user, 'last_login', None),
            'requests_created': requests_created,
            'tasks_completed': tasks_completed,
            'equipment_managed': equipment_managed,
            'reports_generated': reports_generated,
        })
    except Exception as e:
        logger.error(f"user_stats failed: {e}")
        return Response({
            'member_since': None,
            'last_login': None,
            'requests_created': 0,
            'tasks_completed': 0,
            'equipment_managed': 0,
            'reports_generated': 0,
        })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_activity(request):
    """Recent activity for the current user, composed from requests and tasks. Safe fallbacks."""
    try:
        user = request.user
        limit = int(request.GET.get('limit', 10))
        activities = []

        try:
            from requests_system.models import SupportRequest
            reqs = SupportRequest.objects.filter(requester=user).order_by('-created_at')[:limit]
            for r in reqs:
                activities.append({
                    'id': f'user_req_{r.id}',
                    'type': 'request',
                    'action': 'Created support request',
                    'description': getattr(r, 'title', '') or getattr(r, 'description', ''),
                    'timestamp': getattr(r, 'created_at', None),
                })
        except Exception:
            pass

        try:
            from tasks.models import Task
            tks = Task.objects.filter(assigned_to=user).order_by('-created_at')[:limit]
            for t in tks:
                activities.append({
                    'id': f'user_task_{t.id}',
                    'type': 'task',
                    'action': f"Task {getattr(t, 'status', 'updated')}",
                    'description': getattr(t, 'title', ''),
                    'timestamp': getattr(t, 'created_at', None),
                })
        except Exception:
            pass

        # Sort by timestamp desc
        try:
            activities.sort(key=lambda x: x['timestamp'] or '', reverse=True)
        except Exception:
            pass

        return Response({'results': activities[:limit]})
    except Exception as e:
        logger.error(f"user_activity failed: {e}")
        return Response({'results': []})


@api_view(['GET', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def user_preferences(request):
    """Simple per-user preferences using an in-memory store.
    Frontend calls: GET to read, PATCH to update.
    Keys are flexible; common examples: theme, timezone, notifications.
    """
    try:
        uid = request.user.id
        current = USER_PREFERENCES_STORE.get(uid, {
            'theme': 'light',
            'timezone': getattr(request.user, 'timezone', 'UTC') or 'UTC',
            'notifications_enabled': True,
        })
        if request.method == 'GET':
            return Response(current)
        # PATCH
        data = request.data or {}
        # Only take JSON-serializable primitives
        for k, v in data.items():
            current[k] = v
        USER_PREFERENCES_STORE[uid] = current
        return Response(current)
    except Exception as e:
        logger.error(f"user_preferences failed: {e}")
        return Response({'theme': 'light', 'timezone': 'UTC', 'notifications_enabled': True})


def send_password_reset_email(user, token):
    """Send password reset email"""
    subject = 'Reset your Hospital IT System password'
    reset_link = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password/{token.token}"
    message = f"""
    Hello {user.get_full_name()},
    
    You requested a password reset for your Hospital IT System account.
    
    Please click the following link to reset your password:
    {reset_link}
    
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


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def pending_approval_users(request):
    """Get users pending approval"""
    from .permissions import RoleBasedPermission
    
    permission = RoleBasedPermission()
    if not permission.has_permission(request, None):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    user_permissions = permission.get_user_permissions(request.user)
    if not user_permissions.get('manage_users', False):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        pending_users = CustomUser.objects.filter(
            is_approved=False,
            is_active=True
        ).order_by('-date_joined')
        
        serializer = UserProfileSerializer(pending_users, many=True)
        return Response({'results': serializer.data}, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error fetching pending users: {e}")
        return Response(
            {'error': 'Failed to fetch pending users'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def approve_user(request, user_id):
    """Approve a pending user"""
    from .permissions import RoleBasedPermission
    
    permission = RoleBasedPermission()
    if not permission.has_permission(request, None):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    user_permissions = permission.get_user_permissions(request.user)
    if not user_permissions.get('manage_users', False):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user_to_approve = CustomUser.objects.get(id=user_id)
        
        if user_to_approve.is_approved:
            return Response(
                {'error': 'User is already approved'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            user_to_approve.is_approved = True
            user_to_approve.approved_by = request.user
            user_to_approve.approved_at = timezone.now()
            user_to_approve.save()
            
            # Send approval notification email
            try:
                send_mail(
                    'IT Support Account Approved',
                    f'''Dear {user_to_approve.first_name} {user_to_approve.last_name},

Your IT Support account has been approved.

You can now log in to the system using your credentials.

Welcome to the IT Support team!

Best regards,
IT Support Team''',
                    settings.DEFAULT_FROM_EMAIL,
                    [user_to_approve.email],
                    fail_silently=True,
                )
            except Exception as e:
                logger.warning(f"Failed to send approval email: {e}")
        
        return Response(
            {'message': 'User approved successfully'}, 
            status=status.HTTP_200_OK
        )
        
    except CustomUser.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error approving user: {e}")
        return Response(
            {'error': 'Failed to approve user'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def reject_user(request, user_id):
    """Reject a pending user"""
    from .permissions import RoleBasedPermission
    
    permission = RoleBasedPermission()
    if not permission.has_permission(request, None):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    user_permissions = permission.get_user_permissions(request.user)
    if not user_permissions.get('manage_users', False):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user_to_reject = CustomUser.objects.get(id=user_id)
        reason = request.data.get('reason', 'No reason provided')
        
        if user_to_reject.is_approved:
            return Response(
                {'error': 'Cannot reject an approved user'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            # Send rejection notification email before deleting
            try:
                send_mail(
                    'IT Support Account Application Rejected',
                    f'''Dear {user_to_reject.first_name} {user_to_reject.last_name},

Your IT Support account application has been reviewed and unfortunately cannot be approved at this time.

Reason: {reason}

If you believe this is an error or have questions, please contact your system administrator.

Best regards,
IT Support Team''',
                    settings.DEFAULT_FROM_EMAIL,
                    [user_to_reject.email],
                    fail_silently=True,
                )
            except Exception as e:
                logger.warning(f"Failed to send rejection email: {e}")
            
            # Delete the user account
            user_to_reject.delete()
        
        return Response(
            {'message': 'User rejected and removed successfully'}, 
            status=status.HTTP_200_OK
        )
        
    except CustomUser.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error rejecting user: {e}")
        return Response(
            {'error': 'Failed to reject user'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def bulk_approve_users(request):
    """Approve multiple pending users at once."""
    from .permissions import RoleBasedPermission
    permission = RoleBasedPermission()
    if not permission.has_permission(request, None):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    user_permissions = permission.get_user_permissions(request.user)
    if not user_permissions.get('manage_users', False):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    try:
        user_ids = request.data.get('user_ids', [])
        if not isinstance(user_ids, list) or not user_ids:
            return Response({'error': 'user_ids must be a non-empty list'}, status=status.HTTP_400_BAD_REQUEST)

        updated = 0
        with transaction.atomic():
            for uid in user_ids:
                try:
                    user = CustomUser.objects.get(id=uid, is_active=True)
                    if not user.is_approved:
                        user.is_approved = True
                        user.approved_by = request.user
                        user.approved_at = timezone.now()
                        user.save()
                        updated += 1
                except CustomUser.DoesNotExist:
                    continue

        return Response({'message': f'Approved {updated} users', 'approved_count': updated}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"bulk_approve_users failed: {e}")
        return Response({'error': 'Failed to bulk approve users'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_current_user(request):
    """Get current user profile information"""
    try:
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error getting current user: {e}")
        return Response(
            {'error': 'Failed to get user profile'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_assignable_users(request):
    """Get users that can be assigned to tasks/requests"""
    try:
        # Get users with technician role or higher
        users = CustomUser.objects.filter(
            is_active=True,
            is_approved=True,
            role__in=['technician', 'senior_technician', 'it_manager', 'system_admin']
        ).values('id', 'first_name', 'last_name', 'email', 'role', 'department')
        
        return Response({'results': list(users)})
    except Exception as e:
        logger.error(f"Error getting assignable users: {e}")
        return Response(
            {'error': 'Failed to get assignable users'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_active_users(request):
    """Get all active users for dropdowns"""
    try:
        users = CustomUser.objects.filter(
            is_active=True,
            is_approved=True
        ).values('id', 'first_name', 'last_name', 'email', 'role', 'department')
        
        return Response({'results': list(users)})
    except Exception as e:
        logger.error(f"Error getting active users: {e}")
        return Response(
            {'error': 'Failed to get active users'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
