import React from 'react';
import { Paper, Title, Text, Button, Stack, Group, Box } from '@mantine/core';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[TeleDoc Vault] Uncaught Interface Error:', error, errorInfo);

    // Auto-recover from stale Vite chunks or dynamic import chunk mismatches
    const errMsg = (error?.message || '').toLowerCase();
    if (
      errMsg.includes('failed to fetch dynamically imported module') ||
      errMsg.includes('cannot read properties of null (reading \'usecontext\')') ||
      errMsg.includes('chunk')
    ) {
      const hasAutoReloaded = sessionStorage.getItem('teledoc_auto_reloaded_chunk');
      if (!hasAutoReloaded) {
        sessionStorage.setItem('teledoc_auto_reloaded_chunk', 'true');
        console.warn('[TeleDoc Vault] Detected stale asset chunk. Auto-refreshing page cache...');
        window.location.reload();
      }
    }
  }

  handleReload = () => {
    sessionStorage.removeItem('teledoc_auto_reloaded_chunk');
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          style={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            backgroundColor: 'var(--surface-app, #f9f7f2)',
          }}
        >
          <Paper
            p="xl"
            radius="lg"
            withBorder
            style={{
              maxWidth: 480,
              width: '100%',
              backgroundColor: '#ffffff',
              borderColor: 'var(--border-subtle, #e5dfd5)',
              boxShadow: '0 10px 30px rgba(16, 47, 39, 0.12)',
              textAlign: 'center',
            }}
          >
            <Stack align="center" gap="md">
              <Box
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  backgroundColor: '#fef2f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#dc2626',
                }}
              >
                <AlertTriangle size={28} />
              </Box>

              <Title order={3} style={{ color: 'var(--brand-forest, #102F27)', fontWeight: 700 }}>
                Interface Session Refresh Required
              </Title>

              <Text size="sm" c="dimmed" style={{ lineHeight: 1.5 }}>
                A cached module mismatch occurred in the browser after a live asset update. A quick refresh will re-sync your zero-knowledge vault session.
              </Text>

              <Group gap="sm" mt="xs">
                <Button
                  leftSection={<RefreshCw size={15} />}
                  onClick={this.handleReload}
                  className="btn-premium-primary"
                  radius="md"
                  style={{
                    background: 'linear-gradient(135deg, #185844 0%, #102F27 100%)',
                    fontWeight: 600,
                  }}
                >
                  Refresh Application
                </Button>
                <Button variant="default" radius="md" onClick={this.handleReset}>
                  Try Again
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}
