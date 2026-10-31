import React, { useState, useMemo } from 'react';
import {
  Box,
  Stack,
  Group,
  Text,
  Title,
  Paper,
  Button,
  Badge,
  Tooltip,
  Divider,
  ActionIcon,
} from '@mantine/core';
import { Table2, Download, ShieldCheck, ExternalLink, FileSpreadsheet, Lock, X } from 'lucide-react';
import SourceBadge from '../../components/ui/SourceBadge';
import SearchFilterInput from '../../components/ui/SearchFilterInput';
import DataTable from '../../components/ui/DataTable';
import EditableDocumentTitle from '../../components/ui/EditableDocumentTitle';
import { formatBytes } from '../../utils/formatters';
import { API_BASE_URL } from '../../config';

export default function SheetTable({ document, content, onRenameFile, onCloseFile }) {
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCol, setSortCol] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const sheets = content?.sheets || [];
  const hasMultipleSheets = sheets.length > 1;

  // Active sheet data
  const currentSheet = hasMultipleSheets && sheets[activeSheetIndex] ? sheets[activeSheetIndex] : content;
  const headers = currentSheet?.headers || [];
  const rows = currentSheet?.rows || [];

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

  const processedRows = useMemo(() => {
    let result = [...rows];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((row) =>
        row.some((cell) => cell && cell.toString().toLowerCase().includes(term))
      );
    }

    if (sortCol !== null) {
      result.sort((a, b) => {
        const valA = (a[sortCol] || '').toString().trim();
        const valB = (b[sortCol] || '').toString().trim();

        const numA = parseFloat(valA);
        const numB = parseFloat(valB);
        if (!isNaN(numA) && !isNaN(numB)) {
          return sortDirection === 'asc' ? numA - numB : numB - numA;
        }

        return sortDirection === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      });
    }

    return result;
  }, [rows, searchTerm, sortCol, sortDirection]);

  const handleExportCsv = () => {
    const csvContent = [
      headers.map((h) => `"${(h || '').replace(/"/g, '""')}"`).join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    const sheetName = hasMultipleSheets ? `_${sheets[activeSheetIndex]?.name || 'sheet'}` : '';
    link.setAttribute('download', `${document?.title || 'spreadsheet'}${sheetName}.csv`);
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const downloadOriginalUrl = `${API_BASE_URL}/documents/${document.id}/download`;

  return (
    <Box p="lg" style={{ width: '100%', maxWidth: 1200, margin: '0 auto' }}>
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
                <SourceBadge type={document?.type || 'csv'} format={document?.format || 'spreadsheet'} />

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

              <EditableDocumentTitle document={document} onRename={onRenameFile} order={2} />
              <Text size="xs" c="dimmed" mt={2}>
                Original file: {document?.filename} • {formatBytes(document?.fileSize || 0)}
              </Text>
            </Box>

            <Group gap="xs">
              <Button
                component="a"
                href={downloadOriginalUrl}
                download={document?.filename}
                size="xs"
                variant="light"
                color="green"
                leftSection={<Download size={13} />}
              >
                Download Original
              </Button>

              <Tooltip
                label={`Telegram file_id: ${document?.telegramFileId || 'N/A'}`}
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

          {/* Multi-Sheet Workbook Tabs */}
          {hasMultipleSheets && (
            <Box mt="xs">
              <Text size="xs" fw={700} c="dimmed" mb={6} tt="uppercase">
                Workbook Sheets ({sheets.length}):
              </Text>
              <Group gap={6} wrap="wrap">
                {sheets.map((sheet, sIdx) => (
                  <Button
                    key={sIdx}
                    size="xs"
                    variant={activeSheetIndex === sIdx ? 'filled' : 'light'}
                    color="green"
                    onClick={() => {
                      setActiveSheetIndex(sIdx);
                      setSortCol(null);
                    }}
                    leftSection={<FileSpreadsheet size={13} />}
                  >
                    {sheet.name || `Sheet ${sIdx + 1}`} ({sheet.totalRows || 0})
                  </Button>
                ))}
              </Group>
            </Box>
          )}

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
              {hasMultipleSheets && (
                <Badge size="xs" variant="outline" color="green">
                  Active: {sheets[activeSheetIndex]?.name}
                </Badge>
              )}
            </Group>

            <Group gap="xs">
              <SearchFilterInput
                placeholder="Filter table rows..."
                value={searchTerm}
                onChange={setSearchTerm}
                width={200}
              />

              <Button
                size="xs"
                variant="light"
                color="green"
                leftSection={<Download size={14} />}
                onClick={handleExportCsv}
              >
                Export Sheet CSV
              </Button>
            </Group>
          </Group>
        </Stack>
      </Paper>

      {/* Reusable High-Performance Data Table */}
      <Paper radius="md" withBorder style={{ backgroundColor: '#ffffff', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <DataTable
          headers={headers}
          rows={processedRows}
          sortCol={sortCol}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      </Paper>
    </Box>
  );
}
