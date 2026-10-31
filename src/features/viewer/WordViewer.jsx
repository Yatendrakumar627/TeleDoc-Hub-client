import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Loader,
  Center,
  Progress,
  SegmentedControl,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  Download,
  Maximize2,
  Minimize2,
  Lock,
  ShieldCheck,
  Printer,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  FileText,
  BookOpen,
  Sparkles,
  X,
  ArrowLeft,
  Smartphone,
  Check,
} from 'lucide-react';
import { renderAsync } from 'docx-preview';
import SourceBadge from '../../components/ui/SourceBadge';
import EditableDocumentTitle from '../../components/ui/EditableDocumentTitle';
import { formatBytes } from '../../utils/formatters';
import { API_BASE_URL } from '../../config';

export default function WordViewer({ document, content, onRenameFile, onCloseFile }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [zoom, setZoom] = useState(1);
  const [autoFitActive, setAutoFitActive] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [streamProgress, setStreamProgress] = useState(null); // { percent, received, total, speed }
  const [renderError, setRenderError] = useState(null);
  const [viewMode, setViewMode] = useState('native'); // 'native' | 'html' | 'text'
  const [docHeight, setDocHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const docxContainerRef = useRef(null);
  const stageRef = useRef(null);

  const token = localStorage.getItem('teledoc_vault_jwt') || '';
  const downloadUrl = `${API_BASE_URL}/documents/${document.id}/download`;

  // Responsive container width tracking
  useEffect(() => {
    if (!stageRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute Auto-Fit Scale for small viewports (standard Word width is 816px)
  const fitScale = useMemo(() => {
    const stageW = containerWidth || (typeof window !== 'undefined' ? window.innerWidth - 32 : 360);
    const availableW = stageW - (isMobile ? 16 : 48);
    const calculated = +(availableW / 816).toFixed(2);
    return Math.min(1, Math.max(0.32, calculated));
  }, [containerWidth, isMobile]);

  // When on mobile or resizing, default to fitScale if autoFit is active
  useEffect(() => {
    if (isMobile && autoFitActive && fitScale > 0) {
      setZoom(fitScale);
    } else if (!isMobile && autoFitActive) {
      setZoom(1);
    }
  }, [isMobile, fitScale, autoFitActive]);

  // Track docx-preview rendered height to adjust outer wrapper
  useEffect(() => {
    if (!docxContainerRef.current) return;
    const observer = new ResizeObserver(() => {
      if (docxContainerRef.current) {
        setDocHeight(docxContainerRef.current.scrollHeight);
      }
    });
    observer.observe(docxContainerRef.current);
    return () => observer.disconnect();
  }, [viewMode, isLoading]);

  useEffect(() => {
    let isCancelled = false;

    const loadAndRenderDocx = async () => {
      if (viewMode !== 'native') return;
      setIsLoading(true);
      setRenderError(null);
      setStreamProgress({ percent: 5, received: 0, total: document.fileSize || 0, speed: 'Connecting...' });

      try {
        let arrayBuffer = null;

        // Progressive chunked stream reading via ReadableStream
        const streamUrl = `${API_BASE_URL}/documents/${document.id}/view?token=${encodeURIComponent(token)}`;
        const res = await fetch(streamUrl);
        if (!res.ok) {
          throw new Error(`Failed to stream document: ${res.statusText}`);
        }

        const totalBytes = Number(res.headers.get('Content-Length')) || document.fileSize || 0;
        const reader = res.body.getReader();

        let receivedLength = 0;
        const chunks = [];
        const startTime = Date.now();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          receivedLength += value.length;

          const elapsed = (Date.now() - startTime) / 1000;
          const speed = elapsed > 0 ? receivedLength / elapsed : 0;

          if (totalBytes > 0) {
            const percent = Math.min(100, Math.round((receivedLength / totalBytes) * 100));
            setStreamProgress({
              percent,
              received: receivedLength,
              total: totalBytes,
              speed: `${formatBytes(speed)}/s`,
            });
          }
        }

        if (isCancelled) return;

        // Assemble chunks in typed array
        const allChunks = new Uint8Array(receivedLength);
        let position = 0;
        for (const chunk of chunks) {
          allChunks.set(chunk, position);
          position += chunk.length;
        }

        arrayBuffer = allChunks.buffer;

        // Clear container before rendering
        if (docxContainerRef.current) {
          docxContainerRef.current.innerHTML = '';

          // Render with docx-preview with full pagination and styling
          await renderAsync(arrayBuffer, docxContainerRef.current, null, {
            inWrapper: true,
            ignoreWidth: false,
            ignoreHeight: false,
            ignoreFonts: false,
            breakPages: true,
            ignoreLastRenderedPageBreak: false,
            experimental: true,
            trimXmlDeclaration: true,
            useBase64URL: true,
            renderHeaders: true,
            renderFooters: true,
            renderFootnotes: true,
            renderEndnotes: true,
          });

          if (docxContainerRef.current) {
            setDocHeight(docxContainerRef.current.scrollHeight);
          }
        }

        if (!isCancelled) {
          setIsLoading(false);
          setStreamProgress(null);
        }
      } catch (err) {
        console.error('docx-preview rendering error:', err);
        if (!isCancelled) {
          setRenderError(err.message || 'Could not render Word document in native mode.');
          setIsLoading(false);
          setStreamProgress(null);
          // Auto-fallback to rich HTML view if native fails
          if (content?.html) {
            setViewMode('html');
          }
        }
      }
    };

    loadAndRenderDocx();

    return () => {
      isCancelled = true;
    };
  }, [document.id, viewMode]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box
      p={isMobile ? 6 : isFullscreen ? 'xs' : 'lg'}
      style={{
        maxWidth: isFullscreen ? '100%' : 1100,
        margin: '0 auto',
        width: '100%',
        transition: 'all 0.2s ease-in-out',
      }}
    >
      {/* 1. Header Card - Responsive Metadata & Controls */}
      <Paper
        p={isMobile ? 'xs' : 'md'}
        radius="md"
        mb={isMobile ? 'xs' : 'md'}
        className="premium-header-card"
        style={{ border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}
      >
        <Stack gap={isMobile ? 6 : 'xs'}>
          {isMobile ? (
            /* Compact Mobile Header */
            <Stack gap={6}>
              {/* Row 1: Source Badge + Title + Close Button */}
              <Group justify="space-between" align="center" wrap="nowrap">
                <Group gap={6} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                  <SourceBadge type="docx" format="document" />
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <EditableDocumentTitle document={document} onRename={onRenameFile} order={4} />
                  </Box>
                </Group>

                {onCloseFile && (
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    onClick={onCloseFile}
                    title="Close file preview"
                  >
                    <X size={16} />
                  </ActionIcon>
                )}
              </Group>

              {/* Row 2: View Mode Switcher + Zoom Controls + Download */}
              <Group justify="space-between" align="center" wrap="nowrap">
                {/* View Mode Toggle */}
                <Group gap={4} wrap="nowrap">
                  <Button
                    size="compact-xs"
                    variant={viewMode === 'native' ? 'filled' : 'subtle'}
                    color="emerald"
                    onClick={() => setViewMode('native')}
                    style={{ fontSize: '11px', fontWeight: 600, padding: '0 8px', height: '26px' }}
                  >
                    📄 Page
                  </Button>
                  <Button
                    size="compact-xs"
                    variant={viewMode === 'html' || viewMode === 'text' ? 'filled' : 'subtle'}
                    color="gray"
                    onClick={() => setViewMode(content?.html ? 'html' : 'text')}
                    style={{ fontSize: '11px', fontWeight: 600, padding: '0 8px', height: '26px' }}
                  >
                    📖 Read
                  </Button>
                </Group>

                {/* Mobile Zoom Controls (when in native page mode) */}
                {viewMode === 'native' && (
                  <Group gap={3} wrap="nowrap">
                    <Button
                      size="compact-xs"
                      variant={autoFitActive ? 'filled' : 'default'}
                      color={autoFitActive ? 'emerald' : 'gray'}
                      onClick={() => {
                        setAutoFitActive(true);
                        setZoom(fitScale);
                      }}
                      style={{ fontSize: '10px', height: '24px', padding: '0 6px' }}
                    >
                      Fit
                    </Button>
                    <Button
                      size="compact-xs"
                      variant={!autoFitActive && zoom === 1 ? 'filled' : 'default'}
                      color={!autoFitActive && zoom === 1 ? 'emerald' : 'gray'}
                      onClick={() => {
                        setAutoFitActive(false);
                        setZoom(1);
                      }}
                      style={{ fontSize: '10px', height: '24px', padding: '0 6px' }}
                    >
                      100%
                    </Button>
                    <ActionIcon
                      variant="default"
                      size="xs"
                      onClick={() => {
                        setAutoFitActive(false);
                        setZoom((z) => Math.max(0.3, +(z - 0.1).toFixed(2)));
                      }}
                    >
                      <ZoomOut size={12} />
                    </ActionIcon>
                    <ActionIcon
                      variant="default"
                      size="xs"
                      onClick={() => {
                        setAutoFitActive(false);
                        setZoom((z) => Math.min(2.0, +(z + 0.1).toFixed(2)));
                      }}
                    >
                      <ZoomIn size={12} />
                    </ActionIcon>
                  </Group>
                )}

                {/* Mobile Download Button */}
                <ActionIcon
                  component="a"
                  href={downloadUrl}
                  download={document.filename}
                  variant="filled"
                  color="emerald"
                  size="sm"
                  title="Download DOCX"
                >
                  <Download size={13} />
                </ActionIcon>
              </Group>

              {/* Row 3: Micro info bar */}
              <Group gap={6} align="center">
                <Text size="10px" c="dimmed">
                  {formatBytes(document.fileSize || content?.fileSize || 0)}
                </Text>
                {document.collectionName && document.collectionName !== 'Unassigned' && (
                  <Badge color="emerald" variant="light" size="xs" style={{ fontSize: '9px', height: '18px' }}>
                    📁 {document.collectionName}
                  </Badge>
                )}
                <Badge color="teal" variant="light" size="xs" style={{ fontSize: '9px', height: '18px' }}>
                  Vault Synced
                </Badge>
              </Group>
            </Stack>
          ) : (
            /* Desktop Full Header */
            <Group justify="space-between" align="flex-start" wrap="wrap">
              <Box style={{ flex: 1, minWidth: 260 }}>
                <Group gap="xs" mb={4} wrap="wrap">
                  <SourceBadge type="docx" format="document" />

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
                </Group>

                <EditableDocumentTitle document={document} onRename={onRenameFile} order={3} />
                <Text size="xs" c="dimmed" mt={2}>
                  Original file: {document.filename} • {formatBytes(document.fileSize || content?.fileSize || 0)}
                </Text>
              </Box>

              {/* Action Bar */}
              <Group gap="xs" align="center" wrap="wrap">
                {/* 1. Zoom & Auto-Fit Segment */}
                {viewMode === 'native' && (
                  <Group
                    gap={2}
                    p={2}
                    style={{
                      backgroundColor: 'var(--surface-sunken)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      height: 32,
                    }}
                  >
                    <Tooltip label="Auto Fit to Width" withArrow>
                      <Button
                        size="compact-xs"
                        variant={autoFitActive ? 'filled' : 'subtle'}
                        color={autoFitActive ? 'emerald' : 'gray'}
                        onClick={() => {
                          setAutoFitActive(true);
                          setZoom(fitScale);
                        }}
                        style={{
                          height: 26,
                          fontSize: '11px',
                          fontWeight: 600,
                          borderRadius: '6px',
                          backgroundColor: autoFitActive ? 'var(--brand-forest)' : 'transparent',
                          color: autoFitActive ? '#ffffff' : 'var(--text-secondary)',
                          padding: '0 8px',
                        }}
                      >
                        Fit
                      </Button>
                    </Tooltip>
                    <Tooltip label="Zoom Out" withArrow>
                      <ActionIcon
                        variant="subtle"
                        size="xs"
                        color="gray"
                        style={{ height: 26, width: 26, borderRadius: '6px', color: 'var(--text-secondary)' }}
                        onClick={() => {
                          setAutoFitActive(false);
                          setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(2)));
                        }}
                      >
                        <ZoomOut size={13} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Reset to 100%" withArrow>
                      <Button
                        variant="subtle"
                        size="compact-xs"
                        color="gray"
                        onClick={() => {
                          setAutoFitActive(false);
                          setZoom(1);
                        }}
                        style={{
                          height: 26,
                          fontWeight: 600,
                          fontSize: '11px',
                          padding: '0 6px',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {Math.round(zoom * 100)}%
                      </Button>
                    </Tooltip>
                    <Tooltip label="Zoom In" withArrow>
                      <ActionIcon
                        variant="subtle"
                        size="xs"
                        color="gray"
                        style={{ height: 26, width: 26, borderRadius: '6px', color: 'var(--text-secondary)' }}
                        onClick={() => {
                          setAutoFitActive(false);
                          setZoom((z) => Math.min(1.75, +(z + 0.1).toFixed(2)));
                        }}
                      >
                        <ZoomIn size={13} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                )}

                {/* 2. Modern Segmented View Mode */}
                <SegmentedControl
                  size="xs"
                  value={viewMode}
                  onChange={setViewMode}
                  data={[
                    { label: 'Word View', value: 'native' },
                    ...(content?.html ? [{ label: 'HTML', value: 'html' }] : []),
                    { label: 'Text', value: 'text' },
                  ]}
                  radius="md"
                  styles={{
                    root: {
                      backgroundColor: 'var(--surface-sunken)',
                      border: '1px solid var(--border-subtle)',
                      padding: '2px',
                      height: 32,
                    },
                    indicator: {
                      backgroundColor: 'var(--surface-card)',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                    },
                    label: {
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      padding: '4px 10px',
                    },
                  }}
                />

                {/* 3. Utility Actions */}
                <Group gap={4}>
                  <Tooltip label="Print Document" withArrow>
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      color="gray"
                      onClick={handlePrint}
                      style={{
                        height: 32,
                        width: 32,
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--surface-card)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <Printer size={15} />
                    </ActionIcon>
                  </Tooltip>

                  <Tooltip label={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'} withArrow>
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      color="gray"
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      style={{
                        height: 32,
                        width: 32,
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--surface-card)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                    </ActionIcon>
                  </Tooltip>
                </Group>

                {/* 4. Primary CTAs & Status Badge */}
                <Group gap="xs" align="center" wrap="nowrap">
                  <Tooltip label="Decrypted Zero-Knowledge Telegram Blob verified" withArrow>
                    <Badge
                      variant="light"
                      color="teal"
                      size="sm"
                      leftSection={<ShieldCheck size={12} />}
                      style={{
                        height: 32,
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(24, 88, 68, 0.08)',
                        color: 'var(--brand-forest)',
                        border: '1px solid rgba(24, 88, 68, 0.2)',
                      }}
                    >
                      Vault Synced
                    </Badge>
                  </Tooltip>

                  <Button
                    component="a"
                    href={downloadUrl}
                    download={document.filename}
                    size="xs"
                    variant="filled"
                    leftSection={<Download size={13} />}
                    style={{
                      height: 32,
                      fontWeight: 600,
                      borderRadius: '8px',
                      backgroundColor: 'var(--brand-forest)',
                      color: '#ffffff',
                      boxShadow: '0 2px 6px rgba(24, 88, 68, 0.2)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    Download DOCX
                  </Button>

                  {onCloseFile && (
                    <Tooltip
                      label={
                        document?.collectionName && document.collectionName !== 'Unassigned'
                          ? `Back to "${document.collectionName}" folder (Esc)`
                          : 'Close file preview (Esc)'
                      }
                      withArrow
                      position="bottom-end"
                    >
                      <Button
                        size="xs"
                        variant="subtle"
                        color="gray"
                        leftSection={
                          document?.collectionName && document.collectionName !== 'Unassigned' ? (
                            <ArrowLeft size={14} />
                          ) : (
                            <X size={14} />
                          )
                        }
                        onClick={onCloseFile}
                        style={{
                          height: 32,
                          borderRadius: '8px',
                          border: '1px solid var(--border-subtle)',
                          backgroundColor: 'var(--surface-card)',
                          color: 'var(--text-primary)',
                          fontWeight: 600,
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {document?.collectionName && document.collectionName !== 'Unassigned'
                          ? 'Back to Folder (Esc)'
                          : 'Close (Esc)'}
                      </Button>
                    </Tooltip>
                  )}
                </Group>
              </Group>
            </Group>
          )}
        </Stack>
      </Paper>

      {/* 2. Document Stage Canvas */}
      <Paper
        ref={stageRef}
        radius="md"
        withBorder
        style={{
          backgroundColor: '#525659', // Authentic PDF/Word reader desktop gray
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
          maxHeight: isFullscreen ? 'calc(100vh - 120px)' : (isMobile ? 'calc(100vh - 180px)' : '82vh'),
          minHeight: isMobile ? '420px' : '600px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
          position: 'relative',
        }}
      >
        {/* Progressive Chunk Streaming Overlay */}
        {isLoading && viewMode === 'native' && (
          <Center
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(82, 86, 89, 0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 10,
            }}
          >
            <Paper
              p="lg"
              radius="md"
              withBorder
              style={{
                backgroundColor: '#ffffff',
                minWidth: isMobile ? 280 : 340,
                maxWidth: 440,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              }}
            >
              <Stack gap="xs">
                <Group justify="space-between" align="center">
                  <Group gap={6}>
                    <Sparkles size={16} color="#0284c7" />
                    <Text size="xs" fw={700} c="#0f172a" tt="uppercase" style={{ letterSpacing: '0.04em' }}>
                      Streaming In Chunks
                    </Text>
                  </Group>
                  <Badge size="xs" variant="filled" color="blue">
                    {streamProgress?.percent ? `${streamProgress.percent}%` : 'Connecting...'}
                  </Badge>
                </Group>

                <Progress
                  value={streamProgress?.percent || 20}
                  animated
                  striped
                  color="blue"
                  size="sm"
                  radius="xl"
                />

                <Group justify="space-between" mt={2}>
                  <Text size="xs" c="dimmed">
                    {streamProgress?.received
                      ? `${formatBytes(streamProgress.received)} of ${formatBytes(streamProgress.total)}`
                      : 'Connecting to Telegram Vault...'}
                  </Text>
                  <Text size="xs" fw={600} c="blue">
                    {streamProgress?.speed || ''}
                  </Text>
                </Group>
              </Stack>
            </Paper>
          </Center>
        )}

        {/* Real Native Word Document Render (via docx-preview) */}
        {viewMode === 'native' ? (
          <Box
            style={{
              padding: isMobile ? '12px 6px' : '32px 16px',
              minWidth: zoom >= 1 && isMobile ? '832px' : '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              /* Crucial: Prevent negative-X clipping by aligning to flex-start when unscaled */
              alignItems: isMobile && zoom >= 1 ? 'flex-start' : 'center',
            }}
          >
            {/* Scaled Geometry Wrapper */}
            <div
              style={{
                width: zoom < 1 ? `${Math.round(816 * zoom)}px` : '816px',
                height: docHeight > 0 && zoom < 1 ? `${Math.round(docHeight * zoom)}px` : 'auto',
                overflow: 'visible',
                margin: isMobile && zoom >= 1 ? '0' : '0 auto',
                transition: 'width 0.15s ease, height 0.15s ease',
              }}
            >
              <div
                ref={docxContainerRef}
                className="word-native-container"
                style={{
                  width: '816px',
                  transform: zoom !== 1 ? `scale(${zoom})` : undefined,
                  transformOrigin: zoom < 1 ? 'top left' : 'top center',
                  transition: 'transform 0.15s ease',
                }}
              />
            </div>
          </Box>
        ) : viewMode === 'html' ? (
          /* Responsive Reflowed HTML View (Perfect for mobile reading) */
          <Box
            p={isMobile ? 'md' : 'xl'}
            style={{
              backgroundColor: '#ffffff',
              maxWidth: 860,
              margin: isMobile ? '8px auto' : '24px auto',
              borderRadius: '8px',
              minHeight: isMobile ? '400px' : '800px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            }}
          >
            <div
              className="rich-doc-content"
              dangerouslySetInnerHTML={{ __html: content?.html || '' }}
              style={{
                lineHeight: 1.8,
                fontSize: isMobile ? '15px' : '16px',
                color: '#1e293b',
                wordBreak: 'break-word',
              }}
            />
          </Box>
        ) : (
          /* Responsive Plain Text View */
          <Box
            p={isMobile ? 'md' : 'xl'}
            style={{
              backgroundColor: '#ffffff',
              maxWidth: 860,
              margin: isMobile ? '8px auto' : '24px auto',
              borderRadius: '8px',
              minHeight: isMobile ? '400px' : '800px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            }}
          >
            <Text
              style={{
                whiteSpace: 'pre-wrap',
                lineHeight: 1.8,
                fontSize: isMobile ? '14px' : '15px',
                color: '#1e293b',
                wordBreak: 'break-word',
              }}
            >
              {content?.text || 'No text extracted.'}
            </Text>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

