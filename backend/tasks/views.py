from rest_framework import viewsets, filters, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db import models
from .models import Task, ITPersonnel, TaskComment, WorkflowTemplate, TaskAssignmentRule
from .serializers import (
    TaskSerializer, ITPersonnelSerializer, TaskCommentSerializer,
    WorkflowTemplateSerializer, TaskAssignmentRuleSerializer
)
from .services import TaskAssignmentService, TechnicianDashboardService
from requests_system.models import SupportRequest
from authentication.permissions import IsOwnerOrStaff, IsStaffOrReadOnly, RoleBasedPermission
from authentication.admin_views import IsAdminUser
from core.workflow_engine import WorkflowEngine
from core.notification_service import WorkflowNotifications

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    # Role-based access plus read-only for non-technical staff on write ops
    permission_classes = [RoleBasedPermission, IsStaffOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'assigned_to', 'related_request']
    search_fields = ['title', 'description', 'related_request__ticket_number']
    ordering_fields = ['created_at', 'priority', 'due_date']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter tasks based on user role (aligned with RoleBasedPermission roles)."""
        queryset = Task.objects.all()
        user = self.request.user
        
        if not user or not user.is_authenticated:
            return Task.objects.none()
        
        # System admin and IT manager can see all tasks
        if getattr(user, 'role', '') in ['system_admin', 'it_manager'] or user.is_staff:
            return queryset
        
        # Technicians (including senior technicians) can see assigned + department + IT
        if getattr(user, 'role', '') in ['technician', 'senior_technician']:
            from django.db import models
            return queryset.filter(
                models.Q(assigned_to__user=user) |
                models.Q(related_request__requester__department__iexact=getattr(user, 'department', '')) |
                models.Q(related_request__requester__department__iexact='it')
            )
        
        # End users can only see tasks assigned to them
        return queryset.filter(assigned_to__user=user)

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        total_tasks = Task.objects.count()
        pending_tasks = Task.objects.filter(status='pending').count()
        in_progress_tasks = Task.objects.filter(status='in_progress').count()
        overdue_tasks = Task.objects.filter(
            due_date__lt=timezone.now(),
            status__in=['assigned', 'in_progress']
        ).count()
        
        return Response({
            'total_tasks': total_tasks,
            'pending_tasks': pending_tasks,
            'in_progress_tasks': in_progress_tasks,
            'overdue_tasks': overdue_tasks,
        })

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        task = self.get_object()
        personnel_id = request.data.get('personnel_id')
        
        if personnel_id:
            try:
                personnel = ITPersonnel.objects.get(id=personnel_id)
                
                # Use workflow engine for assignment
                success = WorkflowEngine.process_task_assignment(
                    task, personnel, assigned_by=request.user
                )
                
                if success:
                    # Send workflow notifications
                    WorkflowNotifications.task_assigned(task, personnel, request.user)
                    
                    serializer = self.get_serializer(task)
                    return Response({
                        'message': 'Task assigned successfully',
                        'task': serializer.data
                    })
                else:
                    return Response({
                        'error': f'Cannot assign task. Personnel may be overloaded ({personnel.current_task_count}/{personnel.max_concurrent_tasks} tasks)'
                    }, status=status.HTTP_400_BAD_REQUEST)
                    
            except ITPersonnel.DoesNotExist:
                return Response({'error': 'Personnel not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'error': 'personnel_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        task = self.get_object()
        if task.status == 'assigned':
            task.status = 'in_progress'
            task.started_at = timezone.now()
            task.save()
            return Response({'message': 'Task started successfully'})
        
        return Response({'error': 'Task must be assigned to start'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        task = self.get_object()
        completion_notes = request.data.get('completion_notes', '')
        actual_hours = request.data.get('actual_hours')
        
        # Use workflow engine for completion
        success = WorkflowEngine.process_task_completion(
            task, completion_notes, actual_hours
        )
        
        if success:
            # Send workflow notifications
            WorkflowNotifications.task_completed(task)
            
            serializer = self.get_serializer(task)
            return Response({
                'message': 'Task completed successfully',
                'task': serializer.data
            })
        else:
            return Response({
                'error': 'Failed to complete task'
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get', 'post'])
    def comments(self, request, pk=None):
        """List or create comments for a task"""
        task = self.get_object()
        if request.method.lower() == 'get':
            comments = TaskComment.objects.filter(task=task).order_by('created_at')
            serializer = TaskCommentSerializer(comments, many=True)
            return Response(serializer.data)
        # POST
        comment_text = request.data.get('comment', '').strip()
        if not comment_text:
            return Response({'error': 'comment is required'}, status=status.HTTP_400_BAD_REQUEST)
        comment = TaskComment.objects.create(task=task, author=request.user, comment=comment_text)
        serializer = TaskCommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def reassign(self, request, pk=None):
        """Reassign task to a different technician"""
        task = self.get_object()
        personnel_id = request.data.get('personnel_id')
        reason = request.data.get('reason', '')
        
        if not personnel_id:
            return Response({'error': 'personnel_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            new_technician = ITPersonnel.objects.get(id=personnel_id)
            success = TaskAssignmentService.reassign_task(
                task, new_technician, reassigned_by=request.user, reason=reason
            )
            
            if success:
                serializer = self.get_serializer(task)
                return Response({
                    'message': 'Task reassigned successfully',
                    'task': serializer.data
                })
            else:
                return Response({
                    'error': 'Failed to reassign task. Technician may be overloaded.'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except ITPersonnel.DoesNotExist:
            return Response({'error': 'Technician not found'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def create_from_request(self, request):
        """Create a task from a support request"""
        request_id = request.data.get('request_id')
        title = request.data.get('title')
        description = request.data.get('description')
        priority = request.data.get('priority')
        estimated_hours = request.data.get('estimated_hours')
        auto_assign = request.data.get('auto_assign', False)
        
        if not request_id:
            return Response({'error': 'request_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            support_request = SupportRequest.objects.get(id=request_id)
            
            # Create task
            task = TaskAssignmentService.create_task_from_request(
                support_request, title, description, priority, estimated_hours
            )
            
            # Auto-assign if requested
            if auto_assign:
                TaskAssignmentService.auto_assign_task(task)
                task.refresh_from_db()  # Refresh to get updated assignment
            
            serializer = self.get_serializer(task)
            return Response({
                'message': 'Task created successfully',
                'task': serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except SupportRequest.DoesNotExist:
            return Response({'error': 'Support request not found'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def my_tasks(self, request):
        """Get tasks assigned to the current user (technician)"""
        status_filter = request.query_params.get('status')
        if status_filter:
            status_filter = status_filter.split(',')
        
        tasks = TechnicianDashboardService.get_technician_tasks(request.user, status_filter)
        
        page = self.paginate_queryset(tasks)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_dashboard(self, request):
        """Get dashboard statistics for the current technician"""
        stats = TechnicianDashboardService.get_technician_dashboard_stats(request.user)
        upcoming_tasks = TechnicianDashboardService.get_upcoming_tasks(request.user)
        
        upcoming_serializer = self.get_serializer(upcoming_tasks, many=True)
        
        return Response({
            'stats': stats,
            'upcoming_tasks': upcoming_serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def assignment_suggestions(self, request):
        """Get assignment suggestions for unassigned tasks"""
        task_id = request.query_params.get('task_id')
        department = request.query_params.get('department')
        skill_required = request.query_params.get('skill')
        
        if task_id:
            try:
                task = Task.objects.get(id=task_id)
                department = task.related_request.requester_department if task.related_request else department
            except Task.DoesNotExist:
                return Response({'error': 'Task not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        suggestions = TaskAssignmentService.get_available_technicians(
            department=department,
            skill_required=skill_required
        )
        
        # Format response
        formatted_suggestions = []
        for suggestion in suggestions:
            tech = suggestion['technician']
            formatted_suggestions.append({
                'id': tech.id,
                'name': tech.user.get_full_name(),
                'employee_id': tech.employee_id,
                'department': tech.department,
                'skill_level': tech.skill_level,
                'specializations': tech.specializations,
                'current_tasks': suggestion['active_task_count'],
                'max_tasks': suggestion['max_concurrent_tasks'],
                'utilization_percentage': suggestion['utilization_percentage'],
                'critical_tasks': suggestion['critical_tasks'],
                'high_priority_tasks': suggestion['high_priority_tasks'],
            })
        
        return Response({
            'suggestions': formatted_suggestions,
            'total_available': len(formatted_suggestions)
        })

class ITPersonnelViewSet(viewsets.ModelViewSet):
    queryset = ITPersonnel.objects.all()
    serializer_class = ITPersonnelSerializer
    permission_classes = [RoleBasedPermission, IsStaffOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['department', 'skill_level', 'is_available']
    search_fields = ['user__first_name', 'user__last_name', 'employee_id', 'specializations']
    
    def get_queryset(self):
        """Filter personnel based on user role (aligned with RoleBasedPermission roles)."""
        queryset = ITPersonnel.objects.all()
        user = self.request.user
        
        if not user or not user.is_authenticated:
            return ITPersonnel.objects.none()
        
        # System admin and IT manager can see all personnel
        if getattr(user, 'role', '') in ['system_admin', 'it_manager'] or user.is_staff:
            return queryset
        
        # Technicians (incl. senior technicians) can see their department + IT
        if getattr(user, 'role', '') in ['technician', 'senior_technician']:
            from django.db import models
            return queryset.filter(
                models.Q(department__iexact=getattr(user, 'department', '')) |
                models.Q(department__iexact='it')
            )
        
        # End users can only see their own personnel record
        return queryset.filter(user=user)

    @action(detail=False, methods=['get'])
    def available(self, request):
        # Restrict end users from accessing available technicians
        if getattr(request.user, 'role', '') == 'end_user':
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        department = request.query_params.get('department')
        skill_required = request.query_params.get('skill')
        
        available_technicians = TaskAssignmentService.get_available_technicians(
            department=department,
            skill_required=skill_required
        )
        
        # Format response with workload information
        formatted_technicians = []
        for tech_info in available_technicians:
            tech = tech_info['technician']
            formatted_technicians.append({
                'id': tech.id,
                'user_name': tech.user.get_full_name(),
                'user': {
                    'id': tech.user.id,
                    'username': tech.user.username,
                    'first_name': tech.user.first_name,
                    'last_name': tech.user.last_name,
                    'email': tech.user.email,
                },
                'employee_id': tech.employee_id,
                'department': tech.department,
                'skill_level': tech.skill_level,
                'specializations': tech.specializations,
                'phone': tech.phone,
                'workload': {
                    'current_tasks': tech_info['active_task_count'],
                    'max_tasks': tech_info['max_concurrent_tasks'],
                    'utilization_percentage': tech_info['utilization_percentage'],
                    'critical_tasks': tech_info['critical_tasks'],
                    'high_priority_tasks': tech_info['high_priority_tasks'],
                }
            })
        
        return Response({
            'available_technicians': formatted_technicians,
            'total_available': len(formatted_technicians)
        })

class WorkflowTemplateViewSet(viewsets.ModelViewSet):
    queryset = WorkflowTemplate.objects.all()
    serializer_class = WorkflowTemplateSerializer
    permission_classes = [IsStaffOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'is_active']
    search_fields = ['name', 'description']

class TaskAssignmentRuleViewSet(viewsets.ModelViewSet):
    queryset = TaskAssignmentRule.objects.all()
    serializer_class = TaskAssignmentRuleSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['rule_type', 'is_active']
    ordering = ['-priority']
