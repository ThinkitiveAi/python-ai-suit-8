import React, { useState } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  Tabs,
  Stack,
  Group,
  Box,
  Card,
  Badge,
  Avatar,
  Button,
  Divider,
  SimpleGrid,
  ActionIcon,
  Alert,
} from '@mantine/core';
import {
  IconCalendar,
  IconUser,
  IconStethoscope,
  IconSettings,
  IconChartBar,
  IconUsers,
  IconFileText,
  IconBell,
  IconLogout,
  IconPlus,
  IconEdit,
  IconTrash,
  IconEye,
  IconClock,
  IconMapPin,
  IconPhone,
  IconMail,
} from '@tabler/icons-react';
import ProviderAvailability from './ProviderAvailability';

interface ProviderDashboardProps {
  onLogout?: () => void;
}

const ProviderDashboard: React.FC<ProviderDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<string | null>('overview');

  // Mock data for dashboard
  const providerData = {
    name: 'Dr. Sarah Wilson',
    specialization: 'Cardiology',
    email: 'sarah.wilson@healthcare.com',
    phone: '+1 (555) 123-4567',
    location: 'Medical Center, Floor 3',
    avatar: null,
    status: 'online',
    totalPatients: 247,
    todayAppointments: 8,
    pendingReports: 3,
    upcomingAppointments: 12,
  };

  const recentAppointments = [
    {
      id: '1',
      patientName: 'John Smith',
      time: '09:00 AM',
      type: 'Follow-up',
      status: 'confirmed',
    },
    {
      id: '2',
      patientName: 'Emma Johnson',
      time: '10:30 AM',
      type: 'Initial Consultation',
      status: 'confirmed',
    },
    {
      id: '3',
      patientName: 'Michael Brown',
      time: '02:00 PM',
      type: 'Emergency',
      status: 'pending',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'green';
      case 'pending': return 'yellow';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      confirmed: 'green',
      pending: 'yellow',
      cancelled: 'red',
    };
    return (
      <Badge color={colors[status as keyof typeof colors] || 'gray'} size="sm">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Group justify="space-between" align="center">
          <Group>
            <Avatar
              size={60}
              radius="xl"
              src={providerData.avatar}
              style={{ border: '3px solid rgba(255, 255, 255, 0.3)' }}
            >
              <IconUser size={30} />
            </Avatar>
            <Box>
              <Title order={2} c="white" fw={600}>
                {providerData.name}
              </Title>
              <Text c="white" opacity={0.9} size="sm">
                {providerData.specialization}
              </Text>
              <Group gap="xs" mt="xs">
                <IconMapPin size={14} />
                <Text size="xs" c="white" opacity={0.8}>
                  {providerData.location}
                </Text>
              </Group>
            </Box>
          </Group>
          
          <Group>
            <Badge color="green" variant="light" size="lg">
              <IconStethoscope size={14} style={{ marginRight: 4 }} />
              {providerData.status}
            </Badge>
            <Button
              variant="white"
              color="dark"
              size="sm"
              leftSection={<IconLogout size={16} />}
              onClick={onLogout}
            >
              Logout
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* Main Content */}
      <Paper shadow="md" radius="lg" style={{ overflow: 'hidden' }}>
        <Tabs value={activeTab} onChange={setActiveTab} variant="pills">
          <Tabs.List style={{ 
            background: '#f8fafc', 
            borderBottom: '1px solid #e2e8f0',
            padding: '0 24px'
          }}>
            <Tabs.Tab 
              value="overview" 
              leftSection={<IconChartBar size={16} />}
              style={{ fontWeight: 500 }}
            >
              Overview
            </Tabs.Tab>
            <Tabs.Tab 
              value="availability" 
              leftSection={<IconCalendar size={16} />}
              style={{ fontWeight: 500 }}
            >
              Availability
            </Tabs.Tab>
            <Tabs.Tab 
              value="appointments" 
              leftSection={<IconUsers size={16} />}
              style={{ fontWeight: 500 }}
            >
              Appointments
            </Tabs.Tab>
            <Tabs.Tab 
              value="patients" 
              leftSection={<IconUser size={16} />}
              style={{ fontWeight: 500 }}
            >
              Patients
            </Tabs.Tab>
            <Tabs.Tab 
              value="reports" 
              leftSection={<IconFileText size={16} />}
              style={{ fontWeight: 500 }}
            >
              Reports
            </Tabs.Tab>
            <Tabs.Tab 
              value="settings" 
              leftSection={<IconSettings size={16} />}
              style={{ fontWeight: 500 }}
            >
              Settings
            </Tabs.Tab>
          </Tabs.List>

          <Box p="xl">
            {/* Overview Tab */}
            <Tabs.Panel value="overview">
              <Stack gap="xl">
                {/* Stats Cards */}
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Group justify="space-between">
                      <Box>
                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                          Total Patients
                        </Text>
                        <Text size="xl" fw={700} c="dark.8">
                          {providerData.totalPatients}
                        </Text>
                      </Box>
                      <Avatar color="blue" radius="md" size="lg">
                        <IconUser size={20} />
                      </Avatar>
                    </Group>
                  </Card>

                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Group justify="space-between">
                      <Box>
                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                          Today's Appointments
                        </Text>
                        <Text size="xl" fw={700} c="dark.8">
                          {providerData.todayAppointments}
                        </Text>
                      </Box>
                      <Avatar color="green" radius="md" size="lg">
                        <IconCalendar size={20} />
                      </Avatar>
                    </Group>
                  </Card>

                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Group justify="space-between">
                      <Box>
                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                          Pending Reports
                        </Text>
                        <Text size="xl" fw={700} c="dark.8">
                          {providerData.pendingReports}
                        </Text>
                      </Box>
                      <Avatar color="orange" radius="md" size="lg">
                        <IconFileText size={20} />
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
                          {providerData.upcomingAppointments}
                        </Text>
                      </Box>
                      <Avatar color="purple" radius="md" size="lg">
                        <IconClock size={20} />
                      </Avatar>
                    </Group>
                  </Card>
                </SimpleGrid>

                {/* Recent Appointments */}
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Group justify="space-between" mb="md">
                    <Title order={3} size="h5" fw={600}>
                      Recent Appointments
                    </Title>
                    <Button size="sm" variant="light" leftSection={<IconPlus size={14} />}>
                      View All
                    </Button>
                  </Group>
                  
                  <Stack gap="md">
                    {recentAppointments.map((appointment) => (
                      <Group key={appointment.id} justify="space-between" p="md" style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        backgroundColor: '#fafafa'
                      }}>
                        <Group>
                          <Avatar color="blue" radius="xl" size="md">
                            {appointment.patientName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Text fw={600} size="sm">
                              {appointment.patientName}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {appointment.type} • {appointment.time}
                            </Text>
                          </Box>
                        </Group>
                        
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
                    ))}
                  </Stack>
                </Card>
              </Stack>
            </Tabs.Panel>

            {/* Availability Tab */}
            <Tabs.Panel value="availability">
              <ProviderAvailability 
                onClose={() => setActiveTab('overview')}
                onSave={(data) => {
                  console.log('Availability saved:', data);
                  // Handle save logic here
                }}
              />
            </Tabs.Panel>

            {/* Appointments Tab */}
            <Tabs.Panel value="appointments">
              <Stack gap="lg">
                <Group justify="space-between">
                  <Title order={3} size="h4" fw={600}>
                    Appointments
                  </Title>
                  <Button leftSection={<IconPlus size={16} />}>
                    New Appointment
                  </Button>
                </Group>
                
                <Alert icon={<IconBell size={16} />} title="Appointments Management" color="blue">
                  Appointment management interface will be implemented here.
                </Alert>
              </Stack>
            </Tabs.Panel>

            {/* Patients Tab */}
            <Tabs.Panel value="patients">
              <Stack gap="lg">
                <Group justify="space-between">
                  <Title order={3} size="h4" fw={600}>
                    Patients
                  </Title>
                  <Button leftSection={<IconPlus size={16} />}>
                    Add Patient
                  </Button>
                </Group>
                
                <Alert icon={<IconUser size={16} />} title="Patient Management" color="green">
                  Patient management interface will be implemented here.
                </Alert>
              </Stack>
            </Tabs.Panel>

            {/* Reports Tab */}
            <Tabs.Panel value="reports">
              <Stack gap="lg">
                <Group justify="space-between">
                  <Title order={3} size="h4" fw={600}>
                    Reports
                  </Title>
                  <Button leftSection={<IconFileText size={16} />}>
                    Generate Report
                  </Button>
                </Group>
                
                <Alert icon={<IconChartBar size={16} />} title="Reports & Analytics" color="orange">
                  Reports and analytics interface will be implemented here.
                </Alert>
              </Stack>
            </Tabs.Panel>

            {/* Settings Tab */}
            <Tabs.Panel value="settings">
              <Stack gap="lg">
                <Title order={3} size="h4" fw={600}>
                  Settings
                </Title>
                
                <Alert icon={<IconSettings size={16} />} title="Account Settings" color="gray">
                  Account settings and preferences will be implemented here.
                </Alert>
              </Stack>
            </Tabs.Panel>
          </Box>
        </Tabs>
      </Paper>
    </Container>
  );
};

export default ProviderDashboard; 