import React, { useState, useEffect } from 'react';
import { AppShell, Stack, Box, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const DEFAULT_SIDEBAR_WIDTH = 340;
const MIN_SIDEBAR_WIDTH = 260;
const MAX_SIDEBAR_WIDTH = 680;

export default function WorkspaceLayout({
  sidebarProps,
  topbarProps,
  children,
}) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [sidebarOpened, setSidebarOpened] = useState(!isMobile);

  // Dynamic Adjustable Sidebar Width with localStorage persistence
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    try {
      const saved = localStorage.getItem('teledoc_sidebar_width');
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= MIN_SIDEBAR_WIDTH && parsed <= MAX_SIDEBAR_WIDTH) {
        return parsed;
      }
    } catch (e) {
      console.warn('Could not read sidebar width from localStorage:', e);
    }
    return DEFAULT_SIDEBAR_WIDTH;
  });

  const [isResizing, setIsResizing] = useState(false);

  // Global mousemove and mouseup listeners during active resize
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const maxWidth = Math.min(window.innerWidth * 0.55, MAX_SIDEBAR_WIDTH);
      const newWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(e.clientX, maxWidth));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      setSidebarWidth((latestWidth) => {
        try {
          localStorage.setItem('teledoc_sidebar_width', latestWidth.toString());
        } catch (e) {}
        return latestWidth;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing]);

  // Touch resize support for tablets / hybrid laptops
  useEffect(() => {
    if (!isResizing) return;

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        const touchX = e.touches[0].clientX;
        const maxWidth = Math.min(window.innerWidth * 0.55, MAX_SIDEBAR_WIDTH);
        const newWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(touchX, maxWidth));
        setSidebarWidth(newWidth);
      }
    };

    const handleTouchEnd = () => {
      setIsResizing(false);
      setSidebarWidth((latestWidth) => {
        try {
          localStorage.setItem('teledoc_sidebar_width', latestWidth.toString());
        } catch (e) {}
        return latestWidth;
      });
    };

    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isResizing]);

  const handleResetWidth = () => {
    setSidebarWidth(DEFAULT_SIDEBAR_WIDTH);
    try {
      localStorage.setItem('teledoc_sidebar_width', DEFAULT_SIDEBAR_WIDTH.toString());
    } catch (e) {}
  };

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
      padding={0}
      navbar={{
        width: sidebarWidth,
        breakpoint: 'sm',
        collapsed: { desktop: !sidebarOpened, mobile: !sidebarOpened },
      }}
      transitionDuration={isResizing ? 0 : 200}
      transitionTimingFunction="ease"
      styles={{
        navbar: {
          backgroundColor: 'var(--surface-sidebar)',
          borderRight: '1px solid var(--border-subtle)',
          overflow: 'hidden',
          zIndex: 100,
          width: isMobile ? 'min(315px, 82vw) !important' : `${sidebarWidth}px !important`,
          maxWidth: isMobile ? '82vw !important' : `${sidebarWidth}px !important`,
          transition: isResizing ? 'none !important' : 'width 0.2s ease, transform 0.2s ease !important',
          boxShadow: isMobile && sidebarOpened ? '12px 0 35px rgba(16, 47, 39, 0.35)' : undefined,
          overscrollBehavior: 'contain',
        },
        main: {
          backgroundColor: 'var(--surface-app)',
          minHeight: '100vh',
          paddingLeft: isMobile ? 0 : (sidebarOpened ? `${sidebarWidth}px` : 0),
          paddingRight: 0,
          paddingTop: 0,
          paddingBottom: 0,
          transition: isResizing ? 'none !important' : 'padding-left 0.2s ease !important',
          boxSizing: 'border-box',
          width: '100%',
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

        {/* Desktop Resizable Drag Handle with Live Indicator & Double-Click Reset */}
        {!isMobile && sidebarOpened && (
          <Box
            className={`sidebar-resizer-handle ${isResizing ? 'is-resizing' : ''}`}
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
            }}
            onTouchStart={() => setIsResizing(true)}
            onDoubleClick={handleResetWidth}
            title="Drag to resize sidebar width • Double-click to reset"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 8,
              height: '100%',
              cursor: 'col-resize',
              zIndex: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              userSelect: 'none',
              touchAction: 'none',
            }}
          >
            {/* Visual dividing accent bar on hover/active */}
            <Box
              className="sidebar-resizer-line"
              style={{
                width: isResizing ? 3 : 2,
                height: '100%',
                backgroundColor: isResizing ? 'var(--brand-emerald, #185844)' : 'transparent',
                borderRadius: 99,
                transition: isResizing ? 'none' : 'background-color 0.15s ease, width 0.15s ease',
              }}
            />

            {/* Live Width Floating Pill when actively resizing */}
            {isResizing && (
              <Box
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: 14,
                  transform: 'translateY(-50%)',
                  backgroundColor: 'var(--brand-forest, #102F27)',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 6,
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  zIndex: 200,
                  letterSpacing: '0.02em',
                }}
              >
                {Math.round(sidebarWidth)}px
              </Box>
            )}
          </Box>
        )}
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
