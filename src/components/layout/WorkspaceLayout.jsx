import React, { useState, useEffect } from 'react';
import { AppShell, Stack, Box } from '@mantine/core';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function WorkspaceLayout({
  sidebarProps,
  topbarProps,
  children,
}) {
  const [sidebarOpened, setSidebarOpened] = useState(true);

  // Global hotkey: Ctrl+B or Cmd+B toggles sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        const activeTag = document.activeElement?.tagName;
        if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;
        e.preventDefault();
        setSidebarOpened((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleSidebar = () => setSidebarOpened((prev) => !prev);

  return (
    <AppShell
      navbar={{
        width: 350,
        breakpoint: 'sm',
        collapsed: { desktop: !sidebarOpened, mobile: !sidebarOpened },
      }}
      transitionDuration={200}
      transitionTimingFunction="ease"
      styles={{
        navbar: {
          backgroundColor: 'var(--surface-sidebar)',
          borderRight: '1px solid var(--border-subtle)',
          overflow: 'hidden',
        },
        main: {
          backgroundColor: 'var(--surface-app)',
          minHeight: '100vh',
          transition: 'padding-left 0.2s ease',
        },
      }}
    >
      <AppShell.Navbar>
        <Sidebar
          {...sidebarProps}
          onCollapseSidebar={() => setSidebarOpened(false)}
        />
      </AppShell.Navbar>

      <AppShell.Main>
        <Stack gap={0} h="100%">
          <Topbar
            {...topbarProps}
            sidebarOpened={sidebarOpened}
            onToggleSidebar={toggleSidebar}
          />
          <Box style={{ flex: 1, overflowY: 'auto' }}>
            {children}
          </Box>
        </Stack>
      </AppShell.Main>
    </AppShell>
  );
}
