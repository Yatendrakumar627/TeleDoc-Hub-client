import React from 'react';
import { AppShell, Stack, Box } from '@mantine/core';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function WorkspaceLayout({
  sidebarProps,
  topbarProps,
  children,
}) {
  return (
    <AppShell
      navbar={{
        width: 320,
        breakpoint: 'sm',
      }}
      styles={{
        navbar: {
          backgroundColor: 'var(--surface-sidebar)',
          borderRight: '1px solid var(--border-subtle)',
        },
        main: {
          backgroundColor: 'var(--surface-app)',
          minHeight: '100vh',
        },
      }}
    >
      <AppShell.Navbar>
        <Sidebar {...sidebarProps} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Stack gap={0} h="100%">
          <Topbar {...topbarProps} />
          <Box style={{ flex: 1, overflowY: 'auto' }}>
            {children}
          </Box>
        </Stack>
      </AppShell.Main>
    </AppShell>
  );
}
