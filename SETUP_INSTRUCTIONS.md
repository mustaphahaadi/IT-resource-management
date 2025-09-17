# Hospital IT System - Setup Instructions

## 🚀 Quick Start Guide

### 1. Backend Setup (Django)

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Activate virtual environment:**
   ```bash
   # Windows
   venv\Scripts\activate
   
   # Or use the batch file
   start_server.bat
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations:**
   ```bash
   python manage.py makemigrations authentication
   python manage.py migrate
   ```

5. **Create superuser:**
   ```bash
   python manage.py createsuperuser
   ```

6. **Start Django server:**
   ```bash
   python manage.py runserver 8000
   ```

   **Or use the startup script:**
   ```bash
   python start_server.py
   ```

### 2. Frontend Setup (React)

1. **Navigate to project root:**
   ```bash
   cd ..  # if you're in backend directory
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

## 🔧 Fixing the API 404 Error

The error `POST http://localhost:8000/api/auth/users/ 404 (Not Found)` suggests the Django backend isn't running or there's a URL configuration issue.

### Solution Steps:

1. **Ensure Django server is running on port 8000:**
   - Open a terminal in the `backend` directory
   - Run: `python manage.py runserver 8000`
   - You should see: "Starting development server at http://127.0.0.1:8000/"

2. **Test the API endpoints:**
   - Open browser and go to: `http://localhost:8000/api/auth/`
   - You should see the Django REST framework browsable API

3. **Verify URL configuration:**
   - The registration endpoint should be: `http://localhost:8000/api/auth/register/`
   - The login endpoint should be: `http://localhost:8000/api/auth/login/`

4. **Check CORS settings:**
   - Ensure `django-cors-headers` is installed
   - Frontend (localhost:3000) should be allowed to make requests to backend (localhost:8000)

## 📍 Available Endpoints

### Authentication Endpoints:
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/update/` - Update profile
- `POST /api/auth/change-password/` - Change password
- `POST /api/auth/request-password-reset/` - Request password reset
- `POST /api/auth/reset-password/` - Reset password
- `POST /api/auth/verify-email/` - Verify email
- `POST /api/auth/resend-verification/` - Resend verification

### Admin Endpoints:
- `GET /api/auth/admin/users/` - List users
- `GET /api/auth/admin/users/{id}/` - Get user details
- `PUT /api/auth/admin/users/{id}/update/` - Update user
- `POST /api/auth/admin/users/{id}/approve/` - Approve user
- `POST /api/auth/admin/users/{id}/activate/` - Activate user
- `DELETE /api/auth/admin/users/{id}/delete/` - Delete user
- `GET /api/auth/admin/statistics/` - Get statistics

## 🏠 Homepage Features

The new homepage includes:
- **Hero Section** with system overview
- **Features Section** highlighting key capabilities
- **Benefits Section** with healthcare-specific advantages
- **Call-to-Action** for registration/login
- **Professional Footer** with navigation links

### Homepage Routes:
- `/` - Homepage (public)
- `/home` - Homepage (alternative route)
- `/dashboard` - Main dashboard (protected)
- `/login` - Login page
- `/register` - Registration page
- `/analytics` - Public analytics demo

## 🛠️ Troubleshooting

### Common Issues:

1. **Port conflicts:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000
   - Ensure both ports are available

2. **CORS errors:**
   - Check `django-cors-headers` configuration
   - Verify `CORS_ALLOWED_ORIGINS` includes frontend URL

3. **Database errors:**
   - Run migrations: `python manage.py migrate`
   - Check database file permissions

4. **Import errors:**
   - Ensure virtual environment is activated
   - Install requirements: `pip install -r requirements.txt`

## 🔐 Default Credentials

If using the startup script, default superuser:
- **Username:** admin
- **Email:** admin@hospital-it.com
- **Password:** admin123

## 📱 Testing the System

1. **Start both servers:**
   - Backend: `python manage.py runserver 8000`
   - Frontend: `npm run dev`

2. **Test registration:**
   - Go to: http://localhost:3000/register
   - Fill out the form and submit
   - Check Django admin for new user

3. **Test login:**
   - Go to: http://localhost:3000/login
   - Use registered credentials
   - Should redirect to dashboard

4. **Test admin panel:**
   - Login as admin user
   - Go to: http://localhost:3000/admin
   - Manage users and view statistics

## 🎯 Next Steps

After setup:
1. Create test users with different roles
2. Test the admin panel functionality
3. Explore the analytics dashboard
4. Customize the homepage content
5. Add more features as needed

## 📞 Support

If you encounter issues:
1. Check the console for error messages
2. Verify both servers are running
3. Check network tab in browser dev tools
4. Review Django server logs
5. Ensure all dependencies are installed
