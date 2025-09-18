from django.db import models
from django.contrib.auth import get_user_model
from inventory.models import Equipment

User = get_user_model()

class RequestCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Request Categories"

    def __str__(self):
        return self.name

class SupportRequest(models.Model):
    PRIORITY_CHOICES = [
        ('critical', 'Critical - Patient Care Impact'),
        ('high', 'High - Operations Impact'),
        ('medium', 'Medium - Standard Request'),
        ('low', 'Low - Enhancement/Non-urgent'),
    ]

    STATUS_CHOICES = [
        ('open', 'Open'),
        ('assigned', 'Assigned'),
        ('in_progress', 'In Progress'),
        ('pending', 'Pending User Response'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]

    CHANNEL_CHOICES = [
        ('web', 'Web Portal'),
        ('mobile', 'Mobile App'),
        ('phone', 'Phone'),
        ('email', 'Email'),
        ('walk_in', 'Walk-in'),
    ]

    ticket_number = models.CharField(max_length=20, unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey(RequestCategory, on_delete=models.CASCADE)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default='web')
    
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
        super().save(*args, **kwargs)

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
