# Health First Provider Registration Service

A secure and robust Flask-based backend service for healthcare provider registration with comprehensive validation, email verification, and support for multiple database types (MySQL, PostgreSQL, and MongoDB).

## Features

- Secure provider registration with comprehensive validation
- Support for multiple databases (MySQL, PostgreSQL, MongoDB)
- Email verification system
- Rate limiting to prevent abuse
- Secure password hashing with bcrypt
- Input sanitization and validation
- Detailed error handling
- Audit logging
- API documentation

## Prerequisites

- Python 3.8+
- MySQL, PostgreSQL, or MongoDB
- Redis (optional, for rate limiting)
- SMTP server for email verification

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd health-first-server
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

5. Configure your environment variables in `.env`:
- Set database credentials
- Configure email settings
- Set security keys
- Adjust rate limiting settings

## Database Setup

### MySQL
```sql
CREATE DATABASE health_first CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### PostgreSQL
```sql
CREATE DATABASE health_first;
```

### MongoDB
No setup required if MongoDB is running with default settings.

## Running the Application

Development mode:
```bash
flask run
```

Production mode:
```bash
gunicorn run:app
```

## API Documentation

### Provider Registration

**Endpoint:** `POST /api/v1/provider/register`

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
  "message": "Provider registered successfully. Verification email sent.",
  "data": {
    "provider_id": "uuid-here",
    "email": "john.doe@clinic.com",
    "verification_status": "pending"
  }
}
```

### Email Verification

**Endpoint:** `GET /api/v1/provider/verify/<token>`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "provider_id": "uuid-here",
    "email": "john.doe@clinic.com",
    "verification_status": "verified"
  }
}
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- 400: Bad Request (validation errors)
- 409: Conflict (duplicate email/phone/license)
- 422: Unprocessable Entity (validation errors)
- 429: Too Many Requests (rate limit exceeded)
- 500: Internal Server Error

## Security Features

- Password hashing using bcrypt
- Rate limiting for registration attempts
- Input validation and sanitization
- Secure email verification tokens
- Sensitive data redaction in logs

## Testing

Run the test suite:
```bash
pytest
```

With coverage:
```bash
pytest --cov=src tests/
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 