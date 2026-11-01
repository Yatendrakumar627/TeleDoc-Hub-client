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
  Checkbox,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
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
  FolderInput,
  X,
  Check,
} from 'lucide-react';
import { notifications } from '@mantine/notifications';
import SourceBadge from '../../components/ui/SourceBadge';
import { formatBytes, extractDateFromName } from '../../utils/formatters';
import { getDocTypeMeta } from '../../utils/docTypes';
import { API_BASE_URL } from '../../config';
import { reorderDocuments, getCollections } from '../../services/apiClient';

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
  onBatchMoveFiles,
  onBatchDeleteFiles,
}) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Multi-Selection State for Batch Operations
  const [selectedFileIds, setSelectedFileIds] = useState([]);
  const [batchMoveModalOpen, setBatchMoveModalOpen] = useState(false);
  const [targetMoveCollectionId, setTargetMoveCollectionId] = useState('');
  const [availableCollections, setAvailableCollections] = useState([]);
  const [batchDeleteModalOpen, setBatchDeleteModalOpen] = useState(false);
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);

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

  // Clear selection if collection context changes
  useEffect(() => {
    setSelectedFileIds([]);
  }, [collection?.id]);

  // Esc keyboard shortcut to clear selection
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedFileIds.length > 0 && !batchMoveModalOpen && !batchDeleteModalOpen) {
        setSelectedFileIds([]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFileIds.length, batchMoveModalOpen, batchDeleteModalOpen]);

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

  // Batch Selection Handlers
  const handleToggleSelect = (fileId) => {
    setSelectedFileIds((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedFileIds.length === displayedFilesWithMeta.length) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(displayedFilesWithMeta.map((f) => f.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedFileIds([]);
  };

  const handleOpenBatchMove = async () => {
    try {
      const allCols = await getCollections('all');
      setAvailableCollections(allCols.filter((c) => c.id !== collection?.id));
    } catch (err) {
      console.warn('Failed to fetch collections for batch move:', err);
    }
    setTargetMoveCollectionId('');
    setBatchMoveModalOpen(true);
  };

  const handleConfirmBatchMove = async () => {
    if (selectedFileIds.length === 0 || !onBatchMoveFiles) return;
    try {
      setIsSubmittingBatch(true);
      await onBatchMoveFiles(selectedFileIds, targetMoveCollectionId || null);
      setSelectedFileIds([]);
      setBatchMoveModalOpen(false);
    } catch (err) {
      console.error('Batch move error:', err);
    } finally {
      setIsSubmittingBatch(false);
    }
  };

  const handleConfirmBatchDelete = async () => {
    if (selectedFileIds.length === 0 || !onBatchDeleteFiles) return;
    try {
      setIsSubmittingBatch(true);
      await onBatchDeleteFiles(selectedFileIds);
      setSelectedFileIds([]);
      setBatchDeleteModalOpen(false);
    } catch (err) {
      console.error('Batch delete error:', err);
    } finally {
      setIsSubmittingBatch(false);
    }
  };

  const selectedFiles = useMemo(() => {
    const idSet = new Set(selectedFileIds);
    return files.filter((f) => idSet.has(f.id));
  }, [files, selectedFileIds]);

  const selectedBytes = useMemo(() => {
    return selectedFiles.reduce((acc, f) => acc + (f.fileSize || 0), 0);
  }, [selectedFiles]);

  return (
    <Box p={isMobile ? 'xs' : 'lg'} style={{ maxWidth: 1040, margin: '0 auto', width: '100%' }}>
      {/* Collection Hero Header */}
      <Paper p={isMobile ? 'sm' : 'lg'} radius="md" withBorder mb="lg" style={{ backgroundColor: '#ffffff', boxShadow: 'var(--shadow-card)' }}>
        <Stack gap="sm">
          <Group justify="space-between" align="flex-start" wrap="wrap">
            <Group gap="sm" align="flex-start">
              <Box
                style={{
                  width: isMobile ? 38 : 44,
                  height: isMobile ? 38 : 44,
                  borderRadius: 10,
                  backgroundColor: isPersonal ? '#ecfdf5' : '#e0f2fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isPersonal ? '#059669' : '#0284c7',
                  border: isPersonal ? '1px solid #a7f3d0' : '1px solid #bae6fd',
                }}
              >
                <Folder size={isMobile ? 20 : 24} />
              </Box>

              <Box style={{ flex: 1, minWidth: 0 }}>
                <Group gap="xs" mb={4} wrap="wrap">
                  <Badge
                    color={isPersonal ? 'emerald' : 'blue'}
                    variant="light"
                    size="xs"
                    style={{
                      fontWeight: 600,
                      textTransform: 'none',
                      backgroundColor: isPersonal ? '#ecfdf5' : '#eff6ff',
                      color: isPersonal ? '#047857' : '#1d4ed8',
                      border: isPersonal ? '1px solid #a7f3d0' : '1px solid #bfdbfe',
                    }}
                  >
                    {isPersonal ? 'Personal Vault' : 'Work Collection'}
                  </Badge>
                  <Badge color="blue" variant="light" size="xs">
                    {files.length} {files.length === 1 ? 'file' : 'files'}
                  </Badge>
                  <Badge color="teal" variant="light" size="xs" leftSection={<Lock size={10} />}>
                    AES-256 Vault Encrypted
                  </Badge>
                </Group>

                <Title order={isMobile ? 3 : 2} style={{ color: '#0f172a', fontWeight: 800, letterSpacing: '-0.02em' }}>
                  {collection?.name || 'Collection'}
                </Title>
                <Text size="xs" c="dimmed" mt={2}>
                  Total archive size: {formatBytes(totalBytes)} • Stored individually in Telegram Vault
                </Text>
              </Box>
            </Group>

            {/* Collection Actions (CRUD) */}
            <Group gap="xs" wrap="nowrap" mt={isMobile ? 'xs' : 0} style={{ width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'flex-end' : 'flex-start' }}>
              <Tooltip label="Edit Collection Name & Scope" withArrow>
                <Button
                  variant="default"
                  size={isMobile ? 'xs' : 'sm'}
                  leftSection={<Edit3 size={14} />}
                  onClick={handleOpenEdit}
                  style={{ borderRadius: '8px' }}
                >
                  Edit
                </Button>
              </Tooltip>

              <Tooltip label="Delete Collection" withArrow position="top">
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size={isMobile ? '30px' : '36px'}
                  radius="md"
                  onClick={() => setDeleteModalOpen(true)}
                  style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fee2e2',
                    color: '#ef4444',
                    borderRadius: '8px',
                  }}
                >
                  <Trash2 size={15} />
                </ActionIcon>
              </Tooltip>

              <Button
                size={isMobile ? 'xs' : 'sm'}
                leftSection={<UploadCloud size={15} />}
                onClick={() => onOpenUpload && onOpenUpload(collection)}
                style={{
                  backgroundColor: 'var(--brand-primary)',
                  color: '#ffffff',
                  borderRadius: '8px',
                  fontWeight: 600,
                  boxShadow: 'var(--brand-glow)',
                }}
              >
                Add File
              </Button>
            </Group>
          </Group>
        </Stack>
      </Paper>

      {/* Files Grid Header with Selection, Sorting and Indicators */}
      <Group justify="space-between" align="center" mb="md" px={4} wrap="wrap" gap="xs">
        <Group gap="xs" align="center">
          <Text fw={700} size="xs" tt="uppercase" style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
            Files in this collection ({files.length})
          </Text>
          {fileSortBy === 'custom' && (
            <Badge size="xs" variant="light" color="gold" leftSection={<GripVertical size={11} />}>
              Custom Drag Order
            </Badge>
          )}
          {selectedFileIds.length > 0 && (
            <Badge size="xs" variant="filled" color="emerald">
              {selectedFileIds.length} Selected
            </Badge>
          )}
        </Group>

        <Group gap="sm" align="center" wrap="nowrap" style={{ width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
          {files.length > 0 && (
            <Checkbox
              size="xs"
              color="emerald"
              label={
                displayedFilesWithMeta.length > 0 && selectedFileIds.length === displayedFilesWithMeta.length
                  ? 'Deselect All'
                  : 'Select All'
              }
              checked={displayedFilesWithMeta.length > 0 && selectedFileIds.length === displayedFilesWithMeta.length}
              indeterminate={selectedFileIds.length > 0 && selectedFileIds.length < displayedFilesWithMeta.length}
              onChange={handleToggleSelectAll}
              styles={{
                label: { fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: selectedFileIds.length > 0 ? 'var(--brand-emerald)' : 'var(--text-secondary)' },
                input: { cursor: 'pointer' },
              }}
            />
          )}

          <Box style={{ width: isMobile ? 'auto' : 195, flex: isMobile ? 1 : 'none' }}>
            <Select
              size="xs"
              leftSection={<ArrowUpDown size={13} style={{ color: 'var(--brand-emerald)' }} />}
              value={fileSortBy}
              onChange={(val) => setFileSortBy(val || 'date-desc')}
              data={[
                { label: 'Newest First (Date)', value: 'date-desc' },
                { label: 'Oldest First (Date)', value: 'date-asc' },
                { label: 'Name (A - Z)', value: 'name-asc' },
                { label: 'Name (Z - A)', value: 'name-desc' },
                { label: 'Custom Drag Order', value: 'custom' },
              ]}
              comboboxProps={{ width: isMobile ? '100%' : 195, withinPortal: true, shadow: 'md' }}
              style={{ width: '100%' }}
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
                dropdown: { borderRadius: '8px', padding: '4px' },
                option: { fontSize: '12px', whiteSpace: 'nowrap', borderRadius: '6px' },
              }}
            />
          </Box>
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
          <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing={isMobile ? 'xs' : 'md'}>
          {displayedFilesWithMeta.slice(0, collectionDisplayLimit).map((file) => {
            const meta = getDocTypeMeta(file.type, file.format);
            const isDragging = draggedFileId === file.id;
            const isDropBefore = dropTargetFileId === file.id && dropPosition === 'before';
            const isDropAfter = dropTargetFileId === file.id && dropPosition === 'after';
            const isSelected = selectedFileIds.includes(file.id);

            const { formattedFileDate, addedDateFormatted, extLabel } = file;

            return (
              <Card
                key={file.id}
                p={isMobile ? 'xs' : 'sm'}
                radius="md"
                withBorder
                draggable={true}
                onDragStart={(e) => {
                  if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.mantine-Menu-dropdown') || e.target.closest('.mantine-Checkbox-root')) {
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
                  backgroundColor: isSelected ? '#f0fdf4' : '#ffffff',
                  borderColor: isSelected ? 'var(--brand-emerald)' : isDragging ? 'var(--brand-emerald)' : '#e2e8f0',
                  borderWidth: isSelected ? '1.5px' : '1px',
                  borderRadius: '14px',
                  borderStyle: isDragging ? 'dashed' : 'solid',
                  opacity: isDragging ? 0.35 : 1,
                  transform: isDragging ? 'scale(0.98)' : 'none',
                  boxShadow: isSelected
                    ? '0 0 0 1px var(--brand-emerald), 0 6px 16px rgba(16, 185, 129, 0.15)'
                    : '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
                  overflow: 'visible',
                  transition: 'all 0.16s ease-in-out',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: isMobile ? '10px 12px' : '12px 16px',
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
                  {/* Top Row: Selection Checkbox + Drag Handle + Brand Icon + Title + Format Pill ... Quick Action Bar */}
                  <Group justify="space-between" align="flex-start" wrap="nowrap" mb={8}>
                    <Group gap={8} align="center" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
                      {/* Selection Checkbox */}
                      <Tooltip label={isSelected ? 'Deselect file' : 'Select file for batch move / delete'} position="top" withArrow openDelay={400}>
                        <Box
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSelect(file.id);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: '2px',
                            borderRadius: '4px',
                            flexShrink: 0,
                          }}
                        >
                          <Checkbox
                            size="xs"
                            color="emerald"
                            checked={isSelected}
                            onChange={() => {}} // handled by parent onClick
                            styles={{ input: { cursor: 'pointer' } }}
                          />
                        </Box>
                      </Tooltip>

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
                        size={isMobile ? 32 : 38}
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
                              fontSize: isMobile ? '13.5px' : '15px',
                              letterSpacing: '-0.01em',
                            }}
                          >
                            {file.title}
                          </Text>
                        </Tooltip>

                        <Group gap={6} mt={2} wrap="nowrap">
                          <Badge
                            size="xs"
                            variant="light"
                            leftSection={<FileText size={9} />}
                            style={{
                              backgroundColor: '#eaf7ee',
                              color: '#185844',
                              fontSize: '9px',
                              fontWeight: 700,
                              letterSpacing: '0.02em',
                              height: '19px',
                              padding: '0 6px',
                              borderRadius: '4px',
                              textTransform: 'uppercase',
                              maxWidth: '100%',
                            }}
                          >
                            {meta.label || 'WORD DOCUMENT'}
                          </Badge>
                        </Group>
                      </Box>
                    </Group>

                    {/* Quick Action Icons:
                        On Mobile: We show Download + More (Menu has Copy Link, Open, Delete).
                        On Desktop: We show Download, Copy Link, More, Delete. */}
                    <Group gap={isMobile ? 6 : 4} wrap="nowrap" style={{ flexShrink: 0 }}>
                      {/* 1. Download File */}
                      <Tooltip label="Download File" withArrow position="top">
                        <ActionIcon
                          size={isMobile ? '34px' : '28px'}
                          radius="md"
                          variant="subtle"
                          component="a"
                          href={`${API_BASE_URL}/documents/${file.id}/download`}
                          download={file.filename}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            color: '#475569',
                            borderRadius: '8px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Download size={isMobile ? 15 : 13} />
                        </ActionIcon>
                      </Tooltip>

                      {!isMobile && (
                        /* 2. Copy Link (Desktop only) */
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
                      )}

                      {/* 3. More Options Menu */}
                      <Menu shadow="md" width={180} position="bottom-end" withinPortal>
                        <Menu.Target>
                          <Tooltip label="More Options" withArrow position="top">
                            <ActionIcon
                              size={isMobile ? '34px' : '28px'}
                              radius="md"
                              variant="subtle"
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                color: '#475569',
                                borderRadius: '8px',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <MoreVertical size={isMobile ? 15 : 13} />
                            </ActionIcon>
                          </Tooltip>
                        </Menu.Target>
                        <Menu.Dropdown
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            borderRadius: '10px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
                            border: '1px solid #e2e8f0',
                            padding: '5px',
                          }}
                        >
                          <Menu.Item leftSection={<ExternalLink size={13} />} onClick={() => onSelectFile(file.id)}>
                            Open File Viewer
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<LinkIcon size={13} />}
                            onClick={() => {
                              const shareUrl = `${window.location.origin}/#doc=${file.id}`;
                              navigator.clipboard.writeText(shareUrl);
                              notifications.show({
                                title: 'Link Copied',
                                message: 'Document link copied to clipboard.',
                                color: 'emerald',
                                autoClose: 2000,
                              });
                            }}
                          >
                            Copy Direct Link
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

                      {!isMobile && (
                        /* 4. Delete File (Desktop only) */
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
                      )}
                    </Group>
                  </Group>

                  {/* Middle Metrics Strip */}
                  {isMobile ? (
                    /* Mobile Clean 3-Metric Distribution (Date, Words, Size) with ZERO truncation */
                    <Group justify="space-between" align="center" wrap="nowrap" mt={10} mb={10} px={2}>
                      <Group gap={5} wrap="nowrap" align="center">
                        <Calendar size={13} color="#64748b" style={{ flexShrink: 0 }} />
                        <Box>
                          <Text size="9px" c="dimmed" fw={500} style={{ lineHeight: 1 }}>
                            Date
                          </Text>
                          <Text size="11.5px" fw={700} style={{ color: '#0f172a', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                            {formattedFileDate}
                          </Text>
                        </Box>
                      </Group>

                      <Divider orientation="vertical" h={20} color="#e2e8f0" />

                      <Group gap={5} wrap="nowrap" align="center">
                        <AlignLeft size={13} color="#64748b" style={{ flexShrink: 0 }} />
                        <Box>
                          <Text size="9px" c="dimmed" fw={500} style={{ lineHeight: 1 }}>
                            Words
                          </Text>
                          <Text size="11.5px" fw={700} style={{ color: '#0f172a', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                            {file.wordCount ? Number(file.wordCount).toLocaleString() : '—'}
                          </Text>
                        </Box>
                      </Group>

                      <Divider orientation="vertical" h={20} color="#e2e8f0" />

                      <Group gap={5} wrap="nowrap" align="center">
                        <Database size={13} color="#64748b" style={{ flexShrink: 0 }} />
                        <Box>
                          <Text size="9px" c="dimmed" fw={500} style={{ lineHeight: 1 }}>
                            Size
                          </Text>
                          <Text size="11.5px" fw={700} style={{ color: '#0f172a', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                            {formatBytes(file.fileSize)}
                          </Text>
                        </Box>
                      </Group>
                    </Group>
                  ) : (
                    /* Desktop Metrics + Open Button */
                    <Group justify="space-between" align="center" wrap="nowrap" mt={10} mb={10}>
                      <Group gap={10} align="center" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
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
                  )}
                </div>

                {/* Bottom Footer Strip */}
                <Group justify="space-between" align="center" wrap="nowrap" pt={isMobile ? 6 : 2} style={{ borderTop: isMobile ? '1px solid #f1f5f9' : 'none' }}>
                  <Group gap={6} wrap="nowrap" align="center">
                    <Box
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        backgroundColor: '#f1f5f9',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: isMobile ? '9.5px' : '10px',
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
                        fontSize: isMobile ? '9.5px' : '10px',
                        fontWeight: 600,
                        color: '#0284c7',
                        fontFamily: 'var(--font-mono, monospace)',
                      }}
                    >
                      .{extLabel}
                    </Box>
                  </Group>

                  {/* On Mobile: Open CTA in footer row */}
                  {isMobile && (
                    <Button
                      size="xs"
                      radius="sm"
                      rightSection={<ArrowRight size={12} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectFile(file.id);
                      }}
                      style={{
                        backgroundColor: '#185844',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '11.5px',
                        height: '28px',
                        padding: '0 10px',
                        borderRadius: '7px',
                        boxShadow: '0 2px 6px rgba(24, 88, 68, 0.2)',
                        flexShrink: 0,
                      }}
                    >
                      Open
                    </Button>
                  )}
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
        title={
          <Group gap="xs">
            <AlertTriangle size={18} color="#dc2626" />
            <Text fw={700} c="red" size="sm">
              Delete Collection
            </Text>
          </Group>
        }
        size="md"
        radius="md"
      >
        <Stack gap="md">
          <Box>
            <Text size="sm" fw={600} style={{ color: 'var(--brand-forest)' }}>
              Are you sure you want to delete collection "{collection?.name}"?
            </Text>
            <Text size="xs" c="dimmed" mt={3}>
              {files.length > 0
                ? `This collection currently contains ${files.length} file${files.length === 1 ? '' : 's'}. Choose what happens to the files:`
                : 'This collection is empty. Deleting it will permanently remove the folder.'}
            </Text>
          </Box>

          {files.length > 0 ? (
            <Paper p="xs" withBorder radius="md" style={{ backgroundColor: '#fcfbfa' }}>
              <Radio.Group value={deleteCascade} onChange={setDeleteCascade}>
                <Stack gap="xs">
                  {/* Option 1: Move to Inbox (Safe) */}
                  <Box
                    p="xs"
                    style={{
                      borderRadius: '8px',
                      backgroundColor: deleteCascade === 'false' ? '#f0fdf4' : '#ffffff',
                      border: deleteCascade === 'false' ? '1px solid #86efac' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onClick={() => setDeleteCascade('false')}
                  >
                    <Radio
                      value="false"
                      color="emerald"
                      label={
                        <Text fw={600} size="xs" style={{ color: '#166534' }}>
                          Move {files.length} file{files.length === 1 ? '' : 's'} to Inbox (Keep safe)
                        </Text>
                      }
                      description="Deletes this collection folder, but safely keeps all files in your unassigned library."
                    />
                  </Box>

                  {/* Option 2: Delete files with collection (Permanent) */}
                  <Box
                    p="xs"
                    style={{
                      borderRadius: '8px',
                      backgroundColor: deleteCascade === 'true' ? '#fef2f2' : '#ffffff',
                      border: deleteCascade === 'true' ? '1px solid #fca5a5' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onClick={() => setDeleteCascade('true')}
                  >
                    <Radio
                      value="true"
                      color="red"
                      label={
                        <Text fw={600} size="xs" style={{ color: '#991b1b' }}>
                          Permanently delete collection AND all {files.length} file{files.length === 1 ? '' : 's'}
                        </Text>
                      }
                      description="Permanently deletes the folder AND destroys all files from Telegram Cloud Storage & database."
                    />
                  </Box>
                </Stack>
              </Radio.Group>
            </Paper>
          ) : (
            <Paper p="xs" withBorder radius="md" style={{ backgroundColor: '#f8fafc' }}>
              <Text size="xs" c="dimmed">
                📁 No files will be affected because this folder is empty.
              </Text>
            </Paper>
          )}

          <Group justify="flex-end" mt="xs">
            <Button variant="default" size="xs" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              color="red"
              size="xs"
              loading={isSubmittingDelete}
              onClick={handleConfirmDelete}
            >
              {files.length > 0 && deleteCascade === 'true'
                ? `Delete Folder & ${files.length} File${files.length === 1 ? '' : 's'}`
                : 'Delete Collection'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Floating Bottom Batch Action Bar */}
      {selectedFileIds.length > 0 && (
        <Paper
          shadow="xl"
          p="xs"
          radius="xl"
          withBorder
          style={{
            position: 'fixed',
            bottom: isMobile ? 16 : 28,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            backgroundColor: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.08)',
            maxWidth: 'calc(100vw - 32px)',
          }}
        >
          <Group gap={isMobile ? 'xs' : 'md'} wrap="nowrap" px="xs">
            {/* Selection Info */}
            <Group gap={6} wrap="nowrap">
              <Badge
                size="md"
                variant="filled"
                color="emerald"
                style={{ fontWeight: 700, letterSpacing: '0.02em' }}
              >
                {selectedFileIds.length} {selectedFileIds.length === 1 ? 'file' : 'files'}
              </Badge>
              {!isMobile && (
                <Text size="xs" style={{ color: '#94a3b8' }}>
                  ({formatBytes(selectedBytes)})
                </Text>
              )}
            </Group>

            <Divider orientation="vertical" style={{ borderColor: 'rgba(255, 255, 255, 0.15)', height: 20 }} />

            {/* Move Action Button */}
            <Button
              size="xs"
              variant="light"
              color="blue"
              radius="md"
              leftSection={<FolderInput size={14} />}
              onClick={handleOpenBatchMove}
              styles={{
                root: {
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  color: '#60a5fa',
                  border: '1px solid rgba(96, 165, 250, 0.25)',
                  '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.25)' },
                },
              }}
            >
              Move
            </Button>

            {/* Delete Action Button */}
            <Button
              size="xs"
              color="red"
              radius="md"
              leftSection={<Trash2 size={14} />}
              onClick={() => setBatchDeleteModalOpen(true)}
              styles={{
                root: {
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  fontWeight: 600,
                  '&:hover': { backgroundColor: '#b91c1c' },
                },
              }}
            >
              Delete
            </Button>

            {/* Cancel / Deselect Button */}
            <ActionIcon
              size="sm"
              variant="subtle"
              color="gray"
              radius="xl"
              onClick={handleClearSelection}
              title="Deselect all (Esc)"
              style={{ color: '#cbd5e1' }}
            >
              <X size={15} />
            </ActionIcon>
          </Group>
        </Paper>
      )}

      {/* Batch Move Modal */}
      <Modal
        opened={batchMoveModalOpen}
        onClose={() => setBatchMoveModalOpen(false)}
        title={
          <Group gap="xs">
            <FolderInput size={18} color="var(--brand-emerald)" />
            <Text fw={600} size="md">Move {selectedFileIds.length} File{selectedFileIds.length === 1 ? '' : 's'}</Text>
          </Group>
        }
        centered
        radius="lg"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Choose target destination for {selectedFileIds.length} selected file{selectedFileIds.length === 1 ? '' : 's'}:
          </Text>

          <Select
            label="Target Collection"
            placeholder="Select destination folder..."
            data={[
              { label: '📥 Inbox (Unassigned / Loose Files)', value: '' },
              ...availableCollections.map((c) => ({
                label: `📁 ${c.name} (${c.scope === 'personal' ? 'Personal' : 'Work'}${c.groupName ? ` • ${c.groupName}` : ''})`,
                value: c.id,
              })),
            ]}
            value={targetMoveCollectionId}
            onChange={(val) => setTargetMoveCollectionId(val ?? '')}
            searchable
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" size="xs" onClick={() => setBatchMoveModalOpen(false)}>
              Cancel
            </Button>
            <Button
              color="emerald"
              size="xs"
              loading={isSubmittingBatch}
              onClick={handleConfirmBatchMove}
            >
              Move {selectedFileIds.length} File{selectedFileIds.length === 1 ? '' : 's'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Batch Delete Confirmation Modal */}
      <Modal
        opened={batchDeleteModalOpen}
        onClose={() => setBatchDeleteModalOpen(false)}
        title={
          <Group gap="xs">
            <AlertTriangle size={18} color="#ef4444" />
            <Text fw={600} size="md" c="red">Delete {selectedFileIds.length} File{selectedFileIds.length === 1 ? '' : 's'}</Text>
          </Group>
        }
        centered
        radius="lg"
      >
        <Stack gap="md">
          <Paper p="sm" radius="md" withBorder style={{ backgroundColor: '#fef2f2', borderColor: '#fca5a5' }}>
            <Text size="sm" fw={600} c="red" mb={4}>
              Permanent Database & Telegram Storage Removal
            </Text>
            <Text size="xs" style={{ color: '#991b1b', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete these <strong>{selectedFileIds.length} file{selectedFileIds.length === 1 ? '' : 's'}</strong> ({formatBytes(selectedBytes)})?
              This will erase them from MongoDB database and destroy their encrypted blobs on Telegram. This action cannot be undone.
            </Text>
          </Paper>

          <Box style={{ maxHeight: 180, overflowY: 'auto' }}>
            <Stack gap={4}>
              {selectedFiles.slice(0, 10).map((f) => (
                <Group key={f.id} gap="xs" wrap="nowrap" px="xs" py={4} style={{ backgroundColor: '#f8fafc', borderRadius: 6 }}>
                  <Trash2 size={13} color="#ef4444" style={{ flexShrink: 0 }} />
                  <Text size="xs" fw={500} truncate style={{ flex: 1 }}>{f.title || f.filename}</Text>
                  <Text size="11px" c="dimmed">{formatBytes(f.fileSize || 0)}</Text>
                </Group>
              ))}
              {selectedFiles.length > 10 && (
                <Text size="xs" c="dimmed" ta="center" pt={4}>
                  ...and {selectedFiles.length - 10} more file{selectedFiles.length - 10 === 1 ? '' : 's'}
                </Text>
              )}
            </Stack>
          </Box>

          <Group justify="flex-end" mt="md">
            <Button variant="default" size="xs" onClick={() => setBatchDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              color="red"
              size="xs"
              loading={isSubmittingBatch}
              onClick={handleConfirmBatchDelete}
            >
              Permanently Delete {selectedFileIds.length} File{selectedFileIds.length === 1 ? '' : 's'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
