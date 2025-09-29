from rest_framework import permissions
from rest_framework.permissions import BasePermission


class IsOwnerOrStaff(permissions.BasePermission):
    """
    Custom permission to allow owners to view/edit their own objects
    and staff to view/edit all objects.
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user is approved (except for system_admin)
        if request.user.role != 'system_admin' and not request.user.is_approved:
            return False
        
        return True
    
    def has_object_permission(self, request, view, obj):
        # System admin and IT manager can access all objects
        if request.user.role in ['system_admin', 'it_manager'] or request.user.is_staff:
            return True
        
        # Senior technicians can view/edit objects in their department
        if request.user.role in ['senior_technician', 'technician']:
            if hasattr(obj, 'requester') and hasattr(obj.requester, 'department'):
                if obj.requester.department.lower() in [request.user.department.lower(), 'it']:
                    return True
        
        # Check if object has an owner field
        if hasattr(obj, 'requester'):
            return obj.requester == request.user
        elif hasattr(obj, 'assigned_to') and obj.assigned_to:
            return obj.assigned_to.user == request.user if hasattr(obj.assigned_to, 'user') else obj.assigned_to == request.user
        elif hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        
        return False


class IsStaffOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow read access to all authenticated users
    but write access only to staff.
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Read permissions for all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for technical staff roles
        return request.user.role in ['system_admin', 'it_manager', 'senior_technician', 'technician'] or request.user.is_staff


class IsAdminOrStaff(permissions.BasePermission):
    """
    Custom permission for admin and staff only.
    """
    
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.role in ['system_admin', 'it_manager'] or request.user.is_staff)
            and request.user.can_access_admin()
        )


class RoleBasedPermission(BasePermission):
    """
    Advanced role-based permission system with fine-grained control.
    
    Role hierarchy: end_user(1) < technician(2) < senior_technician(3) < it_manager(4) < system_admin(5)
    
    Permission matrix:
    - system_admin: Full system access, user management, all CRUD operations
    - it_manager: Department oversight, team management, SLA monitoring, reporting
    - senior_technician: Advanced technical support, ticket assignment, knowledge base management
    - technician: First-line support, assigned ticket management, basic reporting
    - end_user: Own requests only, basic equipment viewing, self-service portal
    """
    
    ROLE_HIERARCHY = {
        'end_user': 1,
        'technician': 2,
        'senior_technician': 3,
        'it_manager': 4,
        'system_admin': 5
    }
    
    PERMISSION_MATRIX = {
        'system_admin': {
            'view_own': True, 'view_department': True, 'view_all': True,
            'create': True, 'update_own': True, 'update_department': True, 'update_all': True,
            'delete_own': True, 'delete_department': True, 'delete_all': True,
            'assign': True, 'escalate': True, 'close': True, 'manage_users': True, 
            'system_config': True, 'manage_equipment': True, 'generate_reports': True
        },
        'it_manager': {
            'view_own': True, 'view_department': True, 'view_all': True,
            'create': True, 'update_own': True, 'update_department': True, 'update_all': False,
            'delete_own': True, 'delete_department': True, 'delete_all': False,
            'assign': True, 'escalate': True, 'close': True, 'manage_users': True, 
            'system_config': False, 'manage_equipment': True, 'generate_reports': True
        },
        'senior_technician': {
            'view_own': True, 'view_department': True, 'view_all': False,
            'create': True, 'update_own': True, 'update_department': True, 'update_all': False,
            'delete_own': True, 'delete_department': False, 'delete_all': False,
            'assign': True, 'escalate': True, 'close': True, 'manage_users': False, 
            'system_config': False, 'manage_equipment': True, 'generate_reports': False
        },
        'technician': {
            'view_own': True, 'view_department': True, 'view_all': False,
            'create': True, 'update_own': True, 'update_department': False, 'update_all': False,
            'delete_own': False, 'delete_department': False, 'delete_all': False,
            'assign': False, 'escalate': True, 'close': True, 'manage_users': False, 
            'system_config': False, 'manage_equipment': False, 'generate_reports': False
        },
        'end_user': {
            'view_own': True, 'view_department': False, 'view_all': False,
            'create': True, 'update_own': True, 'update_department': False, 'update_all': False,
            'delete_own': False, 'delete_department': False, 'delete_all': False,
            'assign': False, 'escalate': False, 'close': False, 'manage_users': False, 
            'system_config': False, 'manage_equipment': False, 'generate_reports': False
        }
    }
    
    def has_permission(self, request, view):
        """Check if user has permission to access the view"""
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user is approved (except for system_admin)
        if request.user.role != 'system_admin' and not request.user.is_approved:
            return False
        
        # Optional: gate specific list-level actions by role to prevent end-user control
        action = getattr(view, 'action', None)
        if action in ['assignment_suggestions']:
            # Only technical staff can query assignment suggestions
            return request.user.role in ['system_admin', 'it_manager', 'senior_technician', 'technician'] or request.user.is_staff
        
        return True
    
    def has_object_permission(self, request, view, obj):
        """Check if user has permission to access the specific object"""
        if not request.user or not request.user.is_authenticated:
            return False
        
        permissions = self.get_user_permissions(request.user)
        is_owner = self._is_owner(request.user, obj)
        is_same_department = self._is_same_department(request.user, obj)
        action = getattr(view, 'action', None)
        
        # Check view permissions
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            if permissions.get('view_all'):
                return True
            elif permissions.get('view_department') and is_same_department:
                return True
            elif permissions.get('view_own') and is_owner:
                return True
        
        # Check create permissions
        elif request.method in ['POST']:
            # Custom action controls (management)
            if action in ['assign', 'reassign']:
                return permissions.get('assign', False)
            if action in ['complete', 'close']:
                return permissions.get('close', False)
            if action in ['start']:
                # Start is allowed if user can update own/department or all
                if permissions.get('update_all'):
                    return True
                if permissions.get('update_department') and is_same_department:
                    return True
                if permissions.get('update_own') and is_owner:
                    return True
                return False
            # Default to create permission for non-custom actions
            return permissions.get('create', False)
        
        # Check update permissions
        elif request.method in ['PUT', 'PATCH']:
            if permissions.get('update_all'):
                return True
            elif permissions.get('update_department') and is_same_department:
                return True
            elif permissions.get('update_own') and is_owner:
                return True
        
        # Check delete permissions
        elif request.method == 'DELETE':
            if permissions.get('delete_all'):
                return True
            elif permissions.get('delete_department') and is_same_department:
                return True
            elif permissions.get('delete_own') and is_owner:
                return True
        
        return False
    
    def get_user_permissions(self, user):
        """Get permissions for a user based on their role"""
        if not user or not user.is_authenticated:
            return {}
        
        role = getattr(user, 'role', 'end_user')
        return self.PERMISSION_MATRIX.get(role, self.PERMISSION_MATRIX['end_user'])
    
    def has_role_permission(self, user, required_role):
        """Check if user has at least the required role level"""
        if not user or not user.is_authenticated:
            return False
        
        user_level = self.ROLE_HIERARCHY.get(getattr(user, 'role', 'end_user'), 0)
        required_level = self.ROLE_HIERARCHY.get(required_role, 999)
        
        return user_level >= required_level
    
    def _is_owner(self, user, obj):
        """Check if user owns the object"""
        if hasattr(obj, 'requester'):
            return obj.requester == user
        elif hasattr(obj, 'assigned_to'):
            if hasattr(obj.assigned_to, 'user'):
                return obj.assigned_to.user == user
            return obj.assigned_to == user
        elif hasattr(obj, 'user'):
            return obj.user == user
        elif hasattr(obj, 'created_by'):
            return obj.created_by == user
        return False
    
    def _is_same_department(self, user, obj):
        """Check if object belongs to user's department"""
        user_dept = user.department.lower()
        
        # Technicians can access IT department objects too
        if user.role == 'technician':
            allowed_depts = [user_dept, 'it']
        else:
            allowed_depts = [user_dept]
        
        if hasattr(obj, 'department'):
            return obj.department.lower() in allowed_depts
        elif hasattr(obj, 'location') and hasattr(obj.location, 'department'):
            return obj.location.department.name.lower() in allowed_depts
        elif hasattr(obj, 'requester_department'):
            return obj.requester_department.lower() in allowed_depts
        elif hasattr(obj, 'requester') and hasattr(obj.requester, 'department'):
            return obj.requester.department.lower() in allowed_depts
        
        return False


class IsApprovedUser(BasePermission):
    """
    Permission class that requires user approval.
    """
    
    def has_permission(self, request, view):
        return (
            request.user 
            and request.user.is_authenticated 
            and (request.user.is_approved or request.user.role == 'system_admin')
        )


class DepartmentBasedPermission(BasePermission):
    """
    Permission class for department-based access control.
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # System admin and IT manager can access all departments
        if request.user.role in ['system_admin', 'it_manager']:
            return True
        
        return request.user.is_approved
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # System admin and IT manager can access all objects
        if request.user.role in ['system_admin', 'it_manager']:
            return True
        
        # Check department-based access
        user_departments = request.user.get_accessible_departments()
        
        if hasattr(obj, 'department'):
            return obj.department.lower() in [dept.lower() for dept in user_departments]
        elif hasattr(obj, 'requester') and hasattr(obj.requester, 'department'):
            return obj.requester.department.lower() in [dept.lower() for dept in user_departments]
        
        return False
