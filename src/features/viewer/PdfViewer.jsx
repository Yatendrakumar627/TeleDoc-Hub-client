import React, { useState, useMemo, useEffect } from 'react';
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
  SegmentedControl,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  Download,
  ExternalLink,
  Maximize2,
  Minimize2,
  Lock,
  ShieldCheck,
  FileText,
  Printer,
  Layers,
  X,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';
import SourceBadge from '../../components/ui/SourceBadge';
import EditableDocumentTitle from '../../components/ui/EditableDocumentTitle';
import { formatBytes } from '../../utils/formatters';
import { API_BASE_URL } from '../../config';

export default function PdfViewer({ document, content, onRenameFile, onCloseFile }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState('pdf'); // 'pdf' | 'text'

  // 1. Create a same-origin Blob URL from base64 dataUrl for instant zero-latency rendering
  const blobUrl = useMemo(() => {
    if (!content?.dataUrl) return null;
    try {
      const parts = content.dataUrl.split(',');
      const base64Data = parts[1] || parts[0];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      return URL.createObjectURL(blob);
    } catch (err) {
      console.error('Error generating PDF Blob URL:', err);
      return null;
    }
  }, [content?.dataUrl]);

  // Cleanup Blob URL on unmount to prevent browser memory leak
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  const token = localStorage.getItem('teledoc_vault_jwt') || '';
  const streamUrl = `${API_BASE_URL}/documents/${document.id}/view?token=${encodeURIComponent(token)}`;
  const activePdfUrl = `${streamUrl}#page=1&zoom=page-width&view=FitH`;
  const rawPdfUrl = streamUrl;
  const downloadUrl = `${API_BASE_URL}/documents/${document.id}/download`;

  const handlePrint = () => {
    const iframe = window.frames['pdf-embed-frame'];
    if (iframe) {
      try {
        iframe.focus();
        iframe.print();
        return;
      } catch (e) {
        // Fallback to window open if cross-origin or sandboxed
      }
    }
    window.open(rawPdfUrl, '_blank');
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
      {/* Top Metadata & Control Header */}
      <Paper
        p={isMobile ? 'xs' : 'md'}
        radius="md"
        mb={isMobile ? 'xs' : 'md'}
        className="premium-header-card"
        style={{ border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}
      >
        <Stack gap={isMobile ? 6 : 'xs'}>
          {isMobile ? (
            /* Compact Mobile Header for PDF */
            <Stack gap={6}>
              {/* Row 1: Source badge + Title + Close Button */}
              <Group justify="space-between" align="center" wrap="nowrap">
                <Group gap={6} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                  <SourceBadge type="pdf" format="pdf" />
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

              {/* Row 2: Mode Toggle + Direct Browser Tab Link + Download */}
              <Group justify="space-between" align="center" wrap="nowrap">
                <Group gap={4} wrap="nowrap">
                  <Button
                    size="compact-xs"
                    variant={viewMode === 'pdf' ? 'filled' : 'subtle'}
                    color="emerald"
                    onClick={() => setViewMode('pdf')}
                    style={{ fontSize: '11px', fontWeight: 600, padding: '0 8px', height: '26px' }}
                  >
                    📄 PDF
                  </Button>
                  {content?.text && (
                    <Button
                      size="compact-xs"
                      variant={viewMode === 'text' ? 'filled' : 'subtle'}
                      color="gray"
                      onClick={() => setViewMode('text')}
                      style={{ fontSize: '11px', fontWeight: 600, padding: '0 8px', height: '26px' }}
                    >
                      📖 Read
                    </Button>
                  )}
                </Group>

                <Group gap={6} wrap="nowrap">
                  <Button
                    component="a"
                    href={rawPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="compact-xs"
                    variant="default"
                    leftSection={<ExternalLink size={12} />}
                    style={{ fontSize: '11px', height: '26px', padding: '0 8px' }}
                  >
                    Open Tab
                  </Button>

                  <ActionIcon
                    component="a"
                    href={downloadUrl}
                    download={document.filename}
                    variant="filled"
                    color="emerald"
                    size="sm"
                    title="Download PDF"
                  >
                    <Download size={13} />
                  </ActionIcon>
                </Group>
              </Group>

              {/* Row 3: Subtle Metadata Strip */}
              <Group gap={6} align="center">
                <Text size="10px" c="dimmed">
                  {formatBytes(document?.fileSize || content?.fileSize || 0)}
                </Text>
                {(content?.pageCount || document?.pageCount) && (
                  <Badge color="gray" variant="light" size="xs" style={{ fontSize: '9px', height: '18px' }}>
                    {content?.pageCount || document?.pageCount}p
                  </Badge>
                )}
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
                <Group gap="xs" mb={6} wrap="wrap">
                  <SourceBadge type="pdf" format="pdf" />

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
                      AES-256 Zero-Knowledge Encrypted
                    </Badge>
                  )}

                  {(content?.pageCount || document?.pageCount) && (
                    <Badge color="gray" variant="light" size="xs" leftSection={<Layers size={10} />}>
                      {content?.pageCount || document?.pageCount} {(content?.pageCount || document?.pageCount) === 1 ? 'Page' : 'Pages'}
                    </Badge>
                  )}
                </Group>

                <EditableDocumentTitle document={document} onRename={onRenameFile} order={3} />
                <Text size="xs" c="dimmed" mt={2}>
                  Original file: {document?.filename} • {formatBytes(document?.fileSize || content?.fileSize || 0)}
                </Text>
              </Box>

              {/* Action Buttons */}
              <Group gap="xs" align="center" wrap="wrap">
                {content?.text && (
                  <SegmentedControl
                    size="xs"
                    value={viewMode}
                    onChange={setViewMode}
                    data={[
                      { label: 'PDF View', value: 'pdf' },
                      { label: 'Plain Text', value: 'text' },
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
                )}

                {/* Utilities */}
                <Group gap={4}>
                  <Tooltip label="Open PDF directly in a new browser tab" withArrow>
                    <ActionIcon
                      component="a"
                      href={rawPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="sm"
                      variant="subtle"
                      color="gray"
                      style={{
                        height: 32,
                        width: 32,
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--surface-card)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <ExternalLink size={15} />
                    </ActionIcon>
                  </Tooltip>

                  <Tooltip label="Print PDF" withArrow>
                    <ActionIcon
                      size="sm"
                      variant="subtle"
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
                      size="sm"
                      variant="subtle"
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

                {/* Primary CTAs & Status */}
                <Group gap="xs" align="center" wrap="nowrap">
                  <Tooltip
                    label={`Zero-Knowledge Synced: ${document?.telegramFileId ? 'Valid' : 'Pending'}`}
                    withArrow
                    position="bottom-end"
                  >
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
                    download={document?.filename}
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
                    Download PDF
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

      {/* Pristine PDF Viewport or Responsive Mobile Text */}
      {viewMode === 'text' && content?.text ? (
        <Paper
          p={isMobile ? 'md' : 'xl'}
          radius="md"
          withBorder
          style={{
            backgroundColor: '#ffffff',
            maxWidth: 860,
            margin: '0 auto',
            minHeight: isMobile ? '400px' : '700px',
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
            {content.text}
          </Text>
        </Paper>
      ) : (
        <Paper
          radius="md"
          withBorder
          style={{
            overflow: 'hidden',
            backgroundColor: '#525659',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
          }}
        >
          <iframe
            name="pdf-embed-frame"
            src={activePdfUrl}
            title={document.title || 'PDF Preview'}
            style={{
              width: '100%',
              height: isFullscreen
                ? 'calc(100vh - 120px)'
                : isMobile
                ? 'calc(100vh - 180px)'
                : '82vh',
              border: 'none',
              display: 'block',
            }}
          >
            <object
              data={activePdfUrl}
              type="application/pdf"
              width="100%"
              height={
                isFullscreen
                  ? 'calc(100vh - 120px)'
                  : isMobile
                  ? 'calc(100vh - 180px)'
                  : '82vh'
              }
            >
              <Box p="xl" ta="center" c="white">
                <FileText size={48} style={{ opacity: 0.6, marginBottom: 16 }} />
                <Text size="md" fw={600} mb="xs">
                  Your browser does not support embedded PDF frames.
                </Text>
                <Text size="sm" c="dimmed" mb="md">
                  Click below to open the PDF directly or download it.
                </Text>
                <Group justify="center" gap="sm">
                  <Button
                    component="a"
                    href={rawPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="white"
                    color="dark"
                    size="xs"
                  >
                    Open in New Tab
                  </Button>
                  <Button
                    component="a"
                    href={downloadUrl}
                    download={document.filename}
                    variant="filled"
                    color="blue"
                    size="xs"
                  >
                    Download File
                  </Button>
                </Group>
              </Box>
            </object>
          </iframe>
        </Paper>
      )}
    </Box>
  );
}

