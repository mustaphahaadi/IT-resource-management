# Hospital IT Resource Management System

A comprehensive IT resource management system designed specifically for hospitals and healthcare facilities. This system provides real-time monitoring, task management, support request handling, and analytics for IT infrastructure.

## 🚀 Features

### Core Functionality
- **Real-time Dashboard** - Live monitoring of IT infrastructure and operations
- **Equipment Inventory** - Complete asset management with status tracking
- **Support Request System** - Ticketing system for IT support requests
- **Task Management** - Assignment and tracking of IT tasks and workflows
- **Analytics & Reporting** - Comprehensive reporting with data visualization
- **User Management** - Role-based access control and user administration

### Advanced Features
- **Real-time Notifications** - WebSocket-powered live updates
- **Advanced Filtering** - Sophisticated search and filter capabilities
- **Offline Support** - Works offline with data synchronization
- **Mobile Responsive** - Optimized for all device sizes
- **Error Boundaries** - Robust error handling and recovery
- **Authentication Flow** - Secure login with role-based permissions

## 🛠 Technology Stack

### Frontend
- **React 18** - Modern React with hooks and context
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Beautiful SVG icons
- **Axios** - HTTP client for API calls

### Backend Integration
- **Django REST Framework** - Python backend API
- **WebSocket Support** - Real-time communication
- **Token Authentication** - Secure API access
- **PostgreSQL** - Production database

### Development Tools
- **Vite** - Fast build tool and dev server
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+ (for backend)
- PostgreSQL (for production)

### Frontend Setup
```bash
# Clone the repository
git clone https://github.com/mustaphahaadi/IT-resource-management.git
cd hospital-system

# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

## 🚦 Getting Started

### Default Login Credentials
For development/demo purposes:
- **Admin User**: admin / admin123
- **Regular User**: user / user123

### First Steps
1. Start both frontend and backend servers
2. Navigate to `http://localhost:5173`
3. Login with the credentials above
4. Explore the dashboard and different modules

## 📱 Application Structure

### Public Routes
- `/` - Homepage with system overview
- `/login` - User authentication
- `/register` - New user registration
- `/forgot-password` - Password recovery
- `/analytics` - Public analytics demo

### Protected Routes (requires authentication)
- `/app/dashboard` - Main dashboard
- `/app/inventory` - Equipment management
- `/app/requests` - Support tickets
- `/app/tasks` - Task management
- `/app/reports` - Analytics and reports
- `/app/settings` - User settings
- `/app/admin` - Admin panel (admin only)

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_WS_BASE_URL=ws://localhost:8000/ws

# Development Settings
REACT_APP_ENV=development
REACT_APP_DEBUG=true

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_NOTIFICATIONS=true
```

### Backend Configuration
Configure `backend/hospital_it/settings.py`:

```python
# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'hospital_it',
        'USER': 'your_username',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# CORS Settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

## 🏗 Architecture

### Frontend Architecture
```
src/
├── components/          # Reusable UI components
│   ├── common/         # Shared components
│   ├── ui/            # Base UI components
│   ├── Auth/          # Authentication components
│   ├── Dashboard/     # Dashboard-specific components
│   ├── Inventory/     # Inventory management components
│   ├── Requests/      # Support request components
│   ├── Tasks/         # Task management components
│   └── Layout/        # Layout components
├── contexts/           # React contexts
├── hooks/             # Custom React hooks
├── pages/             # Page components
├── services/          # API services and utilities
└── utils/             # Helper functions
```

### Key Components

#### Authentication System
- **AuthContext** - Global authentication state
- **ProtectedRoute** - Route protection wrapper
- **Login/Register** - Authentication forms

#### Real-time Features
- **WebSocket Service** - Real-time communication
- **NotificationCenter** - Live notifications
- **useRealTimeData** - Real-time data hook

#### Data Management
- **API Service** - Centralized API calls
- **Error Boundaries** - Error handling
- **Loading States** - User feedback

## 📊 Features Overview

### Dashboard
- System performance metrics

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## 🗺 Roadmap

### Upcoming Features
- [ ] Mobile app (React Native)
- [ ] Advanced analytics with AI insights
- [ ] Integration with hospital systems (EMR)
- [ ] Automated maintenance scheduling
- [ ] Multi-language support
- [ ] Advanced reporting with custom dashboards

### Version History
- **v1.0.0** - Initial release with core features
- **v1.1.0** - Real-time notifications and WebSocket support
- **v1.2.0** - Advanced filtering and analytics
- **v1.3.0** - Mobile responsiveness and offline support

---

**Built with ❤️ for healthcare IT professionals**
