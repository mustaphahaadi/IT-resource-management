# Vercel Deployment Guide

## Setup Steps

### 1. Install Vercel CLI (optional)
```bash
npm i -g vercel
```

### 2. Environment Variables
Add these in Vercel Dashboard (Settings → Environment Variables):

```
DEBUG=False
SECRET_KEY=your-secret-key-here
FRONTEND_URL=https://your-app.vercel.app
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
```

### 3. Deploy
```bash
vercel --prod
```

## Project Structure
- `/` - React frontend (Vite)
- `/backend` - Django backend
- `/api/*` - Routes to Django backend
- All other routes - Serve React app

## How It Works
1. Vite builds React app to `/dist`
2. Django runs as serverless function via `vercel_wsgi.py`
3. Routes starting with `/api`, `/admin`, `/static` go to Django
4. All other routes serve React SPA from `/dist/index.html`
