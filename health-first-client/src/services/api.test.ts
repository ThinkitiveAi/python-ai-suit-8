import { providerAPI, ProviderLoginData, ProviderRegistrationData, patientAPI, PatientLoginData } from './api';

// Example usage of the patient login API
export const testPatientLogin = async () => {
  const loginData: PatientLoginData = {
    identifier: "emma.jones@example.com", // email or phone
    password: "HealthyLife@123",
    remember_me: true,
    device_info: {
      app_version: "2.0.1",
      device_name: "Samsung Galaxy S21",
      device_type: "Android"
    }
  };

  try {
    console.log('Testing patient login API...');
    console.log('Request data:', loginData);
    
    const response = await patientAPI.login(loginData);
    
    console.log('Patient login successful!');
    console.log('Response:', response);
    
    // Store the token
    localStorage.setItem('patient_token', response.access_token);
    localStorage.setItem('patient_user', JSON.stringify(response.user));
    
    return response;
  } catch (error: any) {
    console.error('Patient login failed:', error);
    
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    }
    
    throw error;
  }
};

// Example usage of the provider registration API
export const testProviderRegistration = async () => {
  const registrationData: ProviderRegistrationData = {
    first_name: "string",
    last_name: "string",
    email: "user@example.com",
    phone_number: "string",
    password: "string",
    confirm_password: "string",
    specialization: "string",
    license_number: "string",
    years_of_experience: 0,
    clinic_address: {
      street: "string",
      city: "string",
      state: "string",
      zip: "string"
    }
  };

  try {
    console.log('Testing provider registration API...');
    console.log('Request data:', registrationData);
    
    const response = await providerAPI.register(registrationData);
    
    console.log('Registration successful!');
    console.log('Response:', response);
    
    return response;
  } catch (error: any) {
    console.error('Registration failed:', error);
    
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    }
    
    throw error;
  }
};

// Example usage of the provider login API
export const testProviderLogin = async () => {
  const loginData: ProviderLoginData = {
    identifier: "string", // email or phone
    password: "string",
    remember_me: false
  };

  try {
    console.log('Testing provider login API...');
    console.log('Request data:', loginData);
    
    const response = await providerAPI.login(loginData);
    
    console.log('Login successful!');
    console.log('Response:', response);
    
    // Store the token
    localStorage.setItem('provider_token', response.access_token);
    localStorage.setItem('provider_user', JSON.stringify(response.user));
    
    return response;
  } catch (error: any) {
    console.error('Login failed:', error);
    
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    }
    
    throw error;
  }
};

// Example of how to use the patient login API in a component
export const examplePatientLoginUsage = `
// In your React component:
import { patientAPI, PatientLoginData } from './services/api';

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
`;

// Example of how to use the registration API in a component
export const exampleRegistrationUsage = `
// In your React component:
import { providerAPI, ProviderRegistrationData } from './services/api';

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
`;

// Example of how to use the API in a component
export const exampleComponentUsage = `
// In your React component:
import { providerAPI, ProviderLoginData } from './services/api';

const handleLogin = async (values: any) => {
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
`; 