from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
from .models import Notification, NotificationPreference
from .serializers import (
    NotificationSerializer, 
    NotificationPreferenceSerializer,
    NotificationCreateSerializer
)
import logging

logger = logging.getLogger(__name__)

class NotificationPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'limit'
    max_page_size = 100

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_notifications(request):
    """Get user's notifications with pagination and filtering"""
    try:
        user = request.user
        
        # Get query parameters
        unread_only = request.GET.get('unread_only', 'false').lower() == 'true'
        notification_type = request.GET.get('type')
        priority = request.GET.get('priority')
        limit = int(request.GET.get('limit', 20))
        
        # Build query
        queryset = Notification.objects.filter(recipient=user)
        
        # Apply filters
        if unread_only:
            queryset = queryset.filter(is_read=False)
        
        if notification_type:
            queryset = queryset.filter(type=notification_type)
        
        if priority:
            queryset = queryset.filter(priority=priority)
        
        # Exclude expired notifications
        queryset = queryset.filter(
            Q(expires_at__isnull=True) | Q(expires_at__gt=timezone.now())
        )
        
        # Limit results
        notifications = queryset[:limit]
        
        serializer = NotificationSerializer(notifications, many=True)
        
        # Get counts
        total_count = queryset.count()
        unread_count = queryset.filter(is_read=False).count()
        
        return Response({
            'notifications': serializer.data,
            'total_count': total_count,
            'unread_count': unread_count,
            'has_more': total_count > limit
        })
        
    except Exception as e:
        logger.error(f"Error fetching notifications: {e}")
        return Response({
            'error': 'Failed to fetch notifications'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_notification_read(request, notification_id):
    """Mark a specific notification as read"""
    try:
        notification = get_object_or_404(
            Notification, 
            id=notification_id, 
            recipient=request.user
        )
        
        notification.mark_as_read()
        
        return Response({
            'message': 'Notification marked as read'
        })
        
    except Exception as e:
        logger.error(f"Error marking notification as read: {e}")
        return Response({
            'error': 'Failed to mark notification as read'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_all_read(request):
    """Mark all user's notifications as read"""
    try:
        user = request.user
        
        # Update all unread notifications
        updated_count = Notification.objects.filter(
            recipient=user,
            is_read=False
        ).update(
            is_read=True,
            read_at=timezone.now()
        )
        
        return Response({
            'message': f'Marked {updated_count} notifications as read'
        })
        
    except Exception as e:
        logger.error(f"Error marking all notifications as read: {e}")
        return Response({
            'error': 'Failed to mark notifications as read'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def dismiss_notification(request, notification_id):
    """Dismiss a specific notification"""
    try:
        notification = get_object_or_404(
            Notification,
            id=notification_id,
            recipient=request.user
        )
        
        notification.is_dismissed = True
        notification.save(update_fields=['is_dismissed'])
        
        return Response({
            'message': 'Notification dismissed'
        })
        
    except Exception as e:
        logger.error(f"Error dismissing notification: {e}")
        return Response({
            'error': 'Failed to dismiss notification'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'PUT'])
@permission_classes([permissions.IsAuthenticated])
def notification_preferences(request):
    """Get or update user's notification preferences"""
    try:
        user = request.user
        
        # Get or create preferences
        preferences, created = NotificationPreference.objects.get_or_create(
            user=user,
            defaults={
                'system_notifications': 'web',
                'request_notifications': 'both',
                'task_notifications': 'both',
                'maintenance_notifications': 'web',
                'equipment_alerts_enabled': True,
                'email_digest_frequency': 'daily'
            }
        )
        
        if request.method == 'GET':
            serializer = NotificationPreferenceSerializer(preferences)
            return Response(serializer.data)
        
        elif request.method == 'PUT':
            serializer = NotificationPreferenceSerializer(
                preferences, 
                data=request.data, 
                partial=True
            )
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'message': 'Preferences updated successfully',
                    'preferences': serializer.data
                })
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error handling notification preferences: {e}")
        return Response({
            'error': 'Failed to handle notification preferences'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_notification(request):
    """Create a new notification (admin/system use)"""
    try:
        # Check if user has permission to create notifications
        if not request.user.is_staff and not request.user.is_superuser:
            return Response({
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = NotificationCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            notification = serializer.save()
            response_serializer = NotificationSerializer(notification)
            
            return Response({
                'message': 'Notification created successfully',
                'notification': response_serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        logger.error(f"Error creating notification: {e}")
        return Response({
            'error': 'Failed to create notification'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_notification_stats(request):
    """Get notification statistics for the user"""
    try:
        user = request.user
        
        # Get counts by type and priority
        notifications = Notification.objects.filter(recipient=user)
        
        stats = {
            'total': notifications.count(),
            'unread': notifications.filter(is_read=False).count(),
            'by_type': {},
            'by_priority': {},
            'recent_count': notifications.filter(
                created_at__gte=timezone.now() - timezone.timedelta(days=7)
            ).count()
        }
        
        # Count by type
        for choice in Notification.TYPE_CHOICES:
            type_name = choice[0]
            count = notifications.filter(type=type_name).count()
            if count > 0:
                stats['by_type'][type_name] = count
        
        # Count by priority
        for choice in Notification.PRIORITY_CHOICES:
            priority_name = choice[0]
            count = notifications.filter(priority=priority_name).count()
            if count > 0:
                stats['by_priority'][priority_name] = count
        
        return Response(stats)
        
    except Exception as e:
        logger.error(f"Error getting notification stats: {e}")
        return Response({
            'error': 'Failed to get notification statistics'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
