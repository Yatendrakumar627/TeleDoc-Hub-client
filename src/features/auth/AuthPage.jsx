import React, { useState } from 'react';
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Stack,
  Group,
  Badge,
  Alert,
  Box,
  Anchor,
  SimpleGrid,
  ThemeIcon,
  rem,
} from '@mantine/core';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  FileText,
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage } from '../../utils/formatters';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (isRegister) {
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }
    }

    try {
      setSubmitting(true);
      if (isRegister) {
        await register({ name: name.trim(), email: email.trim(), password });
      } else {
        await login(email.trim(), password);
      }
    } catch (err) {
      setErrorMessage(extractErrorMessage(err, 'Authentication error. Please check server connection.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        padding: '1.5rem',
      }}
    >
      <Box style={{ width: '100%', maxWidth: 480 }}>
        {/* Vault Header Icon */}
        <Stack align="center" gap="xs" mb="lg">
          <ThemeIcon
            size={68}
            radius={68}
            variant="gradient"
            gradient={{ from: '#0284c7', to: '#0d9488', deg: 45 }}
            style={{ boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.4)' }}
          >
            <ShieldCheck size={36} color="#ffffff" />
          </ThemeIcon>

          <Title order={2} ta="center" c="white" fw={700}>
            TeleDoc Vault
          </Title>
          <Text size="sm" c="dimmed" ta="center">
            Zero-Knowledge Encrypted Storage on Telegram + MongoDB
          </Text>

          <Group gap="xs" mt={4}>
            <Badge color="cyan" variant="filled" size="xs" leftSection={<Lock size={10} />}>
              AES-256-GCM
            </Badge>
            <Badge color="teal" variant="light" size="xs">
              Private Multi-Tenant
            </Badge>
          </Group>
        </Stack>

        {/* Auth Card */}
        <Paper
          withBorder
          shadow="xl"
          p="xl"
          radius="lg"
          style={{
            backgroundColor: '#ffffff',
            borderColor: '#e2e8f0',
          }}
        >
          <Title order={3} size="h4" ta="center" mb="xs">
            {isRegister ? 'Create Your Vault Account' : 'Sign In to Your Vault'}
          </Title>
          <Text size="xs" c="dimmed" ta="center" mb="lg">
            {isRegister
              ? 'Initialize your master keys and personal isolated storage'
              : 'Enter your credentials to unlock your encrypted documents'}
          </Text>

          {errorMessage && (
            <Alert
              icon={<AlertCircle size={16} />}
              color="red"
              variant="light"
              mb="md"
              radius="md"
              onClose={() => setErrorMessage('')}
              withCloseButton
            >
              <Text size="xs">{errorMessage}</Text>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              {isRegister && (
                <TextInput
                  id="vault-fullname"
                  name="fullname"
                  autoComplete="name"
                  label="Full Name"
                  placeholder="e.g. Dr. Alex Morgan"
                  value={name || ''}
                  onChange={(e) => setName(e.currentTarget.value)}
                  radius="md"
                />
              )}

              <TextInput
                id="vault-email"
                name="email"
                autoComplete="username"
                label="Email Address"
                placeholder="name@organization.com"
                required
                type="email"
                value={email || ''}
                onChange={(e) => setEmail(e.currentTarget.value)}
                radius="md"
                autoFocus
              />

              <PasswordInput
                id="vault-password"
                name="password"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                label="Master Password"
                placeholder="Your secret passphrase"
                required
                value={password || ''}
                onChange={(e) => setPassword(e.currentTarget.value)}
                radius="md"
              />

              {isRegister && (
                <PasswordInput
                  id="vault-confirm-password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  label="Confirm Password"
                  placeholder="Re-enter secret passphrase"
                  required
                  value={confirmPassword || ''}
                  onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                  radius="md"
                />
              )}

              <Button
                type="submit"
                fullWidth
                size="md"
                color="blue"
                radius="md"
                loading={submitting}
                leftSection={<KeyRound size={18} />}
                mt="xs"
              >
                {isRegister ? 'Initialize Vault Account' : 'Unlock Vault'}
              </Button>
            </Stack>
          </form>

          <Stack align="center" gap="xs" mt="lg">
            <Text size="xs" c="dimmed">
              {isRegister ? 'Already have a vault account?' : "Don't have a vault account?"}{' '}
              <Anchor
                component="button"
                type="button"
                size="xs"
                fw={600}
                c="blue.7"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setErrorMessage('');
                }}
              >
                {isRegister ? 'Sign In Instead' : 'Create Vault Account'}
              </Anchor>
            </Text>
          </Stack>
        </Paper>

        {/* Security Trust Badges */}
        <SimpleGrid cols={3} spacing="xs" mt="md">
          <Paper p="xs" radius="md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
            <Group justify="center" mb={2}>
              <Lock size={14} color="#38bdf8" />
            </Group>
            <Text size="10px" fw={600} c="gray.3">
              Zero-Knowledge
            </Text>
            <Text size="9px" c="dimmed">
              Client & AES-256
            </Text>
          </Paper>

          <Paper p="xs" radius="md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
            <Group justify="center" mb={2}>
              <Cloud size={14} color="#34d399" />
            </Group>
            <Text size="10px" fw={600} c="gray.3">
              Telegram Storage
            </Text>
            <Text size="9px" c="dimmed">
              Unlimited Blobs
            </Text>
          </Paper>

          <Paper p="xs" radius="md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
            <Group justify="center" mb={2}>
              <Database size={14} color="#a78bfa" />
            </Group>
            <Text size="10px" fw={600} c="gray.3">
              MongoDB Brain
            </Text>
            <Text size="9px" c="dimmed">
              Isolated Indexing
            </Text>
          </Paper>
        </SimpleGrid>
      </Box>
    </Box>
  );
}

