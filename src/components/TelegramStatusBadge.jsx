import React from 'react';
import { Badge, Group, Text, Tooltip } from '@mantine/core';
import { Cloud, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TelegramStatusBadge({ status, loading }) {
  if (loading) {
    return (
      <Badge size="sm" variant="light" color="gray" leftSection={<Cloud size={12} />}>
        Connecting...
      </Badge>
    );
  }

  const isConnected = status?.telegram?.connected;
  const channelName = status?.telegram?.channel || 'Cloud Storage';

  return (
    <Tooltip
      label={
        isConnected
          ? `Connected to ${channelName}`
          : `Storage Offline: ${status?.telegram?.error || 'Unavailable'}`
      }
      withArrow
      position="bottom"
    >
      <Badge
        size="sm"
        variant="light"
        color={isConnected ? 'teal' : 'red'}
        leftSection={
          isConnected ? (
            <CheckCircle2 size={12} style={{ color: '#059669' }} />
          ) : (
            <AlertCircle size={12} style={{ color: '#dc2626' }} />
          )
        }
        styles={{
          root: {
            cursor: 'pointer',
            paddingLeft: 8,
            paddingRight: 8,
            textTransform: 'none',
            fontWeight: 500,
            maxWidth: 220,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        }}
      >
        {isConnected ? `Vault: ${channelName}` : 'Vault Disconnected'}
      </Badge>
    </Tooltip>
  );
}

