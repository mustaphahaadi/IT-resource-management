from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import json

User = get_user_model()

class WorkflowLog(models.Model):
    """Log workflow steps for audit trail and analytics"""
    
    OBJECT_TYPES = [
        ('request', 'Support Request'),
        ('task', 'Task'),
        ('equipment', 'Equipment'),
        ('user', 'User'),
    ]
    
    STEP_TYPES = [
        ('request_created', 'Request Created'),
        ('request_assigned', 'Request Assigned'),
        ('request_resolved', 'Request Resolved'),
        ('task_created', 'Task Created'),
        ('task_assigned', 'Task Assigned'),
        ('task_started', 'Task Started'),
        ('task_completed', 'Task Completed'),
        ('equipment_updated', 'Equipment Updated'),
        ('escalation_triggered', 'Escalation Triggered'),
        ('sla_violation', 'SLA Violation'),
    ]
    
    object_type = models.CharField(max_length=20, choices=OBJECT_TYPES)
    object_id = models.IntegerField()
    step_type = models.CharField(max_length=30, choices=STEP_TYPES)
    timestamp = models.DateTimeField(default=timezone.now)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['object_type', 'object_id']),
            models.Index(fields=['step_type', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.get_step_type_display()} - {self.object_type} {self.object_id}"


class PerformanceMetric(models.Model):
    """Store performance metrics for analytics"""
    
    METRIC_TYPES = [
        ('response_time', 'Average Response Time'),
        ('resolution_time', 'Average Resolution Time'),
        ('sla_compliance', 'SLA Compliance Rate'),
        ('technician_utilization', 'Technician Utilization'),
        ('equipment_uptime', 'Equipment Uptime'),
        ('user_satisfaction', 'User Satisfaction'),
    ]
    
    metric_type = models.CharField(max_length=30, choices=METRIC_TYPES)
    value = models.FloatField()
    unit = models.CharField(max_length=20, default='')  # hours, percentage, etc.
    date = models.DateField(default=timezone.now)
    department = models.CharField(max_length=50, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        unique_together = ['metric_type', 'date', 'department']
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.get_metric_type_display()} - {self.value}{self.unit} ({self.date})"


class SystemAlert(models.Model):
    """System-generated alerts for monitoring"""
    
    ALERT_TYPES = [
        ('sla_violation', 'SLA Violation'),
        ('equipment_failure', 'Equipment Failure'),
        ('high_workload', 'High Workload'),
        ('system_error', 'System Error'),
        ('security_issue', 'Security Issue'),
    ]
    
    SEVERITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    severity = models.CharField(max_length=10, choices=SEVERITY_LEVELS)
    title = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    acknowledged_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_alert_type_display()} - {self.severity} - {self.title}"
    
    @property
    def is_acknowledged(self):
        return self.acknowledged_at is not None
    
    @property
    def is_resolved(self):
        return self.resolved_at is not None


class DashboardWidget(models.Model):
    """Configurable dashboard widgets"""
    
    WIDGET_TYPES = [
        ('metric_card', 'Metric Card'),
        ('chart', 'Chart'),
        ('table', 'Table'),
        ('alert_list', 'Alert List'),
        ('activity_feed', 'Activity Feed'),
    ]
    
    name = models.CharField(max_length=100)
    widget_type = models.CharField(max_length=20, choices=WIDGET_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    config = models.JSONField(default=dict)  # Widget-specific configuration
    position_x = models.IntegerField(default=0)
    position_y = models.IntegerField(default=0)
    width = models.IntegerField(default=1)
    height = models.IntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['position_y', 'position_x']
    
    def __str__(self):
        return f"{self.title} ({self.get_widget_type_display()})"
