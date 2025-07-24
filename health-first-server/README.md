# Health First Provider Registration API

A modern, secure REST API for healthcare provider registration and management built with FastAPI and SQLite.

## 🚀 Features

- **Provider Registration**: Complete registration with comprehensive validation
- **Secure Authentication**: Bcrypt password hashing with 12 salt rounds
- **Data Validation**: Comprehensive input validation and sanitization
- **Duplicate Prevention**: Unique email, phone, and license number validation
- **SQLite Database**: Lightweight, file-based database (no external setup required)
- **REST API**: Clean, RESTful endpoints with proper HTTP status codes
- **Auto Documentation**: Interactive API documentation with Swagger UI
- **CORS Support**: Cross-origin resource sharing enabled
- **Error Handling**: Comprehensive error handling with detailed messages
- **Logging**: Structured logging for monitoring and debugging
- **Docker Support**: Containerized deployment with Docker and Docker Compose

## 🛠️ Tech Stack

- **Framework**: FastAPI 0.104.1
- **Database**: SQLite with SQLAlchemy 2.0.23
- **Password Hashing**: Passlib with bcrypt
- **Validation**: Pydantic 2.5.0
- **Server**: Uvicorn
- **Testing**: Pytest with httpx
- **Documentation**: Auto-generated Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose

## 📁 Project Structure

```
health-first-server/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py               # Application configuration
│   ├── database.py             # Database models and connection
│   ├── controllers/
│   │   ├── __init__.py
│   │   └── provider_controller.py  # API endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   └── provider_service.py     # Business logic
│   ├── models/
│   │   ├── __init__.py
│   │   └── provider.py             # Pydantic models
│   ├── middlewares/
│   │   ├── __init__.py
│   │   └── validation.py           # Input validation utilities
│   └── utils/
│       ├── __init__.py
│       └── password_utils.py       # Password hashing utilities
├── tests/
│   ├── __init__.py
│   └── test_provider_registration.py
├── requirements.txt
├── env.example
├── run.py
├── pytest.ini
├── .gitignore
├── Dockerfile                  # Docker configuration
├── docker-compose.yml          # Docker Compose configuration
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Virtual environment (recommended)
- Docker (optional, for containerized deployment)

### Installation

#### Option 1: Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd health-first-server
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env file with your configuration
   ```

5. **Run the application**
   ```bash
   python run.py
   ```

#### Option 2: Docker Deployment

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd health-first-server
   ```

2. **Build and run with Docker**
   ```bash
   # Build the Docker image
   docker build -t health-first-api .
   
   # Run the container
   docker run -d -p 8000:8000 --name health-first-api health-first-api
   ```

3. **Or use Docker Compose**
   ```bash
   # Start the application
   docker compose up -d
   
   # Stop the application
   docker compose down
   ```

The API will be available at `http://localhost:8000`

## 📚 API Documentation

### Base URL
```
http://localhost:8000
```

### Interactive Documentation
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

### Endpoints

#### 1. Health Check
```http
GET /health
```
**Response:**
```json
{
  "success": true,
  "message": "Health First Provider API is running",
  "status": "healthy"
}
```

#### 2. Provider Registration
```http
POST /api/v1/provider/register
Content-Type: application/json
```

**Request Body:**
```json
{
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
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Provider registered successfully",
  "data": {
    "provider_id": "uuid-here",
    "email": "john.doe@clinic.com",
    "verification_status": "verified"
  }
}
```

#### 3. Check Email Existence
```http
GET /api/v1/provider/check-email/{email}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "email": "john.doe@clinic.com",
    "exists": true
  }
}
```

#### 4. Check Phone Existence
```http
GET /api/v1/provider/check-phone/{phone}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "phone": "+1234567890",
    "exists": true
  }
}
```

#### 5. Check License Existence
```http
GET /api/v1/provider/check-license/{license_number}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "license_number": "MD123456789",
    "exists": true
  }
}
```

## 🗄️ Database Schema

### Provider Table
```sql
CREATE TABLE providers (
    id VARCHAR PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    years_of_experience INTEGER NOT NULL,
    clinic_street VARCHAR(200) NOT NULL,
    clinic_city VARCHAR(100) NOT NULL,
    clinic_state VARCHAR(50) NOT NULL,
    clinic_zip VARCHAR(20) NOT NULL,
    verification_status VARCHAR(20) DEFAULT 'verified',
    license_document_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## ✅ Validation Rules

### Email Validation
- Must be valid email format
- Must be unique in database
- Automatically converted to lowercase

### Phone Number Validation
- Must be valid international format
- Must be unique in database
- Supports formats: `+1234567890`, `1234567890`, etc.

### Password Validation
- Minimum 8 characters
- Must contain uppercase letter
- Must contain lowercase letter
- Must contain number
- Must contain special character
- Must match confirmation password

### License Number Validation
- Must be alphanumeric only
- Must be unique in database
- Automatically converted to uppercase

### Specialization Validation
- Must be from predefined list
- Valid specializations: Cardiology, Dermatology, Endocrinology, Gastroenterology, General Practice, Internal Medicine, Neurology, Oncology, Orthopedics, Pediatrics, Psychiatry, Radiology, Surgery, Urology, Emergency Medicine, Family Medicine, Obstetrics and Gynecology, Ophthalmology, Otolaryngology, Pathology, Physical Medicine, Preventive Medicine

### Address Validation
- Street: Required, max 200 characters
- City: Required, max 100 characters
- State: Required, max 50 characters
- ZIP: Required, valid US format (12345 or 12345-6789)

## 🔒 Security Features

- **Password Hashing**: Bcrypt with 12 salt rounds
- **Input Sanitization**: HTML escaping and dangerous character removal
- **Data Validation**: Comprehensive Pydantic validation
- **SQL Injection Prevention**: SQLAlchemy ORM with parameterized queries
- **CORS Protection**: Configurable cross-origin resource sharing
- **Error Handling**: Secure error messages without sensitive data exposure

## 🧪 Testing

### Run Tests
```bash
pytest
```

### Test Coverage
```bash
pytest --cov=app
```

### Test Categories
- Unit tests for validation logic
- Integration tests for API endpoints
- Database operation tests
- Password hashing tests
- Duplicate validation tests

## ⚙️ Configuration

### Environment Variables
```bash
# Database Configuration
DATABASE_URL=sqlite:///./health_first.db
DATABASE_NAME=health_first_db

# Security
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Application Settings
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## 🚀 Deployment

### Development
```bash
python run.py
```

### Production
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Docker (Recommended)
```bash
# Build and run with Docker
docker build -t health-first-api .
docker run -d -p 8000:8000 --name health-first-api health-first-api

# Or use Docker Compose
docker compose up -d
```

### Docker Commands
```bash
# Build the image
docker build -t health-first-api .

# Run container
docker run -d -p 8000:8000 --name health-first-api health-first-api

# Stop container
docker stop health-first-api

# Remove container
docker rm health-first-api

# View logs
docker logs health-first-api

# Docker Compose
docker compose up -d    # Start
docker compose down     # Stop
docker compose logs     # View logs
```

## 📝 API Examples

### Register a Provider
```bash
curl -X POST "http://localhost:8000/api/v1/provider/register" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@clinic.com",
    "phone_number": "+1987654321",
    "password": "SecurePassword123!",
    "confirm_password": "SecurePassword123!",
    "specialization": "Dermatology",
    "license_number": "MD987654321",
    "years_of_experience": 8,
    "clinic_address": {
      "street": "456 Health Plaza",
      "city": "Los Angeles",
      "state": "CA",
      "zip": "90210"
    }
  }'
```

### Check Email Availability
```bash
curl "http://localhost:8000/api/v1/provider/check-email/jane.smith@clinic.com"
```

### Test with Docker
```bash
# Test health endpoint
curl "http://localhost:8000/health"

# Test provider registration
curl -X POST "http://localhost:8000/api/v1/provider/register" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Docker",
    "last_name": "Test",
    "email": "docker.test@clinic.com",
    "phone_number": "+1555123456",
    "password": "SecurePassword123!",
    "confirm_password": "SecurePassword123!",
    "specialization": "General Practice",
    "license_number": "MDDOCKER123",
    "years_of_experience": 5,
    "clinic_address": {
      "street": "789 Docker Street",
      "city": "Container City",
      "state": "DC",
      "zip": "12345"
    }
  }'
```

## 🐳 Docker Features

- **Multi-stage build**: Optimized image size
- **Non-root user**: Security best practices
- **Health checks**: Container monitoring
- **Volume mounting**: Database persistence
- **Environment variables**: Flexible configuration
- **Docker Compose**: Easy orchestration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.

---

**Health First Provider Registration API** - Secure, scalable, and easy to use healthcare provider management system with Docker support. 