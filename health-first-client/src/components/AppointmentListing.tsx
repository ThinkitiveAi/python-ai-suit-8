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
  TextInput,
  Select,
  ActionIcon,
  Table,
  Modal,
  Divider,
  SimpleGrid,
  Pagination,
  Menu,
  Tooltip,
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
  IconPlus,
  IconSearch,
  IconFilter,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconEye,
  IconVideo,
  IconHome,
  IconUserCheck,
  IconCalendarEvent,
  IconAlertCircle,
  IconX,
} from '@tabler/icons-react';
import { DateInput } from '@mantine/dates';
import ScheduleAppointmentModal from './ScheduleAppointmentModal';

interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  providerName: string;
  providerSpecialization: string;
  appointmentType: string;
  appointmentMode: 'in-person' | 'video-call' | 'home';
  date: string;
  time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  estimatedAmount: number;
  reasonForVisit: string;
  notes?: string;
}

const AppointmentListing: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock data
  const appointments: Appointment[] = [
    {
      id: '1',
      patientName: 'John Doe',
      patientEmail: 'john.doe@email.com',
      patientPhone: '+1 (555) 123-4567',
      providerName: 'Dr. Sarah Wilson',
      providerSpecialization: 'Cardiology',
      appointmentType: 'General Consultation',
      appointmentMode: 'in-person',
      date: '2024-01-15',
      time: '10:30 AM',
      status: 'confirmed',
      estimatedAmount: 150,
      reasonForVisit: 'Chest pain and shortness of breath',
      notes: 'Patient has history of hypertension'
    },
    {
      id: '2',
      patientName: 'Jane Smith',
      patientEmail: 'jane.smith@email.com',
      patientPhone: '+1 (555) 234-5678',
      providerName: 'Dr. Michael Johnson',
      providerSpecialization: 'Neurology',
      appointmentType: 'Follow-up Visit',
      appointmentMode: 'video-call',
      date: '2024-01-16',
      time: '02:00 PM',
      status: 'scheduled',
      estimatedAmount: 120,
      reasonForVisit: 'Follow-up for migraine treatment',
    },
    {
      id: '3',
      patientName: 'Mike Johnson',
      patientEmail: 'mike.johnson@email.com',
      patientPhone: '+1 (555) 345-6789',
      providerName: 'Dr. Emily Davis',
      providerSpecialization: 'Pediatrics',
      appointmentType: 'Regular Check-up',
      appointmentMode: 'home',
      date: '2024-01-14',
      time: '09:00 AM',
      status: 'completed',
      estimatedAmount: 100,
      reasonForVisit: 'Annual physical examination',
    },
    {
      id: '4',
      patientName: 'Sarah Wilson',
      patientEmail: 'sarah.wilson@email.com',
      patientPhone: '+1 (555) 456-7890',
      providerName: 'Dr. Sarah Wilson',
      providerSpecialization: 'Cardiology',
      appointmentType: 'Emergency Consultation',
      appointmentMode: 'in-person',
      date: '2024-01-13',
      time: '11:00 AM',
      status: 'cancelled',
      estimatedAmount: 200,
      reasonForVisit: 'Severe chest pain',
    },
    {
      id: '5',
      patientName: 'David Brown',
      patientEmail: 'david.brown@email.com',
      patientPhone: '+1 (555) 567-8901',
      providerName: 'Dr. Michael Johnson',
      providerSpecialization: 'Neurology',
      appointmentType: 'Specialist Consultation',
      appointmentMode: 'in-person',
      date: '2024-01-17',
      time: '03:30 PM',
      status: 'scheduled',
      estimatedAmount: 250,
      reasonForVisit: 'Neurological assessment for memory issues',
    },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'no-show', label: 'No Show' },
  ];

  const getStatusBadge = (status: string) => {
    const colors = {
      scheduled: 'blue',
      confirmed: 'green',
      completed: 'teal',
      cancelled: 'red',
      'no-show': 'orange',
    };
    return (
      <Badge color={colors[status as keyof typeof colors] || 'gray'} size="sm">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'in-person':
        return <IconUserCheck size={16} />;
      case 'video-call':
        return <IconVideo size={16} />;
      case 'home':
        return <IconHome size={16} />;
      default:
        return <IconUserCheck size={16} />;
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'in-person':
        return 'blue';
      case 'video-call':
        return 'green';
      case 'home':
        return 'orange';
      default:
        return 'blue';
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.appointmentType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    const matchesDate = !dateFilter || appointment.date === dateFilter.toISOString().split('T')[0];
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleScheduleAppointment = (appointmentData: any) => {
    console.log('New appointment scheduled:', appointmentData);
    // Here you would typically save to your backend
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowScheduleModal(true);
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    console.log('Delete appointment:', appointmentId);
    // Here you would typically delete from your backend
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
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
          <Box>
            <Title order={2} c="white" fw={600}>
              Appointment Management
            </Title>
            <Text c="white" opacity={0.9} size="sm">
              Manage and schedule patient appointments
            </Text>
          </Box>
          
          <Button
            leftSection={<IconPlus size={18} />}
            variant="white"
            color="dark"
            size="md"
            radius="md"
            onClick={() => setShowScheduleModal(true)}
          >
            Schedule New Appointment
          </Button>
        </Group>
      </Paper>

      {/* Filters and Search */}
      <Paper shadow="sm" p="lg" radius="lg" mb="xl">
        <SimpleGrid cols={{ base: 1, md: 4 }} spacing="md">
          <TextInput
            placeholder="Search appointments..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.currentTarget.value)}
            leftSection={<IconSearch size={16} />}
            size="md"
            radius="md"
          />
          <Select
            placeholder="Filter by status"
            value={statusFilter}
            onChange={(value) => setStatusFilter(value || 'all')}
            data={statusOptions}
            leftSection={<IconFilter size={16} />}
            size="md"
            radius="md"
          />
          <DateInput
            placeholder="Filter by date"
            value={dateFilter}
            onChange={(date) => setDateFilter(date as Date | null)}
            leftSection={<IconCalendar size={16} />}
            size="md"
            radius="md"
            clearable
          />
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setDateFilter(null);
            }}
            size="md"
            radius="md"
          >
            Clear Filters
          </Button>
        </SimpleGrid>
      </Paper>

      {/* Statistics Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="xl">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between">
            <Box>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Total Appointments
              </Text>
              <Text size="xl" fw={700} c="dark.8">
                {appointments.length}
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
                Scheduled
              </Text>
              <Text size="xl" fw={700} c="dark.8">
                {appointments.filter(a => a.status === 'scheduled').length}
              </Text>
            </Box>
            <Avatar color="blue" radius="md" size="lg">
              <IconCalendarEvent size={20} />
            </Avatar>
          </Group>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between">
            <Box>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Confirmed
              </Text>
              <Text size="xl" fw={700} c="dark.8">
                {appointments.filter(a => a.status === 'confirmed').length}
              </Text>
            </Box>
            <Avatar color="green" radius="md" size="lg">
              <IconCheck size={20} />
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
                {appointments.filter(a => a.status === 'completed').length}
              </Text>
            </Box>
            <Avatar color="teal" radius="md" size="lg">
              <IconCheck size={20} />
            </Avatar>
          </Group>
        </Card>
      </SimpleGrid>

      {/* Appointments Table */}
      <Paper shadow="sm" radius="lg" withBorder>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Patient</Table.Th>
              <Table.Th>Provider</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Date & Time</Table.Th>
              <Table.Th>Mode</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Amount</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paginatedAppointments.map((appointment) => (
              <Table.Tr key={appointment.id}>
                <Table.Td>
                  <Group gap="sm">
                    <Avatar size="sm" radius="xl">
                      <IconUser size={16} />
                    </Avatar>
                    <Box>
                      <Text size="sm" fw={500}>
                        {appointment.patientName}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {appointment.patientEmail}
                      </Text>
                    </Box>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Box>
                    <Text size="sm" fw={500}>
                      {appointment.providerName}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {appointment.providerSpecialization}
                    </Text>
                  </Box>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{appointment.appointmentType}</Text>
                </Table.Td>
                <Table.Td>
                  <Box>
                    <Text size="sm" fw={500}>
                      {new Date(appointment.date).toLocaleDateString()}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {appointment.time}
                    </Text>
                  </Box>
                </Table.Td>
                <Table.Td>
                  <Badge 
                    color={getModeColor(appointment.appointmentMode)} 
                    variant="light" 
                    size="sm"
                    leftSection={getModeIcon(appointment.appointmentMode)}
                  >
                    {appointment.appointmentMode === 'in-person' ? 'In-Person' :
                     appointment.appointmentMode === 'video-call' ? 'Video Call' : 'Home'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {getStatusBadge(appointment.status)}
                </Table.Td>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    ${appointment.estimatedAmount}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Menu shadow="md" width={200}>
                    <Menu.Target>
                      <ActionIcon variant="subtle" size="sm">
                        <IconDotsVertical size={16} />
                      </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconEye size={14} />}
                        onClick={() => handleViewDetails(appointment)}
                      >
                        View Details
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconEdit size={14} />}
                        onClick={() => handleEditAppointment(appointment)}
                      >
                        Edit Appointment
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Item
                        leftSection={<IconTrash size={14} />}
                        color="red"
                        onClick={() => handleDeleteAppointment(appointment.id)}
                      >
                        Delete Appointment
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {/* Pagination */}
        {filteredAppointments.length > itemsPerPage && (
          <Box p="md" style={{ borderTop: '1px solid #e2e8f0' }}>
            <Group justify="center">
              <Pagination
                total={Math.ceil(filteredAppointments.length / itemsPerPage)}
                value={currentPage}
                onChange={setCurrentPage}
                size="sm"
                radius="md"
              />
            </Group>
          </Box>
        )}
      </Paper>

      {/* Schedule Appointment Modal */}
      <ScheduleAppointmentModal
        opened={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSave={handleScheduleAppointment}
      />

      {/* Appointment Details Modal */}
      <Modal
        opened={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Appointment Details"
        size="lg"
        radius="lg"
      >
        {selectedAppointment && (
          <Stack gap="lg">
            <Group>
              <Avatar size={80} radius="xl">
                <IconUser size={40} />
              </Avatar>
              <Box>
                <Title order={3} size="h4" fw={600}>
                  {selectedAppointment.patientName}
                </Title>
                <Text size="sm" c="dimmed" mb="xs">
                  {selectedAppointment.patientEmail}
                </Text>
                <Text size="sm" c="dimmed">
                  {selectedAppointment.patientPhone}
                </Text>
              </Box>
            </Group>

            <Divider />

            <SimpleGrid cols={2} spacing="md">
              <Box>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">
                  Provider
                </Text>
                <Text size="sm" fw={500}>{selectedAppointment.providerName}</Text>
                <Text size="xs" c="dimmed">{selectedAppointment.providerSpecialization}</Text>
              </Box>
              
              <Box>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">
                  Appointment Type
                </Text>
                <Text size="sm" fw={500}>{selectedAppointment.appointmentType}</Text>
              </Box>
              
              <Box>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">
                  Date & Time
                </Text>
                <Text size="sm" fw={500}>
                  {new Date(selectedAppointment.date).toLocaleDateString()} at {selectedAppointment.time}
                </Text>
              </Box>
              
              <Box>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">
                  Mode
                </Text>
                <Badge 
                  color={getModeColor(selectedAppointment.appointmentMode)} 
                  variant="light" 
                  size="sm"
                  leftSection={getModeIcon(selectedAppointment.appointmentMode)}
                >
                  {selectedAppointment.appointmentMode === 'in-person' ? 'In-Person' :
                   selectedAppointment.appointmentMode === 'video-call' ? 'Video Call' : 'Home'}
                </Badge>
              </Box>
              
              <Box>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">
                  Status
                </Text>
                {getStatusBadge(selectedAppointment.status)}
              </Box>
              
              <Box>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">
                  Amount
                </Text>
                <Text size="sm" fw={500}>${selectedAppointment.estimatedAmount}</Text>
              </Box>
            </SimpleGrid>

            <Box>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">
                Reason for Visit
              </Text>
              <Text size="sm">{selectedAppointment.reasonForVisit}</Text>
            </Box>

            {selectedAppointment.notes && (
              <Box>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">
                  Notes
                </Text>
                <Text size="sm">{selectedAppointment.notes}</Text>
              </Box>
            )}

            <Group justify="flex-end">
              <Button
                variant="outline"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowDetailsModal(false);
                  handleEditAppointment(selectedAppointment);
                }}
              >
                Edit Appointment
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  );
};

export default AppointmentListing; 