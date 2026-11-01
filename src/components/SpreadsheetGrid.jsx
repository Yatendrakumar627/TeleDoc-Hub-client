import React, { useState, useMemo } from 'react';
import {
  Box,
  Stack,
  Group,
  Text,
  Title,
  Paper,
  Button,
  TextInput,
  Badge,
  Tooltip,
  Divider,
  ScrollArea,
  ActionIcon,
} from '@mantine/core';
import {
  Table2,
  Search,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

export default function SpreadsheetGrid({ document, content }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCol, setSortCol] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'

  const headers = content?.headers || [];
  const rows = content?.rows || [];

  // Toggle sort on column header click
  const handleSort = (colIndex) => {
    if (sortCol === colIndex) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortCol(null);
        setSortDirection('asc');
      }
    } else {
      setSortCol(colIndex);
      setSortDirection('asc');
    }
  };

  // Filtered and sorted rows
  const processedRows = useMemo(() => {
    let result = [...rows];

    // Filter by search term across all cells
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((row) =>
        row.some((cell) => cell && cell.toString().toLowerCase().includes(term))
      );
    }

    // Sort if column selected
    if (sortCol !== null) {
      result.sort((a, b) => {
        const valA = (a[sortCol] || '').toString().trim();
        const valB = (b[sortCol] || '').toString().trim();

        // Check for numeric comparison
        const numA = parseFloat(valA);
        const numB = parseFloat(valB);
        if (!isNaN(numA) && !isNaN(numB)) {
          return sortDirection === 'asc' ? numA - numB : numB - numA;
        }

        // String comparison
        return sortDirection === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      });
    }

    return result;
  }, [rows, searchTerm, sortCol, sortDirection]);

  // Export client-side CSV
  const handleExportCsv = () => {
    const csvContent = [
      headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${document?.title || 'spreadsheet'}.csv`);
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  return (
    <Box p="lg" style={{ width: '100%' }}>
      {/* Top Header Card */}
      <Paper p="md" radius="md" withBorder mb="md" style={{ backgroundColor: '#ffffff' }}>
        <Stack gap="xs">
          <Group justify="space-between" align="flex-start" wrap="wrap">
            <Box style={{ flex: 1, minWidth: 260 }}>
              <Group gap="xs" mb={4}>
                <Badge
                  color={document?.type?.startsWith('google') ? 'green' : 'teal'}
                  variant="light"
                  size="sm"
                >
                  {document?.type?.replace('_', ' ').toUpperCase()}
                </Badge>
                {document?.originalUrl && (
                  <Tooltip label="Open original Google Sheet" withArrow>
                    <ActionIcon
                      component="a"
                      href={document.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="xs"
                      variant="subtle"
                      color="green"
                    >
                      <ExternalLink size={14} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>
              <Title order={2} style={{ fontSize: '1.4rem', color: '#0f172a' }}>
                {document?.title || 'Spreadsheet Viewer'}
              </Title>
            </Box>

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

          <Divider my={4} />

          {/* Stats and Controls */}
          <Group justify="space-between" align="center" wrap="wrap" gap="sm">
            <Group gap="md">
              <Group gap={4}>
                <Table2 size={14} color="#64748b" />
                <Text size="xs" c="dimmed">
                  {processedRows.length} of {rows.length} rows
                </Text>
              </Group>
              <Text size="xs" c="dimmed">
                • {headers.length} columns
              </Text>
            </Group>

            <Group gap="xs">
              <TextInput
                placeholder="Filter table rows..."
                size="xs"
                radius="md"
                leftSection={<Search size={13} color="#94a3b8" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.currentTarget.value)}
                style={{ width: 200 }}
              />

              <Button
                size="xs"
                variant="light"
                color="green"
                leftSection={<Download size={14} />}
                onClick={handleExportCsv}
              >
                Export CSV
              </Button>
            </Group>
          </Group>
        </Stack>
      </Paper>

      {/* Spreadsheet Table Container */}
      <Paper
        radius="md"
        withBorder
        style={{
          backgroundColor: '#ffffff',
          overflow: 'hidden',
        }}
      >
        <ScrollArea h="calc(100vh - 240px)" offsetScrollbars scrollbarSize={8}>
          <table className="spreadsheet-table">
            <thead>
              <tr>
                <th style={{ width: 50, textAlign: 'center' }}>#</th>
                {headers.map((header, idx) => {
                  const isSorted = sortCol === idx;
                  return (
                    <th
                      key={idx}
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort(idx)}
                    >
                      <Group gap={4} wrap="nowrap" justify="space-between">
                        <Text size="xs" fw={600}>
                          {header}
                        </Text>
                        {isSorted ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp size={12} />
                          ) : (
                            <ArrowDown size={12} />
                          )
                        ) : (
                          <ArrowUpDown size={12} color="#94a3b8" />
                        )}
                      </Group>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {processedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={headers.length + 1}
                    style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}
                  >
                    No matching rows found.
                  </td>
                </tr>
              ) : (
                processedRows.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    <td
                      style={{
                        textAlign: 'center',
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {rowIdx + 1}
                    </td>
                    {headers.map((_, colIdx) => (
                      <td key={colIdx}>
                        {row[colIdx] !== undefined && row[colIdx] !== null
                          ? row[colIdx].toString()
                          : ''}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </ScrollArea>
      </Paper>
    </Box>
  );
}

