#!/bin/bash

echo "========================================"
echo "Hospital IT Resource Management System"
echo "Quick Setup Script"
echo "========================================"
echo

echo "[1/6] Copying environment files..."
if [ ! -f .env ]; then
    cp env.example .env
    echo "✅ Frontend .env created"
else
    echo "⚠️  Frontend .env already exists"
fi

if [ ! -f backend/.env ]; then
    cp backend/env.example backend/.env
    echo "✅ Backend .env created"
else
    echo "⚠️  Backend .env already exists"
fi
echo

echo "[2/6] Setting up Python virtual environment..."
cd backend
if [ ! -d venv ]; then
    python3 -m venv venv
    echo "✅ Virtual environment created"
else
    echo "⚠️  Virtual environment already exists"
fi

echo "[3/6] Activating virtual environment and installing dependencies..."
source venv/bin/activate
pip install -r requirements.txt
echo "✅ Python dependencies installed"
echo

echo "[4/6] Running database migrations..."
python manage.py makemigrations
python manage.py migrate
echo "✅ Database migrations completed"
echo

echo "[5/6] Creating superuser account..."
echo "Please create a superuser account for admin access:"
python manage.py createsuperuser
echo "✅ Superuser created"
echo

echo "[6/6] Setup completed!"
echo

echo "========================================"
echo "SETUP COMPLETE! 🎉"
echo "========================================"
echo
echo "Next steps:"
echo "1. Start Backend:  cd backend && source venv/bin/activate && python manage.py runserver"
echo "2. Start Frontend: npm install && npm run dev"
echo "3. Open browser:   http://localhost:3002"
echo
echo "Backend will be at: http://localhost:8000"
echo "Frontend will be at: http://localhost:3002"
echo
echo "For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo "========================================"

cd ..
echo "Press any key to continue..."
read -n 1
