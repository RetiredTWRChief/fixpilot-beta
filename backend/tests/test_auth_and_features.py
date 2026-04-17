"""
Backend API Tests for FixPilot - Iteration 2
Tests: Auth (register, login, me, refresh), expanded repair library (17 entries),
nearby shops, auth-protected endpoints, brute force lockout
"""
import pytest
import requests
import os
import time

# Use the public URL for testing
BASE_URL = "https://gpt-base44-flow.preview.emergentagent.com"

@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture
def admin_token(api_client):
    """Get admin auth token"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": "admin@fixpilot.com",
        "password": "FixPilot2026!"
    })
    if response.status_code == 200:
        return response.json()["access_token"]
    pytest.skip("Admin login failed - cannot test auth-protected endpoints")

@pytest.fixture
def test_user_token(api_client):
    """Create test user and return token"""
    # Try to register
    email = f"test_{int(time.time())}@fixpilot.com"
    response = api_client.post(f"{BASE_URL}/api/auth/register", json={
        "name": "Test User",
        "email": email,
        "password": "test123456"
    })
    if response.status_code == 200:
        return response.json()["access_token"]
    # If registration fails (email exists), try login
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": email,
        "password": "test123456"
    })
    if response.status_code == 200:
        return response.json()["access_token"]
    pytest.skip("Test user creation failed")


class TestAuthEndpoints:
    """Authentication endpoint tests"""

    def test_register_new_user(self, api_client):
        """Test POST /api/auth/register creates new user"""
        email = f"newuser_{int(time.time())}@fixpilot.com"
        payload = {
            "name": "New User",
            "email": email,
            "password": "password123"
        }
        response = api_client.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert "id" in data
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["email"] == email
        assert data["name"] == "New User"
        assert data["role"] == "user"

    def test_register_duplicate_email(self, api_client):
        """Test registering with existing email returns 400"""
        response = api_client.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Admin Duplicate",
            "email": "admin@fixpilot.com",
            "password": "test123"
        })
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()

    def test_login_admin_success(self, api_client):
        """Test POST /api/auth/login with admin credentials"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@fixpilot.com",
            "password": "FixPilot2026!"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert "id" in data
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["email"] == "admin@fixpilot.com"
        assert data["role"] == "admin"

    def test_login_invalid_credentials(self, api_client):
        """Test login with wrong password returns 401"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@fixpilot.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        assert "invalid" in response.json()["detail"].lower()

    def test_login_nonexistent_user(self, api_client):
        """Test login with non-existent email returns 401"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "password123"
        })
        assert response.status_code == 401

    def test_get_me_with_token(self, api_client, admin_token):
        """Test GET /api/auth/me with valid Bearer token"""
        response = api_client.get(f"{BASE_URL}/api/auth/me", 
            headers={"Authorization": f"Bearer {admin_token}"})
        assert response.status_code == 200
        
        data = response.json()
        assert "id" in data
        assert data["email"] == "admin@fixpilot.com"
        assert data["role"] == "admin"
        assert "password" not in data
        assert "password_hash" not in data

    def test_get_me_without_token(self, api_client):
        """Test GET /api/auth/me without token returns 401"""
        response = api_client.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401

    def test_get_me_invalid_token(self, api_client):
        """Test GET /api/auth/me with invalid token returns 401"""
        response = api_client.get(f"{BASE_URL}/api/auth/me",
            headers={"Authorization": "Bearer invalid_token_12345"})
        assert response.status_code == 401

    def test_refresh_token(self, api_client):
        """Test POST /api/auth/refresh with refresh token"""
        # Login first
        login_response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@fixpilot.com",
            "password": "FixPilot2026!"
        })
        refresh_token = login_response.json()["refresh_token"]
        
        # Use refresh token
        response = api_client.post(f"{BASE_URL}/api/auth/refresh", json={
            "refresh_token": refresh_token
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data


class TestRepairLibrary:
    """Repair library tests - verify 17 entries"""

    def test_repair_library_count(self, api_client):
        """Test /api/repair-library returns 17 entries (expanded from 9)"""
        response = api_client.get(f"{BASE_URL}/api/repair-library")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 17, f"Expected 17 entries, got {len(data)}"

    def test_repair_library_new_entries(self, api_client):
        """Verify new repair entries are present"""
        response = api_client.get(f"{BASE_URL}/api/repair-library")
        data = response.json()
        
        keys = [entry["key"] for entry in data]
        # Check for new entries added in iteration 2
        expected_new = [
            "transmission-issue",
            "exhaust-catalytic-converter",
            "power-steering-issue",
            "ac-heating-system",
            "oil-leak",
            "tire-alignment",
            "check-engine-light",
            "serpentine-belt"
        ]
        for key in expected_new:
            assert key in keys, f"Missing new entry: {key}"


class TestNearbyShops:
    """Nearby shops endpoint tests (Google Places API)"""

    def test_nearby_shops_endpoint(self, api_client):
        """Test POST /api/nearby-shops with lat/lng"""
        payload = {
            "lat": 37.7749,
            "lng": -122.4194,
            "radius": 8000
        }
        response = api_client.post(f"{BASE_URL}/api/nearby-shops", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert "results" in data
        # Results may be empty if API key not configured or no shops nearby
        assert isinstance(data["results"], list)

    def test_nearby_shops_default_radius(self, api_client):
        """Test nearby shops with default radius"""
        payload = {
            "lat": 40.7128,
            "lng": -74.0060
        }
        response = api_client.post(f"{BASE_URL}/api/nearby-shops", json=payload)
        assert response.status_code == 200


class TestAuthProtectedEndpoints:
    """Test endpoints that require authentication"""

    def test_diagnose_with_auth(self, api_client, admin_token):
        """Test POST /api/diagnose with Bearer token associates user_id"""
        payload = {
            "vehicle": {"year": "2020", "make": "Toyota", "model": "Camry", "engine": ""},
            "issue": "TEST_auth_diagnose - engine noise"
        }
        response = api_client.post(f"{BASE_URL}/api/diagnose", json=payload,
            headers={"Authorization": f"Bearer {admin_token}"})
        assert response.status_code == 200
        
        data = response.json()
        assert "user_id" in data
        assert data["user_id"] is not None

    def test_diagnose_without_auth(self, api_client):
        """Test POST /api/diagnose without auth still works (optional auth)"""
        payload = {
            "vehicle": {"year": "2019", "make": "Honda", "model": "Civic", "engine": ""},
            "issue": "TEST_no_auth - brakes squealing"
        }
        response = api_client.post(f"{BASE_URL}/api/diagnose", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] is None

    def test_chat_with_auth(self, api_client, admin_token):
        """Test POST /api/chat with auth token"""
        payload = {
            "session_id": "",
            "vehicle": {"year": "2021", "make": "Ford", "model": "F-150", "engine": ""},
            "message": "TEST_auth_chat - battery issue"
        }
        response = api_client.post(f"{BASE_URL}/api/chat", json=payload,
            headers={"Authorization": f"Bearer {admin_token}"})
        assert response.status_code == 200
        data = response.json()
        assert "session_id" in data
        assert "reply" in data

    def test_history_with_auth(self, api_client, admin_token):
        """Test GET /api/history with auth returns user-specific history"""
        response = api_client.get(f"{BASE_URL}/api/history",
            headers={"Authorization": f"Bearer {admin_token}"})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_vehicles_requires_auth(self, api_client):
        """Test POST /api/vehicles requires authentication"""
        payload = {
            "year": "2022",
            "make": "Tesla",
            "model": "Model 3",
            "engine": "",
            "nickname": "TEST_no_auth"
        }
        response = api_client.post(f"{BASE_URL}/api/vehicles", json=payload)
        assert response.status_code == 401

    def test_vehicles_with_auth(self, api_client, test_user_token):
        """Test POST /api/vehicles with auth creates vehicle"""
        payload = {
            "year": "2023",
            "make": "BMW",
            "model": "X5",
            "engine": "3.0L",
            "nickname": "TEST_auth_vehicle"
        }
        response = api_client.post(f"{BASE_URL}/api/vehicles", json=payload,
            headers={"Authorization": f"Bearer {test_user_token}"})
        assert response.status_code == 200
        
        data = response.json()
        assert "id" in data
        assert data["make"] == "BMW"
        
        # Verify GET works
        get_response = api_client.get(f"{BASE_URL}/api/vehicles",
            headers={"Authorization": f"Bearer {test_user_token}"})
        assert get_response.status_code == 200
        vehicles = get_response.json()
        assert any(v["id"] == data["id"] for v in vehicles)

    def test_get_vehicles_requires_auth(self, api_client):
        """Test GET /api/vehicles requires authentication"""
        response = api_client.get(f"{BASE_URL}/api/vehicles")
        assert response.status_code == 401

    def test_delete_vehicle_requires_auth(self, api_client):
        """Test DELETE /api/vehicles/{id} requires authentication"""
        response = api_client.delete(f"{BASE_URL}/api/vehicles/test-id-123")
        assert response.status_code == 401


class TestBruteForceLockout:
    """Test brute force protection (5 failed attempts)"""

    def test_brute_force_lockout(self, api_client):
        """Test 5 failed login attempts trigger lockout"""
        test_email = f"bruteforce_{int(time.time())}@test.com"
        
        # Make 5 failed attempts
        for i in range(5):
            response = api_client.post(f"{BASE_URL}/api/auth/login", json={
                "email": test_email,
                "password": "wrongpassword"
            })
            if i < 4:
                assert response.status_code == 401
        
        # 6th attempt should be locked out
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": test_email,
            "password": "wrongpassword"
        })
        assert response.status_code == 429
        assert "too many attempts" in response.json()["detail"].lower()
