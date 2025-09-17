from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import Group, Permission
from .models import CustomUser


@receiver(post_save, sender=CustomUser)
def assign_user_permissions(sender, instance, created, **kwargs):
    """Assign default permissions based on user role"""
    if created or kwargs.get('update_fields') and 'role' in kwargs['update_fields']:
        # Remove user from all groups first
        instance.groups.clear()
        
        # Assign permissions based on role
        if instance.role == 'admin':
            # Admin gets all permissions
            admin_group, created = Group.objects.get_or_create(name='Administrators')
            instance.groups.add(admin_group)
            instance.is_staff = True
            instance.is_superuser = True
            
        elif instance.role == 'manager':
            # Manager gets management permissions
            manager_group, created = Group.objects.get_or_create(name='Managers')
            instance.groups.add(manager_group)
            instance.is_staff = True
            
        elif instance.role == 'staff':
            # IT Staff gets operational permissions
            staff_group, created = Group.objects.get_or_create(name='IT Staff')
            instance.groups.add(staff_group)
            
        elif instance.role == 'technician':
            # Technician gets technical permissions
            tech_group, created = Group.objects.get_or_create(name='Technicians')
            instance.groups.add(tech_group)
            
        else:
            # Regular user gets basic permissions
            user_group, created = Group.objects.get_or_create(name='Users')
            instance.groups.add(user_group)
        
        # Save the changes
        if created:
            # Avoid recursion on creation
            CustomUser.objects.filter(pk=instance.pk).update(
                is_staff=instance.is_staff,
                is_superuser=instance.is_superuser
            )
        else:
            instance.save(update_fields=['is_staff', 'is_superuser'])
