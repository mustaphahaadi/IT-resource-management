from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from .role_permissions_models import Permission, RolePermission
import logging

logger = logging.getLogger(__name__)

# Default permissions catalog - will be seeded into database
DEFAULT_PERMISSIONS = [
    {
        'id': 'manage_users',
        'name': 'Manage Users',
        'description': 'Create, update and manage users',
        'category': 'Administration'
    },
    {
        'id': 'view_reports',
        'name': 'View Reports',
        'description': 'Access reporting dashboards and download reports',
        'category': 'Reports'
    },
    {
        'id': 'manage_inventory',
        'name': 'Manage Inventory',
        'description': 'Create and modify equipment and related records',
        'category': 'Inventory'
    },
    {
        'id': 'manage_requests',
        'name': 'Manage Requests',
        'description': 'Assign and update support requests',
        'category': 'Requests'
    },
    {
        'id': 'manage_tasks',
        'name': 'Manage Tasks',
        'description': 'Create and assign tasks',
        'category': 'Tasks'
    },
    {
        'id': 'view_analytics',
        'name': 'View Analytics',
        'description': 'Access analytics and performance metrics',
        'category': 'Reports'
    },
    {
        'id': 'manage_equipment',
        'name': 'Manage Equipment',
        'description': 'Full equipment management including audits',
        'category': 'Inventory'
    },
    {
        'id': 'system_settings',
        'name': 'System Settings',
        'description': 'Configure system-wide settings',
        'category': 'Administration'
    },
    {
        'id': 'backup_restore',
        'name': 'Backup & Restore',
        'description': 'Perform system backups and restores',
        'category': 'Administration'
    },
    {
        'id': 'security_audit',
        'name': 'Security Audit',
        'description': 'View security logs and audit trails',
        'category': 'Administration'
    }
]


def _ensure_permissions_seeded():
    """Ensure default permissions exist in database"""
    try:
        for perm_data in DEFAULT_PERMISSIONS:
            Permission.objects.get_or_create(
                id=perm_data['id'],
                defaults={
                    'name': perm_data['name'],
                    'description': perm_data['description'],
                    'category': perm_data['category']
                }
            )
    except Exception as e:
        logger.error(f"Error seeding permissions: {e}")


def _can_manage_permissions(user):
    """Check if user can manage role permissions"""
    if not user or not user.is_authenticated:
        return False
    # Only system_admin and it_manager can manage permissions
    return user.role in ['system_admin', 'it_manager'] and user.is_approved


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_permissions(request):
    """List available permissions for role management UI"""
    try:
        # Ensure permissions are seeded
        _ensure_permissions_seeded()
        
        # Get all permissions from database
        permissions = Permission.objects.all()
        
        data = [
            {
                'id': p.id,
                'name': p.name,
                'description': p.description,
                'category': p.category
            }
            for p in permissions
        ]
        
        return Response(data)
    except Exception as e:
        logger.error(f"Error listing permissions: {e}")
        return Response({'error': 'Failed to load permissions'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def role_permissions(request):
    """Get or add role-permission assignments.
    - GET: returns list of {role, permission}
    - POST: body {role, permission} (requires system_admin or it_manager)
    """
    try:
        if request.method == 'GET':
            # Anyone authenticated can view role permissions
            assignments = RolePermission.objects.select_related('permission').all()
            
            data = [
                {
                    'role': rp.role,
                    'permission': rp.permission.id
                }
                for rp in assignments
            ]
            
            return Response(data)
        
        # POST - requires permission to manage
        if not _can_manage_permissions(request.user):
            return Response(
                {'error': 'You do not have permission to manage role permissions'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        role = (request.data or {}).get('role')
        permission_id = (request.data or {}).get('permission')
        
        if not role or not permission_id:
            return Response(
                {'error': 'role and permission are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate role
        valid_roles = [choice[0] for choice in RolePermission.ROLE_CHOICES]
        if role not in valid_roles:
            return Response(
                {'error': f'Invalid role. Must be one of: {", ".join(valid_roles)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate permission exists
        try:
            permission = Permission.objects.get(id=permission_id)
        except Permission.DoesNotExist:
            return Response(
                {'error': 'Permission not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Create or get the role-permission assignment
        with transaction.atomic():
            rp, created = RolePermission.objects.get_or_create(
                role=role,
                permission=permission,
                defaults={'granted_by': request.user}
            )
        
        if created:
            return Response(
                {
                    'message': 'Permission added',
                    'role': role,
                    'permission': permission_id
                },
                status=status.HTTP_201_CREATED
            )
        else:
            return Response(
                {
                    'message': 'Permission already exists',
                    'role': role,
                    'permission': permission_id
                },
                status=status.HTTP_200_OK
            )
            
    except Exception as e:
        logger.error(f"Error managing role permissions: {e}")
        return Response(
            {'error': 'Failed to manage role permissions'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_role_permission(request, role, permission):
    """Remove a permission from a role (requires system_admin or it_manager)"""
    try:
        # Check permission to manage
        if not _can_manage_permissions(request.user):
            return Response(
                {'error': 'You do not have permission to manage role permissions'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Find and delete the role-permission assignment
        try:
            rp = RolePermission.objects.get(role=role, permission__id=permission)
            rp.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except RolePermission.DoesNotExist:
            return Response(
                {'error': 'Role-permission assignment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
            
    except Exception as e:
        logger.error(f"Error deleting role permission: {e}")
        return Response(
            {'error': 'Failed to delete role permission'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
