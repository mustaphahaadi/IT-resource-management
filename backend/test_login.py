import requests
import json

# Test login endpoint
url = "http://localhost:8000/api/auth/login/"
data = {
    "email": "test@example.com",
    "password": "TestPassword123!"
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("Login successful!")
        response_data = response.json()
        token = response_data.get('token')
        print(f"Token: {token}")
    else:
        print("Login failed!")
        
except Exception as e:
    print(f"Error: {e}")
