# Database Migration Guide - Role Permissions

This guide explains how to apply the new role-permissions database models.

## Changes Made

1. **New Models Added:**
   - `Permission` - Stores system permissions catalog
   - `RolePermission` - Stores role-to-permission assignments

2. **Files Modified:**
   - `backend/authentication/role_permissions_models.py` - New models
   - `backend/authentication/models.py` - Import new models
   - `backend/authentication/admin.py` - Admin interfaces for new models
   - `backend/authentication/permissions_views.py` - Database-backed API endpoints
   - `src/components/Auth/RolePermissions.jsx` - Enabled permission toggles
   - `src/components/Layout/Sidebar.jsx` - Fixed User Management route

## Migration Steps

### 1. Create and Apply Migrations

```bash
# Navigate to backend directory
cd backend

# Create migrations for the new models
python manage.py makemigrations authentication

# Apply the migrations
python manage.py migrate authentication

# Apply all pending migrations
python manage.py migrate
```

### 2. Seed Default Permissions

The permissions will be automatically seeded when you first access the `/api/auth/permissions/` endpoint.

Alternatively, you can seed them manually using Django shell:

```bash
python manage.py shell
```

```python
from authentication.permissions_views import _ensure_permissions_seeded
_ensure_permissions_seeded()
print("Permissions seeded successfully!")
exit()
```

### 3. Verify Installation

```bash
# Check that tables were created
python manage.py dbshell
```

```sql
-- List tables
.tables

-- Check Permission table
SELECT * FROM authentication_permission;

-- Check RolePermission table
SELECT * FROM authentication_rolepermission;

-- Exit
.exit
```

### 4. Test the API Endpoints

Start the development server:

```bash
python manage.py runserver
```

Test the endpoints:

```bash
# List all permissions
curl -H "Authorization: Token YOUR_TOKEN" http://localhost:8000/api/auth/permissions/

# List role-permission assignments
curl -H "Authorization: Token YOUR_TOKEN" http://localhost:8000/api/auth/role-permissions/

# Add a permission to a role (requires system_admin or it_manager)
curl -X POST -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "technician", "permission": "manage_tasks"}' \
  http://localhost:8000/api/auth/role-permissions/

# Remove a permission from a role
curl -X DELETE -H "Authorization: Token YOUR_TOKEN" \
  http://localhost:8000/api/auth/role-permissions/technician/manage_tasks/
```

## Frontend Changes

### User Management Route Fixed

The sidebar now correctly links to `/app/admin/users` instead of `/app/users`.

### Permission Toggles Enabled

The RolePermissions component now has functional checkboxes that allow system_admin and it_manager users to:
- View all role-permission assignments
- Add permissions to roles
- Remove permissions from roles

## Security Notes

1. **Permission Management Access:**
   - Only `system_admin` and `it_manager` roles can modify role-permissions
   - All authenticated users can view permissions (read-only)

2. **Database Persistence:**
   - Role-permission assignments are now stored in the database
   - Changes survive server restarts
   - Audit trail includes who granted each permission and when

## Troubleshooting

### Migration Errors

If you encounter circular import errors:

```bash
# Remove the import from models.py temporarily
# Run migrations
python manage.py makemigrations
python manage.py migrate

# Add the import back
```

### Permission Seeding Issues

If permissions don't appear:

```bash
python manage.py shell
```

```python
from authentication.role_permissions_models import Permission

# Manually create a permission
Permission.objects.create(
    id='test_permission',
    name='Test Permission',
    description='Test',
    category='Test'
)
```

### API 403 Errors

Ensure your user has the correct role:

```python
from authentication.models import CustomUser

user = CustomUser.objects.get(email='your@email.com')
user.role = 'system_admin'
user.is_approved = True
user.save()
```

## Rollback Instructions

If you need to rollback:

```bash
# Revert the migration
python manage.py migrate authentication <previous_migration_name>

# Or rollback all authentication migrations
python manage.py migrate authentication zero
```

## Next Steps

1. Run migrations as described above
2. Test the User Management page at http://localhost:3000/app/admin/users
3. Test the Role Permissions UI in the User Management page
4. Verify that permission toggles work correctly
5. Check that only authorized users can modify permissions

## Support

If you encounter issues:
1. Check Django logs for detailed error messages
2. Verify database tables were created correctly
3. Ensure user has proper role and is_approved=True
4. Check browser console for frontend errors
