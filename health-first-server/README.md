# Health First - Healthcare Provider & Patient Management System

A comprehensive Flask-based healthcare management system that provides secure registration, authentication, and appointment management for both healthcare providers and patients.

## 🚀 Features

### Provider Features
- **Secure Registration & Authentication**: Complete provider registration with email verification
- **Availability Management**: Create and manage appointment availability slots
- **Profile Management**: Update provider information and clinic details
- **Session Management**: Secure login/logout with refresh tokens

### Patient Features
- **Patient Registration**: Complete patient registration with medical history
- **Appointment Booking**: Book, cancel, and update appointments
- **Appointment History**: View all appointments with filtering options
- **Profile Management**: Manage patient information and preferences

### System Features
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive data validation using Marshmallow
- **Database Management**: SQLite database with SQLAlchemy ORM
- **API Documentation**: Swagger/OpenAPI documentation
- **CORS Support**: Cross-origin resource sharing enabled

## 🛠️ Technology Stack

- **Backend**: Flask (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: Marshmallow
- **API Documentation**: Swagger/Flasgger
- **Virtual Environment**: Python venv

## 📋 Prerequisites

- Python 3.8+
- pip (Python package installer)
- Git

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd health-first-server
```

### 2. Create Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Application
```bash
python3 app.py
```

The application will start on `http://127.0.0.1:5007`

## 📚 API Endpoints

### Provider Endpoints

#### Registration & Authentication
- `POST /api/v1/provider/register` - Register a new provider
- `GET /api/v1/provider/verify/<token>` - Verify provider email
- `POST /api/v1/provider/login` - Provider login
- `POST /api/v1/provider/refresh` - Refresh access token
- `POST /api/v1/provider/logout` - Provider logout
- `POST /api/v1/provider/logout-all` - Logout from all devices

#### Availability Management
- `POST /api/v1/provider/availability` - Create availability slots
- `GET /api/v1/provider/<provider_id>/availability` - Get provider availability

### Patient Endpoints

#### Registration & Authentication
- `POST /api/v1/patient/register` - Register a new patient
- `GET /api/v1/patient/verify-test/<patient_id>` - Test patient verification
- `POST /api/v1/patient/login` - Patient login
- `POST /api/v1/patient/refresh` - Refresh access token
- `POST /api/v1/patient/logout` - Patient logout
- `POST /api/v1/patient/logout-all` - Logout from all devices

#### Appointment Management
- `POST /api/v1/appointment/book` - Book an appointment
- `POST /api/v1/appointment/cancel` - Cancel an appointment
- `PUT /api/v1/appointment/update` - Update appointment
- `GET /api/v1/appointment/list` - View appointment list

## 🔧 Usage Examples

### 1. Provider Registration
```bash
curl -X POST "http://127.0.0.1:5007/api/v1/provider/register" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Dr. Sarah",
    "last_name": "Johnson",
    "email": "sarah.johnson@healthcare.com",
    "phone_number": "+1234567890",
    "password": "Password123!",
    "confirm_password": "Password123!",
    "specialization": "Dermatology",
    "license_number": "MD123456",
    "years_of_experience": 8,
    "clinic_address": {
      "street": "123 Medical Center Dr",
      "city": "Healthcare City",
      "state": "CA",
      "zip": "90210"
    }
  }'
```

### 2. Provider Login
```bash
curl -X POST "http://127.0.0.1:5007/api/v1/provider/login" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "sarah.johnson@healthcare.com",
    "password": "Password123!"
  }'
```

### 3. Create Availability
```bash
curl -X POST "http://127.0.0.1:5007/api/v1/provider/availability" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "date": "2025-08-08",
    "start_time": "09:00",
    "end_time": "17:00",
    "timezone": "America/Los_Angeles",
    "slot_duration": 30,
    "break_duration": 15,
    "is_recurring": false,
    "appointment_type": "consultation",
    "location": {
      "type": "clinic",
      "address": "789 Skin Clinic Dr, Healthcare City, CA 90212",
      "room_number": "301"
    },
    "pricing": {
      "base_fee": 180.00,
      "insurance_accepted": true,
      "currency": "USD"
    }
  }'
```

### 4. Patient Registration
```bash
curl -X POST "http://127.0.0.1:5007/api/v1/patient/register" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@email.com",
    "phone_number": "+1987654321",
    "password": "Password123!",
    "confirm_password": "Password123!",
    "date_of_birth": "1990-05-15",
    "gender": "male",
    "address": {
      "street": "123 Main St",
      "city": "Patient City",
      "state": "CA",
      "zip": "90213"
    },
    "emergency_contact": {
      "name": "Jane Doe",
      "phone": "+1987654322",
      "relationship": "spouse"
    },
    "medical_history": ["diabetes", "hypertension"],
    "insurance_info": {
      "provider": "Blue Cross",
      "policy_number": "BC123456"
    }
  }'
```

### 5. Patient Login
```bash
curl -X POST "http://127.0.0.1:5007/api/v1/patient/login" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "john.doe@email.com",
    "password": "Password123!"
  }'
```

### 6. Book Appointment
```bash
curl -X POST "http://127.0.0.1:5007/api/v1/appointment/book" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <patient-token>" \
  -d '{
    "provider_id": "<provider-id>",
    "slot_id": "<slot-id>",
    "appointment_type": "consultation",
    "notes": "Regular checkup"
  }'
```

### 7. View Appointments
```bash
curl -X GET "http://127.0.0.1:5007/api/v1/appointment/list" \
  -H "Authorization: Bearer <patient-token>"
```

## 🔐 Security Features

- **Password Requirements**: Minimum 8 characters with uppercase, lowercase, number, and special character
- **JWT Tokens**: Secure authentication with configurable expiration
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive validation for all inputs
- **SQL Injection Protection**: Using SQLAlchemy ORM
- **CORS Protection**: Configurable cross-origin resource sharing

## 📊 Database Schema

The application uses the following main models:

- **Provider**: Healthcare provider information
- **Patient**: Patient information and medical history
- **ProviderAvailability**: Provider availability schedules
- **AppointmentSlot**: Individual appointment slots
- **RefreshToken**: JWT refresh tokens
- **PatientSession**: Patient session management

## 🧪 Testing

The application has been thoroughly tested with the following workflow:

1. ✅ Provider Registration
2. ✅ Provider Email Verification
3. ✅ Provider Login
4. ✅ Create Provider Availability
5. ✅ Patient Registration
6. ✅ Patient Email Verification
7. ✅ Patient Login
8. ✅ Book Appointment
9. ✅ Cancel Appointment
10. ✅ Update Appointment
11. ✅ View Appointment List

## 🚨 Error Handling

The API provides comprehensive error handling with appropriate HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `422`: Unprocessable Entity
- `423`: Locked
- `429`: Too Many Requests
- `500`: Internal Server Error

## 📝 Environment Variables

Create a `.env` file with the following variables:

```env
SECRET_KEY=your-secret-key-here
JWT_ACCESS_TOKEN_EXPIRES=1800
JWT_REFRESH_TOKEN_EXPIRES=604800
JWT_REMEMBER_ME_EXPIRES=2592000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions, please open an issue in the GitHub repository.

## 🔄 Version History

- **v1.0.0**: Initial release with provider and patient management
- Complete appointment booking system
- Availability management
- JWT authentication
- Comprehensive API documentation

---

**Note**: This is a development version. For production use, ensure proper security configurations, environment variables, and database setup. 