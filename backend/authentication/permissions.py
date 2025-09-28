from rest_framework import permissions


class IsOwnerOrStaff(permissions.BasePermission):
    """
    Custom permission to allow owners to view/edit their own objects
    and staff to view/edit all objects.
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user is approved (except for admin)
        if request.user.role != 'admin' and not request.user.is_approved:
            return False
        
        return True
    
    def has_object_permission(self, request, view, obj):
        # Staff and admin can access all objects
        if request.user.role in ['admin', 'staff'] or request.user.is_staff:
            return True
        
        # Technicians can view/edit objects in their department
        if request.user.role == 'technician':
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
        
        # Write permissions only for staff, admin, or technician roles
        return request.user.role in ['admin', 'staff', 'technician'] or request.user.is_staff


class IsAdminOrStaff(permissions.BasePermission):
    """
    Custom permission for admin and staff only.
    """
    
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.role in ['admin', 'staff'] or request.user.is_staff)
        )


class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users.
    """
    
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (
                getattr(request.user, 'is_superuser', False)
                or request.user.can_access_admin()
            )
        )


class IsTechnicianOrStaff(permissions.BasePermission):
    """
    Custom permission for technicians and staff.
    """
    
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ['admin', 'staff', 'technician']
        )


class DepartmentBasedPermission(permissions.BasePermission):
    """
    Custom permission to filter objects based on user's department.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Admin and staff can access all objects
        if request.user.role in ['admin', 'staff'] or request.user.is_staff:
            return True
        
        # Technicians can access objects in their department or IT department
        if request.user.role == 'technician':
            user_depts = [request.user.department.lower(), 'it']
        else:
            user_depts = [request.user.department.lower()]
        
        # Check if object has department-related fields
        if hasattr(obj, 'department'):
            return obj.department.lower() in user_depts
        elif hasattr(obj, 'location') and hasattr(obj.location, 'department'):
            return obj.location.department.name.lower() in user_depts
        elif hasattr(obj, 'requester_department'):
            return obj.requester_department.lower() in user_depts
        elif hasattr(obj, 'requester') and hasattr(obj.requester, 'department'):
            return obj.requester.department.lower() in user_depts
        
        return False  # Deny access if no department restriction can be determined


class IsApprovedUser(permissions.BasePermission):
    """
    Custom permission to only allow approved users.
    """
    
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.is_approved or request.user.role == 'admin' or request.user.is_staff)
        )


class RoleBasedPermission(permissions.BasePermission):
    """
    Advanced role-based permission with fine-grained control.
    """
    
    # Define role hierarchy (higher number = more permissions)
    ROLE_HIERARCHY = {
        'user': 1,
        'technician': 2,
        'manager': 3,
        'staff': 4,
        'admin': 5
    }
    
    # Define allowed actions per role
    ROLE_PERMISSIONS = {
        'user': ['view_own', 'create_own'],
        'technician': ['view_own', 'view_department', 'create_own', 'update_own'],
        'manager': ['view_own', 'view_department', 'create_own', 'update_own', 'approve_department'],
        'staff': ['view_all', 'create_all', 'update_all', 'delete_own'],
        'admin': ['view_all', 'create_all', 'update_all', 'delete_all', 'manage_users']
    }
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user is approved (except for admin)
        if request.user.role != 'admin' and not request.user.is_approved:
            return False
        
        return True
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        user_role = user.role
        
        # Admin can do anything
        if user_role == 'admin' or user.is_staff:
            return True
        
        # Get user permissions for their role
        permissions = self.ROLE_PERMISSIONS.get(user_role, [])
        
        # Check ownership
        is_owner = self._is_owner(user, obj)
        
        # Check department access
        is_same_department = self._is_same_department(user, obj)
        
        # Apply permission logic based on HTTP method
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            if 'view_all' in permissions:
                return True
            elif 'view_department' in permissions and is_same_department:
                return True
            elif 'view_own' in permissions and is_owner:
                return True
        
        elif request.method in ['POST']:
            if 'create_all' in permissions:
                return True
            elif 'create_own' in permissions:
                return True
        
        elif request.method in ['PUT', 'PATCH']:
            if 'update_all' in permissions:
                return True
            elif 'update_own' in permissions and is_owner:
                return True
        
        elif request.method == 'DELETE':
            if 'delete_all' in permissions:
                return True
            elif 'delete_own' in permissions and is_owner:
                return True
        
        return False
    
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
