import React, { useState, useMemo } from 'react';
import {
  Box,
  Stack,
  Group,
  Text,
  Title,
  Paper,
  Divider,
  Badge,
  Tooltip,
  ActionIcon,
  Button,
  Select,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  BookOpen,
  Clock,
  ShieldCheck,
  ExternalLink,
  FileText,
  Download,
  Lock,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  X,
  ArrowLeft,
} from 'lucide-react';
import SourceBadge from '../../components/ui/SourceBadge';
import TypographyToolbar from '../../components/ui/TypographyToolbar';
import FeedbackBanner from '../../components/ui/FeedbackBanner';
import EditableDocumentTitle from '../../components/ui/EditableDocumentTitle';
import { formatReadingTime, formatBytes } from '../../utils/formatters';
import { API_BASE_URL } from '../../config';

export default function DocReader({ document, content, onRenameFile, onCloseFile }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [fontSize, setFontSize] = useState('md');
  const [zoomScale, setZoomScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState(content?.html ? 'formatted' : 'text');

  const text = content?.text || '';
  const html = content?.html || '';
  const wordCount = content?.wordCount || document?.wordCount || 0;
  const isDocx = document?.type === 'docx' || document?.type === 'doc' || content?.format === 'docx';
  const isCode = content?.format === 'code' || [
    'js', 'jsx', 'ts', 'tsx', 'py', 'json', 'sql', 'html', 'css',
    'scss', 'yaml', 'yml', 'sh', 'bash', 'zsh', 'env', 'ini', 'log'
  ].includes((document?.type || '').toLowerCase());
  const isMarkdown = content?.format === 'markdown' || document?.type === 'md';

  const fontSizeMap = {
    sm: '0.95rem',
    md: '1.08rem',
    lg: '1.25rem',
  };

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightedParagraphs = useMemo(() => {
    if (!text) return [];
    const paragraphs = text.split(/\n{2,}/);

    if (!searchTerm.trim()) {
      return paragraphs;
    }

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return paragraphs.map((para) => para.split(regex));
  }, [text, searchTerm]);

  const downloadUrl = `${API_BASE_URL}/documents/${document?.id}/download`;

  return (
    <Box
      p={isMobile ? 6 : isFullscreen ? 'xs' : 'lg'}
      style={{
        maxWidth: isFullscreen ? '100%' : isDocx ? 1000 : 880,
        margin: '0 auto',
        width: '100%',
        transition: 'all 0.2s ease-in-out',
      }}
    >
      {/* Top Header Card */}
      <Paper
        p={isMobile ? 'xs' : 'md'}
        radius="md"
        mb={isMobile ? 'xs' : 'lg'}
        className="premium-header-card"
        style={{ border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}
      >
        <Stack gap={isMobile ? 6 : 'xs'}>
          {isMobile ? (
            /* Compact Mobile Header */
            <Stack gap={6}>
              <Group justify="space-between" align="center" wrap="nowrap">
                <Group gap={6} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                  <SourceBadge type={document?.type} format={document?.format} />
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <EditableDocumentTitle document={document} onRename={onRenameFile} order={4} />
                  </Box>
                </Group>
                {onCloseFile && (
                  <ActionIcon variant="subtle" color="gray" size="sm" onClick={onCloseFile}>
                    <X size={16} />
                  </ActionIcon>
                )}
              </Group>

              <Group justify="space-between" align="center" wrap="nowrap">
                <Group gap={4} wrap="nowrap">
                  {html && (
                    <>
                      <Button
                        size="compact-xs"
                        variant={viewMode === 'formatted' ? 'filled' : 'subtle'}
                        color="blue"
                        onClick={() => setViewMode('formatted')}
                        style={{ fontSize: '11px', height: '26px' }}
                      >
                        Word
                      </Button>
                      <Button
                        size="compact-xs"
                        variant={viewMode === 'text' ? 'filled' : 'subtle'}
                        color="gray"
                        onClick={() => setViewMode('text')}
                        style={{ fontSize: '11px', height: '26px' }}
                      >
                        Text
                      </Button>
                    </>
                  )}
                </Group>

                <Group gap={6} wrap="nowrap">
                  <ActionIcon
                    component="a"
                    href={downloadUrl}
                    download={document?.filename}
                    variant="light"
                    color="blue"
                    size="sm"
                    title="Download"
                  >
                    <Download size={13} />
                  </ActionIcon>
                  <Badge variant="outline" color="teal" size="xs">
                    Synced
                  </Badge>
                </Group>
              </Group>
            </Stack>
          ) : (
            /* Desktop Full Header */
            <Group justify="space-between" align="flex-start" wrap="wrap">
              <Box style={{ flex: 1, minWidth: 260 }}>
                <Group gap="xs" mb={4} wrap="wrap">
                  <SourceBadge type={document?.type} format={document?.format} />

                  {document?.collectionName && document?.collectionName !== 'Unassigned' && (
                    <Badge color="emerald" variant="filled" size="xs">
                      📁 {document.collectionName}
                    </Badge>
                  )}

                  {document?.scope && (
                    <Badge
                      color={document.scope === 'personal' ? 'sage' : 'emerald'}
                      variant="light"
                      size="xs"
                    >
                      {document.scope === 'personal' ? 'Personal' : 'Work'}
                    </Badge>
                  )}

                  {document?.security?.isEncrypted && (
                    <Badge color="teal" variant="light" size="xs" leftSection={<Lock size={10} />} className="badge-emerald">
                      AES-256 Encrypted
                    </Badge>
                  )}

                  {document?.originalUrl && (
                    <Tooltip label="Open original Google Workspace link" withArrow>
                      <ActionIcon
                        component="a"
                        href={document.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="xs"
                        variant="subtle"
                        color="blue"
                      >
                        <ExternalLink size={14} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Group>

                <EditableDocumentTitle document={document} onRename={onRenameFile} order={2} />
                <Text size="xs" c="dimmed" mt={2}>
                  Original file: {document?.filename} • {formatBytes(document?.fileSize || 0)}
                </Text>
              </Box>

              <Group gap="xs" wrap="wrap">
                {isDocx && (
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
                    <Tooltip label="Zoom Out" withArrow>
                      <ActionIcon
                        variant="subtle"
                        size="xs"
                        color="gray"
                        style={{ height: 26, width: 26, borderRadius: '6px', color: 'var(--text-secondary)' }}
                        onClick={() => setZoomScale((z) => Math.max(0.75, z - 0.1))}
                      >
                        <ZoomOut size={13} />
                      </ActionIcon>
                    </Tooltip>
                    <Text size="xs" fw={600} px={6} style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                      {Math.round(zoomScale * 100)}%
                    </Text>
                    <Tooltip label="Zoom In" withArrow>
                      <ActionIcon
                        variant="subtle"
                        size="xs"
                        color="gray"
                        style={{ height: 26, width: 26, borderRadius: '6px', color: 'var(--text-secondary)' }}
                        onClick={() => setZoomScale((z) => Math.min(1.5, z + 0.1))}
                      >
                        <ZoomIn size={13} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                )}

                {/* Utility Actions */}
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

                {/* Primary CTAs & Status */}
                <Group gap="xs" align="center" wrap="nowrap">
                  <Tooltip
                    label="Encrypted in Vault • Verified"
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
                    Download File
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

          <Divider my={4} />

          {/* Reader Stats & Controls Bar */}
          <Group justify="space-between" align="center" wrap="wrap" gap="sm">
            <Group gap="md">
              <Group gap={4}>
                <BookOpen size={14} color="#64748b" />
                <Text size="xs" c="dimmed">
                  {wordCount.toLocaleString()} words
                </Text>
              </Group>
              <Group gap={4}>
                <Clock size={14} color="#64748b" />
                <Text size="xs" c="dimmed">
                  {formatReadingTime(wordCount)}
                </Text>
              </Group>
              {content?.lineCount && (
                <Text size="xs" c="dimmed">
                  • {content?.lineCount} lines
                </Text>
              )}
            </Group>

            <Group gap="xs">
              {html && (
                <Group gap={4}>
                  <Button
                    size="compact-xs"
                    variant={viewMode === 'formatted' ? 'filled' : 'subtle'}
                    color="blue"
                    onClick={() => setViewMode('formatted')}
                  >
                    Word Document View
                  </Button>
                  <Button
                    size="compact-xs"
                    variant={viewMode === 'text' ? 'filled' : 'subtle'}
                    color="gray"
                    onClick={() => setViewMode('text')}
                  >
                    Plain Text
                  </Button>
                </Group>
              )}

              <TypographyToolbar
                fontSize={fontSize}
                onChangeFontSize={setFontSize}
                searchTerm={searchTerm}
                onChangeSearch={setSearchTerm}
                onCopy={handleCopy}
                copied={copied}
              />
            </Group>
          </Group>
        </Stack>
      </Paper>

      {/* Scanned Warning Banner */}
      <FeedbackBanner
        type="warning"
        title="Document Notice"
        message={content?.warning}
        mb="lg"
      />

      {/* Document View Canvas */}
      <Paper
        p={isMobile ? 'md' : 'xl'}
        radius="md"
        withBorder
        style={{
          backgroundColor: '#ffffff',
          boxShadow: isDocx && viewMode === 'formatted'
            ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
            : '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
          maxWidth: isDocx && viewMode === 'formatted' ? `${860 * zoomScale}px` : '100%',
          margin: '0 auto',
          minHeight: isDocx ? '800px' : 'auto',
          borderTop: isDocx ? '4px solid #0284c7' : undefined,
          transform: isDocx && zoomScale !== 1 ? `scale(${zoomScale})` : undefined,
          transformOrigin: 'top center',
          transition: 'transform 0.15s ease',
        }}
      >
        <Box className="reader-canvas" style={{ fontSize: fontSizeMap[fontSize] }}>
          {viewMode === 'formatted' && html ? (
            <div
              className="rich-doc-content"
              dangerouslySetInnerHTML={{ __html: html }}
              style={{
                lineHeight: 1.75,
                color: '#1e293b',
              }}
            />
          ) : isCode ? (
            <pre
              style={{
                margin: 0,
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                fontSize: fontSizeMap[fontSize],
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: '#0f172a',
                backgroundColor: '#f8fafc',
                padding: '16px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
              }}
            >
              <code>{text}</code>
            </pre>
          ) : text.length === 0 ? (
            <Box ta="center" py="xl">
              <FileText size={48} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
              <Text c="dimmed" size="sm">
                No readable plain text found in this document.
              </Text>
            </Box>
          ) : typeof highlightedParagraphs[0] === 'string' ? (
            highlightedParagraphs.map((para, idx) => (
              <p key={idx} style={{ whiteSpace: 'pre-wrap' }}>
                {para}
              </p>
            ))
          ) : (
            highlightedParagraphs.map((parts, idx) => (
              <p key={idx} style={{ whiteSpace: 'pre-wrap' }}>
                {parts.map((segment, segIdx) =>
                  segment.toLowerCase() === searchTerm.toLowerCase() ? (
                    <mark
                      key={segIdx}
                      style={{
                        backgroundColor: '#fef08a',
                        color: '#854d0e',
                        padding: '1px 3px',
                        borderRadius: 2,
                      }}
                    >
                      {segment}
                    </mark>
                  ) : (
                    segment
                  )
                )}
              </p>
            ))
          )}
        </Box>
      </Paper>
    </Box>
  );
}
