from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
import uuid
import qrcode
from io import BytesIO
from django.core.files import File
from PIL import Image

User = get_user_model()

class Department(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Location(models.Model):
    building = models.CharField(max_length=100)
    floor = models.CharField(max_length=50)
    room = models.CharField(max_length=50)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.building} - {self.floor} - {self.room}"

class Vendor(models.Model):
    name = models.CharField(max_length=100)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=20)
    address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class EquipmentCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Equipment Categories"

    def __str__(self):
        return self.name

class Equipment(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('maintenance', 'Under Maintenance'),
        ('retired', 'Retired'),
        ('broken', 'Broken'),
        ('disposed', 'Disposed'),
        ('lost', 'Lost'),
        ('stolen', 'Stolen'),
        ('checked_out', 'Checked Out'),
        ('reserved', 'Reserved'),
    ]

    PRIORITY_CHOICES = [
        ('critical', 'Critical'),
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]

    CONDITION_CHOICES = [
        ('excellent', 'Excellent'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('poor', 'Poor'),
        ('damaged', 'Damaged'),
    ]

    # Basic Information
    name = models.CharField(max_length=200)
    asset_tag = models.CharField(max_length=50, unique=True)
    serial_number = models.CharField(max_length=100, blank=True)
    model = models.CharField(max_length=100)
    manufacturer = models.CharField(max_length=100)
    category = models.ForeignKey(EquipmentCategory, on_delete=models.CASCADE)
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    vendor = models.ForeignKey(Vendor, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Status and Condition
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='good')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    
    # Financial Information
    purchase_date = models.DateField(null=True, blank=True)
    warranty_expiry = models.DateField(null=True, blank=True)
    purchase_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    current_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    depreciation_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('20.00'))  # Annual percentage
    
    # Assignment and Usage
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_equipment')
    checked_out_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='checked_out_equipment')
    checked_out_date = models.DateTimeField(null=True, blank=True)
    expected_return_date = models.DateTimeField(null=True, blank=True)
    
    # Tracking and Identification
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True, null=True)
    rfid_tag = models.CharField(max_length=100, blank=True, unique=True, null=True)
    barcode = models.CharField(max_length=100, blank=True, unique=True, null=True)
    
    # Additional Information
    description = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    specifications = models.JSONField(default=dict, blank=True)
    
    # Lifecycle Information
    installation_date = models.DateField(null=True, blank=True)
    last_maintenance_date = models.DateField(null=True, blank=True)
    next_maintenance_date = models.DateField(null=True, blank=True)
    end_of_life_date = models.DateField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.asset_tag})"
    
    def save(self, *args, **kwargs):
        """Save equipment. For new instances we must first save to obtain a primary key
        before generating and saving related file fields (QR code). This avoids
        attempting to insert a model with an explicit id which can trigger UNIQUE
        constraint failures when clients or code inadvertently supply an id.
        """
        is_new = self.pk is None

        # If new record: save first to get pk, then generate QR and save again.
        if is_new:
            # Calculate current value if possible (safe before initial save)
            if self.purchase_cost and self.purchase_date:
                self.calculate_current_value()

            # Initial save to obtain an id
            super().save(*args, **kwargs)

            # Now that we have a pk, generate QR code if missing and persist it
            if not self.qr_code:
                self.generate_qr_code()
                # Save only the qr_code field to avoid overwriting other fields
                try:
                    super().save(update_fields=['qr_code'])
                except TypeError:
                    # Some Django versions may not accept update_fields here; fallback
                    super().save()
            return

        # Existing instance: update computed values and ensure QR exists
        if not self.qr_code:
            self.generate_qr_code()

        if self.purchase_cost and self.purchase_date:
            self.calculate_current_value()

        super().save(*args, **kwargs)
    
    def generate_qr_code(self):
        """Generate QR code for the equipment"""
        qr_data = {
            'asset_tag': self.asset_tag,
            'name': self.name,
            'id': str(self.id) if self.id else str(uuid.uuid4()),
            'type': 'equipment'
        }
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(str(qr_data))
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        filename = f'qr_{self.asset_tag}.png'
        filebuffer = File(buffer, name=filename)
        self.qr_code.save(filename, filebuffer)
    
    def calculate_current_value(self):
        """Calculate current value based on depreciation"""
        if not self.purchase_cost or not self.purchase_date:
            return
        
        years_owned = (timezone.now().date() - self.purchase_date).days / 365.25
        depreciation_amount = self.purchase_cost * (self.depreciation_rate / 100) * Decimal(str(years_owned))
        self.current_value = max(self.purchase_cost - depreciation_amount, Decimal('0.00'))
    
    def is_overdue_maintenance(self):
        """Check if equipment is overdue for maintenance"""
        if self.next_maintenance_date:
            return timezone.now().date() > self.next_maintenance_date
        return False
    
    def is_warranty_expired(self):
        """Check if warranty has expired"""
        if self.warranty_expiry:
            return timezone.now().date() > self.warranty_expiry
        return False
    
    def is_warranty_expiring_soon(self, days=30):
        """Check if warranty is expiring within specified days"""
        if self.warranty_expiry:
            return (self.warranty_expiry - timezone.now().date()).days <= days
        return False
    
    def check_out(self, user, expected_return_date=None):
        """Check out equipment to a user"""
        self.checked_out_to = user
        self.checked_out_date = timezone.now()
        self.expected_return_date = expected_return_date
        self.status = 'checked_out'
        self.save()
    
    def check_in(self):
        """Check in equipment"""
        self.checked_out_to = None
        self.checked_out_date = None
        self.expected_return_date = None
        self.status = 'active'
        self.save()

class Software(models.Model):
    name = models.CharField(max_length=200)
    version = models.CharField(max_length=50)
    license_key = models.CharField(max_length=200, blank=True)
    license_type = models.CharField(max_length=100)
    vendor = models.ForeignKey(Vendor, on_delete=models.SET_NULL, null=True, blank=True)
    purchase_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    max_installations = models.IntegerField(default=1)
    current_installations = models.IntegerField(default=0)
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} v{self.version}"

class SoftwareInstallation(models.Model):
    software = models.ForeignKey(Software, on_delete=models.CASCADE)
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE)
    installed_date = models.DateTimeField(auto_now_add=True)
    installed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    class Meta:
        unique_together = ['software', 'equipment']

    def __str__(self):
        return f"{self.software.name} on {self.equipment.name}"

class MaintenanceSchedule(models.Model):
    FREQUENCY_CHOICES = [
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('annually', 'Annually'),
    ]

    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE)
    maintenance_type = models.CharField(max_length=100)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    last_maintenance = models.DateField(null=True, blank=True)
    next_maintenance = models.DateField()
    assigned_technician = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.equipment.name} - {self.maintenance_type}"

class AssetHistory(models.Model):
    """Track all changes and events for equipment"""
    ACTION_CHOICES = [
        ('created', 'Created'),
        ('updated', 'Updated'),
        ('checked_out', 'Checked Out'),
        ('checked_in', 'Checked In'),
        ('assigned', 'Assigned'),
        ('unassigned', 'Unassigned'),
        ('maintenance_started', 'Maintenance Started'),
        ('maintenance_completed', 'Maintenance Completed'),
        ('location_changed', 'Location Changed'),
        ('status_changed', 'Status Changed'),
        ('condition_changed', 'Condition Changed'),
        ('retired', 'Retired'),
        ('disposed', 'Disposed'),
        ('lost', 'Lost'),
        ('found', 'Found'),
        ('stolen', 'Stolen'),
        ('recovered', 'Recovered'),
    ]
    
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, related_name='history')
    action = models.CharField(max_length=30, choices=ACTION_CHOICES)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    old_value = models.TextField(blank=True)
    new_value = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = "Asset Histories"
    
    def __str__(self):
        return f"{self.equipment.asset_tag} - {self.action} - {self.timestamp}"

class AssetCheckout(models.Model):
    """Track equipment checkout/checkin history"""
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, related_name='checkout_history')
    checked_out_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='equipment_checkouts')
    checked_out_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_checkouts')
    checkout_date = models.DateTimeField(auto_now_add=True)
    expected_return_date = models.DateTimeField(null=True, blank=True)
    actual_return_date = models.DateTimeField(null=True, blank=True)
    checked_in_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_checkins')
    checkout_notes = models.TextField(blank=True)
    checkin_notes = models.TextField(blank=True)
    condition_at_checkout = models.CharField(max_length=20, choices=Equipment.CONDITION_CHOICES, default='good')
    condition_at_checkin = models.CharField(max_length=20, choices=Equipment.CONDITION_CHOICES, blank=True)
    is_overdue = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-checkout_date']
    
    def __str__(self):
        return f"{self.equipment.asset_tag} - {self.checked_out_to.get_full_name()}"
    
    def save(self, *args, **kwargs):
        # Check if overdue
        if self.expected_return_date and not self.actual_return_date:
            self.is_overdue = timezone.now() > self.expected_return_date
        super().save(*args, **kwargs)

class AssetAudit(models.Model):
    """Track periodic asset audits"""
    AUDIT_TYPE_CHOICES = [
        ('physical', 'Physical Audit'),
        ('financial', 'Financial Audit'),
        ('compliance', 'Compliance Audit'),
        ('maintenance', 'Maintenance Audit'),
        ('security', 'Security Audit'),
    ]
    
    AUDIT_STATUS_CHOICES = [
        ('planned', 'Planned'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    name = models.CharField(max_length=200)
    audit_type = models.CharField(max_length=20, choices=AUDIT_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=AUDIT_STATUS_CHOICES, default='planned')
    scheduled_date = models.DateField()
    start_date = models.DateField(null=True, blank=True)
    completion_date = models.DateField(null=True, blank=True)
    auditor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField(blank=True)
    findings = models.TextField(blank=True)
    recommendations = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-scheduled_date']
    
    def __str__(self):
        return f"{self.name} - {self.audit_type}"

class AssetAuditItem(models.Model):
    """Individual equipment items in an audit"""
    AUDIT_RESULT_CHOICES = [
        ('found', 'Found'),
        ('missing', 'Missing'),
        ('damaged', 'Damaged'),
        ('mislocated', 'Mislocated'),
        ('unauthorized', 'Unauthorized'),
    ]
    
    audit = models.ForeignKey(AssetAudit, on_delete=models.CASCADE, related_name='items')
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE)
    expected_location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='expected_audit_items')
    actual_location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True, related_name='actual_audit_items')
    result = models.CharField(max_length=20, choices=AUDIT_RESULT_CHOICES)
    condition_found = models.CharField(max_length=20, choices=Equipment.CONDITION_CHOICES, blank=True)
    notes = models.TextField(blank=True)
    audited_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    audit_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['audit', 'equipment']
    
    def __str__(self):
        return f"{self.audit.name} - {self.equipment.asset_tag}"

class AssetAlert(models.Model):
    """System-generated alerts for equipment"""
    ALERT_TYPE_CHOICES = [
        ('maintenance_due', 'Maintenance Due'),
        ('maintenance_overdue', 'Maintenance Overdue'),
        ('warranty_expiring', 'Warranty Expiring'),
        ('warranty_expired', 'Warranty Expired'),
        ('checkout_overdue', 'Checkout Overdue'),
        ('end_of_life', 'End of Life'),
        ('missing', 'Missing'),
        ('damaged', 'Damaged'),
        ('compliance', 'Compliance Issue'),
    ]
    
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, related_name='alerts')
    alert_type = models.CharField(max_length=30, choices=ALERT_TYPE_CHOICES)
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_active = models.BooleanField(default=True)
    acknowledged_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_alerts')
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.equipment.asset_tag} - {self.alert_type}"
    
    def acknowledge(self, user):
        """Acknowledge the alert"""
        self.acknowledged_by = user
        self.acknowledged_at = timezone.now()
        self.save()
    
    def resolve(self, user):
        """Resolve the alert"""
        self.resolved_by = user
        self.resolved_at = timezone.now()
        self.is_active = False
        self.save()

class AssetTag(models.Model):
    """Manage different types of asset tags"""
    TAG_TYPE_CHOICES = [
        ('qr', 'QR Code'),
        ('barcode', 'Barcode'),
        ('rfid', 'RFID'),
        ('nfc', 'NFC'),
    ]
    
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, related_name='tags')
    tag_type = models.CharField(max_length=10, choices=TAG_TYPE_CHOICES)
    tag_value = models.CharField(max_length=200)
    is_primary = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['tag_type', 'tag_value']
    
    def __str__(self):
        return f"{self.equipment.asset_tag} - {self.tag_type}: {self.tag_value}"
