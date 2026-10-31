import React from 'react';
import { Group, Button, Paper, Box, Text, Avatar, Tooltip, ActionIcon } from '@mantine/core';
import { UploadCloud, LogOut, ShieldCheck, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import GoogleLinkInput from '../../features/upload/GoogleLinkInput';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({
  onOpenUploadModal,
  onIngestGoogleLink,
  isIngesting = false,
  sidebarOpened = true,
  onToggleSidebar,
}) {
  const { user, logout } = useAuth();

  return (
    <Paper
      p="sm"
      px="md"
      style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--surface-topbar)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
        {/* Toggle Sidebar & Google Workspace Link Ingestion Bar */}
        <Group gap="xs" style={{ flex: 1, minWidth: 260, maxWidth: 640 }} wrap="nowrap">
          {onToggleSidebar && (
            <Tooltip
              label={sidebarOpened ? 'Collapse Sidebar (Ctrl+B)' : 'Expand Sidebar (Ctrl+B)'}
              withArrow
              position="bottom"
            >
              <ActionIcon
                size="34px"
                radius="md"
                variant="subtle"
                color="gray"
                onClick={onToggleSidebar}
                style={{
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: '#ffffff',
                  color: 'var(--brand-forest)',
                  flexShrink: 0,
                }}
              >
                {sidebarOpened ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
              </ActionIcon>
            </Tooltip>
          )}

          <Box style={{ flex: 1 }}>
            <GoogleLinkInput
              onIngest={onIngestGoogleLink}
              loading={isIngesting}
            />
          </Box>
        </Group>

        {/* User Status, Upload & Logout Action */}
        <Group gap="xs">
          {user && (
            <Tooltip label={`Zero-Knowledge Session • ${user.email} (${user.role})`} withArrow>
              <Paper
                px="sm"
                py={5}
                radius="xl"
                style={{
                  backgroundColor: 'var(--surface-card-warm)',
                  border: '1px solid var(--border-gold)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <Group gap={8}>
                  <Avatar size={22} radius="xl" color="emerald" variant="filled">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                  <Text size="xs" fw={600} style={{ color: 'var(--brand-forest)' }}>
                    {user.name || user.email.split('@')[0]}
                  </Text>
                  <ShieldCheck size={14} color="var(--brand-gold)" />
                </Group>
              </Paper>
            </Tooltip>
          )}

          <Button
            leftSection={<UploadCloud size={16} color="#eedebd" />}
            size="sm"
            radius="md"
            className="btn-premium-primary"
            onClick={onOpenUploadModal}
            style={{
              background: 'linear-gradient(135deg, #185844 0%, #102F27 100%)',
              border: '1px solid rgba(176, 138, 79, 0.5)',
              boxShadow: '0 3px 12px rgba(24, 88, 68, 0.28), 0 0 0 1px rgba(176, 138, 79, 0.2)',
              color: '#F2EBDD',
              fontWeight: 600,
            }}
          >
            Upload
          </Button>

          <Button
            leftSection={<LogOut size={15} color="#e11d48" />}
            size="sm"
            radius="md"
            onClick={logout}
            style={{
              color: '#e11d48',
              backgroundColor: '#fff1f2',
              border: '1px solid #fecdd3',
              fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
          >
            Lock Vault
          </Button>
        </Group>
      </Group>
    </Paper>
  );
}
