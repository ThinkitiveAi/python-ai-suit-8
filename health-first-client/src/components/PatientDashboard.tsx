import React, { useState } from 'react';
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
  Divider,
  SimpleGrid,
  ActionIcon,
  Alert,
  Grid,
} from '@mantine/core';
import {
  IconCalendar,
  IconUser,
  IconHeart,
  IconFileText,
  IconClock,
  IconMapPin,
  IconPhone,
  IconMail,
  IconStar,
  IconCheck,
  IconArrowRight,
  IconBell,
  IconSettings,
  IconLogout,
  IconPlus,
  IconEye,
  IconEdit,
} from '@tabler/icons-react';

interface PatientDashboardProps {
  onLogout?: () => void;
  onNavigateToAppointmentBooking?: () => void;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ 
  onLogout, 
  onNavigateToAppointmentBooking 
}) => {
  // Mock patient data
  const patientData = {
    name: 'Emma Johnson',
    email: 'emma.johnson@example.com',
    phone: '+1 (555) 987-6543',
    avatar: null,
    memberSince: '2023',
    totalAppointments: 12,
    upcomingAppointments: 2,
    completedAppointments: 10,
  };

  const upcomingAppointments = [
    {
      id: '1',
      providerName: 'Dr. Sarah Wilson',
      specialization: 'Cardiology',
      date: '2024-01-15',
      time: '10:30 AM',
      type: 'Follow-up',
      status: 'confirmed',
    },
    {
      id: '2',
      providerName: 'Dr. Michael Johnson',
      specialization: 'Neurology',
      date: '2024-01-20',
      time: '02:00 PM',
      type: 'Consultation',
      status: 'confirmed',
    },
  ];

  const recentAppointments = [
    {
      id: '1',
      providerName: 'Dr. Emily Davis',
      specialization: 'Pediatrics',
      date: '2024-01-05',
      time: '09:00 AM',
      type: 'Check-up',
      status: 'completed',
      rating: 5,
    },
    {
      id: '2',
      providerName: 'Dr. Sarah Wilson',
      specialization: 'Cardiology',
      date: '2023-12-28',
      time: '11:00 AM',
      type: 'Follow-up',
      status: 'completed',
      rating: 4,
    },
  ];

  const getStatusBadge = (status: string) => {
    const colors = {
      confirmed: 'blue',
      completed: 'green',
      cancelled: 'red',
      pending: 'yellow',
    };
    return (
      <Badge color={colors[status as keyof typeof colors] || 'gray'} size="sm">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <IconStar
        key={i}
        size={14}
        fill={i < rating ? '#fbbf24' : 'none'}
        color="#fbbf24"
      />
    ));
  };

  const handleLogout = () => {
    localStorage.removeItem('patient_token');
    localStorage.removeItem('patient_user');
    window.location.href = '/auth/patient-login';
  };

  const handleNavigateToAppointmentBooking = () => {
    window.location.href = '/auth/patient-appointment-booking';
  };

  return (
    <Container size="xl" py={20}>
      {/* Header */}
      <Paper
        shadow="md"
        p="xl"
        radius="lg"
        mb="xl"
        style={{
          background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
          color: 'white',
        }}
      >
        <Group justify="space-between" align="center">
          <Group>
            <Avatar
              size={60}
              radius="xl"
              src={patientData.avatar}
              style={{ border: '3px solid rgba(255, 255, 255, 0.3)' }}
            >
              <IconUser size={30} />
            </Avatar>
            <Box>
              <Title order={2} c="white" fw={600}>
                Welcome back, {patientData.name}!
              </Title>
              <Text c="white" opacity={0.9} size="sm">
                Member since {patientData.memberSince}
              </Text>
              <Group gap="xs" mt="xs">
                <IconMail size={14} />
                <Text size="xs" c="white" opacity={0.8}>
                  {patientData.email}
                </Text>
              </Group>
            </Box>
          </Group>
          
          <Group>
            <Badge color="white" variant="light" size="lg">
              <IconHeart size={14} style={{ marginRight: 4 }} />
              Patient Portal
            </Badge>
            <Button
              variant="white"
              color="dark"
              size="sm"
              leftSection={<IconLogout size={16} />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* Quick Actions */}
      <Paper shadow="sm" p="lg" radius="lg" mb="xl">
        <Group justify="space-between" mb="md">
          <Title order={3} size="h5" fw={600}>
            Quick Actions
          </Title>
        </Group>
        
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
          <Button
            leftSection={<IconPlus size={18} />}
            variant="filled"
            color="pink"
            size="lg"
            radius="md"
            onClick={handleNavigateToAppointmentBooking}
            gradient={{ from: '#ec4899', to: '#be185d', deg: 135 }}
            styles={{
              root: {
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 16px rgba(236, 72, 153, 0.4)'
                }
              }
            }}
          >
            Book Appointment
          </Button>
          
          <Button
            leftSection={<IconCalendar size={18} />}
            variant="outline"
            color="blue"
            size="lg"
            radius="md"
            onClick={() => window.location.href = '/auth/appointment-listing'}
          >
            View Appointments
          </Button>
          
          <Button
            leftSection={<IconFileText size={18} />}
            variant="outline"
            color="green"
            size="lg"
            radius="md"
          >
            Medical Records
          </Button>
          
          <Button
            leftSection={<IconBell size={18} />}
            variant="outline"
            color="orange"
            size="lg"
            radius="md"
          >
            Notifications
          </Button>
        </SimpleGrid>
      </Paper>

      {/* Stats Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="xl">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between">
            <Box>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Total Appointments
              </Text>
              <Text size="xl" fw={700} c="dark.8">
                {patientData.totalAppointments}
              </Text>
            </Box>
            <Avatar color="blue" radius="md" size="lg">
              <IconCalendar size={20} />
            </Avatar>
          </Group>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between">
            <Box>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Upcoming
              </Text>
              <Text size="xl" fw={700} c="dark.8">
                {patientData.upcomingAppointments}
              </Text>
            </Box>
            <Avatar color="green" radius="md" size="lg">
              <IconClock size={20} />
            </Avatar>
          </Group>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between">
            <Box>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Completed
              </Text>
              <Text size="xl" fw={700} c="dark.8">
                {patientData.completedAppointments}
              </Text>
            </Box>
            <Avatar color="purple" radius="md" size="lg">
              <IconCheck size={20} />
            </Avatar>
          </Group>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between">
            <Box>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Health Score
              </Text>
              <Text size="xl" fw={700} c="dark.8">
                95%
              </Text>
            </Box>
            <Avatar color="teal" radius="md" size="lg">
              <IconHeart size={20} />
            </Avatar>
          </Group>
        </Card>
      </SimpleGrid>

      {/* Main Content */}
      <Grid>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          {/* Upcoming Appointments */}
          <Paper shadow="sm" p="lg" radius="lg" withBorder mb="xl">
            <Group justify="space-between" mb="md">
              <Title order={3} size="h5" fw={600}>
                Upcoming Appointments
              </Title>
              <Button size="sm" variant="light" rightSection={<IconArrowRight size={14} />}>
                View All
              </Button>
            </Group>
            
            <Stack gap="md">
              {upcomingAppointments.map((appointment) => (
                <Card
                  key={appointment.id}
                  shadow="xs"
                  padding="md"
                  radius="md"
                  withBorder
                  style={{
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#fafafa'
                  }}
                >
                  <Group justify="space-between" align="flex-start">
                    <Box>
                      <Text fw={600} size="sm" mb="xs">
                        {appointment.providerName}
                      </Text>
                      <Text size="xs" c="dimmed" mb="xs">
                        {appointment.specialization} • {appointment.type}
                      </Text>
                      <Group gap="xs" mb="xs">
                        <IconCalendar size={12} color="#6b7280" />
                        <Text size="xs" c="dimmed">
                          {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                        </Text>
                      </Group>
                    </Box>
                    
                    <Group gap="xs">
                      {getStatusBadge(appointment.status)}
                      <ActionIcon variant="subtle" size="sm" color="blue">
                        <IconEye size={14} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" size="sm" color="gray">
                        <IconEdit size={14} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Card>
              ))}
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 6 }}>
          {/* Recent Appointments */}
          <Paper shadow="sm" p="lg" radius="lg" withBorder mb="xl">
            <Group justify="space-between" mb="md">
              <Title order={3} size="h5" fw={600}>
                Recent Appointments
              </Title>
              <Button size="sm" variant="light" rightSection={<IconArrowRight size={14} />}>
                View All
              </Button>
            </Group>
            
            <Stack gap="md">
              {recentAppointments.map((appointment) => (
                <Card
                  key={appointment.id}
                  shadow="xs"
                  padding="md"
                  radius="md"
                  withBorder
                  style={{
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#fafafa'
                  }}
                >
                  <Group justify="space-between" align="flex-start">
                    <Box>
                      <Text fw={600} size="sm" mb="xs">
                        {appointment.providerName}
                      </Text>
                      <Text size="xs" c="dimmed" mb="xs">
                        {appointment.specialization} • {appointment.type}
                      </Text>
                      <Group gap="xs" mb="xs">
                        <IconCalendar size={12} color="#6b7280" />
                        <Text size="xs" c="dimmed">
                          {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                        </Text>
                      </Group>
                      <Group gap="xs">
                        {renderStars(appointment.rating)}
                        <Text size="xs" c="dimmed">
                          {appointment.rating}/5
                        </Text>
                      </Group>
                    </Box>
                    
                    <Group gap="xs">
                      {getStatusBadge(appointment.status)}
                      <ActionIcon variant="subtle" size="sm" color="blue">
                        <IconEye size={14} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Card>
              ))}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Help & Support */}
      <Paper shadow="sm" p="lg" radius="lg" withBorder>
        <Title order={3} size="h5" fw={600} mb="md">
          Need Help?
        </Title>
        
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          <Group gap="xs">
            <IconPhone size={16} color="#6b7280" />
            <Box>
              <Text size="sm" fw={500}>Call Support</Text>
              <Text size="xs" c="dimmed">+1 (555) 123-4567</Text>
            </Box>
          </Group>
          
          <Group gap="xs">
            <IconMail size={16} color="#6b7280" />
            <Box>
              <Text size="sm" fw={500}>Email Support</Text>
              <Text size="xs" c="dimmed">support@healthcare.com</Text>
            </Box>
          </Group>
          
          <Group gap="xs">
            <IconClock size={16} color="#6b7280" />
            <Box>
              <Text size="sm" fw={500}>24/7 Available</Text>
              <Text size="xs" c="dimmed">Round the clock support</Text>
            </Box>
          </Group>
        </SimpleGrid>
      </Paper>
    </Container>
  );
};

export default PatientDashboard; 