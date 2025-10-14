# Quick Start Guide - After Fixes

## Summary of Changes

✅ Fixed User Management sidebar route (`/app/admin/users`)
✅ Implemented persistent role-permission management
✅ Fixed notification system field mismatches
✅ Aligned API paths for reports and file uploads
✅ Enabled permission toggle UI
✅ Added permission protection to management endpoints

## Step 1: Run Database Migrations

```bash
cd backend
python manage.py makemigrations authentication
python manage.py migrate
```

Expected output:
```
Migrations for 'authentication':
  authentication/migrations/0XXX_permission_rolepermission.py
    - Create model Permission
    - Create model RolePermission
Operations to perform:
  Apply all migrations: ...
Running migrations:
  Applying authentication.0XXX_permission_rolepermission... OK
```

## Step 2: Start Backend Server

```bash
# From backend directory
python manage.py runserver
```

Server should start at: http://localhost:8000

## Step 3: Start Frontend Server

```bash
# From project root
npm run dev
```

Frontend should start at: http://localhost:3000

## Step 4: Test User Management Access

1. **Login as system_admin:**
   - Navigate to http://localhost:3000/login
   - Use your system_admin credentials

2. **Access User Management:**
   - Click on "User Management" in the Administration section of the sidebar
   - URL should be: http://localhost:3000/app/admin/users
   - You should see the user management interface

3. **Test Role Permissions:**
   - Click "Manage Role Permissions" button
   - You should see a modal with permission matrix
   - Try toggling permissions on/off
   - Changes should persist after page reload

## Step 5: Verify API Endpoints

Test the new endpoints:

```bash
# Get your auth token first
TOKEN="your_auth_token_here"

# List permissions
curl -H "Authorization: Token $TOKEN" http://localhost:8000/api/auth/permissions/

# List role-permission assignments
curl -H "Authorization: Token $TOKEN" http://localhost:8000/api/auth/role-permissions/

# Add a permission (system_admin only)
curl -X POST -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "technician", "permission": "manage_tasks"}' \
  http://localhost:8000/api/auth/role-permissions/
```

## Step 6: Verify Sidebar Navigation

Check that all these links work:

**Main Navigation:**
- ✅ Dashboard → `/app/dashboard`
- ✅ Support Tickets → `/app/requests`
- ✅ Asset Inventory → `/app/inventory`
- ✅ Tasks → `/app/tasks`
- ✅ Knowledge Base → `/app/knowledge-base`
- ✅ Analytics → `/app/reports`

**Administration (system_admin only):**
- ✅ User Management → `/app/admin/users`
- ✅ System Settings → `/app/admin/settings`
- ✅ Security & Audit → `/app/admin/security`
- ✅ System Health → `/app/admin/health`
- ✅ Backup & Export → `/app/admin/backup`

## Troubleshooting

### Migration Errors

If you get circular import errors:
```bash
# Temporarily comment out the import in models.py
# Run migrations
python manage.py makemigrations
python manage.py migrate
# Uncomment the import
```

### User Management Not Showing

Check your user role:
```bash
python manage.py shell
```

```python
from authentication.models import CustomUser
user = CustomUser.objects.get(email='your@email.com')
print(f"Role: {user.role}")
print(f"Approved: {user.is_approved}")

# If needed, update:
user.role = 'system_admin'
user.is_approved = True
user.save()
```

### Permission Toggles Not Working

1. Check browser console for errors
2. Verify you're logged in as system_admin or it_manager
3. Check backend logs for API errors
4. Ensure migrations ran successfully

### 404 on API Endpoints

Verify Django URL configuration:
```bash
python manage.py show_urls | grep auth
```

Should show:
```
/api/auth/permissions/
/api/auth/role-permissions/
/api/auth/role-permissions/<str:role>/<str:permission>/
```

## Testing Checklist

- [ ] Migrations ran successfully
- [ ] Backend server starts without errors
- [ ] Frontend server starts without errors
- [ ] Can login as system_admin
- [ ] User Management page loads
- [ ] Administration section visible in sidebar
- [ ] Role Permissions modal opens
- [ ] Can toggle permissions
- [ ] Changes persist after reload
- [ ] Non-admin users cannot modify permissions
- [ ] Analytics link works
- [ ] All admin routes accessible

## Next Steps

1. **Seed Initial Data:**
   ```bash
   python manage.py shell
   ```
   ```python
   from authentication.permissions_views import _ensure_permissions_seeded
   _ensure_permissions_seeded()
   ```

2. **Create Test Users:**
   - Create users with different roles
   - Test permission visibility for each role

3. **Configure Permissions:**
   - Use the Role Permissions UI to configure which roles have which permissions
   - Test that permissions are enforced

4. **Production Deployment:**
   - Run migrations on production database
   - Verify all endpoints work
   - Test with real users

## Support

For detailed information, see:
- `FIXES_SUMMARY.md` - Complete list of all fixes
- `MIGRATION_GUIDE.md` - Detailed migration instructions
- Django Admin: http://localhost:8000/admin/
- API Docs: http://localhost:8000/api/schema/swagger-ui/

## Success Indicators

✅ No console errors in browser
✅ No Django errors in terminal
✅ User Management page loads
✅ Permission toggles work
✅ Changes persist in database
✅ Proper permission enforcement

If all checks pass, the system is ready to use!
