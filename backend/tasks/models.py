from django.db import models
from django.contrib.auth.models import User
from requests_system.models import SupportRequest

class ITPersonnel(models.Model):
    SKILL_LEVELS = [
        ('junior', 'Junior'),
        ('intermediate', 'Intermediate'),
        ('senior', 'Senior'),
        ('expert', 'Expert'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    employee_id = models.CharField(max_length=20, unique=True)
    department = models.CharField(max_length=100)
    skill_level = models.CharField(max_length=20, choices=SKILL_LEVELS, default='intermediate')
    specializations = models.TextField(help_text="Comma-separated list of specializations")
    phone = models.CharField(max_length=20)
    is_available = models.BooleanField(default=True)
    max_concurrent_tasks = models.IntegerField(default=5)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.employee_id})"

    @property
    def current_task_count(self):
        return self.assigned_tasks.filter(status__in=['assigned', 'in_progress']).count()

    @property
    def is_overloaded(self):
        return self.current_task_count >= self.max_concurrent_tasks

class Task(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Assignment'),
        ('assigned', 'Assigned'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    PRIORITY_CHOICES = [
        ('critical', 'Critical'),
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    related_request = models.ForeignKey(SupportRequest, on_delete=models.CASCADE, related_name='tasks')
    assigned_to = models.ForeignKey(ITPersonnel, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    estimated_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    actual_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    assigned_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    
    notes = models.TextField(blank=True)
    completion_notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.related_request.ticket_number}"

class TaskComment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment on {self.task.title} by {self.author.username}"

class WorkflowTemplate(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class WorkflowStep(models.Model):
    template = models.ForeignKey(WorkflowTemplate, on_delete=models.CASCADE, related_name='steps')
    step_number = models.IntegerField()
    title = models.CharField(max_length=200)
    description = models.TextField()
    estimated_hours = models.DecimalField(max_digits=5, decimal_places=2, default=1.0)
    required_skills = models.TextField(blank=True, help_text="Comma-separated list of required skills")

    class Meta:
        ordering = ['step_number']
        unique_together = ['template', 'step_number']

    def __str__(self):
        return f"{self.template.name} - Step {self.step_number}: {self.title}"

class TaskAssignmentRule(models.Model):
    RULE_TYPES = [
        ('skill_based', 'Skill Based'),
        ('workload_based', 'Workload Based'),
        ('round_robin', 'Round Robin'),
        ('priority_based', 'Priority Based'),
    ]

    name = models.CharField(max_length=200)
    rule_type = models.CharField(max_length=20, choices=RULE_TYPES)
    conditions = models.JSONField(default=dict, help_text="JSON object defining rule conditions")
    is_active = models.BooleanField(default=True)
    priority = models.IntegerField(default=1, help_text="Higher number = higher priority")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-priority']

    def __str__(self):
        return f"{self.name} ({self.get_rule_type_display()})"
