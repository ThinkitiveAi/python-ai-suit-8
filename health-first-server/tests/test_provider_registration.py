import pytest
import asyncio
from httpx import AsyncClient
from unittest.mock import patch, MagicMock
from bson import ObjectId

from app.main import app
from app.models.provider import ProviderCreate, ClinicAddress
from app.services.provider_service import provider_service
from app.utils.password_utils import hash_password, verify_password

# Test data
valid_provider_data = {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@clinic.com",
    "phone_number": "+1234567890",
    "password": "SecurePassword123!",
    "confirm_password": "SecurePassword123!",
    "specialization": "Cardiology",
    "license_number": "MD123456789",
    "years_of_experience": 10,
    "clinic_address": {
        "street": "123 Medical Center Dr",
        "city": "New York",
        "state": "NY",
        "zip": "10001"
    }
}

@pytest.fixture
async def client():
    """Create test client."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture
def mock_db():
    """Mock database connection."""
    with patch('app.database.get_database') as mock:
        mock_db = MagicMock()
        mock.return_value = mock_db
        yield mock_db

class TestProviderRegistration:
    """Test provider registration functionality."""
    
    @pytest.mark.asyncio
    async def test_successful_registration(self, client, mock_db):
        """Test successful provider registration."""
        # Mock database operations
        mock_db.providers.find_one.side_effect = [None, None, None]  # No existing records
        mock_db.providers.insert_one.return_value.inserted_id = ObjectId()
        
        # Mock email service
        with patch('app.services.provider_service.email_service.send_verification_email') as mock_email:
            mock_email.return_value = True
            
            response = await client.post("/api/v1/provider/register", json=valid_provider_data)
            
            assert response.status_code == 201
            data = response.json()
            assert data["success"] is True
            assert "provider_id" in data["data"]
            assert data["data"]["verification_status"] == "pending"
    
    @pytest.mark.asyncio
    async def test_duplicate_email(self, client, mock_db):
        """Test registration with duplicate email."""
        # Mock existing email
        mock_db.providers.find_one.return_value = {"email": "john.doe@clinic.com"}
        
        response = await client.post("/api/v1/provider/register", json=valid_provider_data)
        
        assert response.status_code == 400
        data = response.json()
        assert data["success"] is False
        assert "already registered" in data["message"]
    
    @pytest.mark.asyncio
    async def test_duplicate_phone(self, client, mock_db):
        """Test registration with duplicate phone number."""
        # Mock no existing email but existing phone
        mock_db.providers.find_one.side_effect = [None, {"phone_number": "+1234567890"}]
        
        response = await client.post("/api/v1/provider/register", json=valid_provider_data)
        
        assert response.status_code == 400
        data = response.json()
        assert data["success"] is False
        assert "already registered" in data["message"]
    
    @pytest.mark.asyncio
    async def test_duplicate_license(self, client, mock_db):
        """Test registration with duplicate license number."""
        # Mock no existing email/phone but existing license
        mock_db.providers.find_one.side_effect = [None, None, {"license_number": "MD123456789"}]
        
        response = await client.post("/api/v1/provider/register", json=valid_provider_data)
        
        assert response.status_code == 400
        data = response.json()
        assert data["success"] is False
        assert "already registered" in data["message"]
    
    @pytest.mark.asyncio
    async def test_invalid_email_format(self, client):
        """Test registration with invalid email format."""
        invalid_data = valid_provider_data.copy()
        invalid_data["email"] = "invalid-email"
        
        response = await client.post("/api/v1/provider/register", json=invalid_data)
        
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_weak_password(self, client):
        """Test registration with weak password."""
        invalid_data = valid_provider_data.copy()
        invalid_data["password"] = "weak"
        invalid_data["confirm_password"] = "weak"
        
        response = await client.post("/api/v1/provider/register", json=invalid_data)
        
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_password_mismatch(self, client):
        """Test registration with password mismatch."""
        invalid_data = valid_provider_data.copy()
        invalid_data["confirm_password"] = "DifferentPassword123!"
        
        response = await client.post("/api/v1/provider/register", json=invalid_data)
        
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_invalid_phone_format(self, client):
        """Test registration with invalid phone format."""
        invalid_data = valid_provider_data.copy()
        invalid_data["phone_number"] = "invalid-phone"
        
        response = await client.post("/api/v1/provider/register", json=invalid_data)
        
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_invalid_zip_code(self, client):
        """Test registration with invalid zip code."""
        invalid_data = valid_provider_data.copy()
        invalid_data["clinic_address"]["zip"] = "invalid"
        
        response = await client.post("/api/v1/provider/register", json=invalid_data)
        
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_invalid_specialization(self, client):
        """Test registration with invalid specialization."""
        invalid_data = valid_provider_data.copy()
        invalid_data["specialization"] = "InvalidSpecialization"
        
        response = await client.post("/api/v1/provider/register", json=invalid_data)
        
        assert response.status_code == 422

class TestPasswordUtils:
    """Test password utility functions."""
    
    def test_password_hashing(self):
        """Test password hashing functionality."""
        password = "SecurePassword123!"
        hashed = hash_password(password)
        
        assert hashed != password
        assert verify_password(password, hashed) is True
        assert verify_password("wrongpassword", hashed) is False
    
    def test_password_strength_validation(self):
        """Test password strength validation."""
        from app.utils.password_utils import is_password_strong
        
        # Valid password
        assert is_password_strong("SecurePassword123!") is True
        
        # Too short
        assert is_password_strong("Short1!") is False
        
        # No uppercase
        assert is_password_strong("securepassword123!") is False
        
        # No lowercase
        assert is_password_strong("SECUREPASSWORD123!") is False
        
        # No number
        assert is_password_strong("SecurePassword!") is False
        
        # No special character
        assert is_password_strong("SecurePassword123") is False

class TestProviderVerification:
    """Test provider verification functionality."""
    
    @pytest.mark.asyncio
    async def test_successful_verification(self, client, mock_db):
        """Test successful provider verification."""
        provider_id = str(ObjectId())
        
        # Mock provider exists and is not verified
        mock_db.providers.find_one.return_value = {
            "_id": ObjectId(provider_id),
            "email": "john.doe@clinic.com",
            "first_name": "John"
        }
        mock_db.providers.update_one.return_value.modified_count = 1
        
        # Mock JWT verification
        with patch('app.controllers.provider_controller.verify_token') as mock_verify:
            mock_verify.return_value = provider_id
            
            # Mock email service
            with patch('app.services.provider_service.email_service.send_welcome_email') as mock_email:
                mock_email.return_value = True
                
                response = await client.get(f"/api/v1/provider/verify?token=valid-token")
                
                assert response.status_code == 200
                data = response.json()
                assert data["success"] is True
                assert data["data"]["verification_status"] == "verified"
    
    @pytest.mark.asyncio
    async def test_invalid_token(self, client):
        """Test verification with invalid token."""
        with patch('app.controllers.provider_controller.verify_token') as mock_verify:
            mock_verify.return_value = None
            
            response = await client.get("/api/v1/provider/verify?token=invalid-token")
            
            assert response.status_code == 400
            data = response.json()
            assert data["success"] is False
            assert "Invalid or expired" in data["message"]

class TestExistenceChecks:
    """Test existence check endpoints."""
    
    @pytest.mark.asyncio
    async def test_check_email_exists(self, client, mock_db):
        """Test email existence check."""
        # Test existing email
        mock_db.providers.find_one.return_value = {"email": "test@example.com"}
        
        response = await client.get("/api/v1/provider/check-email/test@example.com")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["exists"] is True
        
        # Test non-existing email
        mock_db.providers.find_one.return_value = None
        
        response = await client.get("/api/v1/provider/check-email/new@example.com")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["exists"] is False
    
    @pytest.mark.asyncio
    async def test_check_phone_exists(self, client, mock_db):
        """Test phone existence check."""
        # Test existing phone
        mock_db.providers.find_one.return_value = {"phone_number": "+1234567890"}
        
        response = await client.get("/api/v1/provider/check-phone/+1234567890")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["exists"] is True
    
    @pytest.mark.asyncio
    async def test_check_license_exists(self, client, mock_db):
        """Test license existence check."""
        # Test existing license
        mock_db.providers.find_one.return_value = {"license_number": "MD123456789"}
        
        response = await client.get("/api/v1/provider/check-license/MD123456789")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["exists"] is True

if __name__ == "__main__":
    pytest.main([__file__]) 