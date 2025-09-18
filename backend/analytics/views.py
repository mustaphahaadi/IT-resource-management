from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Q
from django.contrib.auth import get_user_model

from inventory.models import Equipment
from requests_system.models import SupportRequest
from tasks.models import Task

User = get_user_model()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_analytics(request):
    """Get dashboard analytics data"""
    try:
        # Equipment stats
        equipment_stats = {
            'total': Equipment.objects.count(),
            'active': Equipment.objects.filter(status='active').count(),
            'maintenance': Equipment.objects.filter(status='maintenance').count(),
            'critical': Equipment.objects.filter(status='critical').count(),
        }
        
        # Request stats
        request_stats = {
            'total': SupportRequest.objects.count(),
            'open': SupportRequest.objects.filter(status__in=['open', 'in_progress']).count(),
            'critical': SupportRequest.objects.filter(priority='critical').count(),
            'overdue': SupportRequest.objects.filter(
                status__in=['open', 'in_progress'],
                created_at__lt=timezone.now() - timedelta(days=7)
            ).count(),
        }
        
        # Task stats
        task_stats = {
            'total': Task.objects.count(),
            'pending': Task.objects.filter(status='pending').count(),
            'in_progress': Task.objects.filter(status='in_progress').count(),
            'overdue': Task.objects.filter(
                status__in=['pending', 'in_progress'],
                due_date__lt=timezone.now()
            ).count(),
        }
        
        # Recent trends (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        equipment_trends = []
        request_trends = []
        task_trends = []
        
        # Generate daily data for the last 7 days
        for i in range(7):
            date = timezone.now() - timedelta(days=i)
            date_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
            date_end = date_start + timedelta(days=1)
            
            equipment_trends.append({
                'date': date_start.strftime('%Y-%m-%d'),
                'active': Equipment.objects.filter(
                    created_at__range=[date_start, date_end],
                    status='active'
                ).count(),
                'maintenance': Equipment.objects.filter(
                    created_at__range=[date_start, date_end],
                    status='maintenance'
                ).count(),
            })
            
            request_trends.append({
                'date': date_start.strftime('%Y-%m-%d'),
                'created': SupportRequest.objects.filter(
                    created_at__range=[date_start, date_end]
                ).count(),
                'resolved': SupportRequest.objects.filter(
                    updated_at__range=[date_start, date_end],
                    status='resolved'
                ).count(),
            })
            
            task_trends.append({
                'date': date_start.strftime('%Y-%m-%d'),
                'created': Task.objects.filter(
                    created_at__range=[date_start, date_end]
                ).count(),
                'completed': Task.objects.filter(
                    updated_at__range=[date_start, date_end],
                    status='completed'
                ).count(),
            })
        
        # Department stats
        department_stats = []
        departments = ['IT', 'Administration', 'Medical', 'Nursing', 'Pharmacy', 'Laboratory']
        
        for dept in departments:
            dept_requests = SupportRequest.objects.filter(department__icontains=dept.lower()).count()
            department_stats.append({
                'department': dept,
                'requests': dept_requests,
                'equipment': Equipment.objects.filter(department__icontains=dept.lower()).count(),
            })
        
        # Performance metrics
        avg_resolution_time = 2.5  # Mock data - would calculate from actual data
        user_satisfaction = 4.2    # Mock data - would come from surveys
        system_uptime = 99.8       # Mock data - would come from monitoring
        
        performance_metrics = {
            'avg_resolution_time': avg_resolution_time,
            'user_satisfaction': user_satisfaction,
            'system_uptime': system_uptime,
            'total_users': User.objects.count(),
        }
        
        return Response({
            'equipment': equipment_stats,
            'requests': request_stats,
            'tasks': task_stats,
            'equipment_trends': equipment_trends,
            'request_trends': request_trends,
            'task_trends': task_trends,
            'department_stats': department_stats,
            'performance_metrics': performance_metrics,
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to fetch analytics: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_activity(request):
    """Get recent activity data"""
    try:
        limit = int(request.GET.get('limit', 10))
        
        # Get recent requests
        recent_requests = SupportRequest.objects.select_related('requester').order_by('-created_at')[:limit//2]
        
        # Get recent tasks
        recent_tasks = Task.objects.select_related('assigned_to').order_by('-created_at')[:limit//2]
        
        activities = []
        
        # Add requests to activities
        for req in recent_requests:
            activities.append({
                'id': f'request_{req.id}',
                'type': 'request',
                'title': f'New support request: {req.title}',
                'description': f'Priority: {req.priority}',
                'user': req.requester.get_full_name() if req.requester else 'Unknown',
                'timestamp': req.created_at.isoformat(),
                'status': req.status,
            })
        
        # Add tasks to activities
        for task in recent_tasks:
            activities.append({
                'id': f'task_{task.id}',
                'type': 'task',
                'title': f'Task assigned: {task.title}',
                'description': f'Due: {task.due_date.strftime("%Y-%m-%d") if task.due_date else "No due date"}',
                'user': task.assigned_to.get_full_name() if task.assigned_to else 'Unassigned',
                'timestamp': task.created_at.isoformat(),
                'status': task.status,
            })
        
        # Sort by timestamp (most recent first)
        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return Response({
            'activities': activities[:limit]
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to fetch recent activity: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def request_analytics(request):
    """Get request analytics data"""
    try:
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        report_type = request.GET.get('report_type', 'overview')
        
        # Default to last 30 days if no dates provided
        if not start_date:
            start_date = (timezone.now() - timedelta(days=30)).date()
        if not end_date:
            end_date = timezone.now().date()
        
        # Base queryset
        requests_qs = SupportRequest.objects.filter(
            created_at__date__range=[start_date, end_date]
        )
        
        # Overview data
        overview = {
            'total_requests': requests_qs.count(),
            'resolved_requests': requests_qs.filter(status='resolved').count(),
            'pending_requests': requests_qs.filter(status__in=['open', 'in_progress']).count(),
            'critical_requests': requests_qs.filter(priority='critical').count(),
        }
        
        # Priority breakdown
        priority_breakdown = {
            'low': requests_qs.filter(priority='low').count(),
            'medium': requests_qs.filter(priority='medium').count(),
            'high': requests_qs.filter(priority='high').count(),
            'critical': requests_qs.filter(priority='critical').count(),
        }
        
        # Status breakdown
        status_breakdown = {
            'open': requests_qs.filter(status='open').count(),
            'in_progress': requests_qs.filter(status='in_progress').count(),
            'resolved': requests_qs.filter(status='resolved').count(),
            'closed': requests_qs.filter(status='closed').count(),
        }
        
        # Daily trends
        daily_trends = []
        current_date = timezone.datetime.strptime(str(start_date), '%Y-%m-%d').date()
        end_date_obj = timezone.datetime.strptime(str(end_date), '%Y-%m-%d').date()
        
        while current_date <= end_date_obj:
            daily_count = requests_qs.filter(created_at__date=current_date).count()
            daily_trends.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'requests': daily_count,
            })
            current_date += timedelta(days=1)
        
        return Response({
            'overview': overview,
            'priority_breakdown': priority_breakdown,
            'status_breakdown': status_breakdown,
            'daily_trends': daily_trends,
            'date_range': {
                'start_date': start_date,
                'end_date': end_date,
            }
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to fetch request analytics: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
