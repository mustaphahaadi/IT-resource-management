from django.db import models
from django.contrib.auth import get_user_model
from inventory.models import Equipment

User = get_user_model()

class RequestCategory(models.Model):
    """Categories for IT support requests"""
    
    CATEGORY_TYPES = [
        ('hardware', 'Hardware Issues'),
        ('software', 'Software Issues'),
        ('network', 'Network & Connectivity'),
        ('access', 'Access & Permissions'),
        ('email', 'Email & Communication'),
        ('training', 'Training & Support'),
        ('maintenance', 'Maintenance & Updates'),
        ('security', 'Security Issues'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=100)
    category_type = models.CharField(max_length=20, choices=CATEGORY_TYPES, default='other')
    description = models.TextField(blank=True)
    sla_hours = models.IntegerField(default=24, help_text="Default SLA response time in hours")
    auto_assign_to_it = models.BooleanField(default=True, help_text="Automatically assign to IT department")
    requires_approval = models.BooleanField(default=False, help_text="Requires manager approval")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Request Categories"
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.get_category_type_display()})"

class SupportRequest(models.Model):
    PRIORITY_CHOICES = [
        ('critical', 'Critical - System Down/Security Breach'),
        ('high', 'High - Major Impact on Operations'),
        ('medium', 'Medium - Standard Request'),
        ('low', 'Low - Enhancement/Non-urgent'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending Assignment'),
        ('open', 'Open'),
        ('assigned', 'Assigned'),
        ('in_progress', 'In Progress'),
        ('pending_user', 'Pending User Response'),
        ('pending_approval', 'Pending Approval'),
        ('escalated', 'Escalated'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
        ('cancelled', 'Cancelled'),
    ]

    CHANNEL_CHOICES = [
        ('web_portal', 'Web Portal'),
        ('mobile_app', 'Mobile App'),
        ('phone', 'Phone Call'),
        ('email', 'Email'),
        ('walk_in', 'Walk-in/In-Person'),
        ('chat', 'Live Chat'),
        ('self_service', 'Self-Service Portal'),
    ]

    ticket_number = models.CharField(max_length=20, unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey(RequestCategory, on_delete=models.CASCADE)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default='web_portal')
    
    # Requester information
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submitted_requests')
    requester_phone = models.CharField(max_length=20, blank=True)
    requester_department = models.CharField(max_length=100)
    requester_location = models.CharField(max_length=200)
    
    # Assignment and resolution
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_requests')
    related_equipment = models.ForeignKey(Equipment, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    assigned_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    
    # SLA tracking
    response_due = models.DateTimeField(null=True, blank=True)
    resolution_due = models.DateTimeField(null=True, blank=True)
    first_response_at = models.DateTimeField(null=True, blank=True)
    sla_breached = models.BooleanField(default=False)
    
    # Additional IT helpdesk fields
    urgency = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    impact = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    business_justification = models.TextField(blank=True, help_text="Business reason for this request")
    estimated_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    actual_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Approval workflow
    requires_approval = models.BooleanField(default=False)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_requests')
    approved_at = models.DateTimeField(null=True, blank=True)
    approval_notes = models.TextField(blank=True)
    
    # Resolution details
    resolution_notes = models.TextField(blank=True)
    resolution_time_minutes = models.IntegerField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.ticket_number} - {self.title}"

    def save(self, *args, **kwargs):
        if not self.ticket_number:
            # Generate ticket number
            import datetime
            today = datetime.date.today()
            count = SupportRequest.objects.filter(created_at__date=today).count() + 1
            self.ticket_number = f"IT{today.strftime('%Y%m%d')}{count:04d}"
        
        # Auto-set priority based on urgency and impact
        if self.urgency == 'critical' or self.impact == 'critical':
            self.priority = 'critical'
        elif self.urgency == 'high' or self.impact == 'high':
            self.priority = 'high'
        elif self.urgency == 'low' and self.impact == 'low':
            self.priority = 'low'
        else:
            self.priority = 'medium'
        
        super().save(*args, **kwargs)
    
    def is_overdue(self):
        """Check if request is overdue based on SLA"""
        from django.utils import timezone
        if self.resolution_due and self.status not in ['resolved', 'closed', 'cancelled']:
            return timezone.now() > self.resolution_due
        return False
    
    def get_age_in_hours(self):
        """Get age of request in hours"""
        from django.utils import timezone
        return (timezone.now() - self.created_at).total_seconds() / 3600
    
    def can_be_closed_by(self, user):
        """Check if user can close this request"""
        return user.can_close_tickets() and (
            self.assigned_to == user or 
            user.role in ['it_manager', 'system_admin'] or
            self.requester == user
        )

class RequestComment(models.Model):
    request = models.ForeignKey(SupportRequest, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    comment = models.TextField()
    is_internal = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment on {self.request.ticket_number} by {self.author.username}"

class RequestAttachment(models.Model):
    request = models.ForeignKey(SupportRequest, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='request_attachments/')
    filename = models.CharField(max_length=255)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.filename} - {self.request.ticket_number}"

class Alert(models.Model):
    ALERT_TYPES = [
        ('equipment_down', 'Equipment Down'),
        ('maintenance_due', 'Maintenance Due'),
        ('warranty_expiry', 'Warranty Expiring'),
        ('license_expiry', 'License Expiring'),
        ('sla_breach', 'SLA Breach'),
        ('critical_request', 'Critical Request'),
    ]

    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    related_request = models.ForeignKey(SupportRequest, on_delete=models.CASCADE, null=True, blank=True)
    related_equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, null=True, blank=True)
    is_acknowledged = models.BooleanField(default=False)
    acknowledged_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_alert_type_display()} - {self.title}"
