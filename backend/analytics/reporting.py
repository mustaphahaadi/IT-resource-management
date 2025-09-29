from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db.models import Count, Avg, Sum, Q, F
from datetime import timedelta, datetime
from requests_system.models import SupportRequest
from tasks.models import Task, ITPersonnel
from inventory.models import Equipment
from analytics.models import WorkflowLog, PerformanceMetric
import json
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

class ReportingService:
    """Comprehensive reporting and analytics service"""
    
    @staticmethod
    def generate_dashboard_report(user, date_range=30):
        """Generate comprehensive dashboard report"""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=date_range)
        
        # Apply user permissions
        requests_qs = SupportRequest.objects.all()
        tasks_qs = Task.objects.all()
        equipment_qs = Equipment.objects.all()
        
        if user.role == 'user':
            requests_qs = requests_qs.filter(requester=user)
            tasks_qs = tasks_qs.filter(assigned_to__user=user)
            equipment_qs = equipment_qs.filter(location__department__iexact=user.department)
        elif user.role in ['technician', 'manager']:
            requests_qs = requests_qs.filter(
                Q(requester__department__iexact=user.department) |
                Q(assigned_to__department__iexact=user.department)
            )
            if user.role == 'technician':
                tasks_qs = tasks_qs.filter(assigned_to__user=user)
            equipment_qs = equipment_qs.filter(
                Q(location__department__iexact=user.department) |
                Q(location__department__iexact='it')
            )
        
        # Filter by date range
        requests_qs = requests_qs.filter(created_at__gte=start_date)
        tasks_qs = tasks_qs.filter(created_at__gte=start_date)
        
        report = {
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'days': date_range
            },
            'summary': ReportingService._get_summary_stats(requests_qs, tasks_qs, equipment_qs),
            'trends': ReportingService._get_trend_data(requests_qs, tasks_qs, start_date, end_date),
            'performance': ReportingService._get_performance_metrics(requests_qs, tasks_qs),
            'department_breakdown': ReportingService._get_department_breakdown(requests_qs, tasks_qs),
            'priority_analysis': ReportingService._get_priority_analysis(requests_qs, tasks_qs),
            'sla_compliance': ReportingService._get_sla_compliance(requests_qs),
            'top_issues': ReportingService._get_top_issues(requests_qs),
            'technician_performance': ReportingService._get_technician_performance(tasks_qs)
        }
        
        return report
    
    @staticmethod
    def _get_summary_stats(requests_qs, tasks_qs, equipment_qs):
        """Get summary statistics"""
        return {
            'total_requests': requests_qs.count(),
            'open_requests': requests_qs.filter(status__in=['open', 'assigned', 'in_progress']).count(),
            'resolved_requests': requests_qs.filter(status='resolved').count(),
            'critical_requests': requests_qs.filter(priority='critical').count(),
            'total_tasks': tasks_qs.count(),
            'completed_tasks': tasks_qs.filter(status='completed').count(),
            'overdue_tasks': tasks_qs.filter(
                due_date__lt=timezone.now(),
                status__in=['assigned', 'in_progress']
            ).count(),
            'total_equipment': equipment_qs.count(),
            'active_equipment': equipment_qs.filter(status='active').count(),
            'maintenance_equipment': equipment_qs.filter(status='maintenance').count(),
            'failed_equipment': equipment_qs.filter(status='failed').count()
        }
    
    @staticmethod
    def _get_trend_data(requests_qs, tasks_qs, start_date, end_date):
        """Get trend data over time"""
        # Daily request creation trend
        request_trend = []
        task_trend = []
        
        current_date = start_date.date()
        end_date_only = end_date.date()
        
        while current_date <= end_date_only:
            next_date = current_date + timedelta(days=1)
            
            daily_requests = requests_qs.filter(
                created_at__date=current_date
            ).count()
            
            daily_tasks = tasks_qs.filter(
                created_at__date=current_date
            ).count()
            
            request_trend.append({
                'date': current_date.isoformat(),
                'count': daily_requests
            })
            
            task_trend.append({
                'date': current_date.isoformat(),
                'count': daily_tasks
            })
            
            current_date = next_date
        
        return {
            'requests': request_trend,
            'tasks': task_trend
        }
    
    @staticmethod
    def _get_performance_metrics(requests_qs, tasks_qs):
        """Get performance metrics"""
        # Average resolution time for requests
        resolved_requests = requests_qs.filter(
            status='resolved',
            resolved_at__isnull=False
        ).annotate(
            resolution_time=F('resolved_at') - F('created_at')
        )
        
        avg_resolution_time = resolved_requests.aggregate(
            avg_time=Avg('resolution_time')
        )['avg_time']
        
        # Average task completion time
        completed_tasks = tasks_qs.filter(
            status='completed',
            completed_at__isnull=False
        ).annotate(
            completion_time=F('completed_at') - F('created_at')
        )
        
        avg_completion_time = completed_tasks.aggregate(
            avg_time=Avg('completion_time')
        )['avg_time']
        
        # First response time
        first_response_requests = requests_qs.filter(
            assigned_at__isnull=False
        ).annotate(
            response_time=F('assigned_at') - F('created_at')
        )
        
        avg_response_time = first_response_requests.aggregate(
            avg_time=Avg('response_time')
        )['avg_time']
        
        return {
            'avg_resolution_time_hours': avg_resolution_time.total_seconds() / 3600 if avg_resolution_time else 0,
            'avg_completion_time_hours': avg_completion_time.total_seconds() / 3600 if avg_completion_time else 0,
            'avg_response_time_hours': avg_response_time.total_seconds() / 3600 if avg_response_time else 0,
            'resolution_rate': (resolved_requests.count() / requests_qs.count() * 100) if requests_qs.count() > 0 else 0,
            'completion_rate': (completed_tasks.count() / tasks_qs.count() * 100) if tasks_qs.count() > 0 else 0
        }
    
    @staticmethod
    def _get_department_breakdown(requests_qs, tasks_qs):
        """Get breakdown by department"""
        request_by_dept = requests_qs.values('requester_department').annotate(
            count=Count('id'),
            resolved=Count('id', filter=Q(status='resolved')),
            avg_resolution_time=Avg(
                F('resolved_at') - F('created_at'),
                filter=Q(status='resolved', resolved_at__isnull=False)
            )
        ).order_by('-count')
        
        task_by_dept = tasks_qs.filter(
            assigned_to__user__department__isnull=False
        ).values('assigned_to__user__department').annotate(
            count=Count('id'),
            completed=Count('id', filter=Q(status='completed'))
        ).order_by('-count')
        
        return {
            'requests': list(request_by_dept),
            'tasks': list(task_by_dept)
        }
    
    @staticmethod
    def _get_priority_analysis(requests_qs, tasks_qs):
        """Get analysis by priority"""
        request_priority = requests_qs.values('priority').annotate(
            count=Count('id'),
            resolved=Count('id', filter=Q(status='resolved')),
            avg_resolution_time=Avg(
                F('resolved_at') - F('created_at'),
                filter=Q(status='resolved', resolved_at__isnull=False)
            )
        ).order_by('priority')
        
        task_priority = tasks_qs.values('priority').annotate(
            count=Count('id'),
            completed=Count('id', filter=Q(status='completed')),
            avg_completion_time=Avg(
                F('completed_at') - F('created_at'),
                filter=Q(status='completed', completed_at__isnull=False)
            )
        ).order_by('priority')
        
        return {
            'requests': list(request_priority),
            'tasks': list(task_priority)
        }
    
    @staticmethod
    def _get_sla_compliance(requests_qs):
        """Get SLA compliance metrics"""
        total_requests = requests_qs.count()
        if total_requests == 0:
            return {'compliance_rate': 100, 'violations': 0, 'on_time': 0}
        
        # Requests with SLA violations (resolved after due date)
        sla_violations = requests_qs.filter(
            resolution_due__isnull=False,
            resolved_at__isnull=False,
            resolved_at__gt=F('resolution_due')
        ).count()
        
        # Requests resolved on time
        on_time = requests_qs.filter(
            resolution_due__isnull=False,
            resolved_at__isnull=False,
            resolved_at__lte=F('resolution_due')
        ).count()
        
        # Current overdue requests
        overdue = requests_qs.filter(
            resolution_due__lt=timezone.now(),
            status__in=['open', 'assigned', 'in_progress']
        ).count()
        
        compliance_rate = ((on_time / (on_time + sla_violations)) * 100) if (on_time + sla_violations) > 0 else 100
        
        return {
            'compliance_rate': round(compliance_rate, 2),
            'violations': sla_violations,
            'on_time': on_time,
            'currently_overdue': overdue
        }
    
    @staticmethod
    def _get_top_issues(requests_qs):
        """Get top issues by category and frequency"""
        category_breakdown = requests_qs.filter(
            category__isnull=False
        ).values('category__name').annotate(
            count=Count('id'),
            resolved=Count('id', filter=Q(status='resolved')),
            avg_resolution_time=Avg(
                F('resolved_at') - F('created_at'),
                filter=Q(status='resolved', resolved_at__isnull=False)
            )
        ).order_by('-count')[:10]
        
        # Common keywords in descriptions
        # This is a simplified version - in production, you might use more sophisticated text analysis
        recurring_issues = requests_qs.filter(
            description__icontains='recurring'
        ).count()
        
        return {
            'by_category': list(category_breakdown),
            'recurring_issues': recurring_issues
        }
    
    @staticmethod
    def _get_technician_performance(tasks_qs):
        """Get technician performance metrics"""
        technician_stats = tasks_qs.filter(
            assigned_to__isnull=False
        ).values(
            'assigned_to__user__first_name',
            'assigned_to__user__last_name',
            'assigned_to__user__department'
        ).annotate(
            total_tasks=Count('id'),
            completed_tasks=Count('id', filter=Q(status='completed')),
            avg_completion_time=Avg(
                F('completed_at') - F('assigned_at'),
                filter=Q(status='completed', completed_at__isnull=False, assigned_at__isnull=False)
            ),
            overdue_tasks=Count('id', filter=Q(
                due_date__lt=timezone.now(),
                status__in=['assigned', 'in_progress']
            ))
        ).order_by('-completed_tasks')
        
        return list(technician_stats)
    
    @staticmethod
    def generate_equipment_report(user, date_range=30):
        """Generate equipment-specific report"""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=date_range)
        
        equipment_qs = Equipment.objects.all()
        
        # Apply user permissions
        if user.role == 'user':
            equipment_qs = equipment_qs.filter(location__department__iexact=user.department)
        elif user.role in ['technician', 'manager'] and user.department != 'it':
            equipment_qs = equipment_qs.filter(
                Q(location__department__iexact=user.department) |
                Q(location__department__iexact='it')
            )
        
        # Equipment status breakdown
        status_breakdown = equipment_qs.values('status').annotate(
            count=Count('id')
        ).order_by('status')
        
        # Equipment by category
        category_breakdown = equipment_qs.values('category').annotate(
            count=Count('id'),
            active=Count('id', filter=Q(status='active')),
            maintenance=Count('id', filter=Q(status='maintenance')),
            failed=Count('id', filter=Q(status='failed'))
        ).order_by('-count')
        
        # Equipment by department
        department_breakdown = equipment_qs.filter(
            location__department__isnull=False
        ).values('location__department').annotate(
            count=Count('id'),
            active=Count('id', filter=Q(status='active')),
            issues=Count('id', filter=Q(status__in=['maintenance', 'failed']))
        ).order_by('-count')
        
        # Warranty expiry analysis
        warranty_expiring = equipment_qs.filter(
            warranty_expiry__gte=timezone.now().date(),
            warranty_expiry__lte=(timezone.now() + timedelta(days=90)).date()
        ).count()
        
        warranty_expired = equipment_qs.filter(
            warranty_expiry__lt=timezone.now().date()
        ).count()
        
        # Age analysis
        old_equipment = equipment_qs.filter(
            purchase_date__lt=(timezone.now() - timedelta(days=365*5)).date()
        ).count()
        
        return {
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'days': date_range
            },
            'summary': {
                'total_equipment': equipment_qs.count(),
                'active_equipment': equipment_qs.filter(status='active').count(),
                'maintenance_equipment': equipment_qs.filter(status='maintenance').count(),
                'failed_equipment': equipment_qs.filter(status='failed').count(),
                'warranty_expiring_soon': warranty_expiring,
                'warranty_expired': warranty_expired,
                'equipment_over_5_years': old_equipment
            },
            'status_breakdown': list(status_breakdown),
            'category_breakdown': list(category_breakdown),
            'department_breakdown': list(department_breakdown),
            'maintenance_schedule': ReportingService._get_maintenance_schedule(equipment_qs)
        }
    
    @staticmethod
    def _get_maintenance_schedule(equipment_qs):
        """Get upcoming maintenance schedule"""
        # This would typically be based on maintenance intervals
        # For now, we'll return equipment that might need maintenance
        needs_maintenance = equipment_qs.filter(
            status='active',
            last_maintenance__lt=(timezone.now() - timedelta(days=180)).date()
        ).values('name', 'asset_tag', 'location__name', 'last_maintenance')[:10]
        
        return list(needs_maintenance)
    
    @staticmethod
    def generate_user_activity_report(user, target_user_id=None, date_range=30):
        """Generate user activity report"""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=date_range)
        
        # Get activity logs
        activity_qs = WorkflowLog.objects.filter(
            timestamp__gte=start_date,
            timestamp__lte=end_date
        )
        
        if target_user_id:
            activity_qs = activity_qs.filter(user_id=target_user_id)
        elif user.role not in ['admin', 'staff']:
            activity_qs = activity_qs.filter(user=user)
        
        # Activity by type
        activity_by_type = activity_qs.values('step_type').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Daily activity
        daily_activity = []
        current_date = start_date.date()
        end_date_only = end_date.date()
        
        while current_date <= end_date_only:
            daily_count = activity_qs.filter(
                timestamp__date=current_date
            ).count()
            
            daily_activity.append({
                'date': current_date.isoformat(),
                'count': daily_count
            })
            
            current_date += timedelta(days=1)
        
        # Most active users
        active_users = activity_qs.values(
            'user__first_name',
            'user__last_name',
            'user__department'
        ).annotate(
            activity_count=Count('id')
        ).order_by('-activity_count')[:10]
        
        return {
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'days': date_range
            },
            'summary': {
                'total_activities': activity_qs.count(),
                'unique_users': activity_qs.values('user').distinct().count(),
                'most_common_action': activity_by_type[0]['step_type'] if activity_by_type else None
            },
            'activity_by_type': list(activity_by_type),
            'daily_activity': daily_activity,
            'most_active_users': list(active_users)
        }
