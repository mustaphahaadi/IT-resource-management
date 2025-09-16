from django.contrib import admin
from .models import Task, ITPersonnel, TaskComment, WorkflowTemplate, WorkflowStep, TaskAssignmentRule

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'status', 'priority', 'assigned_to', 'created_at', 'due_date']
    list_filter = ['status', 'priority', 'assigned_to', 'created_at']
    search_fields = ['title', 'description', 'related_request__ticket_number']
    date_hierarchy = 'created_at'

@admin.register(ITPersonnel)
class ITPersonnelAdmin(admin.ModelAdmin):
    list_display = ['user', 'employee_id', 'department', 'skill_level', 'is_available', 'current_task_count']
    list_filter = ['department', 'skill_level', 'is_available']
    search_fields = ['user__first_name', 'user__last_name', 'employee_id']

@admin.register(WorkflowTemplate)
class WorkflowTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'is_active', 'created_at']
    list_filter = ['category', 'is_active']
    search_fields = ['name', 'description']

admin.site.register(TaskComment)
admin.site.register(WorkflowStep)
admin.site.register(TaskAssignmentRule)
