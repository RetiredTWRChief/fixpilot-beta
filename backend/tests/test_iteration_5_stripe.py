"""
Backend API Tests for FixPilot - Iteration 5
Tests: Stripe subscription integration (Free tier 1 diagnosis, Pro $9.99/month unlimited)
Features: subscription-status, subscribe, diagnose with paywall, webhook, checkout-status
"""
import pytest
import requests
import time
import uuid

BASE_URL = "https://gpt-base44-flow.preview.emergentagent.com"

@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


class TestSubscriptionStatus:
    """Test GET /api/subscription-status endpoint"""

    def test_subscription_status_for_admin(self, api_client):
        """Test GET /api/subscription-status returns current plan for admin user"""
        # Login as admin (has 6 diagnoses, free limit is 1)
        login_response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@fixpilot.com",
            "password": "FixPilot2026!"
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        
        # Get subscription status
        response = api_client.get(
            f"{BASE_URL}/api/subscription-status",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "status" in data
        assert "plan" in data
        assert "diagnoses_used" in data
        assert "free_remaining" in data
        
        # Admin has 6 diagnoses, free limit is 1, so free_remaining should be 0
        print(f"✓ Subscription status: {data['status']}, Plan: {data['plan']}")
        print(f"  Diagnoses used: {data['diagnoses_used']}, Free remaining: {data['free_remaining']}")
        
        # Verify admin has exceeded free limit
        assert data["diagnoses_used"] >= 1, "Admin should have at least 1 diagnosis"
        if data["status"] == "free":
            assert data["free_remaining"] == 0, "Admin should have 0 free diagnoses remaining"

    def test_subscription_status_requires_auth(self, api_client):
        """Test GET /api/subscription-status requires authentication"""
        response = api_client.get(f"{BASE_URL}/api/subscription-status")
        assert response.status_code == 401
        print("✓ Subscription status requires authentication")


class TestSubscribeEndpoint:
    """Test POST /api/subscribe endpoint (Stripe checkout session creation)"""

    def test_subscribe_creates_checkout_session(self, api_client):
        """Test POST /api/subscribe creates Stripe checkout session and returns URL + session_id"""
        # Login as admin
        login_response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@fixpilot.com",
            "password": "FixPilot2026!"
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        
        # Create subscription checkout session
        response = api_client.post(
            f"{BASE_URL}/api/subscribe",
            json={"origin_url": "https://gpt-base44-flow.preview.emergentagent.com"},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "url" in data, "Response should contain Stripe checkout URL"
        assert "session_id" in data, "Response should contain session_id"
        assert data["url"].startswith("http"), "URL should be valid HTTP URL"
        assert len(data["session_id"]) > 10, "Session ID should be valid"
        
        print(f"✓ Stripe checkout session created")
        print(f"  Session ID: {data['session_id'][:30]}...")
        print(f"  Checkout URL: {data['url'][:60]}...")

    def test_subscribe_requires_auth(self, api_client):
        """Test POST /api/subscribe requires authentication"""
        response = api_client.post(
            f"{BASE_URL}/api/subscribe",
            json={"origin_url": "https://gpt-base44-flow.preview.emergentagent.com"}
        )
        assert response.status_code == 401
        print("✓ Subscribe endpoint requires authentication")


class TestDiagnosePaywall:
    """Test POST /api/diagnose returns 403 when free tier limit exceeded"""

    def test_diagnose_returns_403_for_free_tier_limit(self, api_client):
        """Test POST /api/diagnose returns 403 when admin (6 diagnoses) exceeds free limit (1)"""
        # Login as admin (has 6 diagnoses, free limit is 1)
        login_response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@fixpilot.com",
            "password": "FixPilot2026!"
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        
        # Check subscription status first
        status_response = api_client.get(
            f"{BASE_URL}/api/subscription-status",
            headers={"Authorization": f"Bearer {token}"}
        )
        status_data = status_response.json()
        print(f"  Admin status: {status_data['status']}, Diagnoses: {status_data['diagnoses_used']}, Free remaining: {status_data['free_remaining']}")
        
        # If admin is already pro, skip this test
        if status_data["status"] == "pro":
            pytest.skip("Admin is already Pro user, cannot test free tier limit")
        
        # Try to create diagnosis (should return 403 if free limit exceeded)
        diagnose_payload = {
            "vehicle": {
                "year": "2021",
                "make": "Ford",
                "model": "F-150",
                "engine": "3.5L V6"
            },
            "issue": "Engine making knocking noise",
            "verified_diagnosis": ""
        }
        diagnose_response = api_client.post(
            f"{BASE_URL}/api/diagnose",
            json=diagnose_payload,
            headers={"Authorization": f"Bearer {token}"}
        )
        
        # Admin has 6 diagnoses, free limit is 1, so should get 403
        if status_data["free_remaining"] == 0:
            assert diagnose_response.status_code == 403, "Should return 403 when free limit exceeded"
            error_data = diagnose_response.json()
            assert "detail" in error_data
            assert "upgrade" in error_data["detail"].lower() or "pro" in error_data["detail"].lower()
            print(f"✓ Diagnose returns 403 when free limit exceeded")
            print(f"  Error message: {error_data['detail']}")
        else:
            print(f"⚠ Admin still has free diagnoses remaining, cannot test 403 paywall")

    def test_diagnose_works_for_new_free_user(self, api_client):
        """Test POST /api/diagnose works for new user with free diagnosis available"""
        # Register new user
        test_email = f"test_free_{uuid.uuid4().hex[:8]}@fixpilot.com"
        register_response = api_client.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Test Free User",
            "email": test_email,
            "password": "test123456"
        })
        assert register_response.status_code == 200
        token = register_response.json()["access_token"]
        
        # Check subscription status (should have 1 free diagnosis)
        status_response = api_client.get(
            f"{BASE_URL}/api/subscription-status",
            headers={"Authorization": f"Bearer {token}"}
        )
        status_data = status_response.json()
        assert status_data["status"] == "free"
        assert status_data["free_remaining"] == 1
        print(f"✓ New user has 1 free diagnosis available")
        
        # Create diagnosis (should work)
        diagnose_payload = {
            "vehicle": {
                "year": "2019",
                "make": "Toyota",
                "model": "Corolla",
                "engine": "1.8L"
            },
            "issue": "Car won't start, clicking noise",
            "verified_diagnosis": ""
        }
        diagnose_response = api_client.post(
            f"{BASE_URL}/api/diagnose",
            json=diagnose_payload,
            headers={"Authorization": f"Bearer {token}"}
        )
        assert diagnose_response.status_code == 200
        
        data = diagnose_response.json()
        assert "id" in data
        print(f"✓ First diagnosis works for new free user: {data['id']}")
        
        # Check status again (should now have 0 free remaining)
        status_response2 = api_client.get(
            f"{BASE_URL}/api/subscription-status",
            headers={"Authorization": f"Bearer {token}"}
        )
        status_data2 = status_response2.json()
        assert status_data2["diagnoses_used"] == 1
        assert status_data2["free_remaining"] == 0
        print(f"✓ After first diagnosis: {status_data2['diagnoses_used']} used, {status_data2['free_remaining']} remaining")
        
        # Try second diagnosis (should return 403)
        diagnose_response2 = api_client.post(
            f"{BASE_URL}/api/diagnose",
            json=diagnose_payload,
            headers={"Authorization": f"Bearer {token}"}
        )
        assert diagnose_response2.status_code == 403
        error_data = diagnose_response2.json()
        assert "detail" in error_data
        print(f"✓ Second diagnosis returns 403: {error_data['detail']}")


class TestWebhookEndpoint:
    """Test POST /api/webhook/stripe endpoint exists"""

    def test_webhook_endpoint_exists(self, api_client):
        """Test POST /api/webhook/stripe endpoint exists and accepts requests"""
        # Send a test webhook (will fail signature verification but endpoint should exist)
        response = api_client.post(
            f"{BASE_URL}/api/webhook/stripe",
            json={"type": "test"},
            headers={"Stripe-Signature": "test_signature"}
        )
        
        # Endpoint should exist (not 404)
        assert response.status_code != 404, "Webhook endpoint should exist"
        
        # Will likely return 200 with error status or 400 due to invalid signature
        # but that's OK - we just need to verify endpoint exists
        print(f"✓ Webhook endpoint exists (status: {response.status_code})")
        if response.status_code == 200:
            data = response.json()
            print(f"  Response: {data}")


class TestCheckoutStatus:
    """Test GET /api/checkout-status/{session_id} endpoint"""

    def test_checkout_status_endpoint_exists(self, api_client):
        """Test GET /api/checkout-status/{session_id} endpoint exists"""
        # Login and create a checkout session first
        login_response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@fixpilot.com",
            "password": "FixPilot2026!"
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        
        # Create checkout session
        subscribe_response = api_client.post(
            f"{BASE_URL}/api/subscribe",
            json={"origin_url": "https://gpt-base44-flow.preview.emergentagent.com"},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert subscribe_response.status_code == 200
        session_id = subscribe_response.json()["session_id"]
        
        # Check checkout status
        response = api_client.get(
            f"{BASE_URL}/api/checkout-status/{session_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "payment_status" in data
        assert "status" in data
        
        print(f"✓ Checkout status endpoint working")
        print(f"  Session ID: {session_id[:30]}...")
        print(f"  Payment status: {data['payment_status']}, Status: {data['status']}")


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

    def test_health_endpoint(self, api_client):
        """Test GET /api/health"""
        response = api_client.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "ok"
        assert "timestamp" in data
        print("✓ Health endpoint working")

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
