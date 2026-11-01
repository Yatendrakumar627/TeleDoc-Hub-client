import React from 'react';
import { Center, Stack, Loader, Text, Box } from '@mantine/core';
import { FileText, AlertCircle } from 'lucide-react';

export default function StateFallback({
  type = 'loading',
  title,
  message,
  height = 360,
}) {
  if (type === 'loading') {
    return (
      <Center h={height}>
        <Stack align="center" gap="sm">
          <Loader size="md" color="blue" />
          <Text size="sm" c="dimmed">
            {message || 'Loading document from vault...'}
          </Text>
        </Stack>
      </Center>
    );
  }

  if (type === 'error') {
    return (
      <Center h={height}>
        <Stack align="center" gap="sm" ta="center">
          <AlertCircle size={36} color="#dc2626" />
          {title && <Text fw={600} size="md" c="#0f172a">{title}</Text>}
          <Text size="sm" c="dimmed" style={{ maxWidth: 400 }}>
            {message || 'An error occurred while loading this document.'}
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Center h={height}>
      <Stack align="center" gap="sm" ta="center">
        <FileText size={40} color="#cbd5e1" />
        {title && <Text fw={600} size="md" c="#0f172a">{title}</Text>}
        <Text size="sm" c="dimmed" style={{ maxWidth: 400 }}>
          {message || 'No data available to display.'}
        </Text>
      </Stack>
    </Center>
  );
}

