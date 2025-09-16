from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Task, ITPersonnel, TaskComment, WorkflowTemplate, TaskAssignmentRule
from .serializers import (
    TaskSerializer, ITPersonnelSerializer, TaskCommentSerializer,
    WorkflowTemplateSerializer, TaskAssignmentRuleSerializer
)

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'assigned_to', 'related_request']
    search_fields = ['title', 'description', 'related_request__ticket_number']
    ordering_fields = ['created_at', 'priority', 'due_date']
    ordering = ['-created_at']

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
                if personnel.is_overloaded:
                    return Response({
                        'error': f'Personnel is overloaded ({personnel.current_task_count}/{personnel.max_concurrent_tasks} tasks)'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                task.assigned_to = personnel
                task.status = 'assigned'
                task.assigned_at = timezone.now()
                task.save()
                
                return Response({'message': 'Task assigned successfully'})
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
        
        task.status = 'completed'
        task.completed_at = timezone.now()
        task.completion_notes = completion_notes
        if actual_hours:
            task.actual_hours = actual_hours
        task.save()
        
        return Response({'message': 'Task completed successfully'})

class ITPersonnelViewSet(viewsets.ModelViewSet):
    queryset = ITPersonnel.objects.all()
    serializer_class = ITPersonnelSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['department', 'skill_level', 'is_available']
    search_fields = ['user__first_name', 'user__last_name', 'employee_id', 'specializations']

    @action(detail=False, methods=['get'])
    def available(self, request):
        available_personnel = ITPersonnel.objects.filter(
            is_available=True
        ).exclude(
            id__in=[p.id for p in ITPersonnel.objects.all() if p.is_overloaded]
        )
        serializer = self.get_serializer(available_personnel, many=True)
        return Response(serializer.data)

class WorkflowTemplateViewSet(viewsets.ModelViewSet):
    queryset = WorkflowTemplate.objects.all()
    serializer_class = WorkflowTemplateSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'is_active']
    search_fields = ['name', 'description']

class TaskAssignmentRuleViewSet(viewsets.ModelViewSet):
    queryset = TaskAssignmentRule.objects.all()
    serializer_class = TaskAssignmentRuleSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['rule_type', 'is_active']
    ordering = ['-priority']
