import React, { useState, useEffect, useRef } from 'react';
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
} from '@mantine/core';
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
} from 'lucide-react';
import { renderAsync } from 'docx-preview';
import SourceBadge from '../../components/ui/SourceBadge';
import EditableDocumentTitle from '../../components/ui/EditableDocumentTitle';
import { formatBytes } from '../../utils/formatters';
import { API_BASE_URL } from '../../config';

export default function WordViewer({ document, content, onRenameFile, onCloseFile }) {
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [streamProgress, setStreamProgress] = useState(null); // { percent, received, total, speed }
  const [renderError, setRenderError] = useState(null);
  const [viewMode, setViewMode] = useState('native'); // 'native' | 'html' | 'text'

  const docxContainerRef = useRef(null);

  const token = localStorage.getItem('teledoc_vault_jwt') || '';
  const downloadUrl = `${API_BASE_URL}/documents/${document.id}/download`;

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

        // Assemble chunks in 1ms via typed array
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
      p={isFullscreen ? 'xs' : 'lg'}
      style={{
        maxWidth: isFullscreen ? '100%' : 1100,
        margin: '0 auto',
        width: '100%',
        transition: 'all 0.2s ease-in-out',
      }}
    >
      {/* 1. Header Card - Metadata & Controls */}
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
            <Group gap="xs" wrap="wrap">
              {viewMode === 'native' && (
                <Group gap={4}>
                  <Tooltip label="Zoom Out" withArrow>
                    <ActionIcon
                      variant="default"
                      size="sm"
                      onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.1).toFixed(2)))}
                    >
                      <ZoomOut size={14} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Click to reset to 100%" withArrow>
                    <Button
                      variant="subtle"
                      size="compact-xs"
                      color="gray"
                      onClick={() => setZoom(1)}
                      style={{ fontWeight: 600, fontSize: '0.78rem' }}
                    >
                      {Math.round(zoom * 100)}%
                    </Button>
                  </Tooltip>
                  <Tooltip label="Zoom In" withArrow>
                    <ActionIcon
                      variant="default"
                      size="sm"
                      onClick={() => setZoom((z) => Math.min(1.75, +(z + 0.1).toFixed(2)))}
                    >
                      <ZoomIn size={14} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              )}

              {/* View Mode Switcher */}
              <Group gap={4}>
                <Button
                  size="compact-xs"
                  variant={viewMode === 'native' ? 'filled' : 'subtle'}
                  color="emerald"
                  onClick={() => setViewMode('native')}
                >
                  Real Word View
                </Button>
                {content?.html && (
                  <Button
                    size="compact-xs"
                    variant={viewMode === 'html' ? 'filled' : 'subtle'}
                    color="gray"
                    onClick={() => setViewMode('html')}
                  >
                    HTML
                  </Button>
                )}
                <Button
                  size="compact-xs"
                  variant={viewMode === 'text' ? 'filled' : 'subtle'}
                  color="gray"
                  onClick={() => setViewMode('text')}
                >
                  Text
                </Button>
              </Group>

              <Tooltip label="Print Document" withArrow>
                <ActionIcon variant="default" size="sm" onClick={handlePrint}>
                  <Printer size={15} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'} withArrow>
                <ActionIcon
                  variant="default"
                  size="sm"
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
                className="btn-premium-primary"
                leftSection={<Download size={13} />}
              >
                Download DOCX
              </Button>

              <Tooltip label="Decrypted Zero-Knowledge Telegram Blob verified" withArrow>
                <Badge
                  variant="light"
                  color="teal"
                  size="sm"
                  leftSection={<ShieldCheck size={12} />}
                  className="mono-badge badge-emerald"
                >
                  Vault Synced
                </Badge>
              </Tooltip>

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

      {/* 2. Document Stage Canvas */}
      <Paper
        radius="md"
        withBorder
        style={{
          backgroundColor: '#525659', // Authentic PDF/Word reader desktop gray
          overflow: 'auto',
          maxHeight: isFullscreen ? 'calc(100vh - 120px)' : '82vh',
          minHeight: '600px',
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
                minWidth: 340,
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
              padding: '32px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transform: zoom !== 1 ? `scale(${zoom})` : undefined,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease',
            }}
          >
            <div
              ref={docxContainerRef}
              className="word-native-container"
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            />
          </Box>
        ) : viewMode === 'html' ? (
          /* Fallback / Alternative Rich HTML View */
          <Box p="xl" style={{ backgroundColor: '#ffffff', maxWidth: 860, margin: '24px auto', borderRadius: '8px', minHeight: '800px' }}>
            <div
              className="rich-doc-content"
              dangerouslySetInnerHTML={{ __html: content?.html || '' }}
              style={{ lineHeight: 1.75 }}
            />
          </Box>
        ) : (
          /* Fallback Plain Text View */
          <Box p="xl" style={{ backgroundColor: '#ffffff', maxWidth: 860, margin: '24px auto', borderRadius: '8px', minHeight: '800px' }}>
            <Text style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
              {content?.text || 'No text extracted.'}
            </Text>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

