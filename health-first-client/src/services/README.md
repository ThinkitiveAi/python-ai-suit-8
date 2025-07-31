# Provider and Patient API Integration

This document describes the integration of the provider and patient login/registration APIs using axios.

## API Endpoints

### Provider Registration
```
POST http://192.168.0.49:5000/api/v1/provider/register
```

### Provider Login
```
POST http://192.168.0.49:5000/api/v1/provider/login
```

### Patient Login
```
POST http://192.168.0.49:5000/api/v1/patient/login
```

## Request Formats

### Provider Registration Request
The registration API expects a JSON payload with the following structure:

```json
{
  "first_name": "string",
  "last_name": "string",
  "email": "user@example.com",
  "phone_number": "string",
  "password": "string",
  "confirm_password": "string",
  "specialization": "string",
  "license_number": "string",
  "years_of_experience": 0,
  "clinic_address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "zip": "string"
  }
}
```

### Provider Login Request
The provider login API expects a JSON payload with the following structure:

```json
{
  "identifier": "string",     // email or phone number
  "password": "string",       // user password
  "remember_me": false        // optional boolean
}
```

### Patient Login Request
The patient login API expects a JSON payload with the following structure:

```json
{
  "identifier": "emma.jones@example.com",
  "password": "HealthyLife@123",
  "remember_me": true,
  "device_info": {
    "app_version": "2.0.1",
    "device_name": "Samsung Galaxy S21",
    "device_type": "Android"
  }
}
```

## Response Formats

### Provider Registration Response
On successful registration, the API returns:

```json
{
  "id": "string",
  "email": "string",
  "first_name": "string",
  "last_name": "string",
  "specialization": "string",
  "license_number": "string",
  "years_of_experience": 0,
  "clinic_address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "zip": "string"
  },
  "created_at": "string"
}
```

### Provider Login Response
On successful login, the API returns:

```json
{
  "access_token": "string",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "specialization": "string",
    "license_number": "string"
  }
}
```

### Patient Login Response
On successful login, the API returns:

```json
{
  "access_token": "string",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "date_of_birth": "string",
    "phone_number": "string"
  }
}
```

## Usage in Components

### Import the APIs

```typescript
import { providerAPI, ProviderLoginData, ProviderRegistrationData, patientAPI, PatientLoginData } from './services/api';
```

### Provider Registration Function

```typescript
const handleRegistration = async (values: any) => {
  try {
    const registrationData: ProviderRegistrationData = {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      phone_number: values.phone_number,
      password: values.password,
      confirm_password: values.confirm_password,
      specialization: values.specialization,
      license_number: values.license_number,
      years_of_experience: values.years_of_experience,
      clinic_address: {
        street: values.clinic_address.street,
        city: values.clinic_address.city,
        state: values.clinic_address.state,
        zip: values.clinic_address.zip
      }
    };

    const response = await providerAPI.register(registrationData);
    
    console.log('Registration successful:', response);
    
    // Navigate to login or dashboard
    // navigate('/provider/login');
    
  } catch (error: any) {
    console.error('Registration error:', error);
    // Handle error appropriately
  }
};
```

### Provider Login Function

```typescript
const handleProviderLogin = async (values: any) => {
  try {
    const loginData: ProviderLoginData = {
      identifier: values.identifier,
      password: values.password,
      remember_me: values.rememberMe
    };

    const response = await providerAPI.login(loginData);
    
    // Store the token
    localStorage.setItem('provider_token', response.access_token);
    localStorage.setItem('provider_user', JSON.stringify(response.user));
    
    // Navigate to dashboard
    // navigate('/provider/dashboard');
    
  } catch (error: any) {
    console.error('Login error:', error);
    // Handle error appropriately
  }
};
```

### Patient Login Function

```typescript
const handlePatientLogin = async (values: any) => {
  try {
    const loginData: PatientLoginData = {
      identifier: values.identifier,
      password: values.password,
      remember_me: values.rememberMe,
      device_info: {
        app_version: "2.0.1",
        device_name: navigator.userAgent,
        device_type: "Web"
      }
    };

    const response = await patientAPI.login(loginData);
    
    // Store the token
    localStorage.setItem('patient_token', response.access_token);
    localStorage.setItem('patient_user', JSON.stringify(response.user));
    
    // Navigate to dashboard
    // navigate('/patient/dashboard');
    
  } catch (error: any) {
    console.error('Patient login error:', error);
    // Handle error appropriately
  }
};
```

## Error Handling

The APIs include comprehensive error handling for:

- Network errors (connection refused, timeout)
- Authentication errors (401 Unauthorized)
- Validation errors (400 Bad Request)
- Not found errors (404)
- Registration-specific errors (email already exists, invalid data)

## Fallback Mode

When the API server is unavailable, the system falls back to dummy credentials for testing:

### Provider Credentials:
- Email: `provider@medical.com`
- Phone: `+15551234567`
- Password: `password123`

### Patient Credentials:
- Email: `patient@healthcare.com`
- Phone: `+15559876543`
- Password: `patient123`

## Configuration

The API is configured with:

- Base URL: `http://192.168.0.49:5000`
- Timeout: 10 seconds
- Headers: `Content-Type: application/json`, `accept: application/json`

## Testing

You can test the API integration using the test file:

```typescript
import { testProviderRegistration, testProviderLogin, testPatientLogin } from './api.test';

// Test the provider registration
testProviderRegistration().then(response => {
  console.log('Registration test successful:', response);
}).catch(error => {
  console.error('Registration test failed:', error);
});

// Test the provider login
testProviderLogin().then(response => {
  console.log('Provider login test successful:', response);
}).catch(error => {
  console.error('Provider login test failed:', error);
});

// Test the patient login
testPatientLogin().then(response => {
  console.log('Patient login test successful:', response);
}).catch(error => {
  console.error('Patient login test failed:', error);
});
``` 