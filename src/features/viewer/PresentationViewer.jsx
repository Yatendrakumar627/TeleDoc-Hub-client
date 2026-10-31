import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Stack,
  Group,
  Text,
  Title,
  Button,
  Badge,
  ActionIcon,
  Tooltip,
  Divider,
  ScrollArea,
} from '@mantine/core';
import {
  Presentation,
  Download,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Lock,
  ShieldCheck,
  FileText,
  Layers,
  X,
} from 'lucide-react';
import SourceBadge from '../../components/ui/SourceBadge';
import EditableDocumentTitle from '../../components/ui/EditableDocumentTitle';
import { formatBytes } from '../../utils/formatters';

export default function PresentationViewer({ document, content, onRenameFile, onCloseFile }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const slides = content?.slides || [];
  const slideCount = slides.length || content?.slideCount || 0;
  const currentSlide = slides[currentSlideIndex] || null;

  const downloadUrl = `/api/documents/${document.id}/download`;

  // Keyboard navigation: ArrowLeft / ArrowRight
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setCurrentSlideIndex((prev) => Math.min(prev + 1, slideCount - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slideCount, isFullscreen]);

  return (
    <Box
      p={isFullscreen ? 'xs' : 'lg'}
      style={{
        maxWidth: isFullscreen ? '100%' : 1100,
        margin: '0 auto',
        width: '100%',
        transition: 'all 0.2s ease-in-out',
      }}
    >
      {/* Top Header Card */}
      <Paper
        p="md"
        radius="md"
        mb="md"
        className="premium-header-card"
        style={{ border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}
      >
        <Stack gap="xs">
          <Group justify="space-between" align="flex-start" wrap="wrap">
            <Box style={{ flex: 1, minWidth: 260 }}>
              <Group gap="xs" mb={4} wrap="wrap">
                <SourceBadge type="pptx" format="presentation" />

                {document.collectionName && document.collectionName !== 'Unassigned' && (
                  <Badge color="emerald" variant="filled" size="xs">
                    📁 {document.collectionName}
                  </Badge>
                )}

                {document.scope && (
                  <Badge
                    color={document.scope === 'personal' ? 'sage' : 'emerald'}
                    variant="light"
                    size="xs"
                  >
                    {document.scope === 'personal' ? 'Personal' : 'Work'}
                  </Badge>
                )}

                {document.security?.isEncrypted && (
                  <Badge color="teal" variant="light" size="xs" leftSection={<Lock size={10} />} className="badge-emerald">
                    AES-256 Encrypted
                  </Badge>
                )}

                <Badge color="orange" variant="light" size="xs" leftSection={<Layers size={10} />}>
                  {slideCount} {slideCount === 1 ? 'Slide' : 'Slides'}
                </Badge>
              </Group>

              <EditableDocumentTitle document={document} onRename={onRenameFile} order={3} />
              <Text size="xs" c="dimmed" mt={2}>
                Original file: {document.filename} • {formatBytes(document.fileSize || 0)}
              </Text>
            </Box>

            {/* Presentation Controls */}
            <Group gap="xs" wrap="wrap">
              <Group gap={4}>
                <ActionIcon
                  size="md"
                  variant="default"
                  disabled={currentSlideIndex <= 0}
                  onClick={() => setCurrentSlideIndex((prev) => Math.max(prev - 1, 0))}
                >
                  <ChevronLeft size={16} />
                </ActionIcon>

                <Badge variant="filled" color="dark" size="sm">
                  Slide {currentSlideIndex + 1} / {slideCount || 1}
                </Badge>

                <ActionIcon
                  size="md"
                  variant="default"
                  disabled={currentSlideIndex >= slideCount - 1}
                  onClick={() => setCurrentSlideIndex((prev) => Math.min(prev + 1, slideCount - 1))}
                >
                  <ChevronRight size={16} />
                </ActionIcon>
              </Group>

              <Tooltip label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Slideshow'} withArrow>
                <ActionIcon
                  size="md"
                  variant="default"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </ActionIcon>
              </Tooltip>

              <Button
                component="a"
                href={downloadUrl}
                download={document.filename}
                size="xs"
                variant="filled"
                color="orange"
                leftSection={<Download size={13} />}
              >
                Download PPTX
              </Button>

              <Badge
                variant="outline"
                color="teal"
                size="sm"
                leftSection={<ShieldCheck size={12} />}
                className="mono-badge"
              >
                Vault Synced
              </Badge>

              {onCloseFile && (
                <Tooltip label="Close file preview (Esc)" withArrow position="bottom-end">
                  <Button
                    size="xs"
                    variant="subtle"
                    color="gray"
                    leftSection={<X size={14} />}
                    onClick={onCloseFile}
                    style={{
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--surface-card)',
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    Close (Esc)
                  </Button>
                </Tooltip>
              )}
            </Group>
          </Group>
        </Stack>
      </Paper>

      {/* Main Presentation Layout: Filmstrip + 16:9 Slide Canvas */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: isFullscreen ? '220px 1fr' : '200px 1fr',
          gap: '16px',
          alignItems: 'start',
        }}
      >
        {/* Left Filmstrip / Slide Thumbnails */}
        <Paper
          p="xs"
          radius="md"
          withBorder
          style={{
            backgroundColor: '#ffffff',
            height: isFullscreen ? 'calc(100vh - 120px)' : '72vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Text size="xs" fw={700} c="dimmed" mb="xs" px="xs" tt="uppercase">
            Slides ({slideCount})
          </Text>
          <ScrollArea style={{ flex: 1 }}>
            <Stack gap="xs">
              {slides.map((s, idx) => (
                <Box
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  p="xs"
                  style={{
                    cursor: 'pointer',
                    borderRadius: '6px',
                    backgroundColor: idx === currentSlideIndex ? '#fff7ed' : '#f8fafc',
                    border: `1.5px solid ${idx === currentSlideIndex ? '#f97316' : '#e2e8f0'}`,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Group justify="space-between" mb={2}>
                    <Badge size="xs" variant={idx === currentSlideIndex ? 'filled' : 'light'} color="orange">
                      #{s.slideNumber}
                    </Badge>
                  </Group>
                  <Text size="xs" fw={600} lineClamp={1} c="#1e293b">
                    {s.title || `Slide ${s.slideNumber}`}
                  </Text>
                  <Text size="xs" c="dimmed" lineClamp={2} style={{ fontSize: '0.75rem' }}>
                    {s.bullets?.[0] || 'No subtitle'}
                  </Text>
                </Box>
              ))}
            </Stack>
          </ScrollArea>
        </Paper>

        {/* Center 16:9 Presentation Stage */}
        <Paper
          p="xl"
          radius="md"
          withBorder
          style={{
            backgroundColor: '#ffffff',
            height: isFullscreen ? 'calc(100vh - 120px)' : '72vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
            borderTop: '4px solid #f97316',
            position: 'relative',
          }}
        >
          {currentSlide ? (
            <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Slide Header */}
              <Group justify="space-between" align="center" mb="lg">
                <Badge color="orange" variant="light" size="sm">
                  Slide {currentSlide.slideNumber} of {slideCount}
                </Badge>
                <Text size="xs" c="dimmed">
                  Use ← → keys to navigate
                </Text>
              </Group>

              {/* Slide Title */}
              <Title
                order={2}
                style={{
                  fontSize: isFullscreen ? '2.4rem' : '1.8rem',
                  color: '#0f172a',
                  fontWeight: 700,
                  marginBottom: '1.5rem',
                  lineHeight: 1.25,
                }}
              >
                {currentSlide.title}
              </Title>

              <Divider mb="lg" />

              {/* Slide Content Bullets */}
              <ScrollArea style={{ flex: 1 }}>
                <Stack gap="md" pr="md">
                  {currentSlide.bullets && currentSlide.bullets.length > 0 ? (
                    currentSlide.bullets.map((bullet, bIdx) => (
                      <Box
                        key={bIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                        }}
                      >
                        <Box
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: '#f97316',
                            marginTop: 10,
                            flexShrink: 0,
                          }}
                        />
                        <Text
                          style={{
                            fontSize: isFullscreen ? '1.25rem' : '1.05rem',
                            lineHeight: 1.6,
                            color: '#334155',
                          }}
                        >
                          {bullet}
                        </Text>
                      </Box>
                    ))
                  ) : (
                    <Box ta="center" py="xl">
                      <Presentation size={48} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
                      <Text c="dimmed" size="sm">
                        This slide does not contain bullet text.
                      </Text>
                    </Box>
                  )}
                </Stack>
              </ScrollArea>
            </Box>
          ) : (
            <Box ta="center" py="xl">
              <FileText size={48} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
              <Text c="dimmed" size="sm">
                No slide content available.
              </Text>
            </Box>
          )}

          {/* Bottom Stage Bar */}
          <Divider my="sm" />
          <Group justify="space-between" align="center">
            <Button
              size="xs"
              variant="subtle"
              color="orange"
              disabled={currentSlideIndex <= 0}
              leftSection={<ChevronLeft size={14} />}
              onClick={() => setCurrentSlideIndex((prev) => Math.max(prev - 1, 0))}
            >
              Previous Slide
            </Button>

            <Group gap="xs">
              <Text size="xs" c="dimmed">
                {document.filename}
              </Text>
            </Group>

            <Button
              size="xs"
              variant="filled"
              color="orange"
              disabled={currentSlideIndex >= slideCount - 1}
              rightSection={<ChevronRight size={14} />}
              onClick={() => setCurrentSlideIndex((prev) => Math.min(prev + 1, slideCount - 1))}
            >
              Next Slide
            </Button>
          </Group>
        </Paper>
      </Box>
    </Box>
  );
}

