import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Box,
  Card,
  Badge,
  Avatar,
  Select,
  TextInput,
  Textarea,
  Divider,
  SimpleGrid,
  ActionIcon,
  Alert,
  Modal,
  Checkbox,
  Progress,
  Stepper,
  Grid,
  Image,
  Chip,
  ScrollArea,
  Tabs,
  List,
  ThemeIcon,
  BackgroundImage,
  Center,
} from '@mantine/core';
import {
  IconCalendar,
  IconUser,
  IconStethoscope,
  IconClock,
  IconMapPin,
  IconPhone,
  IconMail,
  IconStar,
  IconCheck,
  IconArrowLeft,
  IconArrowRight,
  IconCalendarEvent,
  IconFileText,
  IconCreditCard,
  IconShieldCheck,
  IconHeart,
  IconClockHour4,
  IconLocation,
  IconInfoCircle,
  IconAlertCircle,
  IconX,
  IconPlus,
  IconMinus,
  IconSearch,
  IconFilter,
  IconSortAscending,
} from '@tabler/icons-react';
import { DateInput, TimeInput } from '@mantine/dates';

interface Provider {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  experience: string;
  location: string;
  phone: string;
  email: string;
  avatar: string | null;
  availableSlots: TimeSlot[];
  consultationFee: number;
  nextAvailable: string;
  languages: string[];
  education: string;
  certifications: string[];
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  selected?: boolean;
}

interface AppointmentType {
  value: string;
  label: string;
  duration: number;
  description: string;
  price: number;
  icon: React.ReactNode;
}

interface PatientAppointmentBookingProps {
  onBack?: () => void;
  onConfirm?: (bookingData: any) => void;
}

const PatientAppointmentBooking: React.FC<PatientAppointmentBookingProps> = ({ 
  onBack, 
  onConfirm 
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedAppointmentType, setSelectedAppointmentType] = useState<string>('');
  const [patientNotes, setPatientNotes] = useState('');
  const [showProviderDetails, setShowProviderDetails] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');

  // Mock data
  const providers: Provider[] = [
    {
      id: '1',
      name: 'Dr. Sarah Wilson',
      specialization: 'Cardiology',
      rating: 4.8,
      experience: '15 years',
      location: 'Medical Center, Floor 3',
      phone: '+1 (555) 123-4567',
      email: 'sarah.wilson@healthcare.com',
      avatar: null,
      consultationFee: 150,
      nextAvailable: 'Today, 2:30 PM',
      languages: ['English', 'Spanish'],
      education: 'Harvard Medical School',
      certifications: ['Board Certified Cardiologist', 'Fellow of American College of Cardiology'],
      availableSlots: [
        { id: '1', time: '09:00 AM', available: true },
        { id: '2', time: '10:30 AM', available: true },
        { id: '3', time: '02:00 PM', available: false },
        { id: '4', time: '03:30 PM', available: true },
        { id: '5', time: '04:00 PM', available: true },
      ]
    },
    {
      id: '2',
      name: 'Dr. Michael Johnson',
      specialization: 'Neurology',
      rating: 4.9,
      experience: '12 years',
      location: 'Medical Center, Floor 2',
      phone: '+1 (555) 234-5678',
      email: 'michael.johnson@healthcare.com',
      avatar: null,
      consultationFee: 180,
      nextAvailable: 'Tomorrow, 9:00 AM',
      languages: ['English', 'French'],
      education: 'Johns Hopkins University',
      certifications: ['Board Certified Neurologist', 'Member of American Academy of Neurology'],
      availableSlots: [
        { id: '1', time: '09:00 AM', available: true },
        { id: '2', time: '11:00 AM', available: true },
        { id: '3', time: '01:30 PM', available: true },
        { id: '4', time: '03:00 PM', available: true },
      ]
    },
    {
      id: '3',
      name: 'Dr. Emily Davis',
      specialization: 'Pediatrics',
      rating: 4.7,
      experience: '8 years',
      location: 'Medical Center, Floor 1',
      phone: '+1 (555) 345-6789',
      email: 'emily.davis@healthcare.com',
      avatar: null,
      consultationFee: 120,
      nextAvailable: 'Today, 4:30 PM',
      languages: ['English', 'German'],
      education: 'Stanford University',
      certifications: ['Board Certified Pediatrician', 'Member of American Academy of Pediatrics'],
      availableSlots: [
        { id: '1', time: '09:30 AM', available: true },
        { id: '2', time: '10:00 AM', available: true },
        { id: '3', time: '02:30 PM', available: true },
        { id: '4', time: '04:30 PM', available: true },
      ]
    }
  ];

  const appointmentTypes: AppointmentType[] = [
    {
      value: 'consultation',
      label: 'General Consultation',
      duration: 30,
      description: 'Standard consultation for general health concerns',
      price: 120,
      icon: <IconUser size={20} />
    },
    {
      value: 'followup',
      label: 'Follow-up Visit',
      duration: 20,
      description: 'Follow-up appointment for ongoing treatment',
      price: 80,
      icon: <IconCalendar size={20} />
    },
    {
      value: 'emergency',
      label: 'Emergency Consultation',
      duration: 45,
      description: 'Urgent care consultation for immediate concerns',
      price: 200,
      icon: <IconAlertCircle size={20} />
    },
    {
      value: 'specialist',
      label: 'Specialist Consultation',
      duration: 60,
      description: 'Specialized consultation with detailed examination',
      price: 250,
      icon: <IconStethoscope size={20} />
    }
  ];

  const specializations = [
    'All Specializations',
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'Dermatology',
    'Orthopedics',
    'Psychiatry',
    'Oncology'
  ];

  const steps = [
    { label: 'Select Provider', description: 'Choose your healthcare provider' },
    { label: 'Select Date & Time', description: 'Pick your preferred appointment slot' },
    { label: 'Appointment Details', description: 'Confirm appointment information' },
    { label: 'Confirmation', description: 'Review and confirm booking' }
  ];

  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider(provider);
    setActiveStep(1);
  };

  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    if (timeSlot.available) {
      setSelectedTime(timeSlot.time);
    }
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    } else {
      // If we're on the first step, go back to patient dashboard
      window.location.href = '/auth/patient-dashboard';
    }
  };

  const handleConfirmBooking = () => {
    const bookingData = {
      provider: selectedProvider,
      date: selectedDate,
      time: selectedTime,
      appointmentType: appointmentTypes.find(type => type.value === selectedAppointmentType),
      notes: patientNotes,
      totalAmount: appointmentTypes.find(type => type.value === selectedAppointmentType)?.price || 0
    };
    
    console.log('Booking confirmed:', bookingData);
    onConfirm?.(bookingData);
    setShowConfirmation(true);
  };

  const getSelectedAppointmentType = () => {
    return appointmentTypes.find(type => type.value === selectedAppointmentType);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <IconStar
        key={i}
        size={16}
        fill={i < Math.floor(rating) ? '#fbbf24' : 'none'}
        color="#fbbf24"
      />
    ));
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialization = selectedSpecialization === 'All Specializations' || 
                                 provider.specialization === selectedSpecialization;
    return matchesSearch && matchesSpecialization;
  });

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
      <Container size="xl" py={20}>
        {/* Header */}
        <Paper
          shadow="md"
          p="xl"
          radius="lg"
          mb="xl"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          <Group justify="space-between" align="center">
            <Group>
              <ActionIcon
                variant="white"
                color="dark"
                size="lg"
                onClick={onBack || handleBack}
                style={{ 
                  color: 'white',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                <IconArrowLeft size={20} />
              </ActionIcon>
              <Box>
                <Title order={2} c="dark.8" fw={600}>
                  Book Appointment
                </Title>
                <Text c="dimmed" size="sm">
                  Schedule your healthcare appointment
                </Text>
              </Box>
            </Group>
            
            <Group>
              <Badge 
                color="blue" 
                variant="light" 
                size="lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                  border: '1px solid rgba(102, 126, 234, 0.2)'
                }}
              >
                <IconCalendar size={14} style={{ marginRight: 4 }} />
                Step {activeStep + 1} of {steps.length}
              </Badge>
            </Group>
          </Group>
        </Paper>

        {/* Progress Stepper */}
        <Paper 
          shadow="sm" 
          p="lg" 
          radius="lg" 
          mb="xl"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          <Stepper active={activeStep} size="sm">
            {steps.map((step, index) => (
              <Stepper.Step key={index} label={step.label} description={step.description} />
            ))}
          </Stepper>
        </Paper>

        {/* Main Content */}
        <Grid>
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Paper 
              shadow="md" 
              radius="lg" 
              p="xl"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              {/* Step 1: Provider Selection */}
              {activeStep === 0 && (
                <Stack gap="xl">
                  <Box>
                    <Title order={3} size="h4" fw={600} mb="md">
                      Select Your Healthcare Provider
                    </Title>
                    <Text c="dimmed" size="sm" mb="xl">
                      Choose from our qualified healthcare professionals
                    </Text>
                  </Box>

                  {/* Search and Filter */}
                  <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                    <TextInput
                      placeholder="Search by name or specialization..."
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.currentTarget.value)}
                      leftSection={<IconSearch size={16} />}
                      size="md"
                      radius="md"
                      styles={{
                        input: {
                          borderColor: '#e5e7eb',
                          backgroundColor: '#fafafa',
                          '&:focus': {
                            borderColor: '#667eea',
                            backgroundColor: '#ffffff',
                            boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                          }
                        }
                      }}
                    />
                    <Select
                      placeholder="Filter by specialization"
                      value={selectedSpecialization}
                      onChange={(value) => setSelectedSpecialization(value || '')}
                      data={specializations}
                      leftSection={<IconFilter size={16} />}
                      size="md"
                      radius="md"
                      styles={{
                        input: {
                          borderColor: '#e5e7eb',
                          backgroundColor: '#fafafa',
                          '&:focus': {
                            borderColor: '#667eea',
                            backgroundColor: '#ffffff',
                            boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                          }
                        }
                      }}
                    />
                  </SimpleGrid>
                  
                  <Stack gap="md">
                    {filteredProviders.map((provider) => (
                      <Card
                        key={provider.id}
                        shadow="sm"
                        padding="xl"
                        radius="lg"
                        withBorder
                        style={{
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          border: selectedProvider?.id === provider.id ? '2px solid #667eea' : '1px solid #e2e8f0',
                          backgroundColor: selectedProvider?.id === provider.id ? 'rgba(102, 126, 234, 0.05)' : '#ffffff',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
                          }
                        }}
                        onClick={() => setSelectedProvider(provider)}
                      >
                        <Group justify="space-between" align="flex-start">
                          <Group>
                            <Avatar
                              size={80}
                              radius="xl"
                              src={provider.avatar}
                              style={{ 
                                border: '3px solid #e2e8f0',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                              }}
                            >
                              <IconUser size={40} color="white" />
                            </Avatar>
                            <Box>
                              <Title order={4} size="h5" fw={600} mb="xs">
                                {provider.name}
                              </Title>
                              <Text size="sm" c="dimmed" mb="xs">
                                {provider.specialization} • {provider.experience} experience
                              </Text>
                              <Group gap="xs" mb="xs">
                                {renderStars(provider.rating)}
                                <Text size="sm" fw={500}>
                                  {provider.rating}
                                </Text>
                              </Group>
                              <Group gap="md">
                                <Group gap="xs">
                                  <IconMapPin size={14} color="#6b7280" />
                                  <Text size="xs" c="dimmed">
                                    {provider.location}
                                  </Text>
                                </Group>
                                <Group gap="xs">
                                  <IconClock size={14} color="#6b7280" />
                                  <Text size="xs" c="dimmed">
                                    Next: {provider.nextAvailable}
                                  </Text>
                                </Group>
                              </Group>
                              <Group gap="xs" mt="xs">
                                {provider.languages.map((lang, index) => (
                                  <Badge key={index} size="xs" variant="light" color="blue">
                                    {lang}
                                  </Badge>
                                ))}
                              </Group>
                            </Box>
                          </Group>
                          
                          <Group>
                            <Box ta="right">
                              <Text size="lg" fw={700} c="blue">
                                ${provider.consultationFee}
                              </Text>
                              <Text size="xs" c="dimmed">
                                per consultation
                              </Text>
                            </Box>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProvider(provider);
                                setShowProviderDetails(true);
                              }}
                            >
                              View Details
                            </Button>
                            {selectedProvider?.id === provider.id && (
                              <ActionIcon color="blue" variant="filled" size="lg">
                                <IconCheck size={20} />
                              </ActionIcon>
                            )}
                          </Group>
                        </Group>
                      </Card>
                    ))}
                  </Stack>
                </Stack>
              )}

              {/* Step 2: Date & Time Selection */}
              {activeStep === 1 && selectedProvider && (
                <Stack gap="xl">
                  <Box>
                    <Title order={3} size="h4" fw={600} mb="md">
                      Select Date & Time
                    </Title>
                    <Text c="dimmed" size="sm" mb="xl">
                      Choose your preferred appointment slot with {selectedProvider.name}
                    </Text>
                  </Box>
                  
                  <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
                    {/* Date Selection */}
                    <Box>
                      <Text size="sm" fw={500} mb="md">
                        Select Date
                      </Text>
                      <DateInput
                        value={selectedDate}
                        onChange={(date) => setSelectedDate(date as Date | null)}
                        placeholder="Pick a date"
                        leftSection={<IconCalendar size={16} />}
                        minDate={new Date()}
                        maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 30 days from now
                        size="md"
                        radius="md"
                        styles={{
                          input: {
                            borderColor: '#e5e7eb',
                            backgroundColor: '#fafafa',
                            fontSize: '16px',
                            fontWeight: 500,
                            '&:focus': {
                              borderColor: '#667eea',
                              backgroundColor: '#ffffff',
                              boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                            }
                          }
                        }}
                      />
                    </Box>

                    {/* Time Selection */}
                    <Box>
                      <Text size="sm" fw={500} mb="md">
                        Available Time Slots
                      </Text>
                      <SimpleGrid cols={2} spacing="sm">
                        {selectedProvider.availableSlots.map((slot) => (
                          <Button
                            key={slot.id}
                            variant={selectedTime === slot.time ? "filled" : "outline"}
                            color={slot.available ? "blue" : "gray"}
                            disabled={!slot.available}
                            onClick={() => handleTimeSlotSelect(slot)}
                            size="sm"
                            radius="md"
                            style={{
                              opacity: slot.available ? 1 : 0.5,
                              cursor: slot.available ? 'pointer' : 'not-allowed'
                            }}
                          >
                            {slot.time}
                          </Button>
                        ))}
                      </SimpleGrid>
                    </Box>
                  </SimpleGrid>
                </Stack>
              )}

              {/* Step 3: Appointment Details */}
              {activeStep === 2 && (
                <Stack gap="xl">
                  <Box>
                    <Title order={3} size="h4" fw={600} mb="md">
                      Appointment Details
                    </Title>
                    <Text c="dimmed" size="sm" mb="xl">
                      Choose appointment type and add any notes
                    </Text>
                  </Box>
                  
                  <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
                    {/* Appointment Type Selection */}
                    <Box>
                      <Text size="sm" fw={500} mb="md">
                        Appointment Type
                      </Text>
                      <Stack gap="md">
                        {appointmentTypes.map((type) => (
                          <Card
                            key={type.value}
                            shadow="sm"
                            padding="lg"
                            radius="md"
                            withBorder
                            style={{
                              cursor: 'pointer',
                              border: selectedAppointmentType === type.value ? '2px solid #667eea' : '1px solid #e2e8f0',
                              backgroundColor: selectedAppointmentType === type.value ? 'rgba(102, 126, 234, 0.05)' : '#ffffff',
                            }}
                            onClick={() => setSelectedAppointmentType(type.value)}
                          >
                            <Group justify="space-between">
                              <Group>
                                <Box
                                  style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: '50%',
                                    padding: 12,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  {React.cloneElement(type.icon as React.ReactElement, { color: 'white' })}
                                </Box>
                                <Box>
                                  <Text fw={600} size="sm" mb="xs">
                                    {type.label}
                                  </Text>
                                  <Text size="xs" c="dimmed" mb="xs">
                                    {type.description}
                                  </Text>
                                  <Text size="xs" c="dimmed">
                                    Duration: {type.duration} minutes
                                  </Text>
                                </Box>
                              </Group>
                              <Text fw={600} size="lg" c="blue">
                                ${type.price}
                              </Text>
                            </Group>
                          </Card>
                        ))}
                      </Stack>
                    </Box>

                    {/* Patient Notes */}
                    <Box>
                      <Text size="sm" fw={500} mb="md">
                        Additional Notes (Optional)
                      </Text>
                      <Textarea
                        value={patientNotes}
                        onChange={(event) => setPatientNotes(event.currentTarget.value)}
                        placeholder="Describe your symptoms or any specific concerns..."
                        rows={6}
                        size="md"
                        radius="md"
                        styles={{
                          input: {
                            borderColor: '#e5e7eb',
                            backgroundColor: '#fafafa',
                            fontSize: '16px',
                            '&:focus': {
                              borderColor: '#667eea',
                              backgroundColor: '#ffffff',
                              boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                            }
                          }
                        }}
                      />
                    </Box>
                  </SimpleGrid>
                </Stack>
              )}

              {/* Step 4: Confirmation */}
              {activeStep === 3 && (
                <Stack gap="xl">
                  <Box>
                    <Title order={3} size="h4" fw={600} mb="md">
                      Confirm Your Appointment
                    </Title>
                    <Text c="dimmed" size="sm" mb="xl">
                      Review all details before confirming your booking
                    </Text>
                  </Box>
                  
                  <Card shadow="sm" padding="xl" radius="lg" withBorder>
                    <Stack gap="lg">
                      {/* Provider Info */}
                      <Group>
                        <Avatar size={60} radius="xl" src={selectedProvider?.avatar}>
                          <IconUser size={30} />
                        </Avatar>
                        <Box>
                          <Title order={4} size="h5" fw={600}>
                            {selectedProvider?.name}
                          </Title>
                          <Text size="sm" c="dimmed">
                            {selectedProvider?.specialization}
                          </Text>
                        </Box>
                      </Group>

                      <Divider />

                      {/* Appointment Details */}
                      <SimpleGrid cols={2} spacing="md">
                        <Box>
                          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                            Date & Time
                          </Text>
                          <Text size="sm" fw={500}>
                            {selectedDate?.toLocaleDateString()} at {selectedTime}
                          </Text>
                        </Box>
                        <Box>
                          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                            Appointment Type
                          </Text>
                          <Text size="sm" fw={500}>
                            {getSelectedAppointmentType()?.label}
                          </Text>
                        </Box>
                        <Box>
                          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                            Duration
                          </Text>
                          <Text size="sm" fw={500}>
                            {getSelectedAppointmentType()?.duration} minutes
                          </Text>
                        </Box>
                        <Box>
                          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                            Location
                          </Text>
                          <Text size="sm" fw={500}>
                            {selectedProvider?.location}
                          </Text>
                        </Box>
                      </SimpleGrid>

                      {patientNotes && (
                        <>
                          <Divider />
                          <Box>
                            <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">
                              Notes
                            </Text>
                            <Text size="sm">
                              {patientNotes}
                            </Text>
                          </Box>
                        </>
                      )}

                      <Divider />

                      {/* Total */}
                      <Group justify="space-between">
                        <Text size="lg" fw={600}>
                          Total Amount
                        </Text>
                        <Text size="xl" fw={700} c="blue">
                          ${getSelectedAppointmentType()?.price || 0}
                        </Text>
                      </Group>
                    </Stack>
                  </Card>
                </Stack>
              )}

              {/* Navigation Buttons */}
              <Group justify="space-between" mt="xl">
                <Button
                  variant="outline"
                  leftSection={<IconArrowLeft size={16} />}
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  size="md"
                  radius="md"
                >
                  Back
                </Button>
                
                <Button
                  rightSection={<IconArrowRight size={16} />}
                  onClick={handleNext}
                  disabled={
                    (activeStep === 0 && !selectedProvider) ||
                    (activeStep === 1 && (!selectedDate || !selectedTime)) ||
                    (activeStep === 2 && !selectedAppointmentType)
                  }
                  gradient={{ from: '#667eea', to: '#764ba2', deg: 135 }}
                  size="md"
                  radius="md"
                  styles={{
                    root: {
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)'
                      }
                    }
                  }}
                >
                  {activeStep === steps.length - 1 ? 'Confirm Booking' : 'Next'}
                </Button>
              </Group>
            </Paper>
          </Grid.Col>

          {/* Sidebar */}
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Stack gap="md">
              {/* Booking Summary */}
              <Paper 
                shadow="sm" 
                p="lg" 
                radius="lg" 
                withBorder
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                <Title order={4} size="h5" fw={600} mb="md">
                  Booking Summary
                </Title>
                
                <Stack gap="sm">
                  {selectedProvider && (
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Provider</Text>
                      <Text size="sm" fw={500}>{selectedProvider.name}</Text>
                    </Group>
                  )}
                  
                  {selectedDate && (
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Date</Text>
                      <Text size="sm" fw={500}>{selectedDate.toLocaleDateString()}</Text>
                    </Group>
                  )}
                  
                  {selectedTime && (
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Time</Text>
                      <Text size="sm" fw={500}>{selectedTime}</Text>
                    </Group>
                  )}
                  
                  {getSelectedAppointmentType() && (
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Type</Text>
                      <Text size="sm" fw={500}>{getSelectedAppointmentType()?.label}</Text>
                    </Group>
                  )}
                  
                  <Divider />
                  
                  <Group justify="space-between">
                    <Text size="lg" fw={600}>Total</Text>
                    <Text size="lg" fw={700} c="blue">
                      ${getSelectedAppointmentType()?.price || 0}
                    </Text>
                  </Group>
                </Stack>
              </Paper>

              {/* Help & Support */}
              <Paper 
                shadow="sm" 
                p="lg" 
                radius="lg" 
                withBorder
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                <Title order={4} size="h5" fw={600} mb="md">
                  Need Help?
                </Title>
                
                <Stack gap="sm">
                  <Group gap="xs">
                    <IconPhone size={16} color="#6b7280" />
                    <Text size="sm">Call: +1 (555) 123-4567</Text>
                  </Group>
                  <Group gap="xs">
                    <IconMail size={16} color="#6b7280" />
                    <Text size="sm">support@healthcare.com</Text>
                  </Group>
                  <Group gap="xs">
                    <IconClock size={16} color="#6b7280" />
                    <Text size="sm">24/7 Support Available</Text>
                  </Group>
                </Stack>
              </Paper>
            </Stack>
          </Grid.Col>
        </Grid>

        {/* Provider Details Modal */}
        <Modal
          opened={showProviderDetails}
          onClose={() => setShowProviderDetails(false)}
          title="Provider Details"
          size="lg"
          radius="lg"
        >
          {selectedProvider && (
            <Stack gap="lg">
              <Group>
                <Avatar size={100} radius="xl" src={selectedProvider.avatar}>
                  <IconUser size={50} />
                </Avatar>
                <Box>
                  <Title order={3} size="h4" fw={600}>
                    {selectedProvider.name}
                  </Title>
                  <Text size="sm" c="dimmed" mb="xs">
                    {selectedProvider.specialization}
                  </Text>
                  <Group gap="xs" mb="xs">
                    {renderStars(selectedProvider.rating)}
                    <Text size="sm" fw={500}>
                      {selectedProvider.rating} ({selectedProvider.experience} experience)
                    </Text>
                  </Group>
                </Box>
              </Group>

              <Divider />

              <SimpleGrid cols={2} spacing="md">
                <Box>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">
                    Contact
                  </Text>
                  <Stack gap="xs">
                    <Group gap="xs">
                      <IconPhone size={14} color="#6b7280" />
                      <Text size="sm">{selectedProvider.phone}</Text>
                    </Group>
                    <Group gap="xs">
                      <IconMail size={14} color="#6b7280" />
                      <Text size="sm">{selectedProvider.email}</Text>
                    </Group>
                  </Stack>
                </Box>
                
                <Box>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">
                    Location
                  </Text>
                  <Group gap="xs">
                    <IconMapPin size={14} color="#6b7280" />
                    <Text size="sm">{selectedProvider.location}</Text>
                  </Group>
                </Box>
              </SimpleGrid>

              <Box>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">
                  Education & Certifications
                </Text>
                <Stack gap="xs">
                  <Text size="sm" fw={500}>{selectedProvider.education}</Text>
                  {selectedProvider.certifications.map((cert, index) => (
                    <Text key={index} size="sm" c="dimmed">• {cert}</Text>
                  ))}
                </Stack>
              </Box>

              <Group justify="flex-end">
                <Button
                  variant="outline"
                  onClick={() => setShowProviderDetails(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowProviderDetails(false);
                    setActiveStep(1);
                  }}
                >
                  Select This Provider
                </Button>
              </Group>
            </Stack>
          )}
        </Modal>

        {/* Confirmation Modal */}
        <Modal
          opened={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          title="Booking Confirmed!"
          size="md"
          radius="lg"
        >
          <Stack gap="lg" align="center">
            <Box
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '50%',
                padding: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconCheck size={40} color="white" />
            </Box>
            
            <Box ta="center">
              <Title order={3} size="h4" fw={600} mb="xs">
                Appointment Booked Successfully!
              </Title>
              <Text size="sm" c="dimmed">
                You will receive a confirmation email with appointment details.
              </Text>
            </Box>

            <Button
              fullWidth
              onClick={() => setShowConfirmation(false)}
              gradient={{ from: '#10b981', to: '#059669', deg: 135 }}
            >
              Done
            </Button>
          </Stack>
        </Modal>
      </Container>
    </BackgroundImage>
  );
};

export default PatientAppointmentBooking; 