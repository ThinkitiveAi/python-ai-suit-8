import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  Select,
  Button,
  Stack,
  Group,
  Box,
  Center,
  Divider,
  ActionIcon,
  SimpleGrid,
  TextInput,
  Loader,
  Alert,
} from '@mantine/core';
import { TimeInput, DateInput } from '@mantine/dates';
import {
  IconClock,
  IconTrash,
  IconPlus,
  IconX,
  IconCheck,
  IconCalendar,
  IconUser,
  IconAlertCircle,
  IconRefresh,
} from '@tabler/icons-react';
import axios from 'axios';

interface DayAvailability {
  id: string;
  day: string;
  fromTime: string;
  tillTime: string;
}

interface BlockDay {
  id: string;
  date: Date | null;
  fromTime: string;
  tillTime: string;
}

interface AvailabilityData {
  provider_id: string;
  start_date: string;
  end_date: string;
  availability: {
    [day: string]: {
      from_time: string;
      till_time: string;
      is_available: boolean;
    };
  };
  block_days?: {
    date: string;
    from_time: string;
    till_time: string;
    reason?: string;
  }[];
}

interface ProviderAvailabilityProps {
  onClose?: () => void;
  onSave?: (data: any) => void;
  providerId?: string;
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const TIME_ZONES = [
  'UTC-8 (PST)',
  'UTC-7 (MST)',
  'UTC-6 (CST)',
  'UTC-5 (EST)',
  'UTC+0 (GMT)',
  'UTC+1 (CET)',
  'UTC+2 (EET)',
  'UTC+5:30 (IST)',
  'UTC+8 (CST)',
  'UTC+9 (JST)',
];

const PROVIDERS = [
  'John Doe',
  'Jane Smith',
  'Dr. Michael Johnson',
  'Dr. Sarah Wilson',
  'Dr. Robert Brown',
];

const ProviderAvailability: React.FC<ProviderAvailabilityProps> = ({ 
  onClose, 
  onSave,
  providerId = 'f1365ad6-9115-4a91-bbfe-3764273dcfa0'
}) => {
  const [selectedProvider, setSelectedProvider] = useState('John Doe');
  const [selectedTimeZone, setSelectedTimeZone] = useState('UTC-5 (EST)');
  const [dayAvailabilities, setDayAvailabilities] = useState<DayAvailability[]>([
    { id: '1', day: 'Monday', fromTime: '09:00', tillTime: '18:00' },
    { id: '2', day: 'Tuesday', fromTime: '09:00', tillTime: '18:00' },
    { id: '3', day: 'Wednesday', fromTime: '09:00', tillTime: '18:00' },
    { id: '4', day: 'Thursday', fromTime: '09:00', tillTime: '18:00' },
    { id: '5', day: 'Friday', fromTime: '09:00', tillTime: '18:00' },
    { id: '6', day: 'Saturday', fromTime: '09:00', tillTime: '18:00' },
  ]);
  const [blockDays, setBlockDays] = useState<BlockDay[]>([
    { id: '1', date: null, fromTime: '09:00', tillTime: '18:00' },
  ]);

  // API States
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch availability data on component mount
  useEffect(() => {
    fetchAvailabilityData();
  }, [providerId]);

  const fetchAvailabilityData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const startDate = '2025-08-10';
      const endDate = '2025-08-11';
      
      const response = await axios.get(
        `http://192.168.0.252:5000/api/v1/provider/${providerId}/availability`,
        {
          params: {
            start_date: startDate,
            end_date: endDate,
          },
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
          },
          timeout: 10000,
        }
      );

      console.log('Availability API response:', response.data);
      setAvailabilityData(response.data);

      // Update day availabilities with fetched data
      if (response.data.availability) {
        const updatedDayAvailabilities = dayAvailabilities.map((day, index) => {
          const dayKey = day.day.toLowerCase();
          const apiDayData = response.data.availability[dayKey];
          
          if (apiDayData) {
            return {
              ...day,
              fromTime: apiDayData.from_time || day.fromTime,
              tillTime: apiDayData.till_time || day.tillTime,
            };
          }
          return day;
        });
        
        setDayAvailabilities(updatedDayAvailabilities);
      }

      // Update block days with fetched data
      if (response.data.block_days && response.data.block_days.length > 0) {
        const updatedBlockDays = response.data.block_days.map((blockDay: any, index: number) => ({
          id: (index + 1).toString(),
          date: blockDay.date ? new Date(blockDay.date) : null,
          fromTime: blockDay.from_time || '09:00',
          tillTime: blockDay.till_time || '18:00',
        }));
        
        setBlockDays(updatedBlockDays);
      }

    } catch (error: any) {
      console.error('Error fetching availability data:', error);
      
      let errorMessage = 'Failed to fetch availability data. Please try again.';
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Provider availability not found.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        }
      } else if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
        errorMessage = 'Unable to connect to server. Please check your connection.';
      }
      
      setError(errorMessage);
      
      // Use dummy data for testing when API is not available
      if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        console.log('API not available, using dummy data');
        const dummyData: AvailabilityData = {
          provider_id: providerId,
          start_date: '2025-08-10',
          end_date: '2025-08-11',
          availability: {
            monday: { from_time: '09:00', till_time: '17:00', is_available: true },
            tuesday: { from_time: '09:00', till_time: '17:00', is_available: true },
            wednesday: { from_time: '09:00', till_time: '17:00', is_available: true },
            thursday: { from_time: '09:00', till_time: '17:00', is_available: true },
            friday: { from_time: '09:00', till_time: '17:00', is_available: true },
            saturday: { from_time: '09:00', till_time: '15:00', is_available: true },
            sunday: { from_time: '10:00', till_time: '14:00', is_available: false },
          },
          block_days: [
            {
              date: '2025-08-15',
              from_time: '09:00',
              till_time: '18:00',
              reason: 'Holiday'
            }
          ]
        };
        
        setAvailabilityData(dummyData);
        setError(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBlockDay = () => {
    const newBlockDay: BlockDay = {
      id: Date.now().toString(),
      date: null,
      fromTime: '09:00',
      tillTime: '18:00',
    };
    setBlockDays([...blockDays, newBlockDay]);
  };

  const handleRemoveBlockDay = (id: string) => {
    setBlockDays(blockDays.filter(day => day.id !== id));
  };

  const handleUpdateDayAvailability = (id: string, field: keyof DayAvailability, value: string) => {
    setDayAvailabilities(prev => 
      prev.map(day => 
        day.id === id ? { ...day, [field]: value } : day
      )
    );
  };

  const handleUpdateBlockDay = (id: string, field: keyof BlockDay, value: string | Date | null) => {
    setBlockDays(prev => 
      prev.map(day => 
        day.id === id ? { ...day, [field]: value } : day
      )
    );
  };

  const handleSave = () => {
    const data = {
      provider: selectedProvider,
      timeZone: selectedTimeZone,
      dayAvailabilities,
      blockDays,
      availabilityData,
    };
    console.log('Saving provider availability:', data);
    onSave?.(data);
  };

  const handleRefresh = () => {
    fetchAvailabilityData();
  };

  return (
    <Container size="xl" py={40}>
      <Paper
        shadow="xl"
        p={40}
        radius="lg"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
      {/* Header */}
        <Stack align="center" mb={40}>
          <Box
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%',
              padding: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
            }}
          >
            <IconCalendar size={32} color="white" />
          </Box>
          <Title order={1} size="h2" fw={700} style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Provider Availability
              </Title>
          <Text size="sm" c="dimmed" ta="center">
            Manage provider schedules and block days
              </Text>
                  </Stack>

        {/* Loading State */}
        {isLoading && (
          <Center py={40}>
            <Stack align="center" gap="md">
              <Loader size="lg" color="blue" />
              <Text size="sm" c="dimmed">Loading availability data...</Text>
            </Stack>
                          </Center>
        )}

        {/* Error State */}
        {error && (
          <Alert
            icon={<IconAlertCircle size={20} />}
            title="Error Loading Data"
            color="red"
            mb="xl"
            radius="lg"
                            style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.1)'
            }}
          >
            <Text size="sm" mb="sm" style={{ lineHeight: 1.5 }}>
              {error}
            </Text>
                      <Button
              size="sm"
                        variant="light"
              color="red"
              leftSection={<IconRefresh size={16} />}
              onClick={handleRefresh}
            >
              Retry
                      </Button>
          </Alert>
        )}

          {/* Main Content */}
        {!isLoading && (
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="xl">
            {/* Left Section - Day Wise Availability */}
            <Box>
              <Group justify="space-between" mb="md">
                <Title order={3} size="h4" fw={600} c="dark.7">
                  Day Wise Availability
                </Title>
                {availabilityData && (
                  <Text size="xs" c="dimmed">
                    Last updated: {new Date().toLocaleString()}
                    </Text>
                )}
                  </Group>
                  
              {/* Provider Dropdown */}
              <Box mb="lg">
                <Text size="sm" fw={500} mb="xs" c="dark.7">
                  Select Provider
                </Text>
                <Select
                  value={selectedProvider}
                  onChange={(value: string | null) => setSelectedProvider(value || 'John Doe')}
                  data={PROVIDERS}
                  leftSection={<IconUser size={18} />}
                  size="md"
                  radius="lg"
                  styles={{
                    input: {
                      borderColor: '#e5e7eb',
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
                      }
                    }
                  }}
                />
              </Box>

              {/* Day Availability Table */}
              <Stack gap="md">
                {dayAvailabilities.map((day) => (
                  <Box
                    key={day.id}
                    p="md"
                                style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      backgroundColor: '#fafafa',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#667eea',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.1)'
                      }
                    }}
                  >
                    <SimpleGrid cols={3} spacing="md">
                      <Select
                        value={day.day}
                        onChange={(value: string | null) => handleUpdateDayAvailability(day.id, 'day', value || 'Monday')}
                        data={DAYS_OF_WEEK}
                                        size="sm"
                        radius="md"
                        styles={{
                          input: {
                            borderColor: '#e5e7eb',
                            backgroundColor: '#ffffff',
                            fontSize: '14px',
                            fontWeight: 500,
                            '&:focus': {
                              borderColor: '#667eea',
                              boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.1)'
                            }
                          }
                        }}
                      />
                      
                      <TimeInput
                        value={day.fromTime}
                        onChange={(event) => handleUpdateDayAvailability(day.id, 'fromTime', event.currentTarget.value)}
                        leftSection={<IconClock size={16} />}
                        size="sm"
                        radius="md"
                        styles={{
                          input: {
                            borderColor: '#e5e7eb',
                            backgroundColor: '#ffffff',
                            fontSize: '14px',
                            fontWeight: 500,
                            '&:focus': {
                              borderColor: '#667eea',
                              boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.1)'
                            }
                          }
                        }}
                      />
                      
                      <TimeInput
                        value={day.tillTime}
                        onChange={(event) => handleUpdateDayAvailability(day.id, 'tillTime', event.currentTarget.value)}
                        leftSection={<IconClock size={16} />}
                        size="sm"
                        radius="md"
                        styles={{
                          input: {
                            borderColor: '#e5e7eb',
                            backgroundColor: '#ffffff',
                            fontSize: '14px',
                            fontWeight: 500,
                            '&:focus': {
                              borderColor: '#667eea',
                              boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.1)'
                            }
                          }
                        }}
                      />
                    </SimpleGrid>
                  </Box>
                ))}
                      </Stack>
            </Box>

            {/* Right Section - Slot Creation Setting */}
            <Box>
              <Title order={3} size="h4" fw={600} mb="md" c="dark.7">
                Slot Creation Setting
              </Title>
              
              {/* Time Zone Dropdown */}
              <Box mb="lg">
                <Text size="sm" fw={500} mb="xs" c="dark.7">
                  Time Zone
                                </Text>
                <Select
                  value={selectedTimeZone}
                  onChange={(value: string | null) => setSelectedTimeZone(value || 'UTC-5 (EST)')}
                  data={TIME_ZONES}
                  leftSection={<IconClock size={18} />}
                  size="md"
                  radius="lg"
                  styles={{
                    input: {
                      borderColor: '#e5e7eb',
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
                      }
                    }
                  }}
                />
                                        </Box>

              {/* Block Days Section */}
                      <Box>
                <Title order={4} size="h5" fw={600} mb="md" c="dark.7">
                  Block Days
                </Title>
                
                <Stack gap="md">
                  {blockDays.map((blockDay) => (
                    <Box
                      key={blockDay.id}
                      p="md"
                                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        backgroundColor: '#fafafa',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: '#667eea',
                          backgroundColor: '#ffffff',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.1)'
                        }
                      }}
                    >
                      <Group justify="space-between" align="flex-start">
                        <SimpleGrid cols={3} spacing="md" style={{ flex: 1 }}>
                          <DateInput
                            value={blockDay.date}
                            onChange={(value) => handleUpdateBlockDay(blockDay.id, 'date', value)}
                            leftSection={<IconCalendar size={16} />}
                            placeholder="Select date"
                            size="sm"
                            radius="md"
                            styles={{
                              input: {
                                borderColor: '#e5e7eb',
                                backgroundColor: '#ffffff',
                                fontSize: '14px',
                                fontWeight: 500,
                                '&:focus': {
                                  borderColor: '#667eea',
                                  boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.1)'
                                }
                              }
                            }}
                          />
                          
              <TimeInput
                            value={blockDay.fromTime}
                            onChange={(event) => handleUpdateBlockDay(blockDay.id, 'fromTime', event.currentTarget.value)}
                            leftSection={<IconClock size={16} />}
                            size="sm"
                            radius="md"
                            styles={{
                              input: {
                                borderColor: '#e5e7eb',
                                backgroundColor: '#ffffff',
                                fontSize: '14px',
                                fontWeight: 500,
                                '&:focus': {
                                  borderColor: '#667eea',
                                  boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.1)'
                                }
                              }
                            }}
                          />
                          
              <TimeInput
                            value={blockDay.tillTime}
                            onChange={(event) => handleUpdateBlockDay(blockDay.id, 'tillTime', event.currentTarget.value)}
                            leftSection={<IconClock size={16} />}
                            size="sm"
                            radius="md"
                            styles={{
                              input: {
                                borderColor: '#e5e7eb',
                                backgroundColor: '#ffffff',
                                fontSize: '14px',
                                fontWeight: 500,
                                '&:focus': {
                                  borderColor: '#667eea',
                                  boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.1)'
                                }
                              }
                            }}
              />
            </SimpleGrid>

                        <ActionIcon
                          variant="subtle"
                          color="red"
                          size="sm"
                          onClick={() => handleRemoveBlockDay(blockDay.id)}
                          style={{
                            border: '1px solid #fecaca',
                            backgroundColor: '#fef2f2',
                            color: '#dc2626',
                            '&:hover': {
                              backgroundColor: '#fee2e2',
                              borderColor: '#fca5a5'
                            }
                          }}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                  </Group>
                    </Box>
              ))}
            </Stack>

                <Button
                  leftSection={<IconPlus size={16} />}
                  variant="outline"
                  color="blue"
                  size="sm"
                  mt="md"
                  onClick={handleAddBlockDay}
                  styles={{
                    root: {
                      borderColor: '#667eea',
                      color: '#667eea',
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: '#667eea',
                        color: '#ffffff'
                      }
                    }
                  }}
                >
                  + Add Block Days
              </Button>
              </Box>
            </Box>
          </SimpleGrid>
        )}

        {/* Footer */}
        <Divider my="xl" />
        <Group justify="flex-end" gap="md">
          <Button
            variant="outline"
            color="gray"
            leftSection={<IconX size={18} />}
            onClick={onClose}
          size="md"
            radius="lg"
            styles={{
              root: {
                borderColor: '#d1d5db',
                color: '#6b7280',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: '#f3f4f6',
                  borderColor: '#9ca3af'
                }
              }
            }}
          >
                Close
              </Button>
          <Button
            color="blue"
            leftSection={<IconCheck size={18} />}
            onClick={handleSave}
            size="md"
            radius="lg"
            gradient={{ from: '#667eea', to: '#764ba2', deg: 135 }}
            styles={{
              root: {
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)'
                }
              }
            }}
          >
            Save
              </Button>
            </Group>
      </Paper>
    </Container>
  );
};

export default ProviderAvailability; 