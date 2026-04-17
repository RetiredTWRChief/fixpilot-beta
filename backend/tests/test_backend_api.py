"""
Backend API Tests for FixPilot
Tests: health, repair-library, diagnose, chat, history endpoints
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('EXPO_PUBLIC_BACKEND_URL', '').rstrip('/')

@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


class TestHealthAndLibrary:
    """Health check and repair library tests"""

    def test_health_endpoint(self, api_client):
        """Test /api/health returns status ok"""
        response = api_client.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "service" in data
        assert "timestamp" in data

    def test_repair_library_endpoint(self, api_client):
        """Test /api/repair-library returns 9 entries"""
        response = api_client.get(f"{BASE_URL}/api/repair-library")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 9
        # Verify structure of first entry
        assert "key" in data[0]
        assert "title" in data[0]
        assert "summary" in data[0]
        assert "difficulty" in data[0]


class TestDiagnoseEndpoint:
    """Diagnosis endpoint tests"""

    def test_diagnose_basic(self, api_client):
        """Test POST /api/diagnose with basic vehicle info"""
        payload = {
            "vehicle": {
                "year": "2015",
                "make": "Toyota",
                "model": "Camry",
                "engine": "2.5L"
            },
            "issue": "My car is overheating and I smell coolant near the front"
        }
        response = api_client.post(f"{BASE_URL}/api/diagnose", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert "id" in data
        assert "vehicle_summary" in data
        assert "issue" in data
        assert data["issue"] == payload["issue"]
        assert "ai_analysis" in data
        assert "created_at" in data
        
        # Verify data persisted by fetching it
        diag_id = data["id"]
        time.sleep(1)  # Brief wait for DB write
        get_response = api_client.get(f"{BASE_URL}/api/history/{diag_id}")
        assert get_response.status_code == 200
        fetched = get_response.json()
        assert fetched["id"] == diag_id

    def test_diagnose_with_repair_match(self, api_client):
        """Test diagnosis with issue that matches repair library"""
        payload = {
            "vehicle": {
                "year": "2018",
                "make": "Honda",
                "model": "Civic",
                "engine": ""
            },
            "issue": "radiator leak coolant smell"
        }
        response = api_client.post(f"{BASE_URL}/api/diagnose", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert "repair_match" in data
        # Should match radiator leak entry
        if data["repair_match"]:
            assert "title" in data["repair_match"]
            assert "difficulty" in data["repair_match"]

    def test_diagnose_minimal_vehicle_info(self, api_client):
        """Test diagnosis with minimal vehicle info"""
        payload = {
            "vehicle": {
                "year": "",
                "make": "",
                "model": "",
                "engine": ""
            },
            "issue": "engine making strange noise"
        }
        response = api_client.post(f"{BASE_URL}/api/diagnose", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data


class TestChatEndpoint:
    """Chat endpoint tests"""

    def test_chat_new_session(self, api_client):
        """Test POST /api/chat creates new session"""
        payload = {
            "session_id": "",
            "vehicle": {
                "year": "2020",
                "make": "Ford",
                "model": "F-150",
                "engine": ""
            },
            "message": "My truck makes a clicking sound when I try to start it"
        }
        response = api_client.post(f"{BASE_URL}/api/chat", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert "session_id" in data
        assert "reply" in data
        assert len(data["reply"]) > 0
        assert data["session_id"] != ""

    def test_chat_existing_session(self, api_client):
        """Test chat with existing session maintains history"""
        # First message
        payload1 = {
            "session_id": "",
            "vehicle": {"year": "2019", "make": "Tesla", "model": "Model 3", "engine": ""},
            "message": "Battery warning light is on"
        }
        response1 = api_client.post(f"{BASE_URL}/api/chat", json=payload1)
        assert response1.status_code == 200
        session_id = response1.json()["session_id"]
        
        # Second message with same session
        payload2 = {
            "session_id": session_id,
            "vehicle": {"year": "2019", "make": "Tesla", "model": "Model 3", "engine": ""},
            "message": "What should I check first?"
        }
        response2 = api_client.post(f"{BASE_URL}/api/chat", json=payload2)
        assert response2.status_code == 200
        data2 = response2.json()
        assert data2["session_id"] == session_id
        assert "reply" in data2

    def test_get_chat_session(self, api_client):
        """Test GET /api/chat/{session_id}"""
        # Create a session first
        payload = {
            "session_id": "",
            "vehicle": {"year": "2021", "make": "BMW", "model": "X5", "engine": ""},
            "message": "Check engine light is on"
        }
        response = api_client.post(f"{BASE_URL}/api/chat", json=payload)
        session_id = response.json()["session_id"]
        
        # Fetch the session
        get_response = api_client.get(f"{BASE_URL}/api/chat/{session_id}")
        assert get_response.status_code == 200
        session_data = get_response.json()
        assert "messages" in session_data
        assert len(session_data["messages"]) >= 2  # user + assistant


class TestHistoryEndpoint:
    """History endpoint tests"""

    def test_get_history(self, api_client):
        """Test GET /api/history returns list"""
        response = api_client.get(f"{BASE_URL}/api/history")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_specific_diagnosis(self, api_client):
        """Test GET /api/history/{id} for specific diagnosis"""
        # Create a diagnosis first
        payload = {
            "vehicle": {"year": "2017", "make": "Nissan", "model": "Altima", "engine": ""},
            "issue": "TEST_brakes squealing"
        }
        create_response = api_client.post(f"{BASE_URL}/api/diagnose", json=payload)
        diag_id = create_response.json()["id"]
        
        # Fetch it
        time.sleep(1)
        get_response = api_client.get(f"{BASE_URL}/api/history/{diag_id}")
        assert get_response.status_code == 200
        data = get_response.json()
        assert data["id"] == diag_id
        assert "TEST_brakes squealing" in data["issue"]

    def test_delete_diagnosis(self, api_client):
        """Test DELETE /api/history/{id}"""
        # Create a diagnosis
        payload = {
            "vehicle": {"year": "2016", "make": "Mazda", "model": "CX-5", "engine": ""},
            "issue": "TEST_delete_this_diagnosis"
        }
        create_response = api_client.post(f"{BASE_URL}/api/diagnose", json=payload)
        diag_id = create_response.json()["id"]
        
        # Delete it
        time.sleep(1)
        delete_response = api_client.delete(f"{BASE_URL}/api/history/{diag_id}")
        assert delete_response.status_code == 200
        
        # Verify it's gone
        get_response = api_client.get(f"{BASE_URL}/api/history/{diag_id}")
        assert get_response.status_code == 404

    def test_get_nonexistent_diagnosis(self, api_client):
        """Test GET /api/history/{id} with invalid id returns 404"""
        response = api_client.get(f"{BASE_URL}/api/history/nonexistent-id-12345")
        assert response.status_code == 404


class TestVehicleEndpoints:
    """Vehicle save/retrieve tests"""

    def test_save_vehicle(self, api_client):
        """Test POST /api/vehicles"""
        payload = {
            "year": "2022",
            "make": "Chevrolet",
            "model": "Silverado",
            "engine": "5.3L V8",
            "nickname": "TEST_My Truck"
        }
        response = api_client.post(f"{BASE_URL}/api/vehicles", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["make"] == "Chevrolet"
        assert data["nickname"] == "TEST_My Truck"

    def test_get_vehicles(self, api_client):
        """Test GET /api/vehicles"""
        response = api_client.get(f"{BASE_URL}/api/vehicles")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_delete_vehicle(self, api_client):
        """Test DELETE /api/vehicles/{id}"""
        # Create vehicle
        payload = {
            "year": "2020",
            "make": "TEST_DELETE",
            "model": "Test",
            "engine": "",
            "nickname": "TEST_delete_me"
        }
        create_response = api_client.post(f"{BASE_URL}/api/vehicles", json=payload)
        vehicle_id = create_response.json()["id"]
        
        # Delete it
        time.sleep(1)
        delete_response = api_client.delete(f"{BASE_URL}/api/vehicles/{vehicle_id}")
        assert delete_response.status_code == 200
