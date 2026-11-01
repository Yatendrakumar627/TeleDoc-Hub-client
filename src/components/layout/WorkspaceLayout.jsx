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

  // Auto-collapse sidebar on mobile when a document, collection, or group is selected
  useEffect(() => {
    if (isMobile && (sidebarProps?.selectedDocId || sidebarProps?.selectedCollectionId || sidebarProps?.selectedGroupId)) {
      setSidebarOpened(false);
    }
  }, [sidebarProps?.selectedDocId, sidebarProps?.selectedCollectionId, sidebarProps?.selectedGroupId, isMobile]);

  // Root cause fix: Prevent background scroll bleed when mobile sidebar drawer is open
  useEffect(() => {
    if (isMobile && sidebarOpened) {
      const prevBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevBodyOverflow || '';
      };
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  }, [isMobile, sidebarOpened]);

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

  // Wrapped handlers to ensure mobile sidebar collapses cleanly on any navigation click
  const handleSelectDoc = (docId) => {
    if (isMobile) setSidebarOpened(false);
    sidebarProps?.onSelectDoc?.(docId);
  };

  const handleSelectCollection = (col) => {
    if (isMobile) setSidebarOpened(false);
    sidebarProps?.onSelectCollection?.(col);
  };

  const handleSelectGroup = (grp) => {
    if (isMobile) setSidebarOpened(false);
    sidebarProps?.onSelectGroup?.(grp);
  };

  const handleNavigateHome = () => {
    if (isMobile) setSidebarOpened(false);
    sidebarProps?.onNavigateHome?.();
    topbarProps?.onNavigateHome?.();
  };

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
          overscrollBehavior: 'contain',
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
          onSelectDoc={handleSelectDoc}
          onSelectCollection={handleSelectCollection}
          onSelectGroup={handleSelectGroup}
          onNavigateHome={handleNavigateHome}
          onCollapseSidebar={() => setSidebarOpened(false)}
        />
      </AppShell.Navbar>

      <AppShell.Main>
        {/* Mobile Scrim / Backdrop with peek area: Tapping anywhere on the remaining ratio area closes sidebar */}
        {isMobile && sidebarOpened && (
          <Box
            className="sidebar-mobile-backdrop"
            onClick={() => setSidebarOpened(false)}
            onTouchMove={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onWheel={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
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
              touchAction: 'none',
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

        <Topbar
          {...topbarProps}
          sidebarOpened={sidebarOpened}
          onToggleSidebar={toggleSidebar}
          onNavigateHome={handleNavigateHome}
        />
        <Box style={{ width: '100%', minHeight: 'calc(100vh - 65px)' }}>
          {children}
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
