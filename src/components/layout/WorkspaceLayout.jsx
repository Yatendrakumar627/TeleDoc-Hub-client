import React, { useState, useEffect } from 'react';
import { AppShell, Stack, Box, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function WorkspaceLayout({
  sidebarProps,
  topbarProps,
  children,
}) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [sidebarOpened, setSidebarOpened] = useState(!isMobile);

  // Auto-collapse sidebar on mobile when a document is selected for reading
  useEffect(() => {
    if (isMobile && sidebarProps?.selectedDocId) {
      setSidebarOpened(false);
    }
  }, [sidebarProps?.selectedDocId, isMobile]);

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
        width: isMobile ? 'min(315px, 80vw)' : 350,
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
          zIndex: 100,
          width: isMobile ? 'min(315px, 80vw) !important' : '350px',
          maxWidth: isMobile ? '82vw !important' : '350px',
          boxShadow: isMobile && sidebarOpened ? '12px 0 35px rgba(16, 47, 39, 0.35)' : undefined,
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
        {/* Mobile Scrim / Backdrop with peek area: Tapping anywhere on the remaining ratio area closes sidebar */}
        {isMobile && sidebarOpened && (
          <Box
            onClick={() => setSidebarOpened(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(16, 47, 39, 0.42)',
              backdropFilter: 'blur(2.5px)',
              WebkitBackdropFilter: 'blur(2.5px)',
              zIndex: 90,
              cursor: 'pointer',
              transition: 'opacity 0.2s ease',
            }}
          >
            {/* Peek Action Badge on the remaining right margin */}
            <Box
              style={{
                position: 'absolute',
                top: 16,
                right: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid var(--brand-primary-border)',
                borderRadius: '16px',
                padding: '5px 9px',
                boxShadow: '0 4px 12px rgba(16, 47, 39, 0.2)',
                pointerEvents: 'none',
              }}
            >
              <Text size="10px" fw={700} c="var(--brand-primary)" style={{ whiteSpace: 'nowrap' }}>
                ✕ Tap to view
              </Text>
            </Box>
          </Box>
        )}

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
