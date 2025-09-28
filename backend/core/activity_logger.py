from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
import json
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

class ActivityLog(models.Model):
    """Comprehensive activity logging for all system actions"""
    
    ACTION_TYPES = [
        # CRUD Operations
        ('create', 'Create'),
        ('read', 'Read/View'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        
        # Workflow Actions
        ('assign', 'Assign'),
        ('reassign', 'Reassign'),
        ('start', 'Start'),
        ('pause', 'Pause'),
        ('resume', 'Resume'),
        ('complete', 'Complete'),
        ('cancel', 'Cancel'),
        ('approve', 'Approve'),
        ('reject', 'Reject'),
        
        # Status Changes
        ('status_change', 'Status Change'),
        ('priority_change', 'Priority Change'),
        ('category_change', 'Category Change'),
        
        # Communication
        ('comment', 'Comment Added'),
        ('notification_sent', 'Notification Sent'),
        ('email_sent', 'Email Sent'),
        
        # System Events
        ('login', 'User Login'),
        ('logout', 'User Logout'),
        ('export', 'Data Export'),
        ('import', 'Data Import'),
        ('backup', 'Backup Created'),
        
        # Equipment Events
        ('equipment_failure', 'Equipment Failure'),
        ('maintenance_scheduled', 'Maintenance Scheduled'),
        ('maintenance_completed', 'Maintenance Completed'),
        
        # Escalation Events
        ('escalated', 'Escalated'),
        ('sla_violation', 'SLA Violation'),
        ('overdue', 'Overdue'),
    ]
    
    SEVERITY_LEVELS = [
        ('info', 'Information'),
        ('warning', 'Warning'),
        ('error', 'Error'),
        ('critical', 'Critical'),
    ]
    
    # Core fields
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action_type = models.CharField(max_length=30, choices=ACTION_TYPES)
    severity = models.CharField(max_length=10, choices=SEVERITY_LEVELS, default='info')
    timestamp = models.DateTimeField(default=timezone.now)
    
    # Object reference (generic foreign key)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Activity details
    description = models.TextField()
    old_values = models.JSONField(default=dict, blank=True)
    new_values = models.JSONField(default=dict, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    # Context information
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    session_key = models.CharField(max_length=40, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['action_type', 'timestamp']),
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['severity', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.get_action_type_display()} by {self.user} at {self.timestamp}"


class ActivityLogger:
    """Service for logging all system activities"""
    
    @staticmethod
    def log_activity(user, action_type, description, content_object=None, 
                    old_values=None, new_values=None, metadata=None, 
                    severity='info', request=None):
        """Log an activity with comprehensive details"""
        try:
            activity_data = {
                'user': user,
                'action_type': action_type,
                'description': description,
                'severity': severity,
                'old_values': old_values or {},
                'new_values': new_values or {},
                'metadata': metadata or {},
            }
            
            # Add object reference if provided
            if content_object:
                activity_data['content_object'] = content_object
            
            # Add request context if available
            if request:
                activity_data.update({
                    'ip_address': ActivityLogger._get_client_ip(request),
                    'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                    'session_key': request.session.session_key or '',
                })
            
            activity = ActivityLog.objects.create(**activity_data)
            return activity
            
        except Exception as e:
            logger.error(f"Error logging activity: {str(e)}")
            return None
    
    @staticmethod
    def log_model_change(user, instance, action_type, old_values=None, new_values=None, request=None):
        """Log model instance changes"""
        model_name = instance.__class__.__name__
        
        if action_type == 'create':
            description = f"Created {model_name}: {str(instance)}"
        elif action_type == 'update':
            description = f"Updated {model_name}: {str(instance)}"
        elif action_type == 'delete':
            description = f"Deleted {model_name}: {str(instance)}"
        else:
            description = f"{action_type.title()} {model_name}: {str(instance)}"
        
        return ActivityLogger.log_activity(
            user=user,
            action_type=action_type,
            description=description,
            content_object=instance,
            old_values=old_values,
            new_values=new_values,
            request=request
        )
    
    @staticmethod
    def log_workflow_action(user, instance, action_type, details=None, request=None):
        """Log workflow-specific actions"""
        model_name = instance.__class__.__name__
        
        descriptions = {
            'assign': f"Assigned {model_name} to {getattr(instance, 'assigned_to', 'technician')}",
            'reassign': f"Reassigned {model_name}",
            'start': f"Started work on {model_name}",
            'complete': f"Completed {model_name}",
            'escalate': f"Escalated {model_name}",
            'approve': f"Approved {model_name}",
            'reject': f"Rejected {model_name}",
        }
        
        description = descriptions.get(action_type, f"{action_type.title()} {model_name}")
        
        return ActivityLogger.log_activity(
            user=user,
            action_type=action_type,
            description=description,
            content_object=instance,
            metadata=details or {},
            request=request
        )
    
    @staticmethod
    def log_system_event(event_type, description, user=None, severity='info', metadata=None):
        """Log system-level events"""
        return ActivityLogger.log_activity(
            user=user,
            action_type=event_type,
            description=description,
            severity=severity,
            metadata=metadata or {}
        )
    
    @staticmethod
    def log_user_action(user, action_type, description, request=None, metadata=None):
        """Log user-specific actions"""
        return ActivityLogger.log_activity(
            user=user,
            action_type=action_type,
            description=description,
            metadata=metadata or {},
            request=request
        )
    
    @staticmethod
    def get_user_activity(user, limit=50, action_types=None):
        """Get activity history for a user"""
        queryset = ActivityLog.objects.filter(user=user)
        
        if action_types:
            queryset = queryset.filter(action_type__in=action_types)
        
        return queryset[:limit]
    
    @staticmethod
    def get_object_activity(instance, limit=50):
        """Get activity history for an object"""
        content_type = ContentType.objects.get_for_model(instance)
        return ActivityLog.objects.filter(
            content_type=content_type,
            object_id=instance.pk
        )[:limit]
    
    @staticmethod
    def get_system_activity(hours=24, severity=None):
        """Get recent system activity"""
        since = timezone.now() - timezone.timedelta(hours=hours)
        queryset = ActivityLog.objects.filter(timestamp__gte=since)
        
        if severity:
            queryset = queryset.filter(severity=severity)
        
        return queryset
    
    @staticmethod
    def _get_client_ip(request):
        """Extract client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


# Middleware to automatically log user activities
class ActivityLoggingMiddleware:
    """Middleware to automatically log user activities"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Log request start
        if request.user.is_authenticated:
            self._log_request_start(request)
        
        response = self.get_response(request)
        
        # Log request completion
        if request.user.is_authenticated:
            self._log_request_completion(request, response)
        
        return response
    
    def _log_request_start(self, request):
        """Log the start of a request"""
        if self._should_log_request(request):
            ActivityLogger.log_user_action(
                user=request.user,
                action_type='read',
                description=f"Accessed {request.path}",
                request=request,
                metadata={
                    'method': request.method,
                    'path': request.path,
                    'query_params': dict(request.GET),
                }
            )
    
    def _log_request_completion(self, request, response):
        """Log the completion of a request"""
        if response.status_code >= 400 and self._should_log_request(request):
            severity = 'error' if response.status_code >= 500 else 'warning'
            ActivityLogger.log_user_action(
                user=request.user,
                action_type='error',
                description=f"Request failed: {request.path} ({response.status_code})",
                request=request,
                metadata={
                    'status_code': response.status_code,
                    'method': request.method,
                    'path': request.path,
                },
                severity=severity
            )
    
    def _should_log_request(self, request):
        """Determine if request should be logged"""
        # Skip static files and admin
        skip_paths = ['/static/', '/media/', '/admin/']
        return not any(request.path.startswith(path) for path in skip_paths)


# Decorator for automatic activity logging
def log_activity(action_type, description_template=None):
    """Decorator to automatically log function calls"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Extract user and request from args/kwargs
            user = kwargs.get('user') or getattr(args[0], 'user', None) if args else None
            request = kwargs.get('request') or getattr(args[0], 'request', None) if args else None
            
            try:
                result = func(*args, **kwargs)
                
                # Log successful action
                if user:
                    description = description_template or f"Executed {func.__name__}"
                    ActivityLogger.log_user_action(
                        user=user,
                        action_type=action_type,
                        description=description,
                        request=request,
                        metadata={
                            'function': func.__name__,
                            'args': str(args)[:200],  # Truncate for storage
                            'kwargs': str(kwargs)[:200],
                        }
                    )
                
                return result
                
            except Exception as e:
                # Log error
                if user:
                    ActivityLogger.log_user_action(
                        user=user,
                        action_type='error',
                        description=f"Error in {func.__name__}: {str(e)}",
                        request=request,
                        severity='error',
                        metadata={
                            'function': func.__name__,
                            'error': str(e),
                        }
                    )
                raise
        
        return wrapper
    return decorator
