from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import Task, ITPersonnel, TaskAssignmentRule
from requests_system.models import SupportRequest
from notifications.models import Notification
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

class TaskAssignmentService:
    """Service for intelligent task assignment to technicians"""
    
    @staticmethod
    def create_task_from_request(request, title=None, description=None, priority=None, estimated_hours=None):
        """Create a task from a support request"""
        try:
            task = Task.objects.create(
                title=title or f"Support Request: {request.title}",
                description=description or request.description,
                related_request=request,
                priority=priority or request.priority,
                estimated_hours=estimated_hours,
                due_date=request.resolution_due
            )
            
            # Update request status
            request.status = 'assigned'
            request.assigned_at = timezone.now()
            request.save()
            
            logger.info(f"Created task {task.id} from request {request.ticket_number}")
            return task
            
        except Exception as e:
            logger.error(f"Error creating task from request {request.ticket_number}: {str(e)}")
            raise
    
    @staticmethod
    def auto_assign_task(task):
        """Automatically assign task to best available technician"""
        try:
            # Get assignment rules ordered by priority
            rules = TaskAssignmentRule.objects.filter(is_active=True).order_by('-priority')
            
            for rule in rules:
                technician = TaskAssignmentService._apply_assignment_rule(task, rule)
                if technician:
                    return TaskAssignmentService.assign_task_to_technician(task, technician, auto_assigned=True)
            
            # Fallback to simple workload-based assignment
            technician = TaskAssignmentService._get_least_loaded_technician(task)
            if technician:
                return TaskAssignmentService.assign_task_to_technician(task, technician, auto_assigned=True)
            
            logger.warning(f"No suitable technician found for task {task.id}")
            return False
            
        except Exception as e:
            logger.error(f"Error auto-assigning task {task.id}: {str(e)}")
            return False
    
    @staticmethod
    def assign_task_to_technician(task, technician, assigned_by=None, auto_assigned=False):
        """Assign a specific task to a specific technician"""
        try:
            # Check if technician is overloaded
            if technician.is_overloaded:
                logger.warning(f"Technician {technician.user.username} is overloaded")
                return False
            
            # Update task
            task.assigned_to = technician
            task.status = 'assigned'
            task.assigned_at = timezone.now()
            task.save()
            
            # Create notification for technician
            TaskAssignmentService._create_assignment_notification(task, technician, assigned_by, auto_assigned)
            
            # Update related request if exists
            if task.related_request:
                task.related_request.assigned_to = technician.user
                task.related_request.status = 'assigned'
                task.related_request.assigned_at = timezone.now()
                task.related_request.save()
            
            logger.info(f"Assigned task {task.id} to technician {technician.user.username}")
            return True
            
        except Exception as e:
            logger.error(f"Error assigning task {task.id} to technician {technician.id}: {str(e)}")
            return False
    
    @staticmethod
    def reassign_task(task, new_technician, reassigned_by=None, reason=None):
        """Reassign a task to a different technician"""
        try:
            old_technician = task.assigned_to
            
            # Assign to new technician
            success = TaskAssignmentService.assign_task_to_technician(task, new_technician, reassigned_by)
            
            if success:
                # Create notifications
                TaskAssignmentService._create_reassignment_notifications(
                    task, old_technician, new_technician, reassigned_by, reason
                )
                
                logger.info(f"Reassigned task {task.id} from {old_technician.user.username if old_technician else 'unassigned'} to {new_technician.user.username}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error reassigning task {task.id}: {str(e)}")
            return False
    
    @staticmethod
    def get_technician_workload(technician):
        """Get detailed workload information for a technician"""
        active_tasks = Task.objects.filter(
            assigned_to=technician,
            status__in=['assigned', 'in_progress']
        )
        
        return {
            'technician': technician,
            'active_task_count': active_tasks.count(),
            'max_concurrent_tasks': technician.max_concurrent_tasks,
            'utilization_percentage': (active_tasks.count() / technician.max_concurrent_tasks) * 100,
            'is_overloaded': technician.is_overloaded,
            'is_available': technician.is_available,
            'active_tasks': active_tasks,
            'critical_tasks': active_tasks.filter(priority='critical').count(),
            'high_priority_tasks': active_tasks.filter(priority='high').count(),
        }
    
    @staticmethod
    def get_available_technicians(department=None, skill_required=None):
        """Get list of available technicians with their workload"""
        queryset = ITPersonnel.objects.filter(is_available=True)
        
        if department:
            queryset = queryset.filter(
                models.Q(department__iexact=department) |
                models.Q(department__iexact='it')  # IT technicians can work across departments
            )
        
        if skill_required:
            queryset = queryset.filter(specializations__icontains=skill_required)
        
        technicians = []
        for tech in queryset:
            workload = TaskAssignmentService.get_technician_workload(tech)
            if not workload['is_overloaded']:
                technicians.append(workload)
        
        # Sort by utilization (least loaded first)
        return sorted(technicians, key=lambda x: x['utilization_percentage'])
    
    @staticmethod
    def _apply_assignment_rule(task, rule):
        """Apply a specific assignment rule to find suitable technician"""
        try:
            conditions = rule.conditions
            
            if rule.rule_type == 'skill_based':
                return TaskAssignmentService._skill_based_assignment(task, conditions)
            elif rule.rule_type == 'workload_based':
                return TaskAssignmentService._workload_based_assignment(task, conditions)
            elif rule.rule_type == 'round_robin':
                return TaskAssignmentService._round_robin_assignment(task, conditions)
            elif rule.rule_type == 'priority_based':
                return TaskAssignmentService._priority_based_assignment(task, conditions)
            
            return None
            
        except Exception as e:
            logger.error(f"Error applying assignment rule {rule.id}: {str(e)}")
            return None
    
    @staticmethod
    def _skill_based_assignment(task, conditions):
        """Assign based on required skills"""
        required_skills = conditions.get('required_skills', [])
        department = task.related_request.requester_department if task.related_request else None
        
        for skill in required_skills:
            technicians = TaskAssignmentService.get_available_technicians(
                department=department,
                skill_required=skill
            )
            if technicians:
                return technicians[0]['technician']  # Return least loaded with skill
        
        return None
    
    @staticmethod
    def _workload_based_assignment(task, conditions):
        """Assign to least loaded technician"""
        max_utilization = conditions.get('max_utilization', 80)
        department = task.related_request.requester_department if task.related_request else None
        
        technicians = TaskAssignmentService.get_available_technicians(department=department)
        
        for tech_info in technicians:
            if tech_info['utilization_percentage'] <= max_utilization:
                return tech_info['technician']
        
        return None
    
    @staticmethod
    def _round_robin_assignment(task, conditions):
        """Assign using round-robin approach"""
        department = task.related_request.requester_department if task.related_request else None
        technicians = TaskAssignmentService.get_available_technicians(department=department)
        
        if not technicians:
            return None
        
        # Simple round-robin based on last assignment
        # This could be enhanced with a more sophisticated tracking mechanism
        return technicians[0]['technician']
    
    @staticmethod
    def _priority_based_assignment(task, conditions):
        """Assign based on task priority and technician skill level"""
        priority_mapping = conditions.get('priority_mapping', {
            'critical': 'expert',
            'high': 'senior',
            'medium': 'intermediate',
            'low': 'junior'
        })
        
        required_skill_level = priority_mapping.get(task.priority, 'intermediate')
        department = task.related_request.requester_department if task.related_request else None
        
        technicians = ITPersonnel.objects.filter(
            is_available=True,
            skill_level=required_skill_level
        )
        
        if department:
            technicians = technicians.filter(
                models.Q(department__iexact=department) |
                models.Q(department__iexact='it')
            )
        
        # Get workload info and return least loaded
        tech_workloads = []
        for tech in technicians:
            workload = TaskAssignmentService.get_technician_workload(tech)
            if not workload['is_overloaded']:
                tech_workloads.append(workload)
        
        if tech_workloads:
            sorted_techs = sorted(tech_workloads, key=lambda x: x['utilization_percentage'])
            return sorted_techs[0]['technician']
        
        return None
    
    @staticmethod
    def _get_least_loaded_technician(task):
        """Fallback method to get least loaded technician"""
        department = task.related_request.requester_department if task.related_request else None
        technicians = TaskAssignmentService.get_available_technicians(department=department)
        
        if technicians:
            return technicians[0]['technician']  # Already sorted by utilization
        
        return None
    
    @staticmethod
    def _create_assignment_notification(task, technician, assigned_by=None, auto_assigned=False):
        """Create notification for task assignment"""
        try:
            title = f"New Task Assigned: {task.title}"
            message = f"You have been assigned a new {task.priority} priority task"
            
            if auto_assigned:
                message += " (automatically assigned)"
            elif assigned_by:
                message += f" by {assigned_by.get_full_name()}"
            
            Notification.objects.create(
                user=technician.user,
                title=title,
                message=message,
                notification_type='task_assignment',
                related_object_type='task',
                related_object_id=task.id
            )
            
        except Exception as e:
            logger.error(f"Error creating assignment notification: {str(e)}")
    
    @staticmethod
    def _create_reassignment_notifications(task, old_technician, new_technician, reassigned_by=None, reason=None):
        """Create notifications for task reassignment"""
        try:
            # Notification for old technician
            if old_technician:
                Notification.objects.create(
                    user=old_technician.user,
                    title=f"Task Reassigned: {task.title}",
                    message=f"Task has been reassigned to {new_technician.user.get_full_name()}" + 
                           (f". Reason: {reason}" if reason else ""),
                    notification_type='task_reassignment',
                    related_object_type='task',
                    related_object_id=task.id
                )
            
            # Notification for new technician
            Notification.objects.create(
                user=new_technician.user,
                title=f"Task Reassigned to You: {task.title}",
                message=f"You have been assigned a {task.priority} priority task" +
                       (f" by {reassigned_by.get_full_name()}" if reassigned_by else ""),
                notification_type='task_assignment',
                related_object_type='task',
                related_object_id=task.id
            )
            
        except Exception as e:
            logger.error(f"Error creating reassignment notifications: {str(e)}")


class TechnicianDashboardService:
    """Service for technician-specific dashboard data"""
    
    @staticmethod
    def get_technician_tasks(user, status_filter=None):
        """Get tasks assigned to a specific technician"""
        try:
            technician = ITPersonnel.objects.get(user=user)
            queryset = Task.objects.filter(assigned_to=technician)
            
            if status_filter:
                if isinstance(status_filter, list):
                    queryset = queryset.filter(status__in=status_filter)
                else:
                    queryset = queryset.filter(status=status_filter)
            
            return queryset.order_by('-priority', 'due_date', '-created_at')
            
        except ITPersonnel.DoesNotExist:
            logger.warning(f"No ITPersonnel record found for user {user.username}")
            return Task.objects.none()
        except Exception as e:
            logger.error(f"Error getting technician tasks for {user.username}: {str(e)}")
            return Task.objects.none()
    
    @staticmethod
    def get_technician_dashboard_stats(user):
        """Get dashboard statistics for a technician"""
        try:
            technician = ITPersonnel.objects.get(user=user)
            
            # Get task counts
            all_tasks = Task.objects.filter(assigned_to=technician)
            active_tasks = all_tasks.filter(status__in=['assigned', 'in_progress'])
            
            stats = {
                'total_assigned': all_tasks.count(),
                'active_tasks': active_tasks.count(),
                'pending_tasks': all_tasks.filter(status='assigned').count(),
                'in_progress_tasks': all_tasks.filter(status='in_progress').count(),
                'completed_today': all_tasks.filter(
                    status='completed',
                    completed_at__date=timezone.now().date()
                ).count(),
                'overdue_tasks': active_tasks.filter(
                    due_date__lt=timezone.now()
                ).count(),
                'critical_tasks': active_tasks.filter(priority='critical').count(),
                'high_priority_tasks': active_tasks.filter(priority='high').count(),
                'workload_percentage': (active_tasks.count() / technician.max_concurrent_tasks) * 100,
                'is_overloaded': technician.is_overloaded,
            }
            
            return stats
            
        except ITPersonnel.DoesNotExist:
            return {
                'total_assigned': 0,
                'active_tasks': 0,
                'pending_tasks': 0,
                'in_progress_tasks': 0,
                'completed_today': 0,
                'overdue_tasks': 0,
                'critical_tasks': 0,
                'high_priority_tasks': 0,
                'workload_percentage': 0,
                'is_overloaded': False,
            }
        except Exception as e:
            logger.error(f"Error getting technician dashboard stats for {user.username}: {str(e)}")
            return {}
    
    @staticmethod
    def get_upcoming_tasks(user, days_ahead=7):
        """Get upcoming tasks for a technician"""
        try:
            technician = ITPersonnel.objects.get(user=user)
            end_date = timezone.now() + timezone.timedelta(days=days_ahead)
            
            return Task.objects.filter(
                assigned_to=technician,
                status__in=['assigned', 'in_progress'],
                due_date__lte=end_date,
                due_date__gte=timezone.now()
            ).order_by('due_date', '-priority')
            
        except ITPersonnel.DoesNotExist:
            return Task.objects.none()
        except Exception as e:
            logger.error(f"Error getting upcoming tasks for {user.username}: {str(e)}")
            return Task.objects.none()
