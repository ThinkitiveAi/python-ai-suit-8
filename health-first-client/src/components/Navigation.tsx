import React from 'react';
import {
  Container,
  Group,
  Button,
  Stack,
  Title,
  Text,
  Paper,
  Box,
} from '@mantine/core';
import {
  IconUser,
  IconCalendar,
  IconStethoscope,
  IconHeart,
  IconSettings,
} from '@tabler/icons-react';

const Navigation: React.FC = () => {
  const navigateTo = (path: string) => {
    window.location.href = `/auth${path}`;
  };

  return (
    <Container size="md" py={40}>
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
            <IconSettings size={32} color="white" />
          </Box>
          <Title order={1} size="h2" fw={700} style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Healthcare App Navigation
          </Title>
          <Text size="sm" c="dimmed" ta="center">
            Choose a page to navigate to
          </Text>
        </Stack>

        <Stack gap="lg">
          {/* Authentication Pages */}
          <Box>
            <Title order={3} size="h4" fw={600} mb="md" c="dark.7">
              Authentication
            </Title>
            <Group gap="md">
              <Button
                leftSection={<IconHeart size={18} />}
                variant="outline"
                color="blue"
                onClick={() => navigateTo('/patient-login')}
                size="md"
                radius="lg"
              >
                Patient Login
              </Button>
              <Button
                leftSection={<IconStethoscope size={18} />}
                variant="outline"
                color="teal"
                onClick={() => navigateTo('/provider-login')}
                size="md"
                radius="lg"
              >
                Provider Login
              </Button>
              <Button
                leftSection={<IconUser size={18} />}
                variant="outline"
                color="green"
                onClick={() => navigateTo('/provider-register')}
                size="md"
                radius="lg"
              >
                Provider Registration
              </Button>
            </Group>
          </Box>

          {/* Provider Management Pages */}
          <Box>
            <Title order={3} size="h4" fw={600} mb="md" c="dark.7">
              Provider Management
            </Title>
            <Group gap="md">
              <Button
                leftSection={<IconCalendar size={18} />}
                variant="filled"
                color="blue"
                onClick={() => navigateTo('/provider-availability')}
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
                Provider Availability
              </Button>
              <Button
                leftSection={<IconStethoscope size={18} />}
                variant="filled"
                color="teal"
                onClick={() => navigateTo('/provider-dashboard')}
                size="md"
                radius="lg"
                gradient={{ from: '#14b8a6', to: '#0d9488', deg: 135 }}
                styles={{
                  root: {
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 6px 16px rgba(20, 184, 166, 0.4)'
                    }
                  }
                }}
              >
                Provider Dashboard
              </Button>
            </Group>
          </Box>

          {/* Quick Access Info */}
          <Box mt="xl" p="md" style={{
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <Text size="sm" fw={600} mb="xs" c="dark.7">
              Quick Access URLs:
            </Text>
            <Stack gap="xs">
              <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                • Patient Login: /auth/patient-login
              </Text>
              <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                • Provider Login: /auth/provider-login
              </Text>
              <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                • Provider Registration: /auth/provider-register
              </Text>
              <Text size="xs" c="blue" style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                • Provider Availability: /auth/provider-availability
              </Text>
              <Text size="xs" c="teal" style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                • Provider Dashboard: /auth/provider-dashboard
              </Text>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};

export default Navigation; 