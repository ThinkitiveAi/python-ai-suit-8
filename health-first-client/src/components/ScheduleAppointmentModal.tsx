import React, { useState } from 'react';
import {
  Modal,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Box,
  TextInput,
  Select,
  Textarea,
  NumberInput,
  Radio,
  ActionIcon,
  Divider,
  Grid,
  Badge,
} from '@mantine/core';
import {
  IconX,
  IconCalendar,
  IconUser,
  IconStethoscope,
  IconCurrencyDollar,
  IconFileText,
  IconVideo,
  IconHome,
  IconUserCheck,
} from '@tabler/icons-react';
import { DateInput, TimeInput } from '@mantine/dates';

interface ScheduleAppointmentModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (appointmentData: any) => void;
}

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Provider {
  id: string;
  name: string;
  specialization: string;
}

const ScheduleAppointmentModal: React.FC<ScheduleAppointmentModalProps> = ({
  opened,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    patientName: '',
    appointmentMode: 'in-person',
    provider: '',
    estimatedAmount: '',
    reasonForVisit: '',
    appointmentType: '',
    dateTime: null as Date | null,
  });

  // Mock data
  const patients: Patient[] = [
    { id: '1', name: 'John Doe', email: 'john.doe@email.com', phone: '+1 (555) 123-4567' },
    { id: '2', name: 'Jane Smith', email: 'jane.smith@email.com', phone: '+1 (555) 234-5678' },
    { id: '3', name: 'Mike Johnson', email: 'mike.johnson@email.com', phone: '+1 (555) 345-6789' },
  ];

  const providers: Provider[] = [
    { id: '1', name: 'Dr. Sarah Wilson', specialization: 'Cardiology' },
    { id: '2', name: 'Dr. Michael Johnson', specialization: 'Neurology' },
    { id: '3', name: 'Dr. Emily Davis', specialization: 'Pediatrics' },
  ];

  const appointmentTypes = [
    { value: 'consultation', label: 'General Consultation' },
    { value: 'followup', label: 'Follow-up Visit' },
    { value: 'emergency', label: 'Emergency Consultation' },
    { value: 'specialist', label: 'Specialist Consultation' },
    { value: 'checkup', label: 'Regular Check-up' },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
    // Reset form
    setFormData({
      patientName: '',
      appointmentMode: 'in-person',
      provider: '',
      estimatedAmount: '',
      reasonForVisit: '',
      appointmentType: '',
      dateTime: null,
    });
  };

  const isFormValid = () => {
    return (
      formData.patientName &&
      formData.provider &&
      formData.appointmentType &&
      formData.dateTime &&
      formData.estimatedAmount
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group justify="space-between" w="100%">
          <Title order={3} size="h4" fw={600}>
            Schedule New Appointment
          </Title>
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={onClose}
            size="lg"
          >
            <IconX size={20} />
          </ActionIcon>
        </Group>
      }
      size="xl"
      radius="lg"
      centered
      styles={{
        header: {
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '16px',
          marginBottom: '24px',
        },
        body: {
          padding: '24px',
        },
      }}
    >
      <Stack gap="xl">
        {/* Form Fields */}
        <Grid>
          {/* Left Column */}
          <Grid.Col span={6}>
            <Stack gap="lg">
              {/* Patient Name */}
              <Box>
                <Text size="sm" fw={500} mb="xs">
                  Patient Name
                </Text>
                <Select
                  placeholder="Search & Select Patient"
                  value={formData.patientName}
                  onChange={(value) => handleInputChange('patientName', value)}
                  data={patients.map(patient => ({
                    value: patient.id,
                    label: `${patient.name} - ${patient.email}`,
                  }))}
                  searchable
                  leftSection={<IconUser size={16} />}
                  rightSection={<IconUserCheck size={16} />}
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
              </Box>

              {/* Appointment Mode */}
              <Box>
                <Text size="sm" fw={500} mb="xs">
                  Appointment Mode
                </Text>
                <Radio.Group
                  value={formData.appointmentMode}
                  onChange={(value) => handleInputChange('appointmentMode', value)}
                >
                  <Stack gap="xs">
                    <Radio
                      value="in-person"
                      label={
                        <Group gap="xs">
                          <IconUserCheck size={16} />
                          <Text size="sm">In-Person</Text>
                        </Group>
                      }
                      color="blue"
                    />
                    <Radio
                      value="video-call"
                      label={
                        <Group gap="xs">
                          <IconVideo size={16} />
                          <Text size="sm">Video Call</Text>
                        </Group>
                      }
                      color="blue"
                    />
                    <Radio
                      value="home"
                      label={
                        <Group gap="xs">
                          <IconHome size={16} />
                          <Text size="sm">Home</Text>
                        </Group>
                      }
                      color="blue"
                    />
                  </Stack>
                </Radio.Group>
              </Box>

              {/* Provider */}
              <Box>
                <Text size="sm" fw={500} mb="xs">
                  Provider
                </Text>
                <Select
                  placeholder="Search Provider"
                  value={formData.provider}
                  onChange={(value) => handleInputChange('provider', value)}
                  data={providers.map(provider => ({
                    value: provider.id,
                    label: `${provider.name} - ${provider.specialization}`,
                  }))}
                  searchable
                  leftSection={<IconStethoscope size={16} />}
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
              </Box>

              {/* Estimated Amount */}
              <Box>
                <Text size="sm" fw={500} mb="xs">
                  Estimated Amount ($)
                </Text>
                <NumberInput
                  placeholder="Enter Amount"
                  value={formData.estimatedAmount}
                  onChange={(value) => handleInputChange('estimatedAmount', value)}
                  leftSection={<IconCurrencyDollar size={16} />}
                  min={0}
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
              </Box>

              {/* Reason for Visit */}
              <Box>
                <Text size="sm" fw={500} mb="xs">
                  Reason for Visit
                </Text>
                <Textarea
                  placeholder="Enter Reason"
                  value={formData.reasonForVisit}
                  onChange={(event) => handleInputChange('reasonForVisit', event.currentTarget.value)}
                  leftSection={<IconFileText size={16} />}
                  rows={4}
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
              </Box>
            </Stack>
          </Grid.Col>

          {/* Right Column */}
          <Grid.Col span={6}>
            <Stack gap="lg">
              {/* Appointment Type */}
              <Box>
                <Text size="sm" fw={500} mb="xs">
                  Appointment Type
                </Text>
                <Select
                  placeholder="Select Type"
                  value={formData.appointmentType}
                  onChange={(value) => handleInputChange('appointmentType', value)}
                  data={appointmentTypes}
                  leftSection={<IconFileText size={16} />}
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
              </Box>

              {/* Date & Time */}
              <Box>
                <Text size="sm" fw={500} mb="xs">
                  Date & Time
                </Text>
                <DateInput
                  placeholder="Choose Date"
                  value={formData.dateTime}
                  onChange={(date) => handleInputChange('dateTime', date)}
                  leftSection={<IconCalendar size={16} />}
                  minDate={new Date()}
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
              </Box>

              {/* Additional Information */}
              <Box>
                <Text size="sm" fw={500} mb="xs">
                  Additional Information
                </Text>
                <Box
                  p="md"
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                >
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Patient:</Text>
                      <Text size="sm" fw={500}>
                        {patients.find(p => p.id === formData.patientName)?.name || 'Not selected'}
                      </Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Provider:</Text>
                      <Text size="sm" fw={500}>
                        {providers.find(p => p.id === formData.provider)?.name || 'Not selected'}
                      </Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Mode:</Text>
                      <Badge 
                        size="sm" 
                        variant="light" 
                        color={formData.appointmentMode === 'in-person' ? 'blue' : 
                               formData.appointmentMode === 'video-call' ? 'green' : 'orange'}
                      >
                        {formData.appointmentMode === 'in-person' ? 'In-Person' :
                         formData.appointmentMode === 'video-call' ? 'Video Call' : 'Home'}
                      </Badge>
                    </Group>
                  </Stack>
                </Box>
              </Box>
            </Stack>
          </Grid.Col>
        </Grid>

        <Divider />

        {/* Footer Actions */}
        <Group justify="flex-end" gap="md">
          <Button
            variant="outline"
            onClick={onClose}
            size="md"
            radius="md"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isFormValid()}
            size="md"
            radius="md"
            gradient={{ from: '#667eea', to: '#764ba2', deg: 135 }}
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
            Save & Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default ScheduleAppointmentModal; 