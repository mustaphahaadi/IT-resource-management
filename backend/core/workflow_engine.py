from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from requests_system.models import SupportRequest
from tasks.models import Task, ITPersonnel
from inventory.models import Equipment
from notifications.models import Notification
import logging
import json

User = get_user_model()
logger = logging.getLogger(__name__)

class WorkflowEngine:
    """Central workflow engine for orchestrating system processes"""
    
    @staticmethod
    def process_new_request(request):
        """Process a new support request through the workflow"""
        try:
            # 1. Auto-categorize and prioritize
            WorkflowEngine._auto_categorize_request(request)
            
            # 2. Set SLA deadlines
            WorkflowEngine._set_sla_deadlines(request)
            
            # 3. Auto-assign disabled - manual assignment required
            # WorkflowEngine._auto_assign_request(request)
            
            # 4. Create task if needed (only if request is already assigned)
            if request.assigned_to and WorkflowEngine._should_create_task(request):
                WorkflowEngine._create_task_from_request(request)
            
            # 5. Send notifications
            WorkflowEngine._send_request_notifications(request)
            
            # 6. Log workflow step
            WorkflowEngine._log_workflow_step(request, 'request_created')
            
            return True
            
        except Exception as e:
            logger.error(f"Error processing new request {request.id}: {str(e)}")
            return False
    
    @staticmethod
    def process_task_assignment(task, technician, assigned_by=None):
        """Process task assignment workflow"""
        try:
            # 1. Update task status
            task.assigned_to = technician
            task.status = 'assigned'
            task.assigned_at = timezone.now()
            task.save()
            
            # 2. Update related request
            if task.related_request:
                task.related_request.assigned_to = technician.user
                task.related_request.status = 'assigned'
                task.related_request.assigned_at = timezone.now()
                task.related_request.save()
            
            # 3. Send notifications
            WorkflowEngine._send_assignment_notifications(task, technician, assigned_by)
            
            # 4. Check for escalation needs
            WorkflowEngine._check_escalation_needs(task)
            
            # 5. Log workflow step
            WorkflowEngine._log_workflow_step(task, 'task_assigned')
            
            return True
            
        except Exception as e:
            logger.error(f"Error processing task assignment {task.id}: {str(e)}")
            return False
    
    @staticmethod
    def process_task_completion(task, completion_notes="", actual_hours=None):
        """Process task completion workflow"""
        try:
            # 1. Update task
            task.status = 'completed'
            task.completed_at = timezone.now()
            task.completion_notes = completion_notes
            if actual_hours:
                task.actual_hours = actual_hours
            task.save()
            
            # 2. Update related request
            if task.related_request:
                task.related_request.status = 'resolved'
                task.related_request.resolved_at = timezone.now()
                task.related_request.resolution_notes = completion_notes
                task.related_request.save()
            
            # 3. Update equipment status if applicable
            WorkflowEngine._update_equipment_status(task)
            
            # 4. Send completion notifications
            WorkflowEngine._send_completion_notifications(task)
            
            # 5. Generate follow-up tasks if needed
            WorkflowEngine._generate_followup_tasks(task)
            
            # 6. Log workflow step
            WorkflowEngine._log_workflow_step(task, 'task_completed')
            
            return True
            
        except Exception as e:
            logger.error(f"Error processing task completion {task.id}: {str(e)}")
            return False
    
    @staticmethod
    def _auto_categorize_request(request):
        """Auto-categorize request based on content"""
        keywords = {
            'hardware': ['computer', 'laptop', 'printer', 'monitor', 'keyboard', 'mouse'],
            'software': ['application', 'program', 'software', 'system', 'database'],
            'network': ['internet', 'wifi', 'network', 'connection', 'email'],
            'security': ['password', 'access', 'login', 'security', 'virus']
        }
        
        content = f"{request.title} {request.description}".lower()
        
        for category, words in keywords.items():
            if any(word in content for word in words):
                # Update category if not already set
                if not request.category or request.category.name.lower() == 'general':
                    from requests_system.models import RequestCategory
                    try:
                        cat = RequestCategory.objects.get(name__iexact=category)
                        request.category = cat
                        request.save()
                    except RequestCategory.DoesNotExist:
                        pass
                break
    
    @staticmethod
    def _set_sla_deadlines(request):
        """Set SLA deadlines based on priority"""
        sla_hours = {
            'critical': 2,   # 2 hours
            'high': 8,       # 8 hours
            'medium': 24,    # 24 hours
            'low': 72        # 72 hours
        }
        
        hours = sla_hours.get(request.priority, 24)
        request.response_due = timezone.now() + timezone.timedelta(hours=1)
        request.resolution_due = timezone.now() + timezone.timedelta(hours=hours)
        request.save()
    
    @staticmethod
    def _auto_assign_request(request):
        """Auto-assign request to best available technician"""
        try:
            from tasks.services import TaskAssignmentService
            
            # Get available technicians for the department
            technicians = TaskAssignmentService.get_available_technicians(
                department=request.requester_department
            )
            
            if technicians:
                # Assign to least loaded technician
                best_tech = technicians[0]['technician']
                request.assigned_to = best_tech.user
                request.status = 'assigned'
                request.assigned_at = timezone.now()
                request.save()
                
                return best_tech
                
        except Exception as e:
            logger.error(f"Error auto-assigning request {request.id}: {str(e)}")
        
        return None
    
    @staticmethod
    def _should_create_task(request):
        """Determine if a task should be created for the request"""
        # Create task for high/critical priority or specific categories
        if request.priority in ['critical', 'high']:
            return True
        
        # Create task for hardware/equipment related requests
        if request.category and request.category.name.lower() in ['hardware', 'equipment']:
            return True
        
        # Create task if related to specific equipment
        if request.related_equipment:
            return True
        
        return False
    
    @staticmethod
    def _create_task_from_request(request):
        """Create a task from the request"""
        try:
            from tasks.services import TaskAssignmentService
            
            task = TaskAssignmentService.create_task_from_request(
                request,
                title=f"Support Request: {request.title}",
                description=request.description,
                priority=request.priority
            )
            
            # Auto-assign if request is already assigned
            if request.assigned_to:
                try:
                    technician = ITPersonnel.objects.get(user=request.assigned_to)
                    TaskAssignmentService.assign_task_to_technician(task, technician)
                except ITPersonnel.DoesNotExist:
                    # Try auto-assignment
                    TaskAssignmentService.auto_assign_task(task)
            else:
                # Try auto-assignment
                TaskAssignmentService.auto_assign_task(task)
            
            return task
            
        except Exception as e:
            logger.error(f"Error creating task from request {request.id}: {str(e)}")
            return None
    
    @staticmethod
    def _send_request_notifications(request):
        """Send notifications for new request"""
        try:
            # Notify requester
            from core.notification_service import NotificationService
            NotificationService.send_notification(
                request.requester,
                f"Support Request Created: {request.ticket_number}",
                f"Your support request '{request.title}' has been created and will be processed soon.",
                notification_type='request_created',
                related_object_type='request',
                related_object_id=request.id
            )
            
            # Notify assigned technician if assigned
            if request.assigned_to:
                from core.notification_service import NotificationService
                NotificationService.send_notification(
                    request.assigned_to,
                    f"New Request Assigned: {request.ticket_number}",
                    f"You have been assigned a new {request.priority} priority request: {request.title}",
                    notification_type='request_update',
                    related_object_type='request',
                    related_object_id=request.id
                )
            
        except Exception as e:
            logger.error(f"Error sending request notifications {request.id}: {str(e)}")
    
    @staticmethod
    def _send_assignment_notifications(task, technician, assigned_by=None):
        """Send notifications for task assignment"""
        try:
            # Notify technician
            title = f"Task Assigned: {task.title}"
            message = f"You have been assigned a new {task.priority} priority task"
            
            if assigned_by:
                message += f" by {assigned_by.get_full_name()}"
            
            from core.notification_service import NotificationService
            NotificationService.send_notification(
                technician.user,
                title,
                message,
                notification_type='task_assignment',
                related_object_type='task',
                related_object_id=task.id
            )
            
            # Notify requester if task has related request
            if task.related_request:
                from core.notification_service import NotificationService
                NotificationService.send_notification(
                    task.related_request.requester,
                    "Your Request is Being Worked On",
                    f"Your support request '{task.related_request.title}' has been assigned to {technician.user.get_full_name()}",
                    notification_type='request_update',
                    related_object_type='request',
                    related_object_id=task.related_request.id
                )
            
        except Exception as e:
            logger.error(f"Error sending assignment notifications {task.id}: {str(e)}")
    
    @staticmethod
    def _send_completion_notifications(task):
        """Send notifications for task completion"""
        try:
            # Notify requester if task has related request
            if task.related_request:
                from core.notification_service import NotificationService
                NotificationService.send_notification(
                    task.related_request.requester,
                    "Your Request Has Been Resolved",
                    f"Your support request '{task.related_request.title}' has been completed. Please review the resolution.",
                    notification_type='request_resolved',
                    related_object_type='request',
                    related_object_id=task.related_request.id
                )
            
            # Notify supervisor/manager
            if task.assigned_to and task.assigned_to.user.role in ['technician', 'senior_technician']:
                # Find managers in the same department
                managers = User.objects.filter(
                    role__in=['it_manager', 'system_admin'],
                    department=task.assigned_to.user.department
                )
                
                from core.notification_service import NotificationService
                for manager in managers:
                    NotificationService.send_notification(
                        manager,
                        f"Task Completed by {task.assigned_to.user.get_full_name()}",
                        f"Task '{task.title}' has been completed",
                        notification_type='task_completed',
                        related_object_type='task',
                        related_object_id=task.id
                    )
            
        except Exception as e:
            logger.error(f"Error sending completion notifications {task.id}: {str(e)}")
    
    @staticmethod
    def _update_equipment_status(task):
        """Update equipment status based on task completion"""
        try:
            if task.related_request and task.related_request.related_equipment:
                equipment = task.related_request.related_equipment
                
                # Update equipment status based on task outcome
                if 'repair' in task.title.lower() or 'fix' in task.title.lower():
                    equipment.status = 'active'
                elif 'maintenance' in task.title.lower():
                    equipment.status = 'active'
                elif 'replace' in task.title.lower():
                    equipment.status = 'retired'
                
                equipment.save()
                
        except Exception as e:
            logger.error(f"Error updating equipment status for task {task.id}: {str(e)}")
    
    @staticmethod
    def _generate_followup_tasks(task):
        """Generate follow-up tasks if needed"""
        try:
            # Generate maintenance task for equipment repairs
            if (task.related_request and 
                task.related_request.related_equipment and 
                'repair' in task.title.lower()):
                
                # Create preventive maintenance task
                followup_task = Task.objects.create(
                    title=f"Preventive Maintenance: {task.related_request.related_equipment.name}",
                    description=f"Follow-up maintenance after repair of {task.related_request.related_equipment.name}",
                    priority='low',
                    status='pending',
                    due_date=timezone.now() + timezone.timedelta(days=30),
                    estimated_hours=2.0
                )
                
                # Try to assign to same technician
                if task.assigned_to and not task.assigned_to.is_overloaded:
                    from tasks.services import TaskAssignmentService
                    TaskAssignmentService.assign_task_to_technician(
                        followup_task, task.assigned_to
                    )
                
        except Exception as e:
            logger.error(f"Error generating follow-up tasks for {task.id}: {str(e)}")
    
    @staticmethod
    def _check_escalation_needs(task):
        """Check if task needs escalation"""
        try:
            # Escalate critical tasks if not started within 1 hour
            if (task.priority == 'critical' and 
                task.status == 'assigned' and 
                task.assigned_at and
                timezone.now() - task.assigned_at > timezone.timedelta(hours=1)):
                
                WorkflowEngine._escalate_task(task, 'not_started_in_time')
            
        except Exception as e:
            logger.error(f"Error checking escalation for task {task.id}: {str(e)}")
    
    @staticmethod
    def _escalate_task(task, reason):
        """Escalate task to higher level"""
        try:
            # Find managers/supervisors
            supervisors = User.objects.filter(
                role__in=['it_manager', 'system_admin'],
                department=task.assigned_to.user.department if task.assigned_to else 'it'
            )
            
            from core.notification_service import NotificationService
            for supervisor in supervisors:
                NotificationService.send_notification(
                    supervisor,
                    f"Task Escalation: {task.title}",
                    f"Task has been escalated due to: {reason}",
                    notification_type='task_escalation',
                    related_object_type='task',
                    related_object_id=task.id
                )
            
        except Exception as e:
            logger.error(f"Error escalating task {task.id}: {str(e)}")
    
    @staticmethod
    def _log_workflow_step(obj, step_type):
        """Log workflow step for audit trail"""
        try:
            from analytics.models import WorkflowLog
            
            WorkflowLog.objects.create(
                object_type=obj.__class__.__name__.lower(),
                object_id=obj.id,
                step_type=step_type,
                timestamp=timezone.now(),
                metadata=json.dumps({
                    'title': getattr(obj, 'title', ''),
                    'status': getattr(obj, 'status', ''),
                    'priority': getattr(obj, 'priority', ''),
                })
            )
            
        except Exception as e:
            logger.error(f"Error logging workflow step: {str(e)}")


class SLAManager:
    """Manage SLA compliance and escalations"""
    
    @staticmethod
    def check_sla_violations():
        """Check for SLA violations and trigger escalations"""
        try:
            now = timezone.now()
            
            # Check overdue requests
            overdue_requests = SupportRequest.objects.filter(
                resolution_due__lt=now,
                status__in=['open', 'assigned', 'in_progress']
            )
            
            for request in overdue_requests:
                SLAManager._handle_sla_violation(request)
            
            # Check overdue tasks
            overdue_tasks = Task.objects.filter(
                due_date__lt=now,
                status__in=['assigned', 'in_progress']
            )
            
            for task in overdue_tasks:
                SLAManager._handle_task_overdue(task)
                
        except Exception as e:
            logger.error(f"Error checking SLA violations: {str(e)}")
    
    @staticmethod
    def _handle_sla_violation(request):
        """Handle SLA violation for request"""
        try:
            # Escalate to managers
            managers = User.objects.filter(
                role__in=['it_manager', 'system_admin'],
                department=request.requester_department
            )
            
            from core.notification_service import NotificationService
            for manager in managers:
                NotificationService.send_notification(
                    manager,
                    f"SLA Violation: {request.ticket_number}",
                    f"Request '{request.title}' has exceeded its SLA deadline",
                    notification_type='sla_violation',
                    related_object_type='request',
                    related_object_id=request.id
                )
            
        except Exception as e:
            logger.error(f"Error handling SLA violation for request {request.id}: {str(e)}")
    
    @staticmethod
    def _handle_task_overdue(task):
        """Handle overdue task"""
        try:
            # Notify assigned technician and supervisor
            if task.assigned_to:
                from core.notification_service import NotificationService
                NotificationService.send_notification(
                    task.assigned_to.user,
                    f"Overdue Task: {task.title}",
                    f"Your task '{task.title}' is overdue. Please update the status.",
                    notification_type='task_overdue',
                    related_object_type='task',
                    related_object_id=task.id
                )
            
        except Exception as e:
            logger.error(f"Error handling overdue task {task.id}: {str(e)}")
