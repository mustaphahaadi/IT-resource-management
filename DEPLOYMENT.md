# Vercel Deployment Guide

## Prerequisites
- Vercel account
- GitHub repository

## Deployment Steps

### 1. Environment Variables
Set these in your Vercel dashboard:

```
DEBUG=False
SECRET_KEY=your-secure-secret-key-here
FRONTEND_URL=https://your-app.vercel.app
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
```

### 2. Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the configuration from `vercel.json`
3. The build process will:
   - Install Node.js dependencies
   - Install Python dependencies
   - Build the React frontend
   - Deploy Django backend as serverless functions

### 3. API Routes
- Frontend: `https://your-app.vercel.app/`
- Backend API: `https://your-app.vercel.app/api/`

## Local Development
```bash
# Frontend
npm run dev

# Backend (separate terminal)
cd backend
python manage.py runserver
```

## Project Structure
```
├── src/                 # React frontend
├── backend/             # Django backend
├── vercel.json         # Vercel configuration
└── package.json        # Node.js dependencies
```