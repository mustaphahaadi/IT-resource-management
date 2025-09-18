import requests
import json

# Test registration endpoint
url = "http://localhost:8000/api/auth/register/"
data = {
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPassword123!",
    "confirm_password": "TestPassword123!",
    "first_name": "Test",
    "last_name": "User",
    "department": "it",
    "phone_number": "+1234567890",
    "employee_id": "EMP001"
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code != 201:
        print("Registration failed!")
    else:
        print("Registration successful!")
        
except Exception as e:
    print(f"Error: {e}")
