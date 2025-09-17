@echo off
echo.
echo 🏥 Hospital IT System - Django Backend Server
echo =============================================
echo.

REM Activate virtual environment
if exist "venv\Scripts\activate.bat" (
    echo 🔄 Activating virtual environment...
    call venv\Scripts\activate.bat
) else (
    echo ❌ Virtual environment not found! Please create it first:
    echo    python -m venv venv
    echo    venv\Scripts\activate
    echo    pip install -r requirements.txt
    pause
    exit /b 1
)

REM Check if Django is installed
python -c "import django" 2>nul
if errorlevel 1 (
    echo ❌ Django not found! Installing requirements...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ❌ Failed to install requirements!
        pause
        exit /b 1
    )
)

REM Run the startup script
python start_server.py

pause
