import React from 'react';
import { Group, Button, Paper, Box, Text, Avatar, Tooltip, ActionIcon, Stack } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { UploadCloud, LogOut, ShieldCheck, PanelLeftClose, PanelLeftOpen, Home } from 'lucide-react';
import GoogleLinkInput from '../../features/upload/GoogleLinkInput';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({
  onOpenUploadModal,
  onIngestGoogleLink,
  isIngesting = false,
  sidebarOpened = true,
  onToggleSidebar,
  onNavigateHome,
  isHome = false,
}) {
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <Paper
      p={isMobile ? 'xs' : 'sm'}
      px={isMobile ? 'xs' : 'md'}
      style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--surface-topbar)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {isMobile ? (
        /* Mobile Compact 2-Row Topbar */
        <Stack gap={6}>
          {/* Row 1: Sidebar Toggle + Google Link Ingestion Bar */}
          <Group gap="xs" wrap="nowrap" style={{ width: '100%' }}>
            {onToggleSidebar && (
              <ActionIcon
                size="32px"
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
                {sidebarOpened ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
              </ActionIcon>
            )}

            {onNavigateHome && (
              <ActionIcon
                size="32px"
                radius="md"
                variant={isHome ? 'filled' : 'subtle'}
                color={isHome ? 'emerald' : 'gray'}
                onClick={onNavigateHome}
                title="Go to Main Page"
                style={{
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: isHome ? 'var(--brand-primary)' : '#ffffff',
                  color: isHome ? '#F2EBDD' : 'var(--brand-forest)',
                  flexShrink: 0,
                }}
              >
                <Home size={15} />
              </ActionIcon>
            )}

            <Box style={{ flex: 1, minWidth: 0 }}>
              <GoogleLinkInput
                onIngest={onIngestGoogleLink}
                loading={isIngesting}
              />
            </Box>
          </Group>

          {/* Row 2: User Status Chip + Upload + Lock Vault */}
          <Group justify="space-between" align="center" wrap="nowrap" style={{ width: '100%' }}>
            {user ? (
              <Paper
                px={8}
                py={3}
                radius="xl"
                style={{
                  backgroundColor: 'var(--surface-card-warm)',
                  border: '1px solid var(--border-gold)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Avatar size={18} radius="xl" color="emerald" variant="filled">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Avatar>
                <Text size="xs" fw={600} truncate style={{ maxWidth: 110, color: 'var(--brand-forest)' }}>
                  {user.name || user.email.split('@')[0]}
                </Text>
                <ShieldCheck size={12} color="var(--brand-gold)" />
              </Paper>
            ) : <Box />}

            <Group gap={6} wrap="nowrap">
              <Button
                leftSection={<UploadCloud size={14} color="#eedebd" />}
                size="compact-xs"
                radius="md"
                className="btn-premium-primary"
                onClick={onOpenUploadModal}
                style={{
                  height: '28px',
                  padding: '0 10px',
                  background: 'linear-gradient(135deg, #185844 0%, #102F27 100%)',
                  border: '1px solid rgba(176, 138, 79, 0.5)',
                  boxShadow: '0 2px 8px rgba(24, 88, 68, 0.2)',
                  color: '#F2EBDD',
                  fontWeight: 600,
                  fontSize: '11px',
                }}
              >
                Upload
              </Button>

              <Button
                leftSection={<LogOut size={13} color="#e11d48" />}
                size="compact-xs"
                radius="md"
                onClick={logout}
                style={{
                  height: '28px',
                  padding: '0 8px',
                  color: '#e11d48',
                  backgroundColor: '#fff1f2',
                  border: '1px solid #fecdd3',
                  fontWeight: 600,
                  fontSize: '11px',
                }}
              >
                Lock
              </Button>
            </Group>
          </Group>
        </Stack>
      ) : (
        /* Desktop Topbar */
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

            {onNavigateHome && (
              <Tooltip label="Go to Main Page (Dashboard)" withArrow position="bottom">
                <Button
                  size="sm"
                  radius="md"
                  variant={isHome ? 'filled' : 'subtle'}
                  color={isHome ? 'emerald' : 'gray'}
                  leftSection={<Home size={15} />}
                  onClick={onNavigateHome}
                  style={{
                    height: '34px',
                    padding: '0 12px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: isHome ? 'var(--brand-primary)' : '#ffffff',
                    color: isHome ? '#F2EBDD' : 'var(--brand-forest)',
                    fontWeight: 600,
                    fontSize: '12px',
                    flexShrink: 0,
                    boxShadow: isHome ? '0 2px 8px rgba(24, 88, 68, 0.25)' : 'none',
                  }}
                >
                  Main Page
                </Button>
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
              <Tooltip label={user.role === 'admin' ? `${user.email} • Admin` : user.email} withArrow>
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
      )}
    </Paper>
  );
}
