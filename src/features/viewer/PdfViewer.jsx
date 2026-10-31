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
} from '@mantine/core';
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
} from 'lucide-react';
import SourceBadge from '../../components/ui/SourceBadge';
import EditableDocumentTitle from '../../components/ui/EditableDocumentTitle';
import { formatBytes } from '../../utils/formatters';
import { API_BASE_URL } from '../../config';

export default function PdfViewer({ document, content, onRenameFile, onCloseFile }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

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
  const activePdfUrl = streamUrl;
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
    window.open(activePdfUrl, '_blank');
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
      {/* Top Metadata & Control Header */}
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
            <Group gap="xs" wrap="wrap">
              <Tooltip label="Open PDF directly in a new browser tab" withArrow>
                <Button
                  component="a"
                  href={activePdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="xs"
                  variant="default"
                  leftSection={<ExternalLink size={13} />}
                >
                  Open in Tab
                </Button>
              </Tooltip>

              <Tooltip label="Print PDF" withArrow>
                <ActionIcon size="md" variant="default" onClick={handlePrint}>
                  <Printer size={15} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'} withArrow>
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
                className="btn-premium-primary"
                leftSection={<Download size={13} />}
              >
                Download PDF
              </Button>

              <Tooltip
                label={`Zero-Knowledge Synced: ${document.telegramFileId ? 'Valid' : 'Pending'}`}
                withArrow
                position="bottom-end"
              >
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

      {/* Pristine Native PDF Viewport */}
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
            height: isFullscreen ? 'calc(100vh - 120px)' : '82vh',
            border: 'none',
            display: 'block',
          }}
        >
          <object
            data={activePdfUrl}
            type="application/pdf"
            width="100%"
            height={isFullscreen ? 'calc(100vh - 120px)' : '82vh'}
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
                  href={activePdfUrl}
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
    </Box>
  );
}

