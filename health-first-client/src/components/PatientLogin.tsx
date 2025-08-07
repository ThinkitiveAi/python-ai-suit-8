import React, { useState } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Checkbox,
  Anchor,
  Stack,
  Group,
  Box,
  Center,
  Alert,
  Divider,
  BackgroundImage,
  Tooltip,
  ActionIcon,
} from '@mantine/core';
import {
  IconMail,
  IconPhone,
  IconLock,
  IconEye,
  IconEyeOff,
  IconHeart,
  IconUser,
  IconAlertCircle,
  IconCheck,
  IconShieldCheck,
  IconQuestionMark,
  IconInfoCircle,
} from '@tabler/icons-react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { patientAPI, PatientLoginData } from '../services/api';

// Validation schema for patient login
const patientLoginValidationSchema = Yup.object({
  credential: Yup.string()
    .required('Please enter your email or phone number')
    .test('email-or-phone', 'Please enter a valid email or phone number', function(value) {
      if (!value) return false;
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      // Phone validation (basic international format)
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      
      return emailRegex.test(value) || phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
    }),
  password: Yup.string()
    .required('Please enter your password')
    .min(6, 'Password should be at least 6 characters'),
  rememberMe: Yup.boolean()
});

interface PatientLoginFormValues {
  credential: string;
  password: string;
  rememberMe: boolean;
}

interface PatientLoginState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

interface PatientLoginProps {
  onNavigateToRegistration?: () => void;
  onNavigateToProviderLogin?: () => void;
}

const PatientLogin: React.FC<PatientLoginProps> = ({ 
  onNavigateToRegistration, 
  onNavigateToProviderLogin 
}) => {
  const [loginState, setLoginState] = useState<PatientLoginState>({
    isLoading: false,
    error: null,
    success: false
  });

  const initialValues: PatientLoginFormValues = {
    credential: '',
    password: '',
    rememberMe: false
  };

  const handleLogin = async (values: PatientLoginFormValues) => {
    setLoginState({ isLoading: true, error: null, success: false });
    
    try {
      // Map form values to API structure
      const loginData: PatientLoginData = {
        identifier: values.credential,
        password: values.password,
        remember_me: values.rememberMe,
        device_info: {
          app_version: "2.0.1",
          device_name: navigator.userAgent,
          device_type: "Web"
        }
      };

      // Call the API
      const response = await patientAPI.login(loginData);
      
      console.log('Patient login successful:', response);
      
      // Store the token
      localStorage.setItem('patient_token', response.access_token);
      localStorage.setItem('patient_user', JSON.stringify(response.user));
      
      setLoginState({ isLoading: false, error: null, success: true });
      
      // Redirect to patient dashboard after success
      setTimeout(() => {
        console.log('Redirecting to patient dashboard...');
        // window.location.href = '/patient-dashboard';
      }, 1500);
    } catch (error: any) {
      console.error('Patient login error:', error);
      
      let errorMessage = 'We\'re having trouble connecting right now. Please check your internet connection and try again.';
      
      // Handle specific API errors
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'We couldn\'t find an account with those details. Please check your information and try again, or contact support if you need help.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Please check your login information and try again.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Account not found. Please check your credentials or register first.';
      }
      
      setLoginState({ 
        isLoading: false, 
        error: errorMessage, 
        success: false 
      });
    }
  };

  const getCredentialIcon = (value: string) => {
    if (!value) return <IconUser size={18} />;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? <IconMail size={18} /> : <IconPhone size={18} />;
  };

  const getCredentialPlaceholder = (value: string) => {
    if (!value) return 'Enter your email or phone number';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? 'example@email.com' : '+1 (555) 123-4567';
  };

  return (
    <BackgroundImage
      src="data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e0f2fe' fill-opacity='0.3'%3E%3Cpath d='M40 40c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm20 0c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        animation: 'float 20s ease-in-out infinite',
        pointerEvents: 'none'
      }} />
      
      <Container size="sm" py={80}>
        <Center>
          <Paper
            shadow="xl"
            p={60}
            radius="xl"
            style={{
              width: '100%',
              maxWidth: 520,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Decorative elements */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%',
              opacity: 0.1,
              transform: 'rotate(45deg)'
            }} />
            
            <div style={{
              position: 'absolute',
              bottom: '-30px',
              left: '-30px',
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: '50%',
              opacity: 0.08,
              transform: 'rotate(-30deg)'
            }} />

            {/* Header Section */}
            <Stack align="center" mb={50}>
              <Box
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '50%',
                  padding: 25,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                  position: 'relative',
                  marginBottom: '20px'
                }}
              >
                <IconHeart size={40} color="white" />
                {/* Glow effect */}
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '-10px',
                  right: '-10px',
                  bottom: '-10px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '50%',
                  opacity: 0.3,
                  filter: 'blur(10px)',
                  zIndex: -1
                }} />
              </Box>
              <Title order={1} size="h1" fw={700} c="dark.8" ta="center" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Welcome Back
              </Title>
              <Text size="lg" c="dimmed" ta="center" maw={400} style={{ lineHeight: 1.6 }}>
                Sign in to access your health records, appointments, and care team
              </Text>
            </Stack>

            {/* Success State */}
            {loginState.success && (
              <Alert
                icon={<IconCheck size={20} />}
                title="Welcome back!"
                color="green"
                mb="xl"
                radius="lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  boxShadow: '0 4px 15px rgba(34, 197, 94, 0.1)'
                }}
              >
                <Text size="sm" style={{ lineHeight: 1.5 }}>
                  You're successfully signed in. Taking you to your dashboard...
                </Text>
              </Alert>
            )}

            {/* Error State */}
            {loginState.error && (
              <Alert
                icon={<IconAlertCircle size={20} />}
                title="Having trouble signing in?"
                color="orange"
                mb="xl"
                radius="lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
                  border: '1px solid rgba(251, 146, 60, 0.2)',
                  boxShadow: '0 4px 15px rgba(251, 146, 60, 0.1)'
                }}
              >
                <Text size="sm" mb="sm" style={{ lineHeight: 1.5 }}>
                  {loginState.error}
                </Text>
                <Group gap="xs">
                  <Anchor size="sm" c="orange.7" fw={600} style={{ textDecoration: 'none' }}>
                    Reset Password
                  </Anchor>
                  <Text size="sm" c="dimmed">•</Text>
                  <Anchor size="sm" c="orange.7" fw={600} style={{ textDecoration: 'none' }}>
                    Contact Support
                  </Anchor>
                </Group>
              </Alert>
            )}

            {/* Login Form */}
            <Formik
              initialValues={initialValues}
              validationSchema={patientLoginValidationSchema}
              onSubmit={handleLogin}
            >
              {({ values, errors, touched, setFieldValue }) => (
                <Form>
                  <Stack gap="xl">
                    {/* Email/Phone Input */}
                    <Field name="credential">
                      {({ field }: any) => (
                        <Box>
                          <Group gap="xs" mb="xs">
                            <Text size="sm" fw={600} c="dark.7">
                              Email or Phone Number
                            </Text>
                            <Tooltip
                              label="You can use either your email address or phone number to sign in"
                              position="top"
                              withArrow
                            >
                              <ActionIcon variant="subtle" size="xs" color="gray">
                                <IconInfoCircle size={14} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                          <TextInput
                            {...field}
                            placeholder={getCredentialPlaceholder(values.credential)}
                            leftSection={getCredentialIcon(values.credential)}
                            error={touched.credential && errors.credential}
                            disabled={loginState.isLoading || loginState.success}
                            size="lg"
                            radius="lg"
                            styles={{
                              input: {
                                borderColor: touched.credential && errors.credential ? '#f59e0b' : '#e5e7eb',
                                backgroundColor: '#fafafa',
                                fontSize: '16px',
                                fontWeight: 500,
                                transition: 'all 0.3s ease',
                                '&:focus': {
                                  borderColor: '#667eea',
                                  backgroundColor: '#ffffff',
                                  boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                                  transform: 'translateY(-1px)'
                                },
                                '&:hover': {
                                  borderColor: '#667eea',
                                  backgroundColor: '#ffffff'
                                },
                                '&::placeholder': {
                                  color: '#9ca3af',
                                  fontWeight: 400
                                }
                              },
                              leftSection: {
                                color: '#667eea'
                              }
                            }}
                          />
                          {touched.credential && !errors.credential && values.credential && (
                            <Text size="xs" c="green.6" mt="xs" style={{ fontWeight: 500 }}>
                              ✓ {values.credential.includes('@') ? 'Valid email format' : 'Valid phone format'}
                            </Text>
                          )}
                        </Box>
                      )}
                    </Field>

                    {/* Password Input */}
                    <Field name="password">
                      {({ field }: any) => (
                        <Box>
                          <Group gap="xs" mb="xs">
                            <Text size="sm" fw={600} c="dark.7">
                              Password
                            </Text>
                            <Tooltip
                              label="Your password is encrypted and secure"
                              position="top"
                              withArrow
                            >
                              <ActionIcon variant="subtle" size="xs" color="gray">
                                <IconShieldCheck size={14} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                          <PasswordInput
                            {...field}
                            placeholder="Enter your password"
                            leftSection={<IconLock size={18} />}
                            visibilityToggleIcon={({ reveal }) =>
                              reveal ? <IconEyeOff size={18} /> : <IconEye size={18} />
                            }
                            error={touched.password && errors.password}
                            disabled={loginState.isLoading || loginState.success}
                            size="lg"
                            radius="lg"
                            styles={{
                              input: {
                                borderColor: touched.password && errors.password ? '#f59e0b' : '#e5e7eb',
                                backgroundColor: '#fafafa',
                                fontSize: '16px',
                                fontWeight: 500,
                                transition: 'all 0.3s ease',
                                '&:focus': {
                                  borderColor: '#667eea',
                                  backgroundColor: '#ffffff',
                                  boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                                  transform: 'translateY(-1px)'
                                },
                                '&:hover': {
                                  borderColor: '#667eea',
                                  backgroundColor: '#ffffff'
                                },
                                '&::placeholder': {
                                  color: '#9ca3af',
                                  fontWeight: 400
                                }
                              },
                              leftSection: {
                                color: '#667eea'
                              },
                              visibilityToggle: {
                                color: '#667eea'
                              }
                            }}
                          />
                        </Box>
                      )}
                    </Field>

                    {/* Remember Me & Forgot Password */}
                    <Group justify="space-between" mt="md">
                      <Field name="rememberMe">
                        {({ field }: any) => (
                          <Group gap="xs">
                            <Checkbox
                              {...field}
                              checked={values.rememberMe}
                              onChange={(event) => setFieldValue('rememberMe', event.currentTarget.checked)}
                              disabled={loginState.isLoading || loginState.success}
                              size="sm"
                              color="blue"
                              styles={{
                                input: {
                                  backgroundColor: '#667eea',
                                  borderColor: '#667eea'
                                }
                              }}
                            />
                            <Text size="sm" c="dark.6" fw={500}>
                              Keep me signed in
                            </Text>
                            <Tooltip
                              label="We'll remember you on this device for 30 days"
                              position="top"
                              withArrow
                            >
                              <ActionIcon variant="subtle" size="xs" color="gray">
                                <IconQuestionMark size={12} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        )}
                      </Field>
                      
                      <Anchor
                        size="sm"
                        c="blue.6"
                        fw={600}
                        onClick={() => console.log('Navigate to forgot password')}
                        style={{ 
                          cursor: 'pointer',
                          textDecoration: 'none',
                          transition: 'color 0.3s ease',
                          '&:hover': {
                            color: '#4f46e5'
                          }
                        }}
                      >
                        Forgot password?
                      </Anchor>
                    </Group>

                    {/* Login Button */}
                    <Button
                      type="submit"
                      size="xl"
                      radius="lg"
                      fullWidth
                      mt="xl"
                      loading={loginState.isLoading}
                      disabled={loginState.success}
                      gradient={{ from: '#667eea', to: '#764ba2', deg: 135 }}
                      leftSection={loginState.success ? <IconCheck size={20} /> : <IconHeart size={20} />}
                      styles={{
                        root: {
                          height: '60px',
                          fontSize: '16px',
                          fontWeight: 600,
                          boxShadow: loginState.isLoading ? 'none' : '0 8px 25px rgba(102, 126, 234, 0.3)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: loginState.isLoading ? 'none' : 'translateY(-2px)',
                            boxShadow: loginState.isLoading ? 'none' : '0 12px 35px rgba(102, 126, 234, 0.4)',
                          },
                          '&:active': {
                            transform: 'translateY(0px)'
                          }
                        }
                      }}
                    >
                      {loginState.isLoading ? 'Signing you in...' : loginState.success ? 'Welcome back!' : 'Sign In to Your Account'}
                    </Button>

                    {/* Security Notice */}
                    <Center mt="lg">
                      <Group gap="xs">
                        <IconShieldCheck size={18} color="#667eea" />
                        <Text size="sm" c="dimmed" ta="center" fw={500}>
                          Your information is protected with bank-level security
                        </Text>
                      </Group>
                    </Center>

                    {/* Divider */}
                    <Divider 
                      label="New to our healthcare platform?" 
                      labelPosition="center" 
                      my="xl"
                      color="gray.3"
                    />

                    {/* Registration and Provider Links */}
                    <Stack gap="lg">
                      <Center>
                        <Text size="sm" c="dimmed" ta="center" fw={500}>
                          Don't have a patient account yet?{' '}
                          <Anchor
                            c="blue.6"
                            fw={700}
                            onClick={onNavigateToRegistration}
                            style={{ 
                              cursor: 'pointer',
                              textDecoration: 'none',
                              transition: 'color 0.3s ease',
                              '&:hover': {
                                color: '#4f46e5'
                              }
                            }}
                          >
                            Create Account
                          </Anchor>
                        </Text>
                      </Center>

                      <Center>
                        <Text size="sm" c="dimmed" ta="center" fw={500}>
                          Are you a healthcare provider?{' '}
                          <Anchor
                            c="purple.6"
                            fw={700}
                            onClick={onNavigateToProviderLogin}
                            style={{ 
                              cursor: 'pointer',
                              textDecoration: 'none',
                              transition: 'color 0.3s ease',
                              '&:hover': {
                                color: '#7c3aed'
                              }
                            }}
                          >
                            Provider Sign In
                          </Anchor>
                        </Text>
                      </Center>
                    </Stack>
                  </Stack>
                </Form>
              )}
            </Formik>

            {/* Support Section */}
            <Box mt="xl" pt="lg" style={{ 
              borderTop: '1px solid rgba(229, 231, 235, 0.5)',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%)',
              borderRadius: 'lg',
              padding: '20px'
            }}>
              <Stack gap="md">
                <Center>
                  <Text size="sm" fw={600} c="dark.6">
                    Need help signing in?
                  </Text>
                </Center>
                <Group justify="center" gap="xl">
                  <Anchor 
                    size="sm" 
                    c="gray.6" 
                    fw={500}
                    onClick={() => console.log('Navigate to help')}
                    style={{ 
                      cursor: 'pointer',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                      '&:hover': {
                        color: '#667eea'
                      }
                    }}
                  >
                    Help Center
                  </Anchor>
                  <Anchor 
                    size="sm" 
                    c="gray.6" 
                    fw={500}
                    onClick={() => console.log('Contact support')}
                    style={{ 
                      cursor: 'pointer',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                      '&:hover': {
                        color: '#667eea'
                      }
                    }}
                  >
                    Contact Support
                  </Anchor>
                  <Anchor 
                    size="sm" 
                    c="gray.6" 
                    fw={500}
                    onClick={() => console.log('Technical support')}
                    style={{ 
                      cursor: 'pointer',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                      '&:hover': {
                        color: '#667eea'
                      }
                    }}
                  >
                    Technical Issues
                  </Anchor>
                </Group>
              </Stack>
            </Box>

            {/* Footer Information */}
            <Center mt="lg">
              <Text size="xs" c="dimmed" ta="center" maw={450} style={{ lineHeight: 1.5 }}>
                By signing in, you agree to our{' '}
                <Anchor size="xs" c="dimmed" td="underline" fw={500}>Terms of Service</Anchor>
                {' '}and{' '}
                <Anchor size="xs" c="dimmed" td="underline" fw={500}>Privacy Policy</Anchor>.
                Your health information is protected under HIPAA.
              </Text>
            </Center>
          </Paper>
        </Center>
      </Container>
    </BackgroundImage>
  );
};

export default PatientLogin; 