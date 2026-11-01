import React, { useState, useMemo } from 'react';
import {
  Box,
  Stack,
  Group,
  Text,
  Title,
  Paper,
  Button,
  ActionIcon,
  Tooltip,
  Badge,
  SegmentedControl,
  Alert,
  TextInput,
  Divider,
} from '@mantine/core';
import {
  Copy,
  Check,
  Search,
  Clock,
  BookOpen,
  FileText,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export default function DocumentReader({ document, content }) {
  const [fontSize, setFontSize] = useState('md'); // sm: 15px, md: 17px, lg: 20px
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const text = content?.text || '';
  const wordCount = content?.wordCount || document?.wordCount || 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

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

  // Search highlighter
  const highlightedParagraphs = useMemo(() => {
    if (!text) return [];
    const paragraphs = text.split(/\n{2,}/);

    if (!searchTerm.trim()) {
      return paragraphs;
    }

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return paragraphs.map((para) => {
      const parts = para.split(regex);
      return parts;
    });
  }, [text, searchTerm]);

  return (
    <Box p="lg" style={{ maxWidth: 860, margin: '0 auto', width: '100%' }}>
      {/* Top Header Card */}
      <Paper p="md" radius="md" withBorder mb="lg" style={{ backgroundColor: '#ffffff' }}>
        <Stack gap="xs">
          <Group justify="space-between" align="flex-start" wrap="wrap">
            <Box style={{ flex: 1, minWidth: 260 }}>
              <Group gap="xs" mb={4}>
                <Badge
                  color={document?.type?.startsWith('google') ? 'blue' : 'gray'}
                  variant="light"
                  size="sm"
                >
                  {document?.type?.replace('_', ' ').toUpperCase()}
                </Badge>
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
              <Title order={2} style={{ fontSize: '1.4rem', color: '#0f172a' }}>
                {document?.title || 'Untitled Document'}
              </Title>
            </Box>

            {/* Vault Status Badge */}
            <Tooltip
              label="Encrypted in Vault • Verified"
              withArrow
              position="bottom-end"
            >
              <Badge
                variant="outline"
                color="teal"
                size="sm"
                leftSection={<ShieldCheck size={12} />}
                className="mono-badge"
              >
                Vault Synced
              </Badge>
            </Tooltip>
          </Group>

          {/* Reader Stats & Controls Bar */}
          <Divider my={4} />

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
                  ~{readingTimeMinutes} min read
                </Text>
              </Group>
              {content?.pageCount && (
                <Text size="xs" c="dimmed">
                  • {content?.pageCount} pages
                </Text>
              )}
            </Group>

            {/* Typography & Actions */}
            <Group gap="xs">
              <TextInput
                placeholder="Find in text..."
                size="xs"
                radius="md"
                leftSection={<Search size={13} color="#94a3b8" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.currentTarget.value)}
                style={{ width: 150 }}
              />

              <SegmentedControl
                size="xs"
                radius="md"
                value={fontSize}
                onChange={setFontSize}
                data={[
                  { label: 'A-', value: 'sm' },
                  { label: 'A', value: 'md' },
                  { label: 'A+', value: 'lg' },
                ]}
              />

              <Button
                size="xs"
                variant="light"
                color={copied ? 'teal' : 'gray'}
                leftSection={copied ? <Check size={14} /> : <Copy size={14} />}
                onClick={handleCopy}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </Group>
          </Group>
        </Stack>
      </Paper>

      {/* Scanned PDF Warning Banner */}
      {content?.warning && (
        <Alert
          icon={<AlertTriangle size={18} />}
          title="Document Warning"
          color="yellow"
          variant="light"
          radius="md"
          mb="lg"
        >
          {content?.warning}
        </Alert>
      )}

      {/* Reading Canvas */}
      <Paper
        p="xl"
        radius="md"
        withBorder
        style={{
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        <Box
          className="reader-canvas"
          style={{
            fontSize: fontSizeMap[fontSize],
          }}
        >
          {text.length === 0 ? (
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

