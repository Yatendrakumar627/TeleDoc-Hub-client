import React, { useState, useEffect, useMemo } from 'react';
import {
  Paper,
  Group,
  Stack,
  Title,
  Text,
  Badge,
  Button,
  SimpleGrid,
  Box,
  Divider,
  ActionIcon,
  Modal,
  TextInput,
  Textarea,
  SegmentedControl,
  Select,
  Tooltip,
  Checkbox,
  ColorInput,
  Card,
  ThemeIcon,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  FolderKanban,
  Folder,
  FileText,
  Edit3,
  Trash2,
  FolderPlus,
  UploadCloud,
  Layers,
  ArrowRight,
  Shield,
  Tag,
  GripVertical,
  ArrowUpDown,
  CheckSquare,
  FolderInput,
  X,
  AlertTriangle,
  Home,
  ChevronRight,
} from 'lucide-react';
import { notifications } from '@mantine/notifications';
import FileCard from '../library/FileCard';
import { getCollections, reorderCollections } from '../../services/apiClient';
import { extractDateFromName, formatBytes } from '../../utils/formatters';

export default function GroupHubView({
  group,
  onSelectCollection,
  onSelectFile,
  onDeleteFile,
  onOpenUpload,
  onUpdateGroup,
  onDeleteGroup,
  onCreateCollectionInGroup,
  onAssignCollectionToGroup,
  onBatchMoveFiles,
  onBatchDeleteFiles,
  onNavigateHome,
}) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Batch Multi-Select state
  const [selectedFileIds, setSelectedFileIds] = useState([]);
  const [batchMoveModalOpen, setBatchMoveModalOpen] = useState(false);
  const [batchDeleteModalOpen, setBatchDeleteModalOpen] = useState(false);
  const [targetMoveCollectionId, setTargetMoveCollectionId] = useState('');
  const [allAvailableCollections, setAllAvailableCollections] = useState([]);
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [name, setName] = useState(group.name || '');
  const [description, setDescription] = useState(group.description || '');
  const [color, setColor] = useState(group.color || '#6366f1');
  const [scope, setScope] = useState(group.scope || 'all');
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cascadeDelete, setCascadeDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Collection modal state (dual-mode: 'new' or 'existing')
  const [createColOpen, setCreateColOpen] = useState(false);
  const [collectionModalMode, setCollectionModalMode] = useState('new');
  const [newColName, setNewColName] = useState('');
  const [newColScope, setNewColScope] = useState(group.scope === 'personal' ? 'personal' : 'professional');
  const [isCreatingCol, setIsCreatingCol] = useState(false);

  const [availableCollections, setAvailableCollections] = useState([]);
  const [selectedExistingColId, setSelectedExistingColId] = useState('');
  const [isAssigningCol, setIsAssigningCol] = useState(false);

  // Fetch collections when modal opens to support assigning existing collection
  useEffect(() => {
    if (createColOpen) {
      getCollections('all')
        .then((cols) => {
          const currentIds = new Set((group.collections || []).map((c) => c.id));
          const notInGroup = (cols || []).filter(
            (c) => !currentIds.has(c.id) && c.groupId !== group.id
          );
          setAvailableCollections(notInGroup);
          if (notInGroup.length > 0) {
            setSelectedExistingColId(notInGroup[0].id);
          } else {
            setSelectedExistingColId('');
          }
        })
        .catch(() => setAvailableCollections([]));
    }
  }, [createColOpen, group.id, group.collections]);

  const handleOpenEdit = () => {
    setName(group.name || '');
    setDescription(group.description || '');
    setColor(group.color || '#6366f1');
    setScope(group.scope || 'all');
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsUpdating(true);
      await onUpdateGroup(group.id, {
        name: name.trim(),
        description: description.trim(),
        color,
        scope,
      });
      setEditModalOpen(false);
    } catch (err) {
      console.error('Error updating group:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await onDeleteGroup(group.id, cascadeDelete);
      setDeleteModalOpen(false);
    } catch (err) {
      console.error('Error deleting group:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    try {
      setIsCreatingCol(true);
      if (onCreateCollectionInGroup) {
        await onCreateCollectionInGroup({
          name: newColName.trim(),
          scope: newColScope,
          groupId: group.id,
          groupName: group.name,
        });
      }
      setNewColName('');
      setCreateColOpen(false);
    } catch (err) {
      console.error('Error creating collection in group:', err);
    } finally {
      setIsCreatingCol(false);
    }
  };

  const handleAssignExistingCollection = async () => {
    if (!selectedExistingColId || !onAssignCollectionToGroup) return;
    try {
      setIsAssigningCol(true);
      await onAssignCollectionToGroup(selectedExistingColId, group.id, group.name);
      setCreateColOpen(false);
      setSelectedExistingColId('');
    } catch (err) {
      console.error('Error assigning collection to group:', err);
    } finally {
      setIsAssigningCol(false);
    }
  };

  const collections = group.collections || [];
  const documents = group.documents || [];
  const totalKB = (group.totalBytes || 0) / 1024;

  // Batch Multi-Select Handlers
  const handleToggleSelect = (fileId) => {
    setSelectedFileIds((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedFileIds.length === documents.length) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(documents.map((d) => d.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedFileIds([]);
  };

  const handleOpenBatchMove = async () => {
    try {
      const allCols = await getCollections('all');
      setAllAvailableCollections(allCols);
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
    return documents.filter((f) => idSet.has(f.id));
  }, [documents, selectedFileIds]);

  const selectedBytes = useMemo(() => {
    return selectedFiles.reduce((acc, f) => acc + (f.fileSize || 0), 0);
  }, [selectedFiles]);

  // Sorting and Dragging Collections in Group
  const [colSortBy, setColSortBy] = useState('date-desc'); // 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'custom'
  const [orderedCols, setOrderedCols] = useState(collections);
  const [draggedColId, setDraggedColId] = useState(null);
  const [dropTargetColId, setDropTargetColId] = useState(null);
  const [colDropPosition, setColDropPosition] = useState(null); // 'before' | 'after'

  useEffect(() => {
    setOrderedCols(group.collections || []);
  }, [group.collections]);

  const displayedCols = useMemo(() => {
    const list = [...orderedCols];
    if (colSortBy === 'date-desc') {
      return list.sort((a, b) => {
        const dateA = extractDateFromName(a.name, a.createdAt);
        const dateB = extractDateFromName(b.name, b.createdAt);
        if (dateA !== dateB) return dateB - dateA;
        return (a.order ?? 0) - (b.order ?? 0);
      });
    } else if (colSortBy === 'date-asc') {
      return list.sort((a, b) => {
        const dateA = extractDateFromName(a.name, a.createdAt);
        const dateB = extractDateFromName(b.name, b.createdAt);
        if (dateA !== dateB) return dateA - dateB;
        return (a.order ?? 0) - (b.order ?? 0);
      });
    } else if (colSortBy === 'name-asc') {
      return list.sort((a, b) =>
        (a.name || '').localeCompare(b.name || '', undefined, { numeric: true, sensitivity: 'base' })
      );
    } else if (colSortBy === 'name-desc') {
      return list.sort((a, b) =>
        (b.name || '').localeCompare(a.name || '', undefined, { numeric: true, sensitivity: 'base' })
      );
    }
    return list;
  }, [orderedCols, colSortBy]);

  const handleGroupColDrop = async (targetColId, dropPosition) => {
    if (!draggedColId || draggedColId === targetColId) {
      setDraggedColId(null);
      setDropTargetColId(null);
      setColDropPosition(null);
      return;
    }

    const fromIndex = orderedCols.findIndex((c) => c.id === draggedColId);
    if (fromIndex === -1) {
      setDraggedColId(null);
      setDropTargetColId(null);
      setColDropPosition(null);
      return;
    }

    const newCols = [...orderedCols];
    const [movedItem] = newCols.splice(fromIndex, 1);
    let targetIndex = newCols.findIndex((c) => c.id === targetColId);
    if (targetIndex === -1) {
      targetIndex = newCols.length;
    } else if (dropPosition === 'after') {
      targetIndex += 1;
    }

    newCols.splice(targetIndex, 0, movedItem);
    setColSortBy('custom');
    setOrderedCols(newCols);
    setDraggedColId(null);
    setDropTargetColId(null);
    setColDropPosition(null);

    try {
      const orderedIds = newCols.map((c) => c.id);
      await reorderCollections(orderedIds);
      notifications.show({
        title: 'Folder Reordered',
        message: `"${movedItem.name}" sequence updated in ${group.name}.`,
        color: 'teal',
        autoClose: 1800,
      });
    } catch (err) {
      console.error('Failed to save group collection sequence:', err);
      setOrderedCols(group.collections || []);
      notifications.show({
        title: 'Reorder Failed',
        message: 'Could not save folder sequence.',
        color: 'red',
      });
    }
  };

  return (
    <Box p={isMobile ? 'xs' : 'lg'}>
      {/* 1-Click Back to Main Page Breadcrumb Navigation */}
      {onNavigateHome && (
        <Group gap={6} mb="sm" align="center">
          <Button
            variant="subtle"
            size="xs"
            leftSection={<Home size={14} />}
            onClick={onNavigateHome}
            style={{
              padding: '0 8px',
              height: '28px',
              color: 'var(--brand-primary)',
              fontWeight: 600,
              fontSize: '12px',
              borderRadius: '6px',
              backgroundColor: 'rgba(24, 88, 68, 0.06)',
            }}
          >
            Main Page
          </Button>
          <ChevronRight size={14} color="#94a3b8" />
          <Text size="xs" fw={700} style={{ color: 'var(--brand-forest)' }}>
            {group.name}
          </Text>
        </Group>
      )}

      {/* Group Header Hero Banner */}
      <Paper
        p={isMobile ? 'sm' : 'lg'}
        radius="lg"
        withBorder
        mb={isMobile ? 'md' : 'xl'}
        style={{
          borderLeft: `8px solid ${group.color || '#6366f1'}`,
          backgroundColor: '#ffffff',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
          <Group align="flex-start" gap="md" style={{ flex: 1, minWidth: 0 }}>
            <ThemeIcon
              size={isMobile ? 42 : 54}
              radius="md"
              style={{ backgroundColor: `${group.color || '#6366f1'}15`, flexShrink: 0 }}
            >
              <FolderKanban size={isMobile ? 22 : 30} color={group.color || '#6366f1'} />
            </ThemeIcon>

            <Box style={{ flex: 1, minWidth: 0 }}>
              <Group gap="xs" align="center" wrap="wrap">
                <Title order={isMobile ? 3 : 2} fw={700}>
                  {group.name}
                </Title>
                <Badge
                  color={group.scope === 'personal' ? 'violet' : group.scope === 'professional' ? 'blue' : 'gray'}
                  variant="light"
                  size="sm"
                >
                  {group.scope === 'personal' ? '👤 Personal' : group.scope === 'professional' ? '💼 Work' : '🌐 All Scopes'}
                </Badge>
                {group.isSystem && (
                  <Badge color="gray" variant="outline" size="xs">
                    System Group
                  </Badge>
                )}
              </Group>

              <Text size="sm" c="dimmed" mt={4} maw={600}>
                {group.description || 'Custom organizational group for categorizing collections and files.'}
              </Text>

              <Group gap={isMobile ? 'xs' : 'md'} mt="sm" wrap="wrap">
                <Badge color="blue" variant="dot" size="sm">
                  {collections.length} {collections.length === 1 ? 'Collection' : 'Collections'}
                </Badge>
                <Badge color="teal" variant="dot" size="sm">
                  {documents.length} {documents.length === 1 ? 'Direct File' : 'Direct Files'}
                </Badge>
                <Badge color="gray" variant="subtle" size="sm">
                  {totalKB > 1024 ? `${(totalKB / 1024).toFixed(1)} MB` : `${totalKB.toFixed(1)} KB`} total storage
                </Badge>
              </Group>
            </Box>
          </Group>

          {/* Action Buttons */}
          <Group gap="xs" wrap="nowrap" style={{ width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'flex-end' : 'flex-start' }}>
            <Button
              leftSection={<FolderPlus size={15} />}
              variant="light"
              color="indigo"
              size={isMobile ? 'xs' : 'sm'}
              onClick={() => setCreateColOpen(true)}
              style={{ borderRadius: '8px' }}
            >
              Add Collection
            </Button>

            <Button
              leftSection={<UploadCloud size={15} />}
              variant="light"
              color="blue"
              size={isMobile ? 'xs' : 'sm'}
              onClick={onOpenUpload}
              style={{ borderRadius: '8px' }}
            >
              Upload File
            </Button>

            <Tooltip label="Edit Group Details">
              <ActionIcon variant="default" size={isMobile ? '30px' : '36px'} radius="md" onClick={handleOpenEdit}>
                <Edit3 size={15} />
              </ActionIcon>
            </Tooltip>

            {!group.isSystem && (
              <Tooltip label="Delete Group">
                <ActionIcon variant="light" color="red" size={isMobile ? '30px' : '36px'} radius="md" onClick={() => setDeleteModalOpen(true)}>
                  <Trash2 size={15} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Group>
      </Paper>

      <Stack gap="xl">
        {/* SECTION 1: Member Collections */}
        <Box>
          <Group justify="space-between" align="center" mb="md" wrap="wrap" gap="xs">
            <Group gap="xs">
              <Folder size={20} color="#0284c7" />
              <Title order={3} size="h4">
                Collections in this Group ({displayedCols.length})
              </Title>
              {colSortBy === 'custom' && (
                <Badge size="xs" variant="light" color="gold" leftSection={<GripVertical size={11} />}>
                  Custom Drag Order
                </Badge>
              )}
            </Group>

            <Group gap="xs">
              <Select
                size="xs"
                leftSection={<ArrowUpDown size={13} style={{ color: 'var(--brand-emerald)' }} />}
                value={colSortBy}
                onChange={(val) => setColSortBy(val || 'date-desc')}
                data={[
                  { label: 'Newest First (Date)', value: 'date-desc' },
                  { label: 'Oldest First (Date)', value: 'date-asc' },
                  { label: 'Name (A - Z)', value: 'name-asc' },
                  { label: 'Name (Z - A)', value: 'name-desc' },
                  { label: 'Custom Drag Order', value: 'custom' },
                ]}
                comboboxProps={{ width: 195, withinPortal: true, shadow: 'md' }}
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

              <Button
                variant="subtle"
                size="xs"
                leftSection={<FolderPlus size={14} />}
                onClick={() => setCreateColOpen(true)}
              >
                New Collection
              </Button>
            </Group>
          </Group>

          {displayedCols.length > 0 ? (
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
              {displayedCols.map((col) => {
                const isDropTargetBefore = dropTargetColId === col.id && colDropPosition === 'before';
                const isDropTargetAfter = dropTargetColId === col.id && colDropPosition === 'after';
                const isDragging = draggedColId === col.id;

                return (
                  <Box
                    key={col.id}
                    style={{ position: 'relative' }}
                    draggable={true}
                    onDragStart={(e) => {
                      const target = e.target;
                      if (target.closest('button') || target.closest('a') || target.closest('input')) {
                        e.preventDefault();
                        return;
                      }
                      setDraggedColId(col.id);
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', col.id);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.dataTransfer.dropEffect = 'move';
                      if (!draggedColId || draggedColId === col.id) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const relX = e.clientX - rect.left;
                      const position = relX < rect.width / 2 ? 'before' : 'after';
                      setDropTargetColId(col.id);
                      setColDropPosition(position);
                    }}
                    onDragLeave={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget)) {
                        if (dropTargetColId === col.id) {
                          setDropTargetColId(null);
                          setColDropPosition(null);
                        }
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (draggedColId && draggedColId !== col.id) {
                        handleGroupColDrop(col.id, colDropPosition);
                      }
                    }}
                    onDragEnd={() => {
                      setDraggedColId(null);
                      setDropTargetColId(null);
                      setColDropPosition(null);
                    }}
                  >
                    {/* Visual Drop Indicators for Grid Cards */}
                    {isDropTargetBefore && (
                      <Box
                        style={{
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          left: -4,
                          width: 4,
                          backgroundColor: 'var(--brand-emerald)',
                          borderRadius: 99,
                          zIndex: 30,
                          boxShadow: '0 0 8px rgba(24, 88, 68, 0.8)',
                          pointerEvents: 'none',
                        }}
                      />
                    )}
                    {isDropTargetAfter && (
                      <Box
                        style={{
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          right: -4,
                          width: 4,
                          backgroundColor: 'var(--brand-emerald)',
                          borderRadius: 99,
                          zIndex: 30,
                          boxShadow: '0 0 8px rgba(24, 88, 68, 0.8)',
                          pointerEvents: 'none',
                        }}
                      />
                    )}

                    <Card
                      padding="md"
                      radius="md"
                      withBorder
                      style={{
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        borderLeft: `4px solid ${col.color || '#0284c7'}`,
                        opacity: isDragging ? 0.35 : 1,
                        transform: isDragging ? 'scale(0.97)' : 'none',
                      }}
                      onClick={() => onSelectCollection && onSelectCollection(col)}
                      className="hover-card"
                    >
                      <Group justify="space-between" align="flex-start" mb="xs">
                        <Group gap="xs" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
                          <Tooltip label="Drag to reorder folder in group" withArrow openDelay={350}>
                            <Box
                              component="span"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'grab',
                                color: 'var(--text-tertiary)',
                                padding: '2px',
                                borderRadius: 3,
                                flexShrink: 0,
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <GripVertical size={14} />
                            </Box>
                          </Tooltip>

                          <Folder size={20} color={col.color || '#0284c7'} style={{ flexShrink: 0 }} />
                          <Text size="sm" fw={600} truncate style={{ flex: 1, minWidth: 0 }}>
                            {col.name}
                          </Text>
                        </Group>
                        <Badge size="xs" color={col.scope === 'personal' ? 'violet' : 'blue'} variant="light">
                          {col.scope}
                        </Badge>
                      </Group>

                      <Text size="xs" c="dimmed" lineClamp={2} mb="sm" mih={32}>
                        {col.description || 'Custom collection of documents.'}
                      </Text>

                      <Divider my="xs" />

                      <Group justify="space-between" align="center">
                        <Text size="xs" fw={500} c="dimmed">
                          {col.documentCount || 0} {col.documentCount === 1 ? 'file' : 'files'}
                        </Text>
                        <Group gap={4} c="blue" style={{ fontSize: 12, fontWeight: 500 }}>
                          <span>View Collection</span>
                          <ArrowRight size={14} />
                        </Group>
                      </Group>
                    </Card>
                  </Box>
                );
              })}
            </SimpleGrid>
          ) : (
            <Paper p="lg" radius="md" withBorder style={{ backgroundColor: '#f8fafc', textAlign: 'center' }}>
              <Folder size={32} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
              <Text size="sm" fw={500} c="dimmed">
                No collections assigned to this group yet.
              </Text>
              <Button
                variant="light"
                size="xs"
                mt="sm"
                leftSection={<FolderPlus size={14} />}
                onClick={() => setCreateColOpen(true)}
              >
                Create Collection in {group.name}
              </Button>
            </Paper>
          )}
        </Box>

        {/* SECTION 2: Member Direct Files */}
        <Box>
          <Group justify="space-between" align="center" mb="md" wrap="wrap" gap="xs">
            <Group gap="xs" align="center">
              <FileText size={20} color="#10b981" />
              <Title order={3} size="h4">
                Direct Files in this Group ({documents.length})
              </Title>
              {selectedFileIds.length > 0 && (
                <Badge size="xs" variant="filled" color="emerald">
                  {selectedFileIds.length} Selected
                </Badge>
              )}
            </Group>

            <Group gap="sm" align="center">
              {documents.length > 0 && (
                <Checkbox
                  size="xs"
                  color="emerald"
                  label={
                    selectedFileIds.length === documents.length ? 'Deselect All' : 'Select All'
                  }
                  checked={documents.length > 0 && selectedFileIds.length === documents.length}
                  indeterminate={selectedFileIds.length > 0 && selectedFileIds.length < documents.length}
                  onChange={handleToggleSelectAll}
                  styles={{
                    label: {
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      color: selectedFileIds.length > 0 ? 'var(--brand-emerald)' : 'var(--text-secondary)',
                    },
                    input: { cursor: 'pointer' },
                  }}
                />
              )}

              <Button
                variant="subtle"
                size="xs"
                leftSection={<UploadCloud size={14} />}
                onClick={onOpenUpload}
              >
                Upload to Group
              </Button>
            </Group>
          </Group>

          {documents.length > 0 ? (
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
              {documents.map((doc) => (
                <FileCard
                  key={doc.id}
                  document={doc}
                  doc={doc}
                  isSelected={false}
                  isMultiSelected={selectedFileIds.includes(doc.id)}
                  onToggleSelect={handleToggleSelect}
                  hideGroupBadge={true}
                  onSelect={onSelectFile}
                  onDelete={onDeleteFile}
                />
              ))}
            </SimpleGrid>
          ) : (
            <Paper p="lg" radius="md" withBorder style={{ backgroundColor: '#f8fafc', textAlign: 'center' }}>
              <FileText size={32} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
              <Text size="sm" fw={500} c="dimmed">
                No direct files categorized in this group.
              </Text>
              <Button
                variant="light"
                size="xs"
                mt="sm"
                leftSection={<UploadCloud size={14} />}
                onClick={onOpenUpload}
              >
                Upload File to {group.name}
              </Button>
            </Paper>
          )}
        </Box>
      </Stack>

      {/* Edit Group Modal */}
      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={<Text fw={600}>Edit Group: {group.name}</Text>}
        centered
      >
        <form onSubmit={handleSaveEdit}>
          <Stack gap="md">
            <TextInput
              label="Group Name"
              placeholder="e.g. Finance & Tax"
              required
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
            />

            <Textarea
              label="Description (Optional)"
              placeholder="Brief description of this domain group"
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
              rows={2}
            />

            <ColorInput
              label="Group Theme Color"
              value={color}
              onChange={setColor}
              swatches={['#6366f1', '#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']}
            />

            <div>
              <Text size="xs" fw={500} mb={4}>
                Scope Accessibility
              </Text>
              <SegmentedControl
                size="xs"
                fullWidth
                value={scope}
                onChange={setScope}
                data={[
                  { label: '🌐 All Scopes', value: 'all' },
                  { label: '💼 Professional', value: 'professional' },
                  { label: '👤 Personal', value: 'personal' },
                ]}
              />
            </div>

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" color="indigo" loading={isUpdating}>
                Save Changes
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Group Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={<Text fw={600} c="red">Delete Group "{group.name}"</Text>}
        centered
      >
        <Stack gap="md">
          <Text size="sm">
            Are you sure you want to delete this group? Choose how to handle member collections and files:
          </Text>

          <Paper p="sm" radius="md" withBorder style={{ backgroundColor: '#fef2f2' }}>
            <Checkbox
              label="Cascade Delete: Permanently delete all member collections and files from Cloud Storage Vault"
              color="red"
              checked={cascadeDelete}
              onChange={(e) => setCascadeDelete(e.currentTarget.checked)}
            />
          </Paper>

          <Text size="xs" c="dimmed">
            {cascadeDelete
              ? '⚠️ Warning: All member files and collections will be permanently deleted from the vault.'
              : 'Safe Disband: Group will be deleted. All collections and files will be safely moved to General.'}
          </Text>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button color="red" loading={isDeleting} onClick={handleConfirmDelete}>
              {cascadeDelete ? 'Permanently Delete All' : 'Disband Group Safely'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Create / Add Collection in Group Modal */}
      <Modal
        opened={createColOpen}
        onClose={() => setCreateColOpen(false)}
        title={<Text fw={600}>Add Collection to "{group.name}"</Text>}
        centered
        radius="md"
      >
        <Stack gap="md">
          <SegmentedControl
            size="xs"
            fullWidth
            value={collectionModalMode}
            onChange={setCollectionModalMode}
            data={[
              { label: '➕ Create New', value: 'new' },
              { label: '📁 Add Existing', value: 'existing' },
            ]}
          />

          {collectionModalMode === 'new' ? (
            <form onSubmit={handleCreateCollection}>
              <Stack gap="md">
                <TextInput
                  label="Collection Name"
                  placeholder="e.g. Q3 Audits, Lab Tests 2026..."
                  required
                  autoFocus
                  value={newColName}
                  onChange={(e) => setNewColName(e.currentTarget.value)}
                />

                <div>
                  <Text size="xs" fw={500} mb={4}>
                    Collection Scope
                  </Text>
                  <SegmentedControl
                    size="xs"
                    fullWidth
                    value={newColScope}
                    onChange={setNewColScope}
                    data={[
                      { label: '💼 Work / Professional', value: 'professional' },
                      { label: '👤 Personal', value: 'personal' },
                    ]}
                  />
                </div>

                <Group justify="flex-end" mt="md">
                  <Button variant="default" onClick={() => setCreateColOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" color="indigo" loading={isCreatingCol}>
                    Create & Assign to {group.name}
                  </Button>
                </Group>
              </Stack>
            </form>
          ) : (
            <Stack gap="md">
              {availableCollections.length === 0 ? (
                <Text size="sm" c="dimmed" ta="center" py="md">
                  No other unassigned collections available. Create a new collection instead!
                </Text>
              ) : (
                <>
                  <Select
                    label="Select Existing Collection"
                    placeholder="Choose collection to move into this group"
                    data={availableCollections.map((c) => ({
                      label: `📁 ${c.name} (${c.scope || 'professional'})`,
                      value: c.id,
                    }))}
                    value={selectedExistingColId}
                    onChange={(val) => setSelectedExistingColId(val || '')}
                    leftSection={<Folder size={14} color="#0284c7" />}
                  />
                  <Text size="xs" c="dimmed">
                    This will associate this collection and all of its files with the group <strong>"{group.name}"</strong>.
                  </Text>
                </>
              )}

              <Group justify="flex-end" mt="md">
                <Button variant="default" onClick={() => setCreateColOpen(false)}>
                  Cancel
                </Button>
                <Button
                  color="indigo"
                  disabled={availableCollections.length === 0 || !selectedExistingColId}
                  loading={isAssigningCol}
                  onClick={handleAssignExistingCollection}
                >
                  Add to {group.name}
                </Button>
              </Group>
            </Stack>
          )}
        </Stack>
      </Modal>

      {/* Floating Luxury Batch Action Bar */}
      {selectedFileIds.length > 0 && (
        <Paper
          shadow="xl"
          radius="xl"
          p="xs"
          withBorder
          style={{
            position: 'fixed',
            bottom: isMobile ? 16 : 28,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            backgroundColor: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
            animation: 'fadeInUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            minWidth: isMobile ? 'calc(100vw - 32px)' : 420,
            maxWidth: 580,
          }}
        >
          <Group gap={isMobile ? 'xs' : 'md'} wrap="nowrap" px="xs" justify="space-between">
            {/* Selection Info */}
            <Group gap={6} wrap="nowrap">
              <CheckSquare size={16} color="#34d399" />
              <Badge
                variant="filled"
                color="emerald"
                size="sm"
                style={{ fontWeight: 700, borderRadius: '6px' }}
              >
                {selectedFileIds.length} {selectedFileIds.length === 1 ? 'file' : 'files'}
              </Badge>
              {!isMobile && (
                <Text size="xs" style={{ color: '#94a3b8' }}>
                  ({formatBytes(selectedBytes)})
                </Text>
              )}
            </Group>

            {/* Quick Actions */}
            <Group gap="xs" wrap="nowrap">
              <Button
                size="xs"
                variant="light"
                color="blue"
                leftSection={<FolderInput size={13} />}
                onClick={handleOpenBatchMove}
                style={{
                  borderRadius: '999px',
                  fontWeight: 600,
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  color: '#93c5fd',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                }}
              >
                Move
              </Button>

              <Button
                size="xs"
                variant="filled"
                color="red"
                leftSection={<Trash2 size={13} />}
                onClick={() => setBatchDeleteModalOpen(true)}
                style={{
                  borderRadius: '999px',
                  fontWeight: 600,
                  backgroundColor: '#dc2626',
                  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)',
                }}
              >
                Delete
              </Button>

              <ActionIcon
                size="28px"
                radius="xl"
                variant="subtle"
                color="gray"
                onClick={handleClearSelection}
                title="Deselect all (Esc)"
                style={{ color: '#94a3b8' }}
              >
                <X size={14} />
              </ActionIcon>
            </Group>
          </Group>
        </Paper>
      )}

      {/* Batch Move Modal */}
      <Modal
        opened={batchMoveModalOpen}
        onClose={() => setBatchMoveModalOpen(false)}
        title={
          <Group gap="xs">
            <FolderInput size={18} color="#0284c7" />
            <Text fw={700} size="sm">
              Move {selectedFileIds.length} Files to Folder
            </Text>
          </Group>
        }
        centered
        radius="md"
        size="md"
      >
        <Stack gap="md">
          <Text size="xs" c="dimmed">
            Select a target collection or move files to the unassigned Inbox. Encrypted storage and file integrity remain intact.
          </Text>

          <Select
            label="Destination Collection"
            placeholder="Choose target folder or unassigned"
            data={[
              { label: '📥 Inbox (Unassigned / No Folder)', value: '' },
              ...allAvailableCollections.map((c) => ({
                label: `📁 ${c.name} (${c.scope || 'professional'})`,
                value: c.id,
              })),
            ]}
            value={targetMoveCollectionId}
            onChange={(val) => setTargetMoveCollectionId(val || '')}
            comboboxProps={{ withinPortal: true, shadow: 'md' }}
          />

          <Paper p="xs" radius="md" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <Text size="11px" fw={600} c="dimmed" mb={4}>
              Files being moved ({selectedFiles.length}):
            </Text>
            <Stack gap={3} mah={140} style={{ overflowY: 'auto' }}>
              {selectedFiles.map((f) => (
                <Text key={f.id} size="11px" truncate style={{ color: '#334155' }}>
                  • {f.title || f.filename}
                </Text>
              ))}
            </Stack>
          </Paper>

          <Group justify="flex-end" gap="xs" mt="md">
            <Button variant="default" onClick={() => setBatchMoveModalOpen(false)} disabled={isSubmittingBatch}>
              Cancel
            </Button>
            <Button
              color="emerald"
              loading={isSubmittingBatch}
              onClick={handleConfirmBatchMove}
              style={{ backgroundColor: 'var(--brand-emerald)', color: '#ffffff' }}
            >
              Move {selectedFileIds.length} Files
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
            <Text fw={700} size="sm" c="red">
              Permanently Delete {selectedFileIds.length} Files?
            </Text>
          </Group>
        }
        centered
        radius="md"
        size="md"
      >
        <Stack gap="md">
          <Paper p="sm" radius="md" style={{ backgroundColor: '#fef2f2', border: '1px solid #fee2e2' }}>
            <Text size="xs" c="red" fw={600}>
              ⚠️ Warning: This will permanently delete {selectedFileIds.length} files ({formatBytes(selectedBytes)}) from both the database and cloud storage.
            </Text>
          </Paper>

          <Paper p="xs" radius="md" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <Text size="11px" fw={600} c="dimmed" mb={4}>
              Items to be deleted:
            </Text>
            <Stack gap={3} mah={140} style={{ overflowY: 'auto' }}>
              {selectedFiles.map((f) => (
                <Text key={f.id} size="11px" truncate style={{ color: '#475569' }}>
                  • {f.title || f.filename}
                </Text>
              ))}
            </Stack>
          </Paper>

          <Group justify="flex-end" gap="xs" mt="md">
            <Button variant="default" onClick={() => setBatchDeleteModalOpen(false)} disabled={isSubmittingBatch}>
              Cancel
            </Button>
            <Button color="red" loading={isSubmittingBatch} onClick={handleConfirmBatchDelete}>
              Permanently Delete {selectedFileIds.length} Files
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}

