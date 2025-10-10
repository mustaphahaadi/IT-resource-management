from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from datetime import timedelta
import random

from authentication.models import CustomUser
from inventory.models import Equipment, EquipmentCategory, Location, Department
from requests_system.models import SupportRequest, RequestCategory, RequestComment
from tasks.models import Task, ITPersonnel


class Command(BaseCommand):
    help = 'Populate the system with sample data for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before populating',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            self.clear_data()

        self.stdout.write('Creating sample data...')
        
        # Create users
        users = self.create_users()
        self.stdout.write(f'Created {len(users)} users')
        
        # Create departments, locations and categories
        departments, locations = self.create_departments_and_locations()
        categories = self.create_categories()
        self.stdout.write(f'Created {len(departments)} departments, {len(locations)} locations and {len(categories)} categories')
        
        # Create equipment
        equipment = self.create_equipment(locations, categories)
        self.stdout.write(f'Created {len(equipment)} equipment items')
        
        # Create IT personnel
        personnel = self.create_personnel(users)
        self.stdout.write(f'Created {len(personnel)} IT personnel records')
        
        # Create request categories
        req_categories = self.create_request_categories()
        self.stdout.write(f'Created {len(req_categories)} request categories')
        
        # Create support requests
        requests = self.create_support_requests(users, req_categories)
        self.stdout.write(f'Created {len(requests)} support requests')
        
        # Create tasks
        tasks = self.create_tasks(personnel, requests, equipment)
        self.stdout.write(f'Created {len(tasks)} tasks')
        
        # Add comments
        comments = self.create_comments(users, requests)
        self.stdout.write(f'Created {len(comments)} comments')

        self.stdout.write(
            self.style.SUCCESS('Successfully populated the system with sample data!')
        )
        
        # Display login credentials
        self.display_credentials()

    def clear_data(self):
        """Clear existing data"""
        RequestComment.objects.all().delete()
        Task.objects.all().delete()
        SupportRequest.objects.all().delete()
        RequestCategory.objects.all().delete()
        ITPersonnel.objects.all().delete()
        Equipment.objects.all().delete()
        EquipmentCategory.objects.all().delete()
        Location.objects.all().delete()
        Department.objects.all().delete()
        CustomUser.objects.filter(is_superuser=False).delete()

    def create_users(self):
        """Create sample users with different roles"""
        users_data = [
            # System Administrators
            {'username': 'admin1', 'email': 'admin1@hospital.com', 'first_name': 'John', 'last_name': 'Smith', 
             'role': 'system_admin', 'department': 'it', 'employee_id': 'ADM001', 'phone_number': '555-0101'},
            
            # IT Managers
            {'username': 'manager1', 'email': 'manager1@hospital.com', 'first_name': 'Sarah', 'last_name': 'Johnson', 
             'role': 'it_manager', 'department': 'it', 'employee_id': 'MGR001', 'phone_number': '555-0201'},
            
            # Senior Technicians
            {'username': 'senior1', 'email': 'senior1@hospital.com', 'first_name': 'Mike', 'last_name': 'Davis', 
             'role': 'senior_technician', 'department': 'it', 'employee_id': 'SR001', 'phone_number': '555-0301'},
            {'username': 'senior2', 'email': 'senior2@hospital.com', 'first_name': 'Lisa', 'last_name': 'Wilson', 
             'role': 'senior_technician', 'department': 'it', 'employee_id': 'SR002', 'phone_number': '555-0302'},
            
            # Technicians
            {'username': 'tech1', 'email': 'tech1@hospital.com', 'first_name': 'David', 'last_name': 'Brown', 
             'role': 'technician', 'department': 'it', 'employee_id': 'TEC001', 'phone_number': '555-0401'},
            {'username': 'tech2', 'email': 'tech2@hospital.com', 'first_name': 'Emma', 'last_name': 'Garcia', 
             'role': 'technician', 'department': 'it', 'employee_id': 'TEC002', 'phone_number': '555-0402'},
            {'username': 'tech3', 'email': 'tech3@hospital.com', 'first_name': 'James', 'last_name': 'Miller', 
             'role': 'technician', 'department': 'it', 'employee_id': 'TEC003', 'phone_number': '555-0403'},
            {'username': 'tech4', 'email': 'tech4@hospital.com', 'first_name': 'Anna', 'last_name': 'Taylor', 
             'role': 'technician', 'department': 'it', 'employee_id': 'TEC004', 'phone_number': '555-0404'},
            
            # End Users
            {'username': 'user1', 'email': 'user1@hospital.com', 'first_name': 'Robert', 'last_name': 'Anderson', 
             'role': 'end_user', 'department': 'operations', 'employee_id': 'USR001', 'phone_number': '555-0501'},
            {'username': 'user2', 'email': 'user2@hospital.com', 'first_name': 'Jennifer', 'last_name': 'Thomas', 
             'role': 'end_user', 'department': 'administration', 'employee_id': 'USR002', 'phone_number': '555-0502'},
            {'username': 'user3', 'email': 'user3@hospital.com', 'first_name': 'Michael', 'last_name': 'Jackson', 
             'role': 'end_user', 'department': 'finance', 'employee_id': 'USR003', 'phone_number': '555-0503'},
            {'username': 'user4', 'email': 'user4@hospital.com', 'first_name': 'Jessica', 'last_name': 'White', 
             'role': 'end_user', 'department': 'marketing', 'employee_id': 'USR004', 'phone_number': '555-0504'},
            {'username': 'user5', 'email': 'user5@hospital.com', 'first_name': 'Christopher', 'last_name': 'Harris', 
             'role': 'end_user', 'department': 'human_resources', 'employee_id': 'USR005', 'phone_number': '555-0505'},
        ]
        
        users = []
        for user_data in users_data:
            user, created = CustomUser.objects.get_or_create(
                username=user_data['username'],
                defaults={
                    'email': user_data['email'],
                    'first_name': user_data['first_name'],
                    'last_name': user_data['last_name'],
                    'role': user_data['role'],
                    'department': user_data['department'],
                    'employee_id': user_data['employee_id'],
                    'phone_number': user_data['phone_number'],
                    'password': make_password('password123'),
                    'is_active': True,
                    'is_approved': True,
                }
            )
            users.append(user)
        
        return users

    def create_departments_and_locations(self):
        """Create hospital departments and locations"""
        # First create departments
        departments_data = [
            {'name': 'Emergency Department', 'description': 'Emergency care services'},
            {'name': 'Cardiology', 'description': 'Cardiac care department'},
            {'name': 'Radiology', 'description': 'Medical imaging services'},
            {'name': 'Pharmacy', 'description': 'Hospital pharmacy services'},
            {'name': 'Laboratory', 'description': 'Medical laboratory services'},
            {'name': 'IT Department', 'description': 'Information Technology services'},
            {'name': 'Administration', 'description': 'Administrative services'},
            {'name': 'Nursing', 'description': 'Nursing services'},
        ]
        
        departments = []
        for dept_data in departments_data:
            department, created = Department.objects.get_or_create(
                name=dept_data['name'],
                defaults={'description': dept_data['description']}
            )
            departments.append(department)
        
        # Create locations with departments
        locations_data = [
            {'building': 'Main Hospital', 'floor': '1st Floor', 'room': 'Emergency Bay', 'department': 'Emergency Department'},
            {'building': 'Main Hospital', 'floor': '3rd Floor', 'room': 'ICU Ward', 'department': 'Cardiology'},
            {'building': 'Medical Center', 'floor': '2nd Floor', 'room': 'Cardiology Wing', 'department': 'Cardiology'},
            {'building': 'Medical Center', 'floor': '1st Floor', 'room': 'Imaging Suite', 'department': 'Radiology'},
            {'building': 'Main Hospital', 'floor': '1st Floor', 'room': 'Pharmacy Counter', 'department': 'Pharmacy'},
            {'building': 'Lab Building', 'floor': '2nd Floor', 'room': 'Main Lab', 'department': 'Laboratory'},
            {'building': 'IT Building', 'floor': 'Basement', 'room': 'Server Room', 'department': 'IT Department'},
            {'building': 'Admin Building', 'floor': '3rd Floor', 'room': 'Executive Offices', 'department': 'Administration'},
            {'building': 'Main Hospital', 'floor': '2nd Floor', 'room': 'Nursing Station A', 'department': 'Nursing'},
            {'building': 'Main Hospital', 'floor': '4th Floor', 'room': 'Nursing Station B', 'department': 'Nursing'},
        ]
        
        locations = []
        for loc_data in locations_data:
            department = next((d for d in departments if d.name == loc_data['department']), departments[0])
            
            location, created = Location.objects.get_or_create(
                building=loc_data['building'],
                floor=loc_data['floor'],
                room=loc_data['room'],
                defaults={'department': department}
            )
            locations.append(location)
        
        return departments, locations

    def create_categories(self):
        """Create equipment categories"""
        categories_data = [
            {'name': 'Computers', 'description': 'Desktop and laptop computers'},
            {'name': 'Network Equipment', 'description': 'Routers, switches, access points'},
            {'name': 'Medical Devices', 'description': 'IT-connected medical equipment'},
            {'name': 'Printers', 'description': 'Printers and scanners'},
            {'name': 'Servers', 'description': 'Server hardware'},
            {'name': 'Mobile Devices', 'description': 'Tablets and smartphones'},
            {'name': 'Monitors', 'description': 'Computer monitors and displays'},
            {'name': 'Peripherals', 'description': 'Keyboards, mice, and other accessories'},
        ]
        
        categories = []
        for cat_data in categories_data:
            category, created = EquipmentCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults={'description': cat_data['description']}
            )
            categories.append(category)
        
        return categories

    def create_equipment(self, locations, categories):
        """Create sample equipment"""
        equipment_data = [
            # Computers
            {'name': 'Dell OptiPlex 7090', 'model': 'OptiPlex 7090', 'manufacturer': 'Dell', 'asset_tag': 'DL001', 'serial_number': 'DL001SN', 'category': 'Computers', 'location_idx': 0, 'status': 'active'},
            {'name': 'HP EliteDesk 800', 'model': 'EliteDesk 800 G6', 'manufacturer': 'HP', 'asset_tag': 'HP001', 'serial_number': 'HP001SN', 'category': 'Computers', 'location_idx': 2, 'status': 'active'},
            {'name': 'Lenovo ThinkCentre', 'model': 'M720q', 'manufacturer': 'Lenovo', 'asset_tag': 'LN001', 'serial_number': 'LN001SN', 'category': 'Computers', 'location_idx': 4, 'status': 'maintenance'},
            {'name': 'Dell Latitude 5520', 'model': 'Latitude 5520', 'manufacturer': 'Dell', 'asset_tag': 'DL002', 'serial_number': 'DL002SN', 'category': 'Computers', 'location_idx': 7, 'status': 'active'},
            
            # Network Equipment
            {'name': 'Cisco Catalyst 2960', 'model': '2960-X', 'manufacturer': 'Cisco', 'asset_tag': 'CS001', 'serial_number': 'CS001SN', 'category': 'Network Equipment', 'location_idx': 6, 'status': 'active'},
            {'name': 'Aruba AP-515', 'model': 'AP-515', 'manufacturer': 'Aruba', 'asset_tag': 'AR001', 'serial_number': 'AR001SN', 'category': 'Network Equipment', 'location_idx': 1, 'status': 'active'},
            {'name': 'Fortinet FortiGate', 'model': 'FG-100F', 'manufacturer': 'Fortinet', 'asset_tag': 'FG001', 'serial_number': 'FG001SN', 'category': 'Network Equipment', 'location_idx': 6, 'status': 'active'},
            
            # Medical Devices
            {'name': 'GE Patient Monitor', 'model': 'B850', 'manufacturer': 'GE Healthcare', 'asset_tag': 'GE001', 'serial_number': 'GE001SN', 'category': 'Medical Devices', 'location_idx': 1, 'status': 'active'},
            {'name': 'Philips MRI Workstation', 'model': 'IntelliSpace', 'manufacturer': 'Philips', 'asset_tag': 'PH001', 'serial_number': 'PH001SN', 'category': 'Medical Devices', 'location_idx': 3, 'status': 'broken'},
            
            # Printers
            {'name': 'HP LaserJet Pro', 'model': 'M404dn', 'manufacturer': 'HP', 'asset_tag': 'HP002', 'serial_number': 'HP002SN', 'category': 'Printers', 'location_idx': 8, 'status': 'active'},
            {'name': 'Canon ImageRunner', 'model': 'C3226i', 'manufacturer': 'Canon', 'asset_tag': 'CN001', 'serial_number': 'CN001SN', 'category': 'Printers', 'location_idx': 7, 'status': 'active'},
            
            # Servers
            {'name': 'Dell PowerEdge R740', 'model': 'R740', 'manufacturer': 'Dell', 'asset_tag': 'DL003', 'serial_number': 'DL003SN', 'category': 'Servers', 'location_idx': 6, 'status': 'active'},
            {'name': 'HPE ProLiant DL380', 'model': 'DL380 Gen10', 'manufacturer': 'HPE', 'asset_tag': 'HP003', 'serial_number': 'HP003SN', 'category': 'Servers', 'location_idx': 6, 'status': 'active'},
            
            # Mobile Devices
            {'name': 'iPad Pro 12.9', 'model': 'iPad Pro', 'manufacturer': 'Apple', 'asset_tag': 'IP001', 'serial_number': 'IP001SN', 'category': 'Mobile Devices', 'location_idx': 0, 'status': 'active'},
            {'name': 'Samsung Galaxy Tab', 'model': 'Tab S7', 'manufacturer': 'Samsung', 'asset_tag': 'SM001', 'serial_number': 'SM001SN', 'category': 'Mobile Devices', 'location_idx': 4, 'status': 'active'},
        ]
        
        equipment_list = []
        for eq_data in equipment_data:
            category = next((c for c in categories if c.name == eq_data['category']), categories[0])
            location = locations[eq_data['location_idx']] if eq_data['location_idx'] < len(locations) else locations[0]
            
            equipment, created = Equipment.objects.get_or_create(
                asset_tag=eq_data['asset_tag'],
                defaults={
                    'name': eq_data['name'],
                    'model': eq_data['model'],
                    'manufacturer': eq_data['manufacturer'],
                    'serial_number': eq_data['serial_number'],
                    'category': category,
                    'location': location,
                    'status': eq_data['status'],
                    'purchase_date': timezone.now().date() - timedelta(days=random.randint(30, 1095)),
                    'warranty_expiry': timezone.now().date() + timedelta(days=random.randint(30, 730)),
                }
            )
            equipment_list.append(equipment)
        
        return equipment_list

    def create_personnel(self, users):
        """Create IT personnel records"""
        it_users = [u for u in users if u.role in ['technician', 'senior_technician', 'it_manager']]
        personnel_list = []
        
        skills_by_department = {
            'Desktop Support': ['Windows', 'Hardware Repair', 'Software Installation'],
            'Service Desk': ['Customer Service', 'Ticketing Systems', 'Remote Support'],
            'Network & Infrastructure': ['Networking', 'Cisco', 'Security'],
            'Systems Administration': ['Windows Server', 'Linux', 'Active Directory'],
            'Applications Support': ['EHR Systems', 'Database Management', 'Application Troubleshooting'],
            'Field Services': ['Hardware Installation', 'On-site Support', 'Equipment Maintenance'],
            'IT Management/PMO': ['Project Management', 'Team Leadership', 'Strategic Planning'],
        }
        
        for user in it_users:
            skills = skills_by_department.get(user.department, ['General IT Support'])
            
            personnel, created = ITPersonnel.objects.get_or_create(
                user=user,
                defaults={
                    'employee_id': user.employee_id,
                    'department': user.department,
                    'specializations': ', '.join(skills),
                    'phone': user.phone_number or '555-0000',
                    'skill_level': 'senior' if user.role == 'senior_technician' else 'intermediate',
                    'max_concurrent_tasks': 5 if user.role == 'technician' else 8,
                    'is_available': True,
                }
            )
            personnel_list.append(personnel)
        
        return personnel_list

    def create_request_categories(self):
        """Create support request categories"""
        categories_data = [
            {'name': 'Hardware Issue', 'description': 'Computer, printer, or device hardware problems'},
            {'name': 'Software Issue', 'description': 'Application or software-related problems'},
            {'name': 'Network Issue', 'description': 'Internet, WiFi, or network connectivity problems'},
            {'name': 'Account Access', 'description': 'Login, password, or account access issues'},
            {'name': 'Email Issue', 'description': 'Email setup, sending, or receiving problems'},
            {'name': 'New Equipment', 'description': 'Request for new hardware or software'},
            {'name': 'Training Request', 'description': 'IT training or documentation requests'},
            {'name': 'Security Incident', 'description': 'Security-related issues or incidents'},
        ]
        
        categories = []
        for cat_data in categories_data:
            category, created = RequestCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults={'description': cat_data['description']}
            )
            categories.append(category)
        
        return categories

    def create_support_requests(self, users, categories):
        """Create sample support requests"""
        end_users = [u for u in users if u.role == 'end_user']
        
        request_templates = [
            {'title': 'Computer won\'t start', 'description': 'My workstation computer is not turning on when I press the power button. No lights or sounds.', 'category': 'Hardware Issue', 'priority': 'high'},
            {'title': 'Printer not working', 'description': 'The printer in our department is showing an error message and won\'t print documents.', 'category': 'Hardware Issue', 'priority': 'medium'},
            {'title': 'Email not syncing', 'description': 'My email is not receiving new messages. Last email received was yesterday morning.', 'category': 'Email Issue', 'priority': 'medium'},
            {'title': 'Forgot password', 'description': 'I forgot my login password and cannot access the system. Need password reset.', 'category': 'Account Access', 'priority': 'low'},
            {'title': 'Software installation request', 'description': 'Need Adobe Acrobat Pro installed on my computer for document editing.', 'category': 'Software Issue', 'priority': 'low'},
            {'title': 'WiFi connection issues', 'description': 'WiFi keeps disconnecting every few minutes. Very slow internet speed.', 'category': 'Network Issue', 'priority': 'medium'},
            {'title': 'New employee setup', 'description': 'New staff member starting Monday. Need computer, email, and system access setup.', 'category': 'New Equipment', 'priority': 'high'},
            {'title': 'Suspicious email received', 'description': 'Received suspicious email with attachment. Possible phishing attempt.', 'category': 'Security Incident', 'priority': 'high'},
            {'title': 'Monitor flickering', 'description': 'My monitor screen keeps flickering and sometimes goes black for a few seconds.', 'category': 'Hardware Issue', 'priority': 'medium'},
            {'title': 'Training on new system', 'description': 'Need training on the new patient management system that was recently installed.', 'category': 'Training Request', 'priority': 'low'},
        ]
        
        requests = []
        statuses = ['open', 'in_progress', 'resolved', 'closed']
        
        for i, template in enumerate(request_templates):
            user = end_users[i % len(end_users)]
            category = next((c for c in categories if c.name == template['category']), categories[0])
            
            # Create request with some time variation
            created_time = timezone.now() - timedelta(days=random.randint(1, 30), hours=random.randint(0, 23))
            
            request = SupportRequest.objects.create(
                title=template['title'],
                description=template['description'],
                category=category,
                priority=template['priority'],
                status=random.choice(statuses),
                requester=user,
                requester_department=user.department,
                created_at=created_time,
                updated_at=created_time + timedelta(hours=random.randint(1, 48))
            )
            requests.append(request)
        
        return requests

    def create_tasks(self, personnel, requests, equipment):
        """Create sample tasks"""
        tasks = []
        task_templates = [
            {'title': 'Replace faulty RAM', 'description': 'Diagnose and replace faulty memory module in workstation', 'priority': 'high'},
            {'title': 'Install printer drivers', 'description': 'Install and configure printer drivers on department computers', 'priority': 'medium'},
            {'title': 'Network cable repair', 'description': 'Repair damaged network cable in ICU', 'priority': 'high'},
            {'title': 'Software update deployment', 'description': 'Deploy security updates to all workstations', 'priority': 'medium'},
            {'title': 'Equipment maintenance', 'description': 'Perform routine maintenance on server equipment', 'priority': 'low'},
            {'title': 'User account setup', 'description': 'Create new user accounts and configure access permissions', 'priority': 'medium'},
            {'title': 'Backup system check', 'description': 'Verify backup systems are functioning correctly', 'priority': 'high'},
            {'title': 'Security audit', 'description': 'Conduct security audit of network infrastructure', 'priority': 'medium'},
        ]
        
        statuses = ['pending', 'assigned', 'in_progress', 'completed']
        
        for i, template in enumerate(task_templates):
            assigned_personnel = personnel[i % len(personnel)] if personnel else None
            related_request = requests[i % len(requests)]  # Task requires a related request
            
            due_date = timezone.now() + timedelta(days=random.randint(1, 14))
            
            task = Task.objects.create(
                title=template['title'],
                description=template['description'],
                priority=template['priority'],
                status=random.choice(statuses),
                assigned_to=assigned_personnel,
                related_request=related_request,
                estimated_hours=random.randint(1, 8),
                due_date=due_date,
            )
            tasks.append(task)
        
        return tasks

    def create_comments(self, users, requests):
        """Create sample comments on requests"""
        comments = []
        comment_templates = [
            "I've started looking into this issue. Will update shortly.",
            "This appears to be a hardware failure. Ordering replacement parts.",
            "Issue has been resolved. Please test and confirm.",
            "Need more information. Can you provide error messages?",
            "Escalating to senior technician for further assistance.",
            "Temporary workaround provided. Permanent fix scheduled.",
            "Issue confirmed. Working on solution now.",
            "Please restart your computer and try again.",
        ]
        
        tech_users = [u for u in users if u.role in ['technician', 'senior_technician']]
        
        for request in requests[:8]:  # Add comments to first 8 requests
            # Add 1-3 comments per request
            num_comments = random.randint(1, 3)
            for i in range(num_comments):
                author = random.choice(tech_users)
                comment_text = random.choice(comment_templates)
                
                comment = RequestComment.objects.create(
                    request=request,
                    author=author,
                    comment=comment_text,
                    created_at=request.created_at + timedelta(hours=random.randint(1, 24))
                )
                comments.append(comment)
        
        return comments

    def display_credentials(self):
        """Display login credentials for testing"""
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS('TEST USER CREDENTIALS'))
        self.stdout.write('='*60)
        self.stdout.write('All users have password: password123')
        self.stdout.write('')
        
        roles_info = [
            ('System Admin', 'admin1', 'Full system access, user management'),
            ('IT Manager', 'manager1', 'Department oversight, analytics'),
            ('Senior Technician', 'senior1', 'Complex issues, mentoring'),
            ('Technician', 'tech1', 'Handle tickets, equipment management'),
            ('End User', 'user1', 'Submit requests, track status'),
        ]
        
        for role, username, description in roles_info:
            self.stdout.write(f'{role:18} | {username:10} | {description}')
        
        self.stdout.write('')
        self.stdout.write('Frontend: http://localhost:3000')
        self.stdout.write('Backend:  http://localhost:8000')
        self.stdout.write('Admin:    http://localhost:8000/admin')
        self.stdout.write('='*60)
