from rest_framework import serializers
from .models import Task, ITPersonnel, TaskComment, WorkflowTemplate, WorkflowStep, TaskAssignmentRule

class ITPersonnelSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    current_task_count = serializers.ReadOnlyField()
    is_overloaded = serializers.ReadOnlyField()
    
    class Meta:
        model = ITPersonnel
        fields = '__all__'

class TaskCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    
    class Meta:
        model = TaskComment
        fields = '__all__'

class TaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.user.get_full_name', read_only=True)
    request_ticket = serializers.CharField(source='related_request.ticket_number', read_only=True)
    request_title = serializers.CharField(source='related_request.title', read_only=True)
    comments = TaskCommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Task
        fields = '__all__'

class WorkflowStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowStep
        fields = '__all__'

class WorkflowTemplateSerializer(serializers.ModelSerializer):
    steps = WorkflowStepSerializer(many=True, read_only=True)
    
    class Meta:
        model = WorkflowTemplate
        fields = '__all__'

class TaskAssignmentRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskAssignmentRule
        fields = '__all__'
