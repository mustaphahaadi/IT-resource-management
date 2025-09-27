from rest_framework import permissions


class IsOwnerOrStaff(permissions.BasePermission):
    """
    Custom permission to allow owners to view/edit their own objects
    and staff to view/edit all objects.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Staff and admin can access all objects
        if request.user.role in ['admin', 'staff'] or request.user.is_staff:
            return True
        
        # Check if object has an owner field
        if hasattr(obj, 'requester'):
            return obj.requester == request.user
        elif hasattr(obj, 'assigned_to') and obj.assigned_to:
            return obj.assigned_to.user == request.user if hasattr(obj.assigned_to, 'user') else obj.assigned_to == request.user
        elif hasattr(obj, 'user'):
            return obj.user == request.user
        
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
        
        # Check if object has department-related fields
        if hasattr(obj, 'department'):
            return obj.department.lower() == request.user.department.lower()
        elif hasattr(obj, 'location') and hasattr(obj.location, 'department'):
            return obj.location.department.name.lower() == request.user.department.lower()
        elif hasattr(obj, 'requester_department'):
            return obj.requester_department.lower() == request.user.department.lower()
        
        return True  # Allow access if no department restriction can be determined


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
