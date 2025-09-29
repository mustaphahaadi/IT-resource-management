from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth.models import Group, Permission
from django.db.models import Q, Count
from django.utils import timezone
from datetime import timedelta
from .models import CustomUser, LoginAttempt, UserSession
from .serializers import UserProfileSerializer
from .permissions import IsAdminOrStaff
import logging

logger = logging.getLogger(__name__)


class IsAdminUser(permissions.BasePermission):
    """Custom permission to only allow admin users"""
    
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (
                getattr(request.user, 'is_superuser', False)
                or request.user.can_access_admin()
            )
        )


class UserPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_users(request):
    """Get paginated list of users with filtering"""
    try:
        users = CustomUser.objects.all().order_by('-created_at')
        
        # Apply filters
        search = request.GET.get('search', '')
        if search:
            users = users.filter(
                Q(email__icontains=search) |
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(employee_id__icontains=search)
            )
        
        role = request.GET.get('role', '')
        if role:
            users = users.filter(role=role)
        
        department = request.GET.get('department', '')
        if department:
            users = users.filter(department=department)
        
        is_approved = request.GET.get('is_approved', '')
        if is_approved:
            users = users.filter(is_approved=is_approved.lower() == 'true')
        
        is_active = request.GET.get('is_active', '')
        if is_active:
            users = users.filter(is_active=is_active.lower() == 'true')
        
        # Paginate results
        paginator = UserPagination()
        paginated_users = paginator.paginate_queryset(users, request)
        serializer = UserProfileSerializer(paginated_users, many=True)
        
        return paginator.get_paginated_response(serializer.data)
        
    except Exception as e:
        logger.error(f"Error fetching users: {e}")
        return Response({
            'error': 'Failed to fetch users'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_user_details(request, user_id):
    """Get detailed information about a specific user"""
    try:
        user = CustomUser.objects.get(id=user_id)
        serializer = UserProfileSerializer(user)
        
        # Get additional user statistics
        login_attempts = LoginAttempt.objects.filter(user=user).count()
        successful_logins = LoginAttempt.objects.filter(user=user, success=True).count()
        failed_logins = LoginAttempt.objects.filter(user=user, success=False).count()
        active_sessions = UserSession.objects.filter(user=user, is_active=True).count()
        
        data = serializer.data
        data['statistics'] = {
            'total_login_attempts': login_attempts,
            'successful_logins': successful_logins,
            'failed_logins': failed_logins,
            'active_sessions': active_sessions,
        }
        
        return Response(data)
        
    except CustomUser.DoesNotExist:
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error fetching user details: {e}")
        return Response({
            'error': 'Failed to fetch user details'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAdminUser])
def update_user(request, user_id):
    """Update user information"""
    try:
        user = CustomUser.objects.get(id=user_id)
        
        # Prevent non-superusers from modifying superusers
        if user.is_superuser and not request.user.is_superuser:
            return Response({
                'error': 'You cannot modify superuser accounts'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Update allowed fields
        allowed_fields = [
            'first_name', 'last_name', 'email', 'phone_number', 
            'department', 'employee_id', 'role', 'is_approved', 'is_active'
        ]
        
        for field in allowed_fields:
            if field in request.data:
                setattr(user, field, request.data[field])
        
        user.save()
        
        serializer = UserProfileSerializer(user)
        return Response({
            'message': 'User updated successfully',
            'user': serializer.data
        })
        
    except CustomUser.DoesNotExist:
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error updating user: {e}")
        return Response({
            'error': 'Failed to update user'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def approve_user(request, user_id):
    """Approve a user account"""
    try:
        user = CustomUser.objects.get(id=user_id)
        user.is_approved = True
        user.save()
        
        return Response({
            'message': f'User {user.email} has been approved'
        })
        
    except CustomUser.DoesNotExist:
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error approving user: {e}")
        return Response({
            'error': 'Failed to approve user'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def disapprove_user(request, user_id):
    """Disapprove a user account"""
    try:
        user = CustomUser.objects.get(id=user_id)
        user.is_approved = False
        user.save()
        
        return Response({
            'message': f'User {user.email} has been disapproved'
        })
        
    except CustomUser.DoesNotExist:
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error disapproving user: {e}")
        return Response({
            'error': 'Failed to disapprove user'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def deactivate_user(request, user_id):
    """Deactivate a user account"""
    try:
        user = CustomUser.objects.get(id=user_id)
        
        # Prevent deactivating superusers
        if user.is_superuser and not request.user.is_superuser:
            return Response({
                'error': 'You cannot deactivate superuser accounts'
            }, status=status.HTTP_403_FORBIDDEN)
        
        user.is_active = False
        user.save()
        
        # Deactivate all user sessions
        UserSession.objects.filter(user=user).update(is_active=False)
        
        return Response({
            'message': f'User {user.email} has been deactivated'
        })
        
    except CustomUser.DoesNotExist:
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error deactivating user: {e}")
        return Response({
            'error': 'Failed to deactivate user'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def activate_user(request, user_id):
    """Activate a user account"""
    try:
        user = CustomUser.objects.get(id=user_id)
        user.is_active = True
        user.save()
        
        return Response({
            'message': f'User {user.email} has been activated'
        })
        
    except CustomUser.DoesNotExist:
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error activating user: {e}")
        return Response({
            'error': 'Failed to activate user'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def unlock_user_account(request, user_id):
    """Unlock a locked user account"""
    try:
        user = CustomUser.objects.get(id=user_id)
        user.unlock_account()
        
        return Response({
            'message': f'User {user.email} account has been unlocked'
        })
        
    except CustomUser.DoesNotExist:
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error unlocking user account: {e}")
        return Response({
            'error': 'Failed to unlock user account'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_user(request, user_id):
    """Delete a user account (soft delete by deactivating)"""
    try:
        user = CustomUser.objects.get(id=user_id)
        
        # Prevent deleting superusers
        if user.is_superuser:
            return Response({
                'error': 'Superuser accounts cannot be deleted'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Prevent self-deletion
        if user.id == request.user.id:
            return Response({
                'error': 'You cannot delete your own account'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Soft delete by deactivating
        user.is_active = False
        user.save()
        
        # Deactivate all user sessions
        UserSession.objects.filter(user=user).update(is_active=False)
        
        return Response({
            'message': f'User {user.email} has been deleted'
        })
        
    except CustomUser.DoesNotExist:
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error deleting user: {e}")
        return Response({
            'error': 'Failed to delete user'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_admin_statistics(request):
    """Get admin dashboard statistics"""
    try:
        # User statistics
        total_users = CustomUser.objects.count()
        active_users = CustomUser.objects.filter(is_active=True).count()
        pending_approval = CustomUser.objects.filter(is_approved=False, is_active=True).count()
        locked_accounts = CustomUser.objects.filter(account_locked_until__gt=timezone.now()).count()
        
        # Login statistics (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_logins = LoginAttempt.objects.filter(timestamp__gte=thirty_days_ago)
        successful_logins = recent_logins.filter(success=True).count()
        failed_logins = recent_logins.filter(success=False).count()
        
        # Active sessions
        active_sessions = UserSession.objects.filter(is_active=True).count()
        
        # User distribution by role
        role_distribution = CustomUser.objects.values('role').annotate(count=Count('role'))
        
        # User distribution by department
        department_distribution = CustomUser.objects.values('department').annotate(count=Count('department'))
        
        return Response({
            'user_statistics': {
                'total_users': total_users,
                'active_users': active_users,
                'pending_approval': pending_approval,
                'locked_accounts': locked_accounts,
            },
            'login_statistics': {
                'successful_logins_30d': successful_logins,
                'failed_logins_30d': failed_logins,
                'active_sessions': active_sessions,
            },
            'distributions': {
                'by_role': list(role_distribution),
                'by_department': list(department_distribution),
            }
        })
        
    except Exception as e:
        logger.error(f"Error fetching admin statistics: {e}")
        return Response({
            'error': 'Failed to fetch statistics'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_recent_login_attempts(request):
    """Get recent login attempts for monitoring"""
    try:
        limit = int(request.GET.get('limit', 50))
        attempts = LoginAttempt.objects.all()[:limit]
        
        data = []
        for attempt in attempts:
            data.append({
                'id': attempt.id,
                'user': attempt.user.email if attempt.user else None,
                'attempted_username': attempt.attempted_username,
                'ip_address': attempt.ip_address,
                'success': attempt.success,
                'timestamp': attempt.timestamp,
                'user_agent': attempt.user_agent[:100] if attempt.user_agent else None,
            })
        
        return Response(data)
        
    except Exception as e:
        logger.error(f"Error fetching login attempts: {e}")
        return Response({
            'error': 'Failed to fetch login attempts'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
