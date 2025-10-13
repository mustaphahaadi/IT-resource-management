# 🗄️ Data Population Guide

## 📊 **POPULATE SYSTEM WITH SAMPLE DATA**

I've created a comprehensive Django management command to populate your Hospital IT Resource Management System with realistic test data.

---

## 🚀 **QUICK START**

### **Run the Population Command**
```bash
# Navigate to backend directory (if not already there)
cd backend

# Activate virtual environment (if not already active)
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate

# Run the population command
python manage.py populate_data
```

### **Clear and Repopulate (Optional)**
```bash
# Clear existing data and create fresh sample data
python manage.py populate_data --clear
```

---

## 📋 **WHAT GETS CREATED**

### **👥 Users (13 Total)**
- **1 System Administrator**: Full system access
- **1 IT Manager**: Department oversight and analytics
- **2 Senior Technicians**: Complex issues and mentoring
- **4 Technicians**: Handle tickets and equipment management
- **5 End Users**: Submit requests and track status

### **🏢 Locations (10 Total)**
- Emergency Department
- ICU Floor 3
- Cardiology Wing
- Radiology Department
- Pharmacy
- Laboratory
- IT Server Room
- Administration Office
- Nursing Station A & B

### **📦 Equipment Categories (8 Total)**
- Computers
- Network Equipment
- Medical Devices
- Printers
- Servers
- Mobile Devices
- Monitors
- Peripherals

### **💻 Equipment Items (15 Total)**
- **Computers**: Dell OptiPlex, HP EliteDesk, Lenovo ThinkCentre, Dell Latitude
- **Network**: Cisco Catalyst Switch, Aruba Access Point, Fortinet Firewall
- **Medical**: GE Patient Monitor, Philips MRI Workstation
- **Printers**: HP LaserJet, Canon ImageRunner
- **Servers**: Dell PowerEdge, HPE ProLiant
- **Mobile**: iPad Pro, Samsung Galaxy Tab

### **🎫 Support Requests (10 Total)**
- Computer won't start (High Priority)
- Printer not working (Medium Priority)
- Email not syncing (Medium Priority)
- Forgot password (Low Priority)
- Software installation request (Low Priority)
- WiFi connection issues (Medium Priority)
- New employee setup (High Priority)
- Suspicious email received (High Priority)
- Monitor flickering (Medium Priority)
- Training on new system (Low Priority)

### **📋 Tasks (8 Total)**
- Replace faulty RAM
- Install printer drivers
- Network cable repair
- Software update deployment
- Equipment maintenance
- User account setup
- Backup system check
- Security audit

### **💬 Comments**
- Realistic technician responses on support requests
- Multiple comments per request showing conversation flow

---

## 🔑 **TEST USER CREDENTIALS**

**All users have password: `password123`**

| Role | Username | Department | Description |
|------|----------|------------|-------------|
| **System Admin** | `admin1` | IT Management/PMO | Full system access, user management |
| **IT Manager** | `manager1` | IT Management/PMO | Department oversight, analytics |
| **Senior Technician** | `senior1` | Network & Infrastructure | Complex issues, mentoring |
| **Senior Technician** | `senior2` | Systems Administration | Complex issues, mentoring |
| **Technician** | `tech1` | Desktop Support | Handle tickets, equipment management |
| **Technician** | `tech2` | Service Desk | Handle tickets, equipment management |
| **Technician** | `tech3` | Field Services | Handle tickets, equipment management |
| **Technician** | `tech4` | Applications Support | Handle tickets, equipment management |
| **End User** | `user1` | Cardiology | Submit requests, track status |
| **End User** | `user2` | Emergency | Submit requests, track status |
| **End User** | `user3` | Radiology | Submit requests, track status |
| **End User** | `user4` | Pharmacy | Submit requests, track status |
| **End User** | `user5` | Laboratory | Submit requests, track status |

---

## 🎯 **TESTING SCENARIOS**

### **As System Administrator (`admin1`)**
- ✅ **User Management**: Approve/reject new users
- ✅ **System Settings**: Configure system parameters
- ✅ **Analytics**: View system-wide reports
- ✅ **Equipment Management**: Full CRUD operations

### **As IT Manager (`manager1`)**
- ✅ **Team Oversight**: Monitor technician workloads
- ✅ **Department Analytics**: View department-specific metrics
- ✅ **Task Assignment**: Assign tasks to technicians
- ✅ **SLA Monitoring**: Track request resolution times

### **As Technician (`tech1`)**
- ✅ **Request Handling**: View and resolve support requests
- ✅ **Task Management**: Complete assigned tasks
- ✅ **Equipment Updates**: Update equipment status
- ✅ **Comment System**: Communicate with requesters

### **As End User (`user1`)**
- ✅ **Request Submission**: Create new support requests
- ✅ **Status Tracking**: Monitor request progress
- ✅ **Equipment Viewing**: View department equipment
- ✅ **Profile Management**: Update personal information

---

## 📊 **DATA RELATIONSHIPS**

The sample data includes realistic relationships:
- **Requests ↔ Tasks**: Some requests automatically generate tasks
- **Tasks ↔ Equipment**: Tasks are linked to relevant equipment
- **Users ↔ Departments**: Users are assigned to hospital departments
- **Equipment ↔ Locations**: Equipment is placed in specific hospital areas
- **Comments ↔ Requests**: Technicians provide updates on requests

---

## 🔄 **COMMAND OPTIONS**

### **Standard Population**
```bash
python manage.py populate_data
```
- Creates sample data without clearing existing data
- Safe to run multiple times (uses get_or_create)

### **Clear and Repopulate**
```bash
python manage.py populate_data --clear
```
- **⚠️ WARNING**: Deletes all existing data except superusers
- Creates fresh sample data
- Use for clean testing environment

---

## 🎉 **READY TO TEST**

After running the population command:

1. **Start the servers** (if not already running):
   ```bash
   # Backend
   python manage.py runserver
   
   # Frontend (new terminal)
   npm run dev
   ```

2. **Access the system**:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **Admin Panel**: http://localhost:8000/admin

3. **Login with any test user** using password `password123`

4. **Explore all features**:
   - Dashboard analytics
   - Equipment management
   - Support requests
   - Task assignment
   - User management
   - Reports and analytics

---

## 🎯 **SYSTEM NOW READY FOR COMPREHENSIVE TESTING**

Your Hospital IT Resource Management System is now populated with realistic sample data and ready for thorough testing of all features and user roles!
