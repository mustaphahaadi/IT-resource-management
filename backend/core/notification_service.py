from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from notifications.models import Notification
# from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import logging
import json

User = get_user_model()
logger = logging.getLogger(__name__)

class NotificationService:
    """Enhanced notification service with multiple delivery channels"""
    
    @staticmethod
    def send_notification(user, title, message, notification_type='general', 
                         related_object_type=None, related_object_id=None,
                         priority='medium', channels=['in_app']):
        """Send notification through multiple channels"""
        try:
            # Create in-app notification
            notification = Notification.objects.create(
                user=user,
                title=title,
                message=message,
                notification_type=notification_type,
                related_object_type=related_object_type,
                related_object_id=related_object_id,
                priority=priority
            )
            
            # Send through requested channels
            if 'in_app' in channels:
                NotificationService._send_realtime_notification(user, notification)
            
            if 'email' in channels:
                NotificationService._send_email_notification(user, notification)
            
            if 'sms' in channels:
                NotificationService._send_sms_notification(user, notification)
            
            return notification
            
        except Exception as e:
            logger.error(f"Error sending notification to {user.username}: {str(e)}")
            return None
    
    @staticmethod
    def send_bulk_notification(users, title, message, **kwargs):
        """Send notification to multiple users"""
        notifications = []
        for user in users:
            notification = NotificationService.send_notification(
                user, title, message, **kwargs
            )
            if notification:
                notifications.append(notification)
        return notifications
    
    @staticmethod
    def send_role_based_notification(roles, departments, title, message, **kwargs):
        """Send notification to users based on roles and departments"""
        users = User.objects.filter(
            role__in=roles,
            department__in=departments if departments else User.objects.values_list('department', flat=True).distinct()
        )
        return NotificationService.send_bulk_notification(users, title, message, **kwargs)
    
    @staticmethod
    def _send_realtime_notification(user, notification):
        """Send real-time notification via WebSocket"""
        try:
            channel_layer = get_channel_layer()
            if channel_layer:
                async_to_sync(channel_layer.group_send)(
                    f"user_{user.id}",
                    {
                        'type': 'notification_message',
                        'notification': {
                            'id': notification.id,
                            'title': notification.title,
                            'message': notification.message,
                            'type': notification.notification_type,
                            'priority': notification.priority,
                            'created_at': notification.created_at.isoformat(),
                        }
                    }
                )
        except Exception as e:
            logger.error(f"Error sending real-time notification: {str(e)}")
    
    @staticmethod
    def _send_email_notification(user, notification):
        """Send email notification"""
        try:
            if user.email and hasattr(settings, 'EMAIL_HOST'):
                subject = f"[Hospital IT] {notification.title}"
                message_body = f"""
                Dear {user.get_full_name()},
                
                {notification.message}
                
                Please log in to the Hospital IT system to view more details.
                
                Best regards,
                Hospital IT Team
                """
                
                send_mail(
                    subject,
                    message_body,
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=True
                )
                
        except Exception as e:
            logger.error(f"Error sending email notification: {str(e)}")
    
    @staticmethod
    def _send_sms_notification(user, notification):
        """Send SMS notification (placeholder for SMS service integration)"""
        try:
            # Implement SMS service integration here
            # This could use Twilio, AWS SNS, or other SMS providers
            logger.info(f"SMS notification would be sent to {user.phone_number}: {notification.title}")
            
        except Exception as e:
            logger.error(f"Error sending SMS notification: {str(e)}")
    
    @staticmethod
    def create_system_alert(alert_type, severity, title, message, metadata=None):
        """Create system alert"""
        try:
            from analytics.models import SystemAlert
            
            alert = SystemAlert.objects.create(
                alert_type=alert_type,
                severity=severity,
                title=title,
                message=message,
                metadata=metadata or {}
            )
            
            # Notify relevant users based on alert type and severity
            NotificationService._notify_for_system_alert(alert)
            
            return alert
            
        except Exception as e:
            logger.error(f"Error creating system alert: {str(e)}")
            return None
    
    @staticmethod
    def _notify_for_system_alert(alert):
        """Send notifications for system alerts"""
        try:
            # Determine who should be notified based on alert type and severity
            roles_to_notify = []
            
            if alert.severity in ['critical', 'high']:
                roles_to_notify.extend(['admin', 'staff'])
            
            if alert.alert_type == 'equipment_failure':
                roles_to_notify.extend(['technician'])
            elif alert.alert_type == 'sla_violation':
                roles_to_notify.extend(['manager', 'staff'])
            elif alert.alert_type == 'security_issue':
                roles_to_notify = ['admin']
            
            if roles_to_notify:
                users = User.objects.filter(role__in=roles_to_notify)
                
                channels = ['in_app']
                if alert.severity == 'critical':
                    channels.append('email')
                
                NotificationService.send_bulk_notification(
                    users,
                    f"System Alert: {alert.title}",
                    alert.message,
                    notification_type='system_alert',
                    priority=alert.severity,
                    channels=channels
                )
                
        except Exception as e:
            logger.error(f"Error notifying for system alert: {str(e)}")


class WorkflowNotifications:
    """Workflow-specific notification templates and logic"""
    
    @staticmethod
    def request_created(request):
        """Notifications for new request creation"""
        # Notify requester
        NotificationService.send_notification(
            request.requester,
            f"Support Request Created: {request.ticket_number}",
            f"Your support request '{request.title}' has been created and will be processed according to {request.priority} priority.",
            notification_type='request_created',
            related_object_type='request',
            related_object_id=request.id,
            priority=request.priority
        )
        
        # Notify department staff for high/critical priority
        if request.priority in ['critical', 'high']:
            staff_users = User.objects.filter(
                role__in=['staff', 'admin'],
                department__in=[request.requester_department, 'it']
            )
            
            NotificationService.send_bulk_notification(
                staff_users,
                f"New {request.priority.title()} Priority Request",
                f"New {request.priority} priority request from {request.requester_department}: {request.title}",
                notification_type='request_created',
                related_object_type='request',
                related_object_id=request.id,
                priority=request.priority,
                channels=['in_app', 'email'] if request.priority == 'critical' else ['in_app']
            )
    
    @staticmethod
    def task_assigned(task, technician, assigned_by=None):
        """Notifications for task assignment"""
        # Notify technician
        message = f"You have been assigned a new {task.priority} priority task: {task.title}"
        if assigned_by:
            message += f" by {assigned_by.get_full_name()}"
        
        NotificationService.send_notification(
            technician.user,
            f"Task Assigned: {task.title}",
            message,
            notification_type='task_assignment',
            related_object_type='task',
            related_object_id=task.id,
            priority=task.priority
        )
        
        # Notify requester if task has related request
        if task.related_request:
            NotificationService.send_notification(
                task.related_request.requester,
                "Your Request is Being Worked On",
                f"Your support request '{task.related_request.title}' has been assigned to {technician.user.get_full_name()} and work will begin soon.",
                notification_type='request_update',
                related_object_type='request',
                related_object_id=task.related_request.id
            )
    
    @staticmethod
    def task_completed(task):
        """Notifications for task completion"""
        # Notify requester if task has related request
        if task.related_request:
            NotificationService.send_notification(
                task.related_request.requester,
                "Your Request Has Been Resolved",
                f"Your support request '{task.related_request.title}' has been completed. Resolution: {task.completion_notes or 'Task completed successfully.'}",
                notification_type='request_resolved',
                related_object_type='request',
                related_object_id=task.related_request.id,
                channels=['in_app', 'email']
            )
        
        # Notify supervisor/manager
        if task.assigned_to:
            supervisors = User.objects.filter(
                role__in=['manager', 'staff'],
                department=task.assigned_to.user.department
            )
            
            NotificationService.send_bulk_notification(
                supervisors,
                f"Task Completed by {task.assigned_to.user.get_full_name()}",
                f"Task '{task.title}' has been completed. Time taken: {task.actual_hours or 'Not specified'} hours.",
                notification_type='task_completed',
                related_object_type='task',
                related_object_id=task.id
            )
    
    @staticmethod
    def sla_violation(request_or_task):
        """Notifications for SLA violations"""
        obj_type = 'request' if hasattr(request_or_task, 'ticket_number') else 'task'
        title = f"SLA Violation: {getattr(request_or_task, 'ticket_number', request_or_task.title)}"
        
        # Notify managers and staff
        managers = User.objects.filter(
            role__in=['manager', 'staff', 'admin'],
            department__in=[
                getattr(request_or_task, 'requester_department', 'it'),
                'it'
            ]
        )
        
        NotificationService.send_bulk_notification(
            managers,
            title,
            f"The {obj_type} '{getattr(request_or_task, 'title', request_or_task.ticket_number)}' has exceeded its SLA deadline and requires immediate attention.",
            notification_type='sla_violation',
            related_object_type=obj_type,
            related_object_id=request_or_task.id,
            priority='high',
            channels=['in_app', 'email']
        )
    
    @staticmethod
    def equipment_failure(equipment, description=""):
        """Notifications for equipment failures"""
        # Notify IT technicians and staff
        it_users = User.objects.filter(
            role__in=['technician', 'staff', 'admin'],
            department='it'
        )
        
        # Also notify users in the equipment's location department
        dept_users = User.objects.filter(
            role__in=['manager', 'staff'],
            department=equipment.location.department.name.lower() if equipment.location else 'it'
        )
        
        all_users = (it_users | dept_users).distinct()
        
        NotificationService.send_bulk_notification(
            all_users,
            f"Equipment Failure: {equipment.name}",
            f"Equipment '{equipment.name}' (Asset: {equipment.asset_tag}) has failed. {description}",
            notification_type='equipment_failure',
            related_object_type='equipment',
            related_object_id=equipment.id,
            priority='high',
            channels=['in_app', 'email']
        )
    
    @staticmethod
    def technician_overload(technician):
        """Notifications for technician overload"""
        # Notify managers and staff
        managers = User.objects.filter(
            role__in=['manager', 'staff', 'admin'],
            department__in=[technician.user.department, 'it']
        )
        
        NotificationService.send_bulk_notification(
            managers,
            f"Technician Overload: {technician.user.get_full_name()}",
            f"Technician {technician.user.get_full_name()} is at maximum capacity ({technician.current_task_count}/{technician.max_concurrent_tasks} tasks). Consider redistributing workload.",
            notification_type='workload_alert',
            priority='medium'
        )
