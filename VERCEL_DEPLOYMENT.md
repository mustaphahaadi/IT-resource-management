# Vercel Deployment Guide

## Setup Instructions

### 1. Vercel Project Setup
1. Connect your GitHub repository to Vercel
2. Import your project
3. Vercel will auto-detect the framework (React/Vite)

### 2. Environment Variables
Add these environment variables in your Vercel dashboard:

```
SECRET_KEY=your-django-secret-key
DEBUG=False
FRONTEND_URL=https://your-app.vercel.app
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
```

### 3. Build Settings
Vercel will automatically use:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install && pip install -r backend/requirements.txt`

### 4. Deployment Structure
- Frontend (React/Vite): Served from `/`
- Backend API (Django): Served from `/api/*`
- Django Admin: Served from `/admin/*`
- Static files: Served from `/static/*`

### 5. API Endpoints
Your Django API will be available at:
- `https://your-app.vercel.app/api/`
- `https://your-app.vercel.app/admin/`

### 6. Local Development
```bash
# Frontend
npm run dev

# Backend
cd backend
python manage.py runserver
```

### 7. Important Notes
- SQLite database resets on each deployment (use external DB for production)
- Static files are handled by Django in production
- CORS is configured for your Vercel domain
- Logs are sent to console in production

### 8. Troubleshooting
- Check Vercel function logs for backend errors
- Ensure all environment variables are set
- Verify API endpoints are working: `/api/admin/` should show Django admin