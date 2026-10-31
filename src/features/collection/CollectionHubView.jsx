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
  SimpleGrid,
  Card,
  ActionIcon,
  Tooltip,
  Modal,
  TextInput,
  SegmentedControl,
  Select,
  Radio,
  Divider,
  Menu,
} from '@mantine/core';
import {
  Folder,
  FileText,
  Lock,
  UploadCloud,
  ArrowRight,
  Trash2,
  Download,
  Edit3,
  AlertTriangle,
  GripVertical,
  Calendar,
  AlignLeft,
  ArrowUpDown,
  Database,
  Link as LinkIcon,
  MoreVertical,
  ExternalLink,
} from 'lucide-react';
import { notifications } from '@mantine/notifications';
import SourceBadge from '../../components/ui/SourceBadge';
import { formatBytes, extractDateFromName } from '../../utils/formatters';
import { getDocTypeMeta } from '../../utils/docTypes';
import { API_BASE_URL } from '../../config';
import { reorderDocuments } from '../../services/apiClient';

/**
 * Authentic Document Brand Icon (Word, PDF, Excel, PPT, Media)
 */
function DocumentBrandIcon({ type, format, filename, size = 40 }) {
  const t = (type || '').toLowerCase();
  const f = (format || '').toLowerCase();
  const ext = (filename ? filename.split('.').pop() : '').toLowerCase();

  const isWord = ['docx', 'doc'].includes(t) || ['docx', 'doc'].includes(ext) || f === 'word';
  const isPdf = t === 'pdf' || ext === 'pdf' || f === 'pdf';
  const isSheet = ['xlsx', 'xls', 'csv', 'tsv', 'ods'].includes(t) || ['xlsx', 'xls', 'csv'].includes(ext) || f === 'spreadsheet';
  const isPpt = ['pptx', 'ppt'].includes(t) || ['pptx', 'ppt'].includes(ext) || f === 'presentation';

  if (isWord) {
    return (
      <Box
        style={{
          width: size,
          height: size,
          borderRadius: 10,
          backgroundColor: '#e0f2fe',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 36 36" fill="none">
          <rect x="9" y="4" width="22" height="28" rx="3" fill="#185ABD" />
          <path d="M23 4H31V12L23 4Z" fill="#103F91" />
          <rect x="5" y="8" width="18" height="20" rx="3.5" fill="url(#w_grad_cb)" style={{ filter: 'drop-shadow(0 2px 4px rgba(16,63,145,0.35))' }} />
          <path d="M8.5 13L10.2 23H11.8L13.5 16.5L15.2 23H16.8L18.5 13H16.8L15.6 19.5L14.1 13H12.9L11.4 19.5L10.2 13H8.5Z" fill="#ffffff" />
          <defs>
            <linearGradient id="w_grad_cb" x1="5" y1="8" x2="23" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2B7CD3" />
              <stop offset="1" stopColor="#104A9E" />
            </linearGradient>
          </defs>
        </svg>
      </Box>
    );
  }

  if (isPdf) {
    return (
      <Box
        style={{
          width: size,
          height: size,
          borderRadius: 10,
          backgroundColor: '#ffe4e6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 36 36" fill="none">
          <rect x="7" y="4" width="22" height="28" rx="3" fill="#E11D48" />
          <path d="M21 4H29V12L21 4Z" fill="#9F1239" />
          <rect x="5" y="8" width="18" height="20" rx="3.5" fill="url(#pdf_grad_cb)" style={{ filter: 'drop-shadow(0 2px 4px rgba(159,18,57,0.35))' }} />
          <text x="7.5" y="21.5" fill="#ffffff" fontSize="8.5" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.5">PDF</text>
          <defs>
            <linearGradient id="pdf_grad_cb" x1="5" y1="8" x2="23" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F43F5E" />
              <stop offset="1" stopColor="#BE123C" />
            </linearGradient>
          </defs>
        </svg>
      </Box>
    );
  }

  if (isSheet) {
    return (
      <Box
        style={{
          width: size,
          height: size,
          borderRadius: 10,
          backgroundColor: '#dcfce7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 36 36" fill="none">
          <rect x="9" y="4" width="22" height="28" rx="3" fill="#107C41" />
          <path d="M23 4H31V12L23 4Z" fill="#0A5028" />
          <rect x="5" y="8" width="18" height="20" rx="3.5" fill="url(#x_grad_cb)" style={{ filter: 'drop-shadow(0 2px 4px rgba(10,80,40,0.35))' }} />
          <path d="M9.5 13.5L12.5 18L9.5 22.5H11.5L13.5 19.3L15.5 22.5H17.5L14.5 18L17.5 13.5H15.5L13.5 16.7L11.5 13.5H9.5Z" fill="#ffffff" />
          <defs>
            <linearGradient id="x_grad_cb" x1="5" y1="8" x2="23" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1E8E4F" />
              <stop offset="1" stopColor="#0E6533" />
            </linearGradient>
          </defs>
        </svg>
      </Box>
    );
  }

  if (isPpt) {
    return (
      <Box
        style={{
          width: size,
          height: size,
          borderRadius: 10,
          backgroundColor: '#ffedd5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 36 36" fill="none">
          <rect x="9" y="4" width="22" height="28" rx="3" fill="#C43E1C" />
          <path d="M23 4H31V12L23 4Z" fill="#8A260D" />
          <rect x="5" y="8" width="18" height="20" rx="3.5" fill="url(#ppt_grad_cb)" style={{ filter: 'drop-shadow(0 2px 4px rgba(138,38,13,0.35))' }} />
          <path d="M9.5 13H14C15.5 13 16.5 14 16.5 15.5C16.5 17 15.5 18 14 18H11.5V23H9.5V13ZM11.5 16.2H13.8C14.4 16.2 14.8 15.9 14.8 15.5C14.8 15.1 14.4 14.8 13.8 14.8H11.5V16.2Z" fill="#ffffff" />
          <defs>
            <linearGradient id="ppt_grad_cb" x1="5" y1="8" x2="23" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#EA580C" />
              <stop offset="1" stopColor="#C2410C" />
            </linearGradient>
          </defs>
        </svg>
      </Box>
    );
  }

  // Generic / Default
  return (
    <Box
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        backgroundColor: '#f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <FileText size={20} color="#64748b" />
    </Box>
  );
}

export default function CollectionHubView({
  collection,
  files = [],
  onSelectFile,
  onDeleteFile,
  onOpenUpload,
  onUpdateCollection,
  onDeleteCollection,
}) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Sorting and Dragging State
  const [fileSortBy, setFileSortBy] = useState('date-desc'); // 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'custom'
  const [orderedFiles, setOrderedFiles] = useState(files);
  const [draggedFileId, setDraggedFileId] = useState(null);
  const [dropTargetFileId, setDropTargetFileId] = useState(null);
  const [dropPosition, setDropPosition] = useState(null); // 'before' | 'after'

  // Sync internal list whenever files prop updates
  useEffect(() => {
    setOrderedFiles(files);
  }, [files]);

  const [collectionDisplayLimit, setCollectionDisplayLimit] = useState(36);

  useEffect(() => {
    setCollectionDisplayLimit(36);
  }, [collection?.id, fileSortBy]);

  // Sort files according to chosen mode with pre-calculated date metadata (eliminates regex during drag/render)
  const displayedFilesWithMeta = useMemo(() => {
    const list = [...orderedFiles];
    let sorted = list;
    if (fileSortBy === 'date-desc') {
      sorted = list.sort((a, b) => {
        const dateA = extractDateFromName(a.title || a.originalFilename || a.filename, a.createdAt);
        const dateB = extractDateFromName(b.title || b.originalFilename || b.filename, b.createdAt);
        if (dateA !== dateB) return dateB - dateA;
        return (a.order ?? 0) - (b.order ?? 0);
      });
    } else if (fileSortBy === 'date-asc') {
      sorted = list.sort((a, b) => {
        const dateA = extractDateFromName(a.title || a.originalFilename || a.filename, a.createdAt);
        const dateB = extractDateFromName(b.title || b.originalFilename || b.filename, b.createdAt);
        if (dateA !== dateB) return dateA - dateB;
        return (a.order ?? 0) - (b.order ?? 0);
      });
    } else if (fileSortBy === 'name-asc') {
      sorted = list.sort((a, b) =>
        (a.title || a.originalFilename || a.filename || '').localeCompare(
          b.title || b.originalFilename || b.filename || '',
          undefined,
          { numeric: true, sensitivity: 'base' }
        )
      );
    } else if (fileSortBy === 'name-desc') {
      sorted = list.sort((a, b) =>
        (b.title || b.originalFilename || b.filename || '').localeCompare(
          a.title || a.originalFilename || a.filename || '',
          undefined,
          { numeric: true, sensitivity: 'base' }
        )
      );
    }

    return sorted.map((file) => {
      const parsedTime = extractDateFromName(file.title || file.originalFilename || file.filename, file.createdAt);
      const formattedFileDate = parsedTime
        ? new Date(parsedTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '—';
      const addedDateFormatted = new Date(file.createdAt || parsedTime || Date.now()).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const extName = (file.filename ? file.filename.split('.').pop() : file.type || 'file').toLowerCase();
      const extLabel = extName.startsWith('.') ? extName : `.${extName}`;
      return {
        ...file,
        formattedFileDate,
        addedDateFormatted,
        extLabel,
      };
    });
  }, [orderedFiles, fileSortBy]);

  // Handle Drag & Drop reordering in the grid
  const handleFileDrop = async (targetFileId, position) => {
    if (!draggedFileId || draggedFileId === targetFileId) {
      setDraggedFileId(null);
      setDropTargetFileId(null);
      setDropPosition(null);
      return;
    }

    const fromIndex = orderedFiles.findIndex((f) => f.id === draggedFileId);
    if (fromIndex === -1) {
      setDraggedFileId(null);
      setDropTargetFileId(null);
      setDropPosition(null);
      return;
    }

    const newFiles = [...orderedFiles];
    const [movedFile] = newFiles.splice(fromIndex, 1);
    let targetIndex = newFiles.findIndex((f) => f.id === targetFileId);
    if (targetIndex === -1) {
      targetIndex = newFiles.length;
    } else if (position === 'after') {
      targetIndex += 1;
    }

    newFiles.splice(targetIndex, 0, movedFile);

    // Switch sort mode to custom so dragged order is applied
    setFileSortBy('custom');
    setOrderedFiles(newFiles);
    setDraggedFileId(null);
    setDropTargetFileId(null);
    setDropPosition(null);

    try {
      const orderedIds = newFiles.map((f) => f.id);
      await reorderDocuments(orderedIds);
      notifications.show({
        title: 'Order Updated',
        message: `"${movedFile.title || movedFile.filename}" position saved.`,
        color: 'emerald',
        autoClose: 1800,
      });
    } catch (err) {
      console.error('Failed to save document order:', err);
    }
  };

  // Edit form state
  const [editName, setEditName] = useState(collection?.name || '');
  const [editScope, setEditScope] = useState(collection?.scope || 'professional');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Delete options state
  const [deleteCascade, setDeleteCascade] = useState('false'); // 'false' (unassign) | 'true' (delete files)
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

  const totalBytes = files.reduce((acc, f) => acc + (f.fileSize || 0), 0);
  const isPersonal = collection?.scope === 'personal';

  const handleOpenEdit = () => {
    setEditName(collection?.name || '');
    setEditScope(collection?.scope || 'professional');
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !onUpdateCollection) return;

    try {
      setIsSubmittingEdit(true);
      await onUpdateCollection(collection.id, {
        name: editName.trim(),
        scope: editScope,
      });
      setEditModalOpen(false);
    } catch (err) {
      console.error('Update collection error:', err);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!onDeleteCollection) return;

    try {
      setIsSubmittingDelete(true);
      await onDeleteCollection(collection.id, deleteCascade === 'true');
      setDeleteModalOpen(false);
    } catch (err) {
      console.error('Delete collection error:', err);
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  return (
    <Box p="lg" style={{ maxWidth: 1040, margin: '0 auto', width: '100%' }}>
      {/* Collection Hero Header */}
      <Paper p="lg" radius="md" withBorder mb="lg" style={{ backgroundColor: '#ffffff' }}>
        <Stack gap="sm">
          <Group justify="space-between" align="flex-start" wrap="wrap">
            <Group gap="sm" align="flex-start">
              <Box
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  backgroundColor: isPersonal ? '#fdf2f8' : '#e0f2fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isPersonal ? '#db2777' : '#0284c7',
                }}
              >
                <Folder size={24} />
              </Box>

              <Box>
                <Group gap="xs" mb={4} wrap="wrap">
                  <Badge color={isPersonal ? 'grape' : 'cyan'} variant="outline" size="xs">
                    {isPersonal ? 'Personal Vault' : 'Work Collection'}
                  </Badge>
                  <Badge color="blue" variant="light" size="xs">
                    {files.length} {files.length === 1 ? 'file' : 'files'}
                  </Badge>
                  <Badge color="teal" variant="light" size="xs" leftSection={<Lock size={10} />}>
                    AES-256 Vault Encrypted
                  </Badge>
                </Group>

                <Title order={2} style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
                  {collection?.name || 'Collection'}
                </Title>
                <Text size="xs" c="dimmed">
                  Total archive size: {formatBytes(totalBytes)} • Stored individually in Telegram Vault
                </Text>
              </Box>
            </Group>

            {/* Collection Actions (CRUD) */}
            <Group gap="xs" wrap="wrap">
              <Tooltip label="Edit Collection Name & Scope" withArrow>
                <Button
                  variant="default"
                  size="sm"
                  leftSection={<Edit3 size={15} />}
                  onClick={handleOpenEdit}
                >
                  Edit
                </Button>
              </Tooltip>

              <Tooltip label="Delete Collection" withArrow>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="36px"
                  radius="md"
                  onClick={() => setDeleteModalOpen(true)}
                >
                  <Trash2 size={16} />
                </ActionIcon>
              </Tooltip>

              <Button
                color="blue"
                size="sm"
                leftSection={<UploadCloud size={16} />}
                onClick={() => onOpenUpload && onOpenUpload(collection)}
              >
                Add File
              </Button>
            </Group>
          </Group>
        </Stack>
      </Paper>

      {/* Files Grid Header with Sorting and Drag Indicators */}
      <Group justify="space-between" align="center" mb="md" px={4} wrap="wrap" gap="xs">
        <Group gap="xs">
          <Text fw={700} size="xs" tt="uppercase" style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
            Files in this collection ({files.length})
          </Text>
          {fileSortBy === 'custom' && (
            <Badge size="xs" variant="light" color="gold" leftSection={<GripVertical size={11} />}>
              Custom Drag Order
            </Badge>
          )}
        </Group>

        <Group gap="xs">
          <Select
            size="xs"
            leftSection={<ArrowUpDown size={13} style={{ color: 'var(--text-tertiary)' }} />}
            value={fileSortBy}
            onChange={(val) => setFileSortBy(val || 'date-desc')}
            data={[
              { label: 'Date: Newest First', value: 'date-desc' },
              { label: 'Date: Oldest First', value: 'date-asc' },
              { label: 'Name (A - Z)', value: 'name-asc' },
              { label: 'Name (Z - A)', value: 'name-desc' },
              { label: 'Custom (Draggable)', value: 'custom' },
            ]}
            comboboxProps={{ width: 185, withinPortal: true, shadow: 'md' }}
            styles={{
              input: {
                height: 32,
                minHeight: 32,
                fontSize: '12px',
                fontWeight: 500,
                borderRadius: '8px',
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'var(--surface-card)',
                color: 'var(--text-primary)',
              },
              option: { fontSize: '12px', whiteSpace: 'nowrap' },
            }}
          />
        </Group>
      </Group>

      {/* Grid of Individual Files */}
      {displayedFilesWithMeta.length === 0 ? (
        <Paper p="xl" radius="md" withBorder ta="center" style={{ backgroundColor: '#f8fafc' }}>
          <Stack align="center" gap="sm" py="xl">
            <Folder size={40} color="#94a3b8" />
            <Text fw={600} size="md">
              No files in this collection yet
            </Text>
            <Text size="xs" c="dimmed" style={{ maxWidth: 360 }}>
              Upload files and assign them here, or move existing documents into "{collection?.name}".
            </Text>
            <Button
              variant="light"
              color="blue"
              size="xs"
              mt="xs"
              leftSection={<UploadCloud size={14} />}
              onClick={() => onOpenUpload && onOpenUpload(collection)}
            >
              Upload Document
            </Button>
          </Stack>
        </Paper>
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing="md">
          {displayedFilesWithMeta.slice(0, collectionDisplayLimit).map((file) => {
            const meta = getDocTypeMeta(file.type, file.format);
            const isDragging = draggedFileId === file.id;
            const isDropBefore = dropTargetFileId === file.id && dropPosition === 'before';
            const isDropAfter = dropTargetFileId === file.id && dropPosition === 'after';

            const { formattedFileDate, addedDateFormatted, extLabel } = file;

            return (
              <Card
                key={file.id}
                p="sm"
                radius="md"
                withBorder
                draggable={true}
                onDragStart={(e) => {
                  if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.mantine-Menu-dropdown')) {
                    e.preventDefault();
                    return;
                  }
                  setDraggedFileId(file.id);
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', file.id);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (draggedFileId && draggedFileId !== file.id) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const relX = e.clientX - rect.left;
                    const pos = relX < rect.width / 2 ? 'before' : 'after';
                    setDropTargetFileId(file.id);
                    setDropPosition(pos);
                  }
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    if (dropTargetFileId === file.id) {
                      setDropTargetFileId(null);
                      setDropPosition(null);
                    }
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedFileId && draggedFileId !== file.id) {
                    handleFileDrop(file.id, dropPosition);
                  }
                }}
                onDragEnd={() => {
                  setDraggedFileId(null);
                  setDropTargetFileId(null);
                  setDropPosition(null);
                }}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  backgroundColor: '#ffffff',
                  borderColor: isDragging ? 'var(--brand-emerald)' : '#e2e8f0',
                  borderRadius: '14px',
                  borderStyle: isDragging ? 'dashed' : 'solid',
                  opacity: isDragging ? 0.35 : 1,
                  transform: isDragging ? 'scale(0.98)' : 'none',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
                  overflow: 'visible',
                  transition: 'all 0.16s ease-in-out',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  '&:hover': {
                    borderColor: 'var(--brand-emerald)',
                    boxShadow: '0 6px 18px -3px rgba(16, 47, 39, 0.08), 0 2px 5px -1px rgba(16, 47, 39, 0.03)',
                    transform: 'translateY(-1px)',
                  },
                }}
                onClick={() => onSelectFile(file.id)}
              >
                {/* Visual Insertion Drop Indicator Line */}
                {isDropBefore && (
                  <Box
                    style={{
                      position: 'absolute',
                      left: -4,
                      top: 4,
                      bottom: 4,
                      width: 4,
                      backgroundColor: 'var(--brand-emerald)',
                      borderRadius: 99,
                      zIndex: 25,
                      boxShadow: '0 0 8px rgba(24, 88, 68, 0.8)',
                      pointerEvents: 'none',
                    }}
                  />
                )}
                {isDropAfter && (
                  <Box
                    style={{
                      position: 'absolute',
                      right: -4,
                      top: 4,
                      bottom: 4,
                      width: 4,
                      backgroundColor: 'var(--brand-emerald)',
                      borderRadius: 99,
                      zIndex: 25,
                      boxShadow: '0 0 8px rgba(24, 88, 68, 0.8)',
                      pointerEvents: 'none',
                    }}
                  />
                )}

                <div>
                  {/* Top Row: Brand Icon + Title + Format Pill ... Quick Action Bar */}
                  <Group justify="space-between" align="flex-start" wrap="nowrap" mb={8}>
                    <Group gap={10} align="center" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
                      {/* Drag Handle */}
                      <Tooltip label="Drag to reorder" position="top" withArrow openDelay={350}>
                        <Box
                          component="span"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'grab',
                            color: '#94a3b8',
                            padding: '2px',
                            borderRadius: 3,
                            flexShrink: 0,
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <GripVertical size={14} />
                        </Box>
                      </Tooltip>

                      {/* Brand Logo Icon */}
                      <DocumentBrandIcon
                        type={file.type}
                        format={file.format}
                        filename={file.filename || file.title}
                        size={38}
                      />

                      {/* Title & Format Pill */}
                      <Box style={{ minWidth: 0, flex: 1 }}>
                        <Tooltip label={file.title} position="top" withArrow openDelay={400}>
                          <Text
                            fw={700}
                            truncate
                            style={{
                              color: '#0f172a',
                              lineHeight: 1.25,
                              fontSize: '15px',
                              letterSpacing: '-0.01em',
                            }}
                          >
                            {file.title}
                          </Text>
                        </Tooltip>

                        <Group gap={6} mt={3} wrap="nowrap">
                          <Badge
                            size="xs"
                            variant="light"
                            leftSection={<FileText size={10} />}
                            style={{
                              backgroundColor: '#eaf7ee',
                              color: '#185844',
                              fontSize: '9.5px',
                              fontWeight: 700,
                              letterSpacing: '0.02em',
                              height: '20px',
                              padding: '0 6px',
                              borderRadius: '4px',
                              textTransform: 'uppercase',
                            }}
                          >
                            {meta.label || 'WORD DOCUMENT'}
                          </Badge>
                        </Group>
                      </Box>
                    </Group>

                    {/* Quick Action Icons: Download, Link, More, Delete */}
                    <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
                      {/* 1. Download File */}
                      <Tooltip label="Download File" withArrow position="top">
                        <ActionIcon
                          size="28px"
                          radius="md"
                          variant="subtle"
                          component="a"
                          href={`${API_BASE_URL}/documents/${file.id}/download`}
                          download={file.filename}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            backgroundColor: '#f8fafc',
                            border: '1px solid #f1f5f9',
                            color: '#475569',
                            borderRadius: '8px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Download size={13} />
                        </ActionIcon>
                      </Tooltip>

                      {/* 2. Copy Link */}
                      <Tooltip label="Copy Link" withArrow position="top">
                        <ActionIcon
                          size="28px"
                          radius="md"
                          variant="subtle"
                          onClick={(e) => {
                            e.stopPropagation();
                            const shareUrl = `${window.location.origin}/#doc=${file.id}`;
                            navigator.clipboard.writeText(shareUrl);
                            notifications.show({
                              title: 'Link Copied',
                              message: 'Document link copied to clipboard.',
                              color: 'emerald',
                              autoClose: 2000,
                            });
                          }}
                          style={{
                            backgroundColor: '#f8fafc',
                            border: '1px solid #f1f5f9',
                            color: '#475569',
                            borderRadius: '8px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <LinkIcon size={13} />
                        </ActionIcon>
                      </Tooltip>

                      {/* 3. More Options Menu */}
                      <Menu shadow="md" width={170} position="bottom-end" withinPortal>
                        <Menu.Target>
                          <Tooltip label="More Options" withArrow position="top">
                            <ActionIcon
                              size="28px"
                              radius="md"
                              variant="subtle"
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                backgroundColor: '#f8fafc',
                                border: '1px solid #f1f5f9',
                                color: '#475569',
                                borderRadius: '8px',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <MoreVertical size={13} />
                            </ActionIcon>
                          </Tooltip>
                        </Menu.Target>
                        <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
                          <Menu.Item leftSection={<ExternalLink size={13} />} onClick={() => onSelectFile(file.id)}>
                            Open File Viewer
                          </Menu.Item>
                          <Menu.Item
                            color="red"
                            leftSection={<Trash2 size={13} />}
                            onClick={() => {
                              if (window.confirm(`Delete "${file.filename || file.title}"?`)) {
                                onDeleteFile(file.id);
                              }
                            }}
                          >
                            Delete File
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>

                      {/* 4. Delete File */}
                      <Tooltip label="Delete File" withArrow position="top">
                        <ActionIcon
                          size="28px"
                          radius="md"
                          variant="subtle"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete "${file.filename || file.title}" from vault?`)) {
                              onDeleteFile(file.id);
                            }
                          }}
                          style={{
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fee2e2',
                            color: '#ef4444',
                            borderRadius: '8px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Trash2 size={13} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Group>

                  {/* Middle Metrics Strip (Date | Words | Size | Open Button) */}
                  <Group justify="space-between" align="center" wrap="nowrap" mt={10} mb={10}>
                    <Group gap={10} align="center" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
                      {/* Date */}
                      <Group gap={6} wrap="nowrap" align="center">
                        <Calendar size={15} color="#64748b" style={{ flexShrink: 0 }} />
                        <Box>
                          <Text size="9.5px" c="dimmed" fw={500} style={{ lineHeight: 1.1 }}>
                            Date
                          </Text>
                          <Text size="12px" fw={700} style={{ color: '#0f172a', lineHeight: 1.25, whiteSpace: 'nowrap' }}>
                            {formattedFileDate}
                          </Text>
                        </Box>
                      </Group>

                      <Divider orientation="vertical" h={22} color="#e2e8f0" />

                      {/* Words */}
                      <Group gap={6} wrap="nowrap" align="center">
                        <AlignLeft size={15} color="#64748b" style={{ flexShrink: 0 }} />
                        <Box>
                          <Text size="9.5px" c="dimmed" fw={500} style={{ lineHeight: 1.1 }}>
                            Words
                          </Text>
                          <Text size="12px" fw={700} style={{ color: '#0f172a', lineHeight: 1.25, whiteSpace: 'nowrap' }}>
                            {file.wordCount ? Number(file.wordCount).toLocaleString() : '—'}
                          </Text>
                        </Box>
                      </Group>

                      <Divider orientation="vertical" h={22} color="#e2e8f0" />

                      {/* Size */}
                      <Group gap={6} wrap="nowrap" align="center">
                        <Database size={15} color="#64748b" style={{ flexShrink: 0 }} />
                        <Box>
                          <Text size="9.5px" c="dimmed" fw={500} style={{ lineHeight: 1.1 }}>
                            Size
                          </Text>
                          <Text size="12px" fw={700} style={{ color: '#0f172a', lineHeight: 1.25, whiteSpace: 'nowrap' }}>
                            {formatBytes(file.fileSize)}
                          </Text>
                        </Box>
                      </Group>
                    </Group>

                    {/* Open CTA Button */}
                    <Button
                      size="xs"
                      radius="sm"
                      leftSection={<ExternalLink size={12} />}
                      rightSection={<ArrowRight size={12} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectFile(file.id);
                      }}
                      style={{
                        backgroundColor: '#185844',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '12px',
                        height: '32px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(24, 88, 68, 0.22)',
                        flexShrink: 0,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      Open
                    </Button>
                  </Group>
                </div>

                {/* Bottom Footer Strip: Added On Pill & Extension Badge */}
                <Group justify="space-between" align="center" wrap="nowrap" pt={2}>
                  {/* Added on Date Pill */}
                  <Box
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      backgroundColor: '#f1f5f9',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '10px',
                      fontWeight: 500,
                      color: '#475569',
                    }}
                  >
                    <Box
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        backgroundColor: '#64748b',
                      }}
                    />
                    <span>Added on {addedDateFormatted}</span>
                  </Box>

                  {/* Extension Badge */}
                  <Box
                    style={{
                      backgroundColor: '#f0f7ff',
                      border: '1px solid #bae6fd',
                      borderRadius: '5px',
                      padding: '2px 6px',
                      fontSize: '10px',
                      fontWeight: 600,
                      color: '#0284c7',
                      fontFamily: 'var(--font-mono, monospace)',
                    }}
                  >
                    {extLabel}
                  </Box>
                </Group>
              </Card>
            );
          })}
        </SimpleGrid>

        {displayedFilesWithMeta.length > collectionDisplayLimit && (
          <Button
            fullWidth
            variant="subtle"
            color="emerald"
            size="sm"
            mt="md"
            onClick={() => setCollectionDisplayLimit((prev) => prev + 36)}
            style={{
              border: '1px dashed var(--brand-primary-border)',
              backgroundColor: 'var(--surface-card)',
              fontWeight: 600,
            }}
          >
            Load More Files ({Math.min(collectionDisplayLimit, displayedFilesWithMeta.length)} of {displayedFilesWithMeta.length})
          </Button>
        )}
        </>
      )}

      {/* Modal: Edit Collection (Update) */}
      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Collection"
        size="sm"
        radius="md"
      >
        <form onSubmit={handleSaveEdit}>
          <Stack gap="md">
            <TextInput
              label="Collection Name"
              required
              value={editName}
              onChange={(e) => setEditName(e.currentTarget.value)}
              placeholder="e.g. Tax 2024"
            />

            <div>
              <Text size="xs" fw={500} mb={4}>
                Scope
              </Text>
              <SegmentedControl
                size="xs"
                value={editScope}
                onChange={setEditScope}
                data={[
                  { label: '💼 Work / Professional', value: 'professional' },
                  { label: '👤 Personal', value: 'personal' },
                ]}
              />
            </div>

            <Group justify="flex-end" mt="sm">
              <Button variant="default" size="xs" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="xs"
                color="blue"
                loading={isSubmittingEdit}
                disabled={!editName.trim()}
              >
                Save Changes
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Modal: Delete Collection (Delete with Safety) */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Collection"
        size="md"
        radius="md"
      >
        <Stack gap="md">
          <Group gap="xs" align="flex-start">
            <AlertTriangle size={24} color="#dc2626" />
            <Box style={{ flex: 1 }}>
              <Text size="sm" fw={600}>
                Are you sure you want to delete "{collection?.name}"?
              </Text>
              <Text size="xs" c="dimmed">
                This collection currently contains {files.length} document(s). Choose what happens to the files:
              </Text>
            </Box>
          </Group>

          <Paper p="sm" withBorder radius="md" style={{ backgroundColor: '#f8fafc' }}>
            <Radio.Group value={deleteCascade} onChange={setDeleteCascade}>
              <Stack gap="xs">
                <Radio
                  value="false"
                  label="Move files to Inbox (Keep files safe)"
                  description="Deletes the collection, but preserves the files in your unassigned Inbox."
                />
                <Radio
                  value="true"
                  label="Permanently delete all files in this collection"
                  description="Deletes the collection and permanently removes all its files from Telegram Vault and MongoDB."
                  color="red"
                />
              </Stack>
            </Radio.Group>
          </Paper>

          <Group justify="flex-end">
            <Button variant="default" size="xs" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              color="red"
              size="xs"
              loading={isSubmittingDelete}
              onClick={handleConfirmDelete}
            >
              Confirm Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
