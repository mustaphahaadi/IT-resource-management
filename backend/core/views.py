from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db.models import Q
from .bulk_operations import BulkOperationService, AdvancedSearchService
from .activity_logger import ActivityLogger, ActivityLog
from analytics.reporting import ReportingService
from analytics.models import WorkflowLog, PerformanceMetric, SystemAlert
from requests_system.models import SupportRequest
from tasks.models import Task
from inventory.models import Equipment
from authentication.permissions import RoleBasedPermission
import json
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

class BulkOperationViewSet(viewsets.ViewSet):
    """ViewSet for bulk operations"""
    permission_classes = [RoleBasedPermission]
    
    @action(detail=False, methods=['post'])
    def bulk_assign_requests(self, request):
        """Bulk assign multiple requests"""
        request_ids = request.data.get('request_ids', [])
        assigned_to_id = request.data.get('assigned_to_id')
        
        if not request_ids or not assigned_to_id:
            return Response({
                'error': 'request_ids and assigned_to_id are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        results = BulkOperationService.bulk_assign_requests(
            request_ids, assigned_to_id, request.user
        )
        
        # Log bulk operation
        ActivityLogger.log_user_action(
            user=request.user,
            action_type='assign',
            description=f"Bulk assigned {len(request_ids)} requests",
            request=request,
            metadata={
                'operation': 'bulk_assign_requests',
                'request_ids': request_ids,
                'assigned_to_id': assigned_to_id,
                'results': results
            }
        )
        
        return Response(results)
    
    @action(detail=False, methods=['post'])
    def bulk_update_priority(self, request):
        """Bulk update priority for requests or tasks"""
        object_ids = request.data.get('object_ids', [])
        object_type = request.data.get('object_type')  # 'request' or 'task'
        new_priority = request.data.get('priority')
        
        if not object_ids or not object_type or not new_priority:
            return Response({
                'error': 'object_ids, object_type, and priority are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        model_class = SupportRequest if object_type == 'request' else Task
        
        results = BulkOperationService.bulk_update_priority(
            model_class, object_ids, new_priority, request.user
        )
        
        # Log bulk operation
        ActivityLogger.log_user_action(
            user=request.user,
            action_type='update',
            description=f"Bulk updated priority for {len(object_ids)} {object_type}s",
            request=request,
            metadata={
                'operation': 'bulk_update_priority',
                'object_type': object_type,
                'object_ids': object_ids,
                'new_priority': new_priority,
                'results': results
            }
        )
        
        return Response(results)
    
    @action(detail=False, methods=['post'])
    def bulk_close_requests(self, request):
        """Bulk close multiple requests"""
        request_ids = request.data.get('request_ids', [])
        resolution_notes = request.data.get('resolution_notes', '')
        
        if not request_ids:
            return Response({
                'error': 'request_ids are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        results = BulkOperationService.bulk_close_requests(
            request_ids, resolution_notes, request.user
        )
        
        # Log bulk operation
        ActivityLogger.log_user_action(
            user=request.user,
            action_type='complete',
            description=f"Bulk closed {len(request_ids)} requests",
            request=request,
            metadata={
                'operation': 'bulk_close_requests',
                'request_ids': request_ids,
                'resolution_notes': resolution_notes,
                'results': results
            }
        )
        
        return Response(results)
    
    @action(detail=False, methods=['post'])
    def bulk_update_equipment_status(self, request):
        """Bulk update equipment status"""
        equipment_ids = request.data.get('equipment_ids', [])
        new_status = request.data.get('status')
        notes = request.data.get('notes', '')
        
        if not equipment_ids or not new_status:
            return Response({
                'error': 'equipment_ids and status are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        results = BulkOperationService.bulk_update_equipment_status(
            equipment_ids, new_status, request.user, notes
        )
        
        # Log bulk operation
        ActivityLogger.log_user_action(
            user=request.user,
            action_type='update',
            description=f"Bulk updated status for {len(equipment_ids)} equipment items",
            request=request,
            metadata={
                'operation': 'bulk_update_equipment_status',
                'equipment_ids': equipment_ids,
                'new_status': new_status,
                'notes': notes,
                'results': results
            }
        )
        
        return Response(results)


class SearchViewSet(viewsets.ViewSet):
    """ViewSet for advanced search functionality"""
    permission_classes = [RoleBasedPermission]
    
    @action(detail=False, methods=['get'])
    def global_search(self, request):
        """Perform global search across all models"""
        query = request.query_params.get('q', '')
        limit = int(request.query_params.get('limit', 50))
        
        if not query or len(query) < 2:
            return Response({
                'error': 'Query must be at least 2 characters long'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        results = AdvancedSearchService.global_search(
            query, request.user, limit=limit
        )
        
        # Log search activity
        ActivityLogger.log_user_action(
            user=request.user,
            action_type='read',
            description=f"Global search: '{query}'",
            request=request,
            metadata={
                'search_query': query,
                'results_count': sum(len(v) for v in results.values()),
                'result_types': list(results.keys())
            }
        )
        
        return Response({
            'query': query,
            'results': results,
            'total_results': sum(len(v) for v in results.values())
        })


class ReportingViewSet(viewsets.ViewSet):
    """ViewSet for reporting and analytics"""
    permission_classes = [RoleBasedPermission]
    
    @action(detail=False, methods=['get'])
    def dashboard_report(self, request):
        """Generate comprehensive dashboard report"""
        date_range = int(request.query_params.get('days', 30))
        
        report = ReportingService.generate_dashboard_report(
            request.user, date_range
        )
        
        # Log report generation
        ActivityLogger.log_user_action(
            user=request.user,
            action_type='read',
            description=f"Generated dashboard report ({date_range} days)",
            request=request,
            metadata={
                'report_type': 'dashboard',
                'date_range': date_range
            }
        )
        
        return Response(report)
    
    @action(detail=False, methods=['get'])
    def equipment_report(self, request):
        """Generate equipment-specific report"""
        date_range = int(request.query_params.get('days', 30))
        
        report = ReportingService.generate_equipment_report(
            request.user, date_range
        )
        
        # Log report generation
        ActivityLogger.log_user_action(
            user=request.user,
            action_type='read',
            description=f"Generated equipment report ({date_range} days)",
            request=request,
            metadata={
                'report_type': 'equipment',
                'date_range': date_range
            }
        )
        
        return Response(report)
    
    @action(detail=False, methods=['get'])
    def user_activity_report(self, request):
        """Generate user activity report"""
        date_range = int(request.query_params.get('days', 30))
        target_user_id = request.query_params.get('user_id')
        
        report = ReportingService.generate_user_activity_report(
            request.user, target_user_id, date_range
        )
        
        # Log report generation
        ActivityLogger.log_user_action(
            user=request.user,
            action_type='read',
            description=f"Generated user activity report ({date_range} days)",
            request=request,
            metadata={
                'report_type': 'user_activity',
                'date_range': date_range,
                'target_user_id': target_user_id
            }
        )
        
        return Response(report)
    
    @action(detail=False, methods=['get'])
    def export_data(self, request):
        """Export data to CSV"""
        model_type = request.query_params.get('model', 'request')
        format_type = request.query_params.get('format', 'csv')
        
        # Map model types
        model_mapping = {
            'request': SupportRequest,
            'task': Task,
            'equipment': Equipment,
            'user': User
        }
        
        model_class = model_mapping.get(model_type)
        if not model_class:
            return Response({
                'error': 'Invalid model type'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            csv_data = BulkOperationService.export_data(
                model_class, user=request.user
            )
            
            # Log export activity
            ActivityLogger.log_user_action(
                user=request.user,
                action_type='export',
                description=f"Exported {model_type} data",
                request=request,
                metadata={
                    'model_type': model_type,
                    'format': format_type
                }
            )
            
            response = HttpResponse(csv_data, content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="{model_type}_export_{timezone.now().strftime("%Y%m%d_%H%M%S")}.csv"'
            return response
            
        except Exception as e:
            logger.error(f"Export error: {str(e)}")
            return Response({
                'error': 'Export failed'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for activity logs"""
    queryset = ActivityLog.objects.all()
    permission_classes = [RoleBasedPermission]
    
    def get_queryset(self):
        """Filter activity logs based on user permissions"""
        user = self.request.user
        queryset = ActivityLog.objects.all()
        
        # Apply user-based filtering
        if user.role == 'user':
            queryset = queryset.filter(user=user)
        elif user.role in ['technician', 'manager']:
            # Show activities related to user's department
            queryset = queryset.filter(
                Q(user=user) |
                Q(user__department__iexact=user.department)
            )
        
        return queryset.order_by('-timestamp')
    
    @action(detail=False, methods=['get'])
    def my_activity(self, request):
        """Get current user's activity"""
        limit = int(request.query_params.get('limit', 50))
        action_types = request.query_params.getlist('action_types')
        
        activities = ActivityLogger.get_user_activity(
            request.user, limit, action_types
        )
        
        activity_data = []
        for activity in activities:
            activity_data.append({
                'id': activity.id,
                'action_type': activity.action_type,
                'description': activity.description,
                'timestamp': activity.timestamp.isoformat(),
                'severity': activity.severity,
                'metadata': activity.metadata
            })
        
        return Response({
            'activities': activity_data,
            'total': len(activity_data)
        })
    
    @action(detail=False, methods=['get'])
    def system_activity(self, request):
        """Get recent system activity"""
        hours = int(request.query_params.get('hours', 24))
        severity = request.query_params.get('severity')
        
        activities = ActivityLogger.get_system_activity(hours, severity)
        
        activity_data = []
        for activity in activities:
            activity_data.append({
                'id': activity.id,
                'user': {
                    'id': activity.user.id if activity.user else None,
                    'name': f"{activity.user.first_name} {activity.user.last_name}" if activity.user else 'System'
                },
                'action_type': activity.action_type,
                'description': activity.description,
                'timestamp': activity.timestamp.isoformat(),
                'severity': activity.severity,
                'metadata': activity.metadata
            })
        
        return Response({
            'activities': activity_data,
            'total': len(activity_data),
            'period_hours': hours
        })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def import_equipment_data(request):
    """Import equipment data from CSV"""
    if 'file' not in request.FILES:
        return Response({
            'error': 'No file provided'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    csv_file = request.FILES['file']
    
    try:
        csv_data = csv_file.read().decode('utf-8')
        results = BulkOperationService.import_equipment_data(csv_data, request.user)
        
        # Log import activity
        ActivityLogger.log_user_action(
            user=request.user,
            action_type='import',
            description=f"Imported equipment data ({results['total']} records)",
            request=request,
            metadata={
                'operation': 'import_equipment',
                'filename': csv_file.name,
                'results': results
            }
        )
        
        return Response(results)
        
    except Exception as e:
        logger.error(f"Import error: {str(e)}")
        return Response({
            'error': 'Import failed',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def system_health(request):
    """Get system health metrics"""
    try:
        # Get recent system alerts
        recent_alerts = SystemAlert.objects.filter(
            created_at__gte=timezone.now() - timezone.timedelta(hours=24)
        ).count()
        
        # Get active users
        active_users = User.objects.filter(
            last_login__gte=timezone.now() - timezone.timedelta(hours=24)
        ).count()
        
        # Get system activity
        recent_activity = ActivityLog.objects.filter(
            timestamp__gte=timezone.now() - timezone.timedelta(hours=1)
        ).count()
        
        # Calculate uptime (simplified)
        uptime_percentage = 99.5  # This would be calculated from actual monitoring
        
        health_data = {
            'status': 'healthy' if recent_alerts == 0 else 'warning',
            'uptime_percentage': uptime_percentage,
            'active_users': active_users,
            'recent_alerts': recent_alerts,
            'recent_activity': recent_activity,
            'timestamp': timezone.now().isoformat(),
            'services': {
                'database': 'healthy',
                'api': 'healthy',
                'notifications': 'healthy',
                'file_storage': 'healthy'
            }
        }
        
        return Response(health_data)
        
    except Exception as e:
        logger.error(f"System health check error: {str(e)}")
        return Response({
            'status': 'error',
            'error': 'Health check failed'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
