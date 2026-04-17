"""
Backend API Tests for FixPilot - Iteration 4
Tests: Push token registration, Resend email integration (graceful fallback), push notification on diagnosis
"""
import pytest
import requests
import time

BASE_URL = "https://gpt-base44-flow.preview.emergentagent.com"

@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


class TestPushTokenRegistration:
    """Test push token registration endpoint"""

    def test_push_token_registration_authenticated(self, api_client):
        """Test POST /api/push-token registers push token for authenticated user"""
        # Login first
        login_response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@fixpilot.com",
            "password": "FixPilot2026!"
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        
        # Register push token
        push_token = "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
        response = api_client.post(
            f"{BASE_URL}/api/push-token",
            json={"push_token": push_token},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "status" in data
        assert data["status"] == "registered"
        print(f"✓ Push token registered successfully")

    def test_push_token_registration_unauthenticated(self, api_client):
        """Test POST /api/push-token requires authentication"""
        push_token = "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
        response = api_client.post(
            f"{BASE_URL}/api/push-token",
            json={"push_token": push_token}
        )
        assert response.status_code == 401
        print("✓ Push token registration requires authentication")


class TestResendEmailIntegration:
    """Test Resend email integration with graceful fallback"""

    def test_forgot_password_with_resend_fallback(self, api_client):
        """Test POST /api/auth/forgot-password works with graceful fallback (no RESEND_API_KEY)"""
        response = api_client.post(f"{BASE_URL}/api/auth/forgot-password", json={
            "email": "admin@fixpilot.com"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
        assert "reset_token" in data
        assert data["reset_token"] is not None
        # Token should be returned for testing even if email sending fails
        assert len(data["reset_token"]) > 20
        print(f"✓ Forgot password returns reset token (graceful fallback): {data['reset_token'][:20]}...")
        print("  Note: RESEND_API_KEY is empty, so email is logged instead of sent")

    def test_forgot_password_token_format(self, api_client):
        """Verify reset token format is URL-safe"""
        response = api_client.post(f"{BASE_URL}/api/auth/forgot-password", json={
            "email": "admin@fixpilot.com"
        })
        assert response.status_code == 200
        
        token = response.json()["reset_token"]
        # Token should be URL-safe (no special characters except - and _)
        import re
        assert re.match(r'^[A-Za-z0-9_-]+$', token)
        print(f"✓ Reset token is URL-safe: {token[:30]}...")


class TestDiagnosisWithPushNotification:
    """Test diagnosis endpoint sends push notification"""

    def test_diagnose_sends_push_notification(self, api_client):
        """Test POST /api/diagnose sends push notification if user has token"""
        # Login and register push token
        login_response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@fixpilot.com",
            "password": "FixPilot2026!"
        })
        assert login_response.status_code == 200
        auth_token = login_response.json()["access_token"]
        
        # Register push token
        push_token = "ExponentPushToken[test_token_for_diagnosis]"
        push_response = api_client.post(
            f"{BASE_URL}/api/push-token",
            json={"push_token": push_token},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert push_response.status_code == 200
        
        # Create diagnosis (should trigger push notification)
        diagnose_payload = {
            "vehicle": {
                "year": "2018",
                "make": "Honda",
                "model": "Civic",
                "engine": "1.5L Turbo"
            },
            "issue": "Check engine light on, rough idle",
            "verified_diagnosis": ""
        }
        diagnose_response = api_client.post(
            f"{BASE_URL}/api/diagnose",
            json=diagnose_payload,
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert diagnose_response.status_code == 200
        
        data = diagnose_response.json()
        assert "id" in data
        assert "ai_analysis" in data
        # Push notification is sent asynchronously, we can't verify it was sent
        # but we can verify the diagnosis was created successfully
        print(f"✓ Diagnosis created (push notification sent if token valid): {data['id']}")
        print(f"  AI Analysis: {data['ai_analysis'].get('title', 'N/A') if data['ai_analysis'] else 'N/A'}")

    def test_diagnose_without_push_token(self, api_client):
        """Test POST /api/diagnose works even without push token"""
        # Login without registering push token
        login_response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@fixpilot.com",
            "password": "FixPilot2026!"
        })
        assert login_response.status_code == 200
        auth_token = login_response.json()["access_token"]
        
        # Create diagnosis (should work without push notification)
        diagnose_payload = {
            "vehicle": {
                "year": "2020",
                "make": "Toyota",
                "model": "Camry",
                "engine": "2.5L"
            },
            "issue": "Brake squeaking noise",
            "verified_diagnosis": ""
        }
        diagnose_response = api_client.post(
            f"{BASE_URL}/api/diagnose",
            json=diagnose_payload,
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert diagnose_response.status_code == 200
        
        data = diagnose_response.json()
        assert "id" in data
        print(f"✓ Diagnosis works without push token: {data['id']}")


class TestRegressionPreviousFeatures:
    """Regression tests for previous iteration features"""

    def test_login_still_works(self, api_client):
        """Verify login endpoint still works"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@fixpilot.com",
            "password": "FixPilot2026!"
        })
        assert response.status_code == 200
        assert "access_token" in response.json()
        print("✓ Login still works")

    def test_register_still_works(self, api_client):
        """Verify register endpoint still works"""
        import uuid
        test_email = f"test_iter4_{uuid.uuid4().hex[:8]}@fixpilot.com"
        response = api_client.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Test User Iter4",
            "email": test_email,
            "password": "test123456"
        })
        assert response.status_code == 200
        assert "access_token" in response.json()
        print(f"✓ Register still works: {test_email}")

    def test_history_still_works(self, api_client):
        """Verify history endpoint still works"""
        login_response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@fixpilot.com",
            "password": "FixPilot2026!"
        })
        token = login_response.json()["access_token"]
        
        response = api_client.get(
            f"{BASE_URL}/api/history",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        print(f"✓ History still works: {len(response.json())} diagnoses")

    def test_garage_still_works(self, api_client):
        """Verify garage (vehicles) endpoint still works"""
        login_response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@fixpilot.com",
            "password": "FixPilot2026!"
        })
        token = login_response.json()["access_token"]
        
        response = api_client.get(
            f"{BASE_URL}/api/vehicles",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        print(f"✓ Garage still works: {len(response.json())} vehicles")

    def test_health_endpoint(self, api_client):
        """Test GET /api/health"""
        response = api_client.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "ok"
        assert "timestamp" in data
        print("✓ Health endpoint working")
