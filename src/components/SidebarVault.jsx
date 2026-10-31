import React, { useState, useRef } from 'react';
import {
  Box,
  Stack,
  Group,
  Text,
  TextInput,
  SegmentedControl,
  ScrollArea,
  UnstyledButton,
  Badge,
  ActionIcon,
  Tooltip,
  Paper,
} from '@mantine/core';
import {
  Search,
  FileText,
  Table2,
  Trash2,
  Globe,
  FileType,
  Sparkles,
} from 'lucide-react';
import TelegramStatusBadge from './TelegramStatusBadge';

export default function SidebarVault({
  documents = [],
  selectedDocId,
  onSelectDoc,
  onDeleteDoc,
  status,
  statusLoading,
}) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const prefetchedIds = useRef(new Set());

  // Speculative prefetch on hover: warms up server RAM cache before user clicks
  const handlePrefetch = (docId) => {
    if (!docId || prefetchedIds.current.has(docId)) return;
    prefetchedIds.current.add(docId);
    const token = localStorage.getItem('teledoc_vault_jwt') || '';
    fetch(`/api/documents/${docId}/view?token=${encodeURIComponent(token)}`, {
      headers: { Range: 'bytes=0-65535' },
    }).catch(() => {});
  };

  const getDocIcon = (type, format) => {
    switch (type) {
      case 'google_doc':
        return <Globe size={18} color="#2563eb" />;
      case 'google_sheet':
        return <Table2 size={18} color="#16a34a" />;
      case 'pdf':
        return <FileType size={18} color="#dc2626" />;
      case 'docx':
        return <FileText size={18} color="#0284c7" />;
      case 'csv':
        return <Table2 size={18} color="#16a34a" />;
      default:
        return format === 'spreadsheet' ? (
          <Table2 size={18} color="#16a34a" />
        ) : (
          <FileText size={18} color="#64748b" />
        );
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'google_doc':
        return 'blue';
      case 'google_sheet':
        return 'green';
      case 'pdf':
        return 'red';
      case 'docx':
        return 'cyan';
      case 'csv':
        return 'teal';
      default:
        return 'gray';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      (doc.filename && doc.filename.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'all') return true;
    if (filterType === 'google') return doc.type.startsWith('google');
    if (filterType === 'sheets') return doc.format === 'spreadsheet';
    if (filterType === 'docs') return doc.format === 'document';
    return true;
  });

  return (
    <Stack
      h="100%"
      gap="sm"
      p="md"
      style={{
        borderRight: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Brand Header */}
      <Group justify="space-between" align="center">
        <Group gap="xs">
          <Box
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <Sparkles size={18} />
          </Box>
          <Box>
            <Text fw={700} size="md" style={{ letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              TeleDoc Hub
            </Text>
            <Text size="xs" c="dimmed">
              Zero-Cost Cloud Vault
            </Text>
          </Box>
        </Group>
      </Group>

      {/* Telegram Connection Badge */}
      <Box mt={4}>
        <TelegramStatusBadge status={status} loading={statusLoading} />
      </Box>

      {/* Search Input */}
      <TextInput
        placeholder="Filter saved documents..."
        leftSection={<Search size={15} color="#94a3b8" />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        size="xs"
        radius="md"
      />

      {/* Filter Segmented Control */}
      <SegmentedControl
        size="xs"
        radius="md"
        value={filterType}
        onChange={setFilterType}
        data={[
          { label: `All (${documents.length})`, value: 'all' },
          { label: 'Docs', value: 'docs' },
          { label: 'Sheets', value: 'sheets' },
          { label: 'Google', value: 'google' },
        ]}
      />

      {/* Documents Scroll Area */}
      <ScrollArea style={{ flex: 1 }} offsetScrollbars scrollbarSize={6}>
        <Stack gap={6} pr={4}>
          {filteredDocs.length === 0 ? (
            <Box py="xl" ta="center">
              <Text size="sm" c="dimmed">
                {documents.length === 0
                  ? 'No documents in vault yet.'
                  : 'No matching documents found.'}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                Upload a file or paste a Google link to begin.
              </Text>
            </Box>
          ) : (
            filteredDocs.map((doc) => {
              const isSelected = doc.id === selectedDocId;

              return (
                <Paper
                  key={doc.id}
                  p="xs"
                  radius="md"
                  withBorder
                  style={{
                    cursor: 'pointer',
                    borderColor: isSelected ? '#0284c7' : '#f1f5f9',
                    backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => onSelectDoc(doc.id)}
                  onMouseEnter={() => handlePrefetch(doc.id)}
                >
                  <Group justify="space-between" wrap="nowrap" align="flex-start">
                    <Group gap="xs" wrap="nowrap" style={{ overflow: 'hidden' }}>
                      <Box mt={2}>{getDocIcon(doc.type, doc.format)}</Box>
                      <Box style={{ overflow: 'hidden' }}>
                        <Text
                          size="sm"
                          fw={isSelected ? 600 : 500}
                          truncate
                          style={{ color: isSelected ? '#0369a1' : '#0f172a' }}
                        >
                          {doc.title}
                        </Text>
                        <Group gap={6} mt={2}>
                          <Badge
                            size="xs"
                            variant="light"
                            color={getBadgeColor(doc.type)}
                            radius="sm"
                          >
                            {doc.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Text size="xs" c="dimmed" className="mono-badge">
                            {formatFileSize(doc.fileSize)}
                          </Text>
                          {doc.wordCount > 0 && (
                            <Text size="xs" c="dimmed" className="mono-badge">
                              • {doc.wordCount} words
                            </Text>
                          )}
                        </Group>
                      </Box>
                    </Group>

                    {/* Delete Action Button */}
                    <Tooltip label="Delete from Vault" withArrow position="left">
                      <ActionIcon
                        size="xs"
                        variant="subtle"
                        color="gray"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete "${doc.title}" from Telegram Vault?`)) {
                            onDeleteDoc(doc.id);
                          }
                        }}
                      >
                        <Trash2 size={13} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Paper>
              );
            })
          )}
        </Stack>
      </ScrollArea>
    </Stack>
  );
}

