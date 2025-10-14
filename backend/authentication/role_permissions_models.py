from django.db import models
from django.utils import timezone


class Permission(models.Model):
    """System permissions catalog"""
    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, default='General')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['category', 'name']
        verbose_name = 'Permission'
        verbose_name_plural = 'Permissions'
    
    def __str__(self):
        return f"{self.name} ({self.id})"


class RolePermission(models.Model):
    """Role-Permission assignments"""
    ROLE_CHOICES = [
        ('system_admin', 'System Administrator'),
        ('it_manager', 'IT Manager'),
        ('senior_technician', 'Senior Technician'),
        ('technician', 'Technician'),
        ('end_user', 'End User'),
    ]
    
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE, related_name='role_assignments')
    granted_by = models.ForeignKey(
        'CustomUser', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='granted_permissions'
    )
    granted_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        unique_together = ['role', 'permission']
        ordering = ['role', 'permission']
        verbose_name = 'Role Permission'
        verbose_name_plural = 'Role Permissions'
    
    def __str__(self):
        return f"{self.get_role_display()} - {self.permission.name}"
