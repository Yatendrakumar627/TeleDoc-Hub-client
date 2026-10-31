import React, { useState, useMemo, useEffect } from 'react';
import {
  Stack,
  Group,
  Box,
  Text,
  ScrollArea,
  SegmentedControl,
  Select,
  Badge,
  ActionIcon,
  Tooltip,
  Modal,
  TextInput,
  Textarea,
  ColorInput,
  Checkbox,
  Button,
  Collapse,
  UnstyledButton,
  Menu,
  Paper,
} from '@mantine/core';
import {
  Sparkles,
  Folder,
  FolderOpen,
  FolderPlus,
  FolderKanban,
  Lock,
  ChevronDown,
  ChevronRight,
  Inbox,
  LayoutGrid,
  List,
  MoreVertical,
  Edit3,
  Trash2,
  UploadCloud,
  Tag,
  PanelLeftClose,
  GripVertical,
  ArrowUpDown,
} from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { useDebouncedValue } from '@mantine/hooks';
import TelegramStatusPill from '../ui/TelegramStatusPill';
import SearchFilterInput from '../ui/SearchFilterInput';
import FileCard from '../../features/library/FileCard';
import { extractDateFromName } from '../../utils/formatters';
import { getCollections, createCollection, reorderCollections, reorderGroups } from '../../services/apiClient';

export default function Sidebar({
  documents = [],
  selectedDocId,
  selectedCollectionId,
  groups = [],
  selectedGroupId = null,
  collectionsVersion = 0,
  onSelectDoc,
  onSelectCollection,
  onSelectGroup,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onReorderGroups,
  onDeleteDoc,
  onRenameDoc,
  onAssignCollection,
  onUpdateCollection,
  onDeleteCollection,
  onOpenUpload,
  onCollapseSidebar,
  status,
  statusLoading,
}) {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 160);
  const [flatDisplayCount, setFlatDisplayCount] = useState(40);
  const [scopeFilter, setScopeFilter] = useState('all'); // 'all', 'professional', 'personal'
  const [groupFilter, setGroupFilter] = useState('all'); // 'all', 'grp_id', etc.
  const [yearFilter, setYearFilter] = useState('all');   // 'all', '2026', etc.
  const [formatFilter, setFormatFilter] = useState('all'); // 'all', 'pdf', 'word', 'spreadsheet', 'media'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'name', 'size'
  const [confidentialOnly, setConfidentialOnly] = useState(false);
  const [viewMode, setViewMode] = useState('collections'); // 'collections' | 'groups' | 'flat'

  // Reset flat list display count whenever filters or search change
  useEffect(() => {
    setFlatDisplayCount(40);
  }, [debouncedSearch, scopeFilter, groupFilter, formatFilter, yearFilter, confidentialOnly, sortBy, viewMode]);

  // Currently active/open document in viewer
  const activeDoc = useMemo(
    () => (selectedDocId ? documents.find((d) => d.id === selectedDocId) : null),
    [documents, selectedDocId]
  );

  // Collections state
  const [collections, setCollections] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColScope, setNewColScope] = useState('professional');
  const [newColGroupId, setNewColGroupId] = useState('');
  const [isSubmittingCol, setIsSubmittingCol] = useState(false);

  // Edit Collection state
  const [editingCol, setEditingCol] = useState(null);
  const [editColName, setEditColName] = useState('');
  const [editColScope, setEditColScope] = useState('professional');
  const [editColGroupId, setEditColGroupId] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Group Create state
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('#6366f1');
  const [newGroupScope, setNewGroupScope] = useState('all');
  const [isSubmittingGroup, setIsSubmittingGroup] = useState(false);

  // Group Edit state
  const [editingGroup, setEditingGroup] = useState(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDesc, setEditGroupDesc] = useState('');
  const [editGroupColor, setEditGroupColor] = useState('#6366f1');
  const [editGroupScope, setEditGroupScope] = useState('all');
  const [isSubmittingGroupEdit, setIsSubmittingGroupEdit] = useState(false);

  // Group Delete state
  const [deletingGroup, setDeletingGroup] = useState(null);
  const [cascadeGroupDelete, setCascadeGroupDelete] = useState(false);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);

  // Expanded folders and groups in sidebar
  const [expandedFolders, setExpandedFolders] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});

  // Drag-and-drop reordering state
  const [draggedColId, setDraggedColId] = useState(null);
  const [dropTargetColId, setDropTargetColId] = useState(null);
  const [colDropPosition, setColDropPosition] = useState(null); // 'before' | 'after'

  const [draggedGroupId, setDraggedGroupId] = useState(null);
  const [dropTargetGroupId, setDropTargetGroupId] = useState(null);
  const [groupDropPosition, setGroupDropPosition] = useState(null); // 'before' | 'after'

  // Generic drag-over position calculator
  const handleItemDragOver = (e, targetId, setTargetFn, setPositionFn, currentDraggedId) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (!currentDraggedId || currentDraggedId === targetId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const relY = e.clientY - rect.top;
    const position = relY < rect.height / 2 ? 'before' : 'after';
    setTargetFn(targetId);
    setPositionFn(position);
  };

  // Reorder Collections handler
  const handleCollectionDrop = async (targetColId, dropPosition) => {
    if (!draggedColId || draggedColId === targetColId) {
      setDraggedColId(null);
      setDropTargetColId(null);
      setColDropPosition(null);
      return;
    }

    const fromIndex = collections.findIndex((c) => c.id === draggedColId);
    if (fromIndex === -1) {
      setDraggedColId(null);
      setDropTargetColId(null);
      setColDropPosition(null);
      return;
    }

    const newCollections = [...collections];
    const [movedItem] = newCollections.splice(fromIndex, 1);
    let targetIndex = newCollections.findIndex((c) => c.id === targetColId);
    if (targetIndex === -1) {
      targetIndex = newCollections.length;
    } else if (dropPosition === 'after') {
      targetIndex += 1;
    }

    newCollections.splice(targetIndex, 0, movedItem);

    // Switch to custom order when dragged
    setSortBy('custom');

    // Optimistic UI state update
    setCollections(newCollections);
    setDraggedColId(null);
    setDropTargetColId(null);
    setColDropPosition(null);

    try {
      const orderedIds = newCollections.map((c) => c.id);
      await reorderCollections(orderedIds);
      notifications.show({
        title: 'Folder Reordered',
        message: `"${movedItem.name}" sequence updated.`,
        color: 'emerald',
        autoClose: 1800,
      });
    } catch (err) {
      console.error('Failed to save collection order:', err);
      loadCollections();
      notifications.show({
        title: 'Reorder Failed',
        message: 'Could not save new folder order.',
        color: 'red',
      });
    }
  };

  // Reorder Groups handler
  const handleGroupDrop = async (targetGroupId, dropPosition) => {
    if (!draggedGroupId || draggedGroupId === targetGroupId) {
      setDraggedGroupId(null);
      setDropTargetGroupId(null);
      setGroupDropPosition(null);
      return;
    }

    const fromIndex = groups.findIndex((g) => g.id === draggedGroupId);
    if (fromIndex === -1) {
      setDraggedGroupId(null);
      setDropTargetGroupId(null);
      setGroupDropPosition(null);
      return;
    }

    const newGroups = [...groups];
    const [movedItem] = newGroups.splice(fromIndex, 1);
    let targetIndex = newGroups.findIndex((g) => g.id === targetGroupId);
    if (targetIndex === -1) {
      targetIndex = newGroups.length;
    } else if (dropPosition === 'after') {
      targetIndex += 1;
    }

    newGroups.splice(targetIndex, 0, movedItem);

    // Optimistic UI state update
    if (onReorderGroups) {
      onReorderGroups(newGroups);
    }
    setDraggedGroupId(null);
    setDropTargetGroupId(null);
    setGroupDropPosition(null);

    try {
      const orderedIds = newGroups.map((g) => g.id);
      await reorderGroups(orderedIds);
      notifications.show({
        title: 'Group Reordered',
        message: `"${movedItem.name}" sequence updated.`,
        color: 'emerald',
        autoClose: 1800,
      });
    } catch (err) {
      console.error('Failed to save group order:', err);
      notifications.show({
        title: 'Reorder Failed',
        message: 'Could not save new group order.',
        color: 'red',
      });
    }
  };

  // Auto-expand all groups by default
  useEffect(() => {
    if (Array.isArray(groups)) {
      const initialGrp = {};
      groups.forEach((g) => {
        initialGrp[g.id] = true;
      });
      setExpandedGroups((prev) => ({ ...initialGrp, ...prev }));
    }
  }, [groups]);

  // Scope counts
  const workDocCount = useMemo(() => documents.filter((d) => d.scope === 'professional').length, [documents]);
  const personalDocCount = useMemo(() => documents.filter((d) => d.scope === 'personal').length, [documents]);

  // Load collections (all folders collapsed by default)
  const loadCollections = async () => {
    try {
      const data = await getCollections('all');
      setCollections(data);
    } catch (err) {
      console.warn('Sidebar collections fetch warning:', err.message);
    }
  };

  useEffect(() => {
    loadCollections();
  }, [documents.length, collectionsVersion]);

  const toggleFolder = (folderId, e) => {
    e.stopPropagation();
    setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const toggleGroup = (groupId, e) => {
    e.stopPropagation();
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    try {
      setIsSubmittingCol(true);
      const matchedGroup = groups.find((g) => g.id === newColGroupId);
      const created = await createCollection({
        name: newColName.trim(),
        scope: newColScope,
        groupId: newColGroupId || null,
        groupName: matchedGroup ? matchedGroup.name : 'General',
      });
      setCollections((prev) => [created, ...prev]);
      setExpandedFolders((prev) => ({ ...prev, [created.id]: true }));
      setNewColName('');
      setNewColGroupId('');
      setCreateModalOpen(false);
      if (onSelectCollection) {
        onSelectCollection(created);
      }
    } catch (err) {
      console.error('Error creating collection:', err);
    } finally {
      setIsSubmittingCol(false);
    }
  };

  const handleCreateGroupSubmit = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim() || !onCreateGroup) return;

    try {
      setIsSubmittingGroup(true);
      const created = await onCreateGroup({
        name: newGroupName.trim(),
        description: newGroupDesc.trim(),
        color: newGroupColor,
        scope: newGroupScope,
      });
      if (created) {
        setExpandedGroups((prev) => ({ ...prev, [created.id]: true }));
        if (onSelectGroup) onSelectGroup(created);
      }
      setNewGroupName('');
      setNewGroupDesc('');
      setCreateGroupModalOpen(false);
    } catch (err) {
      console.error('Error creating group:', err);
    } finally {
      setIsSubmittingGroup(false);
    }
  };

  const handleSaveGroupEdit = async (e) => {
    e.preventDefault();
    if (!editGroupName.trim() || !onUpdateGroup || !editingGroup) return;

    try {
      setIsSubmittingGroupEdit(true);
      await onUpdateGroup(editingGroup.id, {
        name: editGroupName.trim(),
        description: editGroupDesc.trim(),
        color: editGroupColor,
        scope: editGroupScope,
      });
      setEditingGroup(null);
    } catch (err) {
      console.error('Error updating group:', err);
    } finally {
      setIsSubmittingGroupEdit(false);
    }
  };

  const handleConfirmDeleteGroup = async () => {
    if (!deletingGroup || !onDeleteGroup) return;
    try {
      setIsDeletingGroup(true);
      await onDeleteGroup(deletingGroup.id, cascadeGroupDelete);
      setDeletingGroup(null);
    } catch (err) {
      console.error('Error deleting group:', err);
    } finally {
      setIsDeletingGroup(false);
    }
  };

  // Dynamic counts for each format pill based on documents matching current scope
  const formatCounts = useMemo(() => {
    const counts = { all: 0, pdf: 0, word: 0, spreadsheet: 0, media: 0 };
    documents.forEach((d) => {
      if (scopeFilter !== 'all' && d.scope !== scopeFilter) return;
      counts.all++;
      const type = (d.type || '').toLowerCase();
      const fmt = (d.format || '').toLowerCase();
      if (type === 'pdf' || fmt === 'pdf') counts.pdf++;
      else if (['docx', 'doc'].includes(type) || fmt === 'docx') counts.word++;
      else if (['xlsx', 'xls', 'csv', 'tsv', 'ods'].includes(type) || fmt === 'spreadsheet') counts.spreadsheet++;
      else if (
        ['mp4', 'webm', 'mov', 'mkv', 'avi', 'mp3', 'wav', 'ogg', 'm4a', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(type) ||
        ['image', 'media', 'video', 'audio'].includes(fmt)
      ) counts.media++;
    });
    return counts;
  }, [documents, scopeFilter]);

  // Multi-dimensional filtering and sorting logic
  const filteredDocs = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return documents
      .filter((doc) => {
        // 1. Text Search (title, filename, tags, collection)
        const matchesSearch =
          !q ||
          doc.title.toLowerCase().includes(q) ||
          (doc.filename && doc.filename.toLowerCase().includes(q)) ||
          (doc.collectionName && doc.collectionName.toLowerCase().includes(q)) ||
          (doc.taxonomy?.tags && doc.taxonomy.tags.some((t) => t.includes(q)));

        if (!matchesSearch) return false;

        // 2. Scope Filter (personal vs professional)
        if (scopeFilter !== 'all' && doc.scope !== scopeFilter) {
          return false;
        }

        // 3. Group Filter (Matches user-created groups only)
        if (groupFilter !== 'all') {
          const selectedGroup = groups.find((g) => g.id === groupFilter);
          const gName = selectedGroup?.name?.toLowerCase() || '';
          const gSlug = selectedGroup?.slug || '';
          const matchesGroup =
            doc.groupId === groupFilter ||
            (doc.groupName && doc.groupName.toLowerCase() === gName) ||
            (doc.taxonomy?.group && doc.taxonomy.group.toLowerCase() === gName) ||
            (doc.taxonomy?.group && doc.taxonomy.group.toLowerCase() === gSlug);
          if (!matchesGroup) return false;
        }

        // 4. Format Quick Filter
        if (formatFilter !== 'all') {
          const type = (doc.type || '').toLowerCase();
          const fmt = (doc.format || '').toLowerCase();
          if (formatFilter === 'pdf') {
            if (type !== 'pdf' && fmt !== 'pdf') return false;
          } else if (formatFilter === 'word') {
            if (!['docx', 'doc'].includes(type) && fmt !== 'docx') return false;
          } else if (formatFilter === 'spreadsheet') {
            if (!['xlsx', 'xls', 'csv', 'tsv', 'ods'].includes(type) && fmt !== 'spreadsheet') return false;
          } else if (formatFilter === 'media') {
            const isMedia =
              ['mp4', 'webm', 'mov', 'mkv', 'avi', 'mp3', 'wav', 'ogg', 'm4a', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(type) ||
              ['image', 'media', 'video', 'audio'].includes(fmt);
            if (!isMedia) return false;
          }
        }

        // 5. Year Filter
        if (yearFilter !== 'all' && doc.temporal?.year?.toString() !== yearFilter) {
          return false;
        }

        // 6. Confidential Only Filter
        if (confidentialOnly) {
          const isConfidential =
            doc.security?.level === 'confidential' ||
            doc.security?.level === 'strictly_confidential';
          if (!isConfidential) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'oldest') {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        if (sortBy === 'name') {
          return (a.title || '').localeCompare(b.title || '');
        }
        if (sortBy === 'size') {
          const sizeA = a.fileSizeBytes || a.sizeBytes || a.size || 0;
          const sizeB = b.fileSizeBytes || b.sizeBytes || b.size || 0;
          return sizeB - sizeA;
        }
        // Default: 'newest'
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [documents, debouncedSearch, scopeFilter, groupFilter, formatFilter, yearFilter, confidentialOnly, sortBy, groups]);

  // Group filtered docs by Collection (strictly preserves user-defined collection order)
  const groupedCollections = useMemo(() => {
    const map = {};
    const collectionsList = [];

    // Initialize map and list for all known collections matching scope
    collections.forEach((col) => {
      if (scopeFilter === 'all' || col.scope === scopeFilter) {
        const entry = {
          collection: col,
          files: [],
        };
        map[col.id] = entry;
        collectionsList.push(entry);
      }
    });

    // Bucket for unassigned files
    const unassignedFiles = [];

    filteredDocs.forEach((doc) => {
      if (doc.collectionId && map[doc.collectionId]) {
        map[doc.collectionId].files.push(doc);
      } else {
        unassignedFiles.push(doc);
      }
    });

    // Sort folders according to sortBy (Name-wise, Date-wise, or custom draggable order)
    if (sortBy === 'name') {
      collectionsList.sort((a, b) =>
        (a.collection.name || '').localeCompare(b.collection.name || '', undefined, {
          numeric: true,
          sensitivity: 'base',
        })
      );
    } else if (sortBy === 'newest') {
      collectionsList.sort((a, b) => {
        const dateA = extractDateFromName(a.collection.name, a.collection.createdAt);
        const dateB = extractDateFromName(b.collection.name, b.collection.createdAt);
        if (dateA !== dateB) return dateB - dateA;
        return (a.collection.order ?? 0) - (b.collection.order ?? 0);
      });
    } else if (sortBy === 'oldest') {
      collectionsList.sort((a, b) => {
        const dateA = extractDateFromName(a.collection.name, a.collection.createdAt);
        const dateB = extractDateFromName(b.collection.name, b.collection.createdAt);
        if (dateA !== dateB) return dateA - dateB;
        return (a.collection.order ?? 0) - (b.collection.order ?? 0);
      });
    }

    return {
      collectionsList,
      unassignedFiles,
    };
  }, [collections, filteredDocs, scopeFilter, sortBy]);

  // High-performance O(1) Hash Maps to avoid running nested .filter() queries inside render loops
  const { filesByCollectionId, directFilesByGroupId } = useMemo(() => {
    const colMap = {};
    const grpMap = {};

    for (let i = 0; i < filteredDocs.length; i++) {
      const doc = filteredDocs[i];
      if (doc.collectionId) {
        if (!colMap[doc.collectionId]) colMap[doc.collectionId] = [];
        colMap[doc.collectionId].push(doc);
      } else {
        const gId = doc.groupId;
        const gName = doc.taxonomy?.group ? doc.taxonomy.group.toLowerCase() : null;
        if (gId) {
          if (!grpMap[gId]) grpMap[gId] = [];
          grpMap[gId].push(doc);
        }
        if (gName && gName !== gId) {
          if (!grpMap[gName]) grpMap[gName] = [];
          grpMap[gName].push(doc);
        }
      }
    }
    return { filesByCollectionId: colMap, directFilesByGroupId: grpMap };
  }, [filteredDocs]);

  // Available groups for dropdown filter: Strictly actual user-created groups
  const availableGroups = useMemo(() => {
    return (Array.isArray(groups) ? groups : [])
      .filter((g) => g && (typeof g === 'string' || (g.id != null && g.name != null)))
      .map((g) => ({
        label: typeof g === 'string' ? g : g.name,
        value: typeof g === 'string' ? g : g.id,
      }));
  }, [groups]);

  const availableYears = useMemo(() => {
    const set = new Set();
    documents.forEach((d) => {
      if (d.temporal?.year) set.add(d.temporal.year.toString());
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [documents]);

  return (
    <Stack
      h="100%"
      gap="sm"
      p="md"
      style={{
        borderRight: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--surface-sidebar)',
      }}
    >
      {/* Brand Header */}
      <Group justify="space-between" align="center">
        <Group gap="xs">
          <Box
            className="brand-sparkle-box"
            style={{
              width: 34,
              height: 34,
            }}
          >
            <Sparkles size={18} color="#eedebd" />
          </Box>
          <Box>
            <Text fw={700} size="md" style={{ letterSpacing: '-0.02em', lineHeight: 1.2, color: 'var(--brand-forest)' }}>
              TeleDoc Hub
            </Text>
            <Text size="xs" style={{ color: 'var(--text-muted)' }}>
              Vault • Collection Explorer
            </Text>
          </Box>
        </Group>

        {onCollapseSidebar && (
          <Tooltip label="Collapse Sidebar (Ctrl+B)" withArrow position="bottom-end">
            <ActionIcon
              size="28px"
              radius="sm"
              variant="subtle"
              color="gray"
              onClick={onCollapseSidebar}
            >
              <PanelLeftClose size={16} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>

      {/* Telegram Status Pill */}
      <Box mt={2}>
        <TelegramStatusPill status={status} loading={statusLoading} />
      </Box>

      {/* Active Open Document Quick-Jump Banner */}
      {activeDoc && (
        <Paper
          p="xs"
          px="sm"
          radius="md"
          style={{
            background: 'linear-gradient(135deg, #edf4f0 0%, #FAF7F2 100%)',
            border: '1px solid var(--brand-primary-border)',
            borderLeft: '3.5px solid var(--brand-primary)',
            boxShadow: '0 2px 8px rgba(24, 88, 68, 0.08)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onClick={onCollapseSidebar}
        >
          <Group justify="space-between" align="center" wrap="nowrap">
            <Group gap={8} wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
              <Box
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.3)',
                  flexShrink: 0,
                }}
              />
              <Box style={{ minWidth: 0, flex: 1 }}>
                <Text size="10px" fw={700} c="emerald" tt="uppercase" style={{ letterSpacing: '0.04em', lineHeight: 1.2 }}>
                  Currently Open File
                </Text>
                <Text size="xs" fw={600} truncate c="var(--text-primary)" style={{ lineHeight: 1.2 }}>
                  {activeDoc.title || activeDoc.filename}
                </Text>
              </Box>
            </Group>

            <Button
              size="compact-xs"
              variant="filled"
              color="emerald"
              radius="xl"
              style={{ fontSize: '10px', height: '22px', padding: '0 8px', flexShrink: 0 }}
            >
              View →
            </Button>
          </Group>
        </Paper>
      )}

      {/* Scope Selector: All | Work | Personal */}
      <SegmentedControl
        size="xs"
        radius="md"
        value={scopeFilter}
        onChange={setScopeFilter}
        data={[
          { label: `All (${documents.length} files)`, value: 'all' },
          { label: `Work (${workDocCount})`, value: 'professional' },
          { label: `Personal (${personalDocCount})`, value: 'personal' },
        ]}
      />

      {/* View Mode & New Action Bar */}
      <Group justify="space-between" align="center">
        <SegmentedControl
          size="xs"
          value={viewMode}
          onChange={setViewMode}
          data={[
            { label: '📁 Folders', value: 'collections' },
            { label: '🗂️ Groups', value: 'groups' },
            { label: '📄 Files', value: 'flat' },
          ]}
          style={{ flex: 1 }}
        />

        <Tooltip
          label={
            viewMode === 'groups'
              ? 'Create New Group'
              : viewMode === 'collections'
              ? 'Create New Collection'
              : 'Upload File'
          }
          withArrow
          position="top"
        >
          <ActionIcon
            size="28px"
            radius="sm"
            variant="filled"
            color="emerald"
            className="btn-premium-primary"
            onClick={() => {
              if (viewMode === 'groups') setCreateGroupModalOpen(true);
              else if (viewMode === 'collections') setCreateModalOpen(true);
              else if (onOpenUpload) onOpenUpload();
            }}
          >
            {viewMode === 'groups' ? <FolderKanban size={14} color="#eedebd" /> : <FolderPlus size={14} color="#eedebd" />}
          </ActionIcon>
        </Tooltip>
      </Group>

      {/* 1. High-Fidelity Search Bar with Hotkey */}
      <SearchFilterInput
        placeholder="Search title, content, tags..."
        value={search}
        onChange={setSearch}
      />

      {/* 2. Format Quick-Filter Pills */}
      <SegmentedControl
        size="xs"
        radius="md"
        value={formatFilter}
        onChange={setFormatFilter}
        data={[
          { label: 'All', value: 'all' },
          { label: `PDF${formatCounts.pdf ? ` (${formatCounts.pdf})` : ''}`, value: 'pdf' },
          { label: `Word${formatCounts.word ? ` (${formatCounts.word})` : ''}`, value: 'word' },
          { label: `Sheets${formatCounts.spreadsheet ? ` (${formatCounts.spreadsheet})` : ''}`, value: 'spreadsheet' },
          { label: `Media${formatCounts.media ? ` (${formatCounts.media})` : ''}`, value: 'media' },
        ]}
        styles={{
          root: {
            backgroundColor: 'rgba(24, 88, 68, 0.05)',
            padding: '2px',
          },
          label: {
            fontSize: '10.5px',
            padding: '3px 6px',
            fontWeight: 500,
          },
        }}
      />

      {/* 3. Group & Timeline Filters (Row 1) */}
      <Group gap="xs" grow>
        {groups.length > 0 && (
          <Select
            size="xs"
            placeholder="Group"
            value={groupFilter}
            onChange={(val) => setGroupFilter(val || 'all')}
            data={[
              { label: 'All Groups', value: 'all' },
              ...availableGroups.map((g) => ({
                label: g.label || g.name || '',
                value: g.value || g.id || '',
              })),
            ]}
            comboboxProps={{ position: 'bottom-start', withinPortal: true, shadow: 'md' }}
            allowDeselect={false}
            styles={{
              input: {
                fontSize: '11.5px',
                fontWeight: 500,
                height: '32px',
                minHeight: '32px',
                padding: '0 10px',
                borderRadius: '8px',
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'var(--surface-card)',
                color: 'var(--text-primary)',
              },
              dropdown: { minWidth: '175px', width: 'max-content', padding: '4px' },
              option: { fontSize: '12px', whiteSpace: 'nowrap', padding: '6px 12px' },
            }}
          />
        )}

        <Select
          size="xs"
          placeholder="Timeline"
          value={yearFilter}
          onChange={(val) => setYearFilter(val || 'all')}
          data={[
            { label: 'All Time', value: 'all' },
            ...availableYears.map((y) => ({ label: y, value: y })),
          ]}
          comboboxProps={{ position: 'bottom-start', withinPortal: true, shadow: 'md' }}
          allowDeselect={false}
          styles={{
            input: {
              fontSize: '11.5px',
              fontWeight: 500,
              height: '32px',
              minHeight: '32px',
              padding: '0 10px',
              borderRadius: '8px',
              borderColor: 'var(--border-subtle)',
              backgroundColor: 'var(--surface-card)',
              color: 'var(--text-primary)',
            },
            dropdown: { minWidth: '160px', width: 'max-content', padding: '4px' },
            option: { fontSize: '12px', whiteSpace: 'nowrap', padding: '6px 12px' },
          }}
        />
      </Group>

      {/* 4. Sort Engine & Confidential Mode (Row 2) */}
      <Group gap="xs">
        <Select
          size="xs"
          placeholder="Sort By"
          value={sortBy}
          leftSection={<ArrowUpDown size={13} style={{ color: 'var(--text-tertiary)' }} />}
          onChange={(val) => setSortBy(val || 'newest')}
          data={[
            { label: 'Newest (Date)', value: 'newest' },
            { label: 'Oldest (Date)', value: 'oldest' },
            { label: 'Name (A - Z)', value: 'name' },
            { label: 'File Size', value: 'size' },
            { label: 'Custom / Drag Order', value: 'custom' },
          ]}
          comboboxProps={{ position: 'bottom-start', withinPortal: true, shadow: 'md' }}
          allowDeselect={false}
          style={{ flex: 1 }}
          styles={{
            input: {
              fontSize: '11.5px',
              fontWeight: 500,
              height: '32px',
              minHeight: '32px',
              padding: '0 8px',
              borderRadius: '8px',
              borderColor: 'var(--border-subtle)',
              backgroundColor: 'var(--surface-card)',
              color: 'var(--text-primary)',
            },
            dropdown: { minWidth: '185px', width: 'max-content', padding: '4px' },
            option: { fontSize: '12px', whiteSpace: 'nowrap', padding: '6px 12px' },
          }}
        />

        <Tooltip label={confidentialOnly ? 'Showing Confidential Only (Click to show all)' : 'Filter Confidential Only'} withArrow>
          <ActionIcon
            size="32px"
            radius="md"
            variant={confidentialOnly ? 'filled' : 'light'}
            color={confidentialOnly ? 'gold' : 'gray'}
            style={{
              flexShrink: 0,
              backgroundColor: confidentialOnly ? 'var(--brand-gold)' : 'var(--surface-card)',
              color: confidentialOnly ? '#ffffff' : 'var(--text-secondary)',
              border: confidentialOnly ? 'none' : '1px solid var(--border-subtle)',
              transition: 'all 0.15s ease',
            }}
            onClick={() => setConfidentialOnly(!confidentialOnly)}
          >
            <Lock size={14} />
          </ActionIcon>
        </Tooltip>
      </Group>

      {/* 4. Active Filter Summary & Counter */}
      <Group justify="space-between" px={2}>
        <Text size="xs" c="dimmed" fw={500}>
          {viewMode === 'collections'
            ? `${groupedCollections.collectionsList.length} ${groupedCollections.collectionsList.length === 1 ? 'Folder' : 'Folders'} • ${filteredDocs.length} Total Files`
            : viewMode === 'groups'
            ? `${groups.length} ${groups.length === 1 ? 'Group' : 'Groups'} • ${filteredDocs.length} Total Files`
            : `Showing ${filteredDocs.length} Files`}
        </Text>
        {(scopeFilter !== 'all' || groupFilter !== 'all' || yearFilter !== 'all' || formatFilter !== 'all' || sortBy !== 'newest' || confidentialOnly || search) && (
          <Text
            size="xs"
            c="blue"
            fw={600}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSearch('');
              setScopeFilter('all');
              setGroupFilter('all');
              setFormatFilter('all');
              setYearFilter('all');
              setSortBy('newest');
              setConfidentialOnly(false);
            }}
          >
            Reset filters
          </Text>
        )}
      </Group>

      {/* Main List Scroll Area: GROUPED BY FOLDER, GROUP, OR FLAT */}
      <ScrollArea style={{ flex: 1 }} offsetScrollbars scrollbarSize={6}>
        <Stack gap="xs" pr={4}>
          {viewMode === 'groups' ? (
            // ================= GROUPS VIEW (User-Created Groups Only) =================
            groups.length === 0 ? (
              <Box py="xl" ta="center">
                <Text size="sm" c="dimmed">
                  No groups created yet.
                </Text>
                <Button
                  size="xs"
                  variant="light"
                  color="indigo"
                  mt="xs"
                  leftSection={<FolderKanban size={14} />}
                  onClick={() => setCreateGroupModalOpen(true)}
                >
                  Create First Group
                </Button>
              </Box>
            ) : (
              groups.map((grp) => {
                const isExpanded = !!expandedGroups[grp.id];
                const isSelected = selectedGroupId === grp.id;

                // Member collections in this group
                const memberCols = collections.filter(
                  (c) => c.groupId === grp.id || c.groupName === grp.name
                );

                // Member direct files in this group (O(1) lookup)
                const memberDocs = directFilesByGroupId[grp.id] || directFilesByGroupId[grp.name?.toLowerCase()] || [];

                // Accurate count: direct files + files inside member collections (O(1) lookup)
                const totalGroupFiles = memberDocs.length + memberCols.reduce((acc, c) => {
                  return acc + (filesByCollectionId[c.id]?.length || 0);
                }, 0);

                const isDropTargetBefore = dropTargetGroupId === grp.id && groupDropPosition === 'before';
                const isDropTargetAfter = dropTargetGroupId === grp.id && groupDropPosition === 'after';
                const isDragging = draggedGroupId === grp.id;

                return (
                  <Box
                    key={grp.id}
                    draggable={true}
                    onDragStart={(e) => {
                      const target = e.target;
                      if (
                        target.closest('button') ||
                        target.closest('a') ||
                        target.closest('input') ||
                        target.closest('.mantine-Menu-dropdown') ||
                        target.closest('.sidebar-card-content')
                      ) {
                        e.preventDefault();
                        return;
                      }
                      setDraggedGroupId(grp.id);
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', grp.id);
                    }}
                    onDragOver={(e) =>
                      handleItemDragOver(e, grp.id, setDropTargetGroupId, setGroupDropPosition, draggedGroupId)
                    }
                    onDragLeave={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget)) {
                        if (dropTargetGroupId === grp.id) {
                          setDropTargetGroupId(null);
                          setGroupDropPosition(null);
                        }
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (draggedGroupId && draggedGroupId !== grp.id) {
                        handleGroupDrop(grp.id, groupDropPosition);
                      }
                    }}
                    onDragEnd={() => {
                      setDraggedGroupId(null);
                      setDropTargetGroupId(null);
                      setGroupDropPosition(null);
                    }}
                    style={{
                      position: 'relative',
                      borderRadius: '10px',
                      border: isSelected ? `1.5px solid ${grp.color || 'var(--brand-primary)'}` : isDragging ? '1.5px dashed var(--brand-emerald)' : '1px solid var(--border-subtle)',
                      backgroundColor: isSelected ? 'var(--surface-selected)' : 'var(--surface-card)',
                      boxShadow: isSelected ? '0 2px 8px rgba(79, 70, 229, 0.12)' : 'var(--shadow-sm)',
                      overflow: 'visible',
                      opacity: isDragging ? 0.35 : 1,
                      transform: isDragging ? 'scale(0.98)' : 'none',
                      transition: 'all 0.18s ease-in-out',
                    }}
                  >
                    {/* Visual Drop Indicators with dot */}
                    {isDropTargetBefore && (
                      <Box
                        style={{
                          position: 'absolute',
                          top: -3,
                          left: 4,
                          right: 4,
                          height: 3,
                          backgroundColor: 'var(--brand-emerald)',
                          borderRadius: 99,
                          zIndex: 30,
                          boxShadow: '0 0 8px rgba(24, 88, 68, 0.75)',
                          pointerEvents: 'none',
                        }}
                      >
                        <Box
                          style={{
                            position: 'absolute',
                            left: -4,
                            top: -3,
                            width: 9,
                            height: 9,
                            borderRadius: '50%',
                            backgroundColor: 'var(--brand-emerald)',
                            boxShadow: '0 0 6px rgba(24, 88, 68, 0.8)',
                          }}
                        />
                      </Box>
                    )}
                    {isDropTargetAfter && (
                      <Box
                        style={{
                          position: 'absolute',
                          bottom: -3,
                          left: 4,
                          right: 4,
                          height: 3,
                          backgroundColor: 'var(--brand-emerald)',
                          borderRadius: 99,
                          zIndex: 30,
                          boxShadow: '0 0 8px rgba(24, 88, 68, 0.75)',
                          pointerEvents: 'none',
                        }}
                      >
                        <Box
                          style={{
                            position: 'absolute',
                            left: -4,
                            top: -3,
                            width: 9,
                            height: 9,
                            borderRadius: '50%',
                            backgroundColor: 'var(--brand-emerald)',
                            boxShadow: '0 0 6px rgba(24, 88, 68, 0.8)',
                          }}
                        />
                      </Box>
                    )}

                    {/* Group Header Button */}
                    <Box
                      w="100%"
                      p="xs"
                      onClick={() => onSelectGroup && onSelectGroup(grp)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: isSelected ? `${grp.color || '#6366f1'}15` : 'var(--surface-card)',
                        cursor: 'pointer',
                        userSelect: 'none',
                        borderRadius: '9px 9px 0 0',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <Group gap="xs" wrap="nowrap" style={{ overflow: 'hidden' }}>
                        {/* Drag Handle */}
                        <Tooltip label="Drag up or down to re-order group" position="top" withArrow openDelay={350}>
                          <Box
                            component="span"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'grab',
                              color: 'var(--brand-sage)',
                              padding: '2px',
                              borderRadius: 3,
                              transition: 'color 0.15s ease',
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <GripVertical size={14} />
                          </Box>
                        </Tooltip>

                        <ActionIcon
                          size="xs"
                          variant="subtle"
                          color="gray"
                          onClick={(e) => toggleGroup(grp.id, e)}
                        >
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </ActionIcon>

                        <FolderKanban size={16} color={grp.color || 'var(--brand-primary)'} />

                        <Text size="xs" fw={600} truncate style={{ color: 'var(--text-primary)' }}>
                          {grp.name}
                        </Text>
                      </Group>

                      <Group gap={4} wrap="nowrap">
                        <Badge size="xs" variant={isSelected ? 'filled' : 'light'} color="emerald">
                          {totalGroupFiles}
                        </Badge>

                        <Menu position="bottom-end" shadow="md" withinPortal>
                          <Menu.Target>
                            <ActionIcon
                              size="xs"
                              variant="subtle"
                              color="gray"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical size={13} />
                            </ActionIcon>
                          </Menu.Target>

                          <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
                            <Menu.Item
                              leftSection={<FolderKanban size={13} />}
                              onClick={() => onSelectGroup && onSelectGroup(grp)}
                            >
                              Open Group Hub
                            </Menu.Item>
                            <Menu.Item
                              leftSection={<Edit3 size={13} />}
                              onClick={() => {
                                setEditingGroup(grp);
                                setEditGroupName(grp.name);
                                setEditGroupDesc(grp.description || '');
                                setEditGroupColor(grp.color || '#6366f1');
                                setEditGroupScope(grp.scope || 'all');
                              }}
                            >
                              Edit Group
                            </Menu.Item>
                            {!grp.isSystem && (
                              <Menu.Item
                                color="red"
                                leftSection={<Trash2 size={13} />}
                                onClick={() => {
                                  setDeletingGroup(grp);
                                }}
                              >
                                Delete Group
                              </Menu.Item>
                            )}
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                    </Box>

                    {/* Group Inner Content (Collections + Files) */}
                    <Collapse in={isExpanded}>
                      {isExpanded && (
                        <Box className="sidebar-card-content" p="xs" pt={4} style={{ borderTop: '1px solid #f1f5f9', backgroundColor: '#fafafa', borderRadius: '0 0 9px 9px' }}>
                          {/* Member Collections */}
                          {memberCols.length > 0 && (
                            <Box mb="xs">
                              <Text size="10px" fw={700} c="dimmed" tt="uppercase" px={4} mb={2}>
                                📁 Collections ({memberCols.length})
                              </Text>
                              <Stack gap={3}>
                                {memberCols.map((c) => {
                                  const isColExpanded = !!expandedFolders[c.id];
                                  const isColSelected = selectedCollectionId === c.id;
                                  const cFiles = filesByCollectionId[c.id] || [];

                                  return (
                                    <Box
                                      key={c.id}
                                      style={{
                                        borderRadius: 8,
                                        border: isColSelected ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                                        backgroundColor: isColSelected ? 'var(--surface-selected)' : '#ffffff',
                                        overflow: 'hidden',
                                      }}
                                    >
                                      <Box
                                        p={6}
                                        px={8}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          cursor: 'pointer',
                                        }}
                                        onClick={() => onSelectCollection && onSelectCollection(c)}
                                      >
                                        <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
                                          <ActionIcon
                                            size="xs"
                                            variant="subtle"
                                            color="gray"
                                            onClick={(e) => toggleFolder(c.id, e)}
                                          >
                                            {isColExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                                          </ActionIcon>
                                          {isColExpanded ? (
                                            <FolderOpen size={14} color="var(--brand-gold)" />
                                          ) : (
                                            <Folder size={14} color="var(--brand-gold)" />
                                          )}
                                          <Text size="xs" truncate fw={isColSelected ? 600 : 500} style={{ color: 'var(--brand-forest)' }}>
                                            {c.name}
                                          </Text>
                                        </Group>

                                        <Badge size="xs" variant={isColSelected ? 'filled' : 'light'} color={isColSelected ? 'emerald' : 'gold'}>
                                          {cFiles.length}
                                        </Badge>
                                      </Box>

                                      {/* Files inside collection in this group: Only shown when opened */}
                                      <Collapse in={isColExpanded}>
                                        {isColExpanded && (
                                          <Stack gap={4} p="xs" pl="sm" style={{ borderTop: '1px solid var(--border-subtle)', backgroundColor: '#fafaf9' }}>
                                            {cFiles.length === 0 ? (
                                              <Text size="xs" c="dimmed" fs="italic" py={2} px={4}>
                                                No files in this collection
                                              </Text>
                                            ) : (
                                              cFiles.map((doc) => (
                                                <FileCard
                                                  key={doc.id}
                                                  document={doc}
                                                  isSelected={doc.id === selectedDocId}
                                                  collections={collections}
                                                  hideCollectionBadge={true}
                                                  hideGroupBadge={true}
                                                  onSelect={onSelectDoc}
                                                  onDelete={onDeleteDoc}
                                                  onRename={onRenameDoc}
                                                  onAssignCollection={onAssignCollection}
                                                />
                                              ))
                                            )}
                                          </Stack>
                                        )}
                                      </Collapse>
                                    </Box>
                                  );
                                })}
                              </Stack>
                            </Box>
                          )}

                          {/* Member Files */}
                          {memberDocs.length > 0 && (
                            <Box>
                              <Text size="10px" fw={700} c="dimmed" tt="uppercase" px={4} mb={2}>
                                📄 Direct Files ({memberDocs.length})
                              </Text>
                              <Stack gap={2}>
                                {memberDocs.map((doc) => (
                                  <FileCard
                                    key={doc.id}
                                    document={doc}
                                    isSelected={doc.id === selectedDocId}
                                    collections={collections}
                                    hideGroupBadge={true}
                                    onSelect={onSelectDoc}
                                    onDelete={onDeleteDoc}
                                    onRename={onRenameDoc}
                                    onAssignCollection={onAssignCollection}
                                  />
                                ))}
                              </Stack>
                            </Box>
                          )}

                          {memberCols.length === 0 && memberDocs.length === 0 && (
                            <Text size="xs" c="dimmed" ta="center" py="xs">
                              Empty Group
                            </Text>
                          )}
                        </Box>
                      )}
                    </Collapse>
                  </Box>
                );
              })
            )
          ) : viewMode === 'collections' ? (
            // ================= COLLECTION-FIRST TREE VIEW =================
            <>
              {groupedCollections.collectionsList.length === 0 && (
                <Paper p="sm" radius="md" withBorder ta="center" style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-subtle)' }}>
                  <FolderPlus size={22} color="var(--brand-gold)" style={{ margin: '0 auto 6px' }} />
                  <Text size="xs" fw={600} style={{ color: 'var(--brand-forest)' }}>
                    {scopeFilter === 'all'
                      ? 'No Folders Created Yet'
                      : `No Folders in ${scopeFilter === 'professional' ? 'Work' : 'Personal'}`}
                  </Text>
                  <Text size="11px" c="dimmed" mt={2} mb="xs">
                    Create a folder to organize your vault files.
                  </Text>
                  <Button
                    size="xs"
                    variant="light"
                    color="emerald"
                    leftSection={<FolderPlus size={13} />}
                    onClick={() => {
                      setNewColScope(scopeFilter === 'personal' ? 'personal' : 'professional');
                      setCreateModalOpen(true);
                    }}
                  >
                    Create Folder
                  </Button>
                </Paper>
              )}

              {groupedCollections.collectionsList.map(({ collection: col, files: colFiles }) => {
                const isExpanded = !!expandedFolders[col.id];
                const isSelected = selectedCollectionId === col.id;
                const isDropTargetBefore = dropTargetColId === col.id && colDropPosition === 'before';
                const isDropTargetAfter = dropTargetColId === col.id && colDropPosition === 'after';
                const isDragging = draggedColId === col.id;

                return (
                  <Box
                    key={col.id}
                    draggable={true}
                    onDragStart={(e) => {
                      const target = e.target;
                      if (
                        target.closest('button') ||
                        target.closest('a') ||
                        target.closest('input') ||
                        target.closest('.mantine-Menu-dropdown') ||
                        target.closest('.sidebar-card-content')
                      ) {
                        e.preventDefault();
                        return;
                      }
                      setDraggedColId(col.id);
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', col.id);
                    }}
                    onDragOver={(e) =>
                      handleItemDragOver(e, col.id, setDropTargetColId, setColDropPosition, draggedColId)
                    }
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
                        handleCollectionDrop(col.id, colDropPosition);
                      }
                    }}
                    onDragEnd={() => {
                      setDraggedColId(null);
                      setDropTargetColId(null);
                      setColDropPosition(null);
                    }}
                    style={{
                      position: 'relative',
                      borderRadius: '10px',
                      border: isSelected ? '1.5px solid var(--brand-primary)' : isDragging ? '1.5px dashed var(--brand-emerald)' : '1px solid var(--border-subtle)',
                      backgroundColor: isSelected ? 'var(--surface-selected)' : 'var(--surface-card)',
                      boxShadow: isSelected ? '0 2px 8px rgba(79, 70, 229, 0.12)' : 'var(--shadow-sm)',
                      overflow: 'visible',
                      opacity: isDragging ? 0.35 : 1,
                      transform: isDragging ? 'scale(0.98)' : 'none',
                      transition: 'all 0.18s ease-in-out',
                    }}
                  >
                    {/* Visual Drop Indicators with dot */}
                    {isDropTargetBefore && (
                      <Box
                        style={{
                          position: 'absolute',
                          top: -3,
                          left: 4,
                          right: 4,
                          height: 3,
                          backgroundColor: 'var(--brand-emerald)',
                          borderRadius: 99,
                          zIndex: 30,
                          boxShadow: '0 0 8px rgba(24, 88, 68, 0.75)',
                          pointerEvents: 'none',
                        }}
                      >
                        <Box
                          style={{
                            position: 'absolute',
                            left: -4,
                            top: -3,
                            width: 9,
                            height: 9,
                            borderRadius: '50%',
                            backgroundColor: 'var(--brand-emerald)',
                            boxShadow: '0 0 6px rgba(24, 88, 68, 0.8)',
                          }}
                        />
                      </Box>
                    )}
                    {isDropTargetAfter && (
                      <Box
                        style={{
                          position: 'absolute',
                          bottom: -3,
                          left: 4,
                          right: 4,
                          height: 3,
                          backgroundColor: 'var(--brand-emerald)',
                          borderRadius: 99,
                          zIndex: 30,
                          boxShadow: '0 0 8px rgba(24, 88, 68, 0.75)',
                          pointerEvents: 'none',
                        }}
                      >
                        <Box
                          style={{
                            position: 'absolute',
                            left: -4,
                            top: -3,
                            width: 9,
                            height: 9,
                            borderRadius: '50%',
                            backgroundColor: 'var(--brand-emerald)',
                            boxShadow: '0 0 6px rgba(24, 88, 68, 0.8)',
                          }}
                        />
                      </Box>
                    )}

                    {/* Collection Header Folder Bar */}
                    <Box
                      w="100%"
                      p="xs"
                      onClick={() => onSelectCollection(col)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: isSelected ? 'var(--surface-selected)' : 'var(--surface-card)',
                        cursor: 'pointer',
                        userSelect: 'none',
                        borderRadius: '9px 9px 0 0',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <Group gap="xs" wrap="nowrap" style={{ overflow: 'hidden' }}>
                        {/* Drag Grip Handle */}
                        <Tooltip label="Drag up or down to re-order folder" position="top" withArrow openDelay={350}>
                          <Box
                            component="span"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'grab',
                              color: 'var(--brand-sage)',
                              padding: '2px',
                              borderRadius: 3,
                              transition: 'color 0.15s ease',
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <GripVertical size={14} />
                          </Box>
                        </Tooltip>

                        <ActionIcon
                          size="xs"
                          variant="subtle"
                          color="gray"
                          onClick={(e) => toggleFolder(col.id, e)}
                        >
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </ActionIcon>

                        {isExpanded ? (
                          <FolderOpen size={16} color="var(--brand-gold)" />
                        ) : (
                          <Folder size={16} color="var(--brand-gold)" />
                        )}

                        <Text size="xs" fw={600} truncate style={{ color: 'var(--brand-forest)' }}>
                          {col.name}
                        </Text>
                      </Group>

                      <Group gap={4} wrap="nowrap">
                        <Badge size="xs" variant={isSelected ? 'filled' : 'light'} color={isSelected ? 'emerald' : 'gold'}>
                          {colFiles.length}
                        </Badge>

                        <Menu position="bottom-end" shadow="md" withinPortal>
                          <Menu.Target>
                            <ActionIcon
                              size="xs"
                              variant="subtle"
                              color="gray"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical size={13} />
                            </ActionIcon>
                          </Menu.Target>

                          <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
                            <Menu.Item
                              leftSection={<Edit3 size={13} />}
                              onClick={() => {
                                setEditingCol(col);
                                setEditColName(col.name);
                                setEditColScope(col.scope);
                              }}
                            >
                              Edit Collection
                            </Menu.Item>
                            <Menu.Item
                              leftSection={<UploadCloud size={13} />}
                              onClick={() => onOpenUpload && onOpenUpload(col)}
                            >
                              Add File
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item
                              color="red"
                              leftSection={<Trash2 size={13} />}
                              onClick={() => onDeleteCollection && onDeleteCollection(col.id, false)}
                            >
                              Delete Collection
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                    </Box>

                    {/* Collapsible List of Individual Files inside this Collection */}
                    <Collapse in={isExpanded}>
                      {isExpanded && (
                        <Stack className="sidebar-card-content" gap={4} p="xs" pl="md">
                          {colFiles.length === 0 ? (
                            <Text size="xs" c="dimmed" fs="italic" py={2}>
                              No files in this collection
                            </Text>
                          ) : (
                            colFiles.map((doc) => (
                              <FileCard
                                key={doc.id}
                                document={doc}
                                isSelected={doc.id === selectedDocId}
                                collections={collections}
                                hideCollectionBadge={true}
                                onSelect={onSelectDoc}
                                onDelete={onDeleteDoc}
                                onRename={onRenameDoc}
                                onAssignCollection={onAssignCollection}
                              />
                            ))
                          )}
                        </Stack>
                      )}
                    </Collapse>
                  </Box>
                );
              })}

              {/* Loose / unassigned files note in Folders view */}
              {groupedCollections.unassignedFiles.length > 0 && (
                <Box px="xs" py="sm" ta="center">
                  <Text size="11px" c="dimmed">
                    {groupedCollections.unassignedFiles.length} loose {groupedCollections.unassignedFiles.length === 1 ? 'file' : 'files'} not in any folder.
                  </Text>
                  <Text
                    size="11px"
                    c="emerald"
                    fw={600}
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => setViewMode('flat')}
                  >
                    View in Files tab to assign →
                  </Text>
                </Box>
              )}
            </>
          ) : (
            // ================= FLAT LIST VIEW (Progressive Windowing) =================
            filteredDocs.length === 0 ? (
              <Box py="xl" ta="center">
                <Text size="sm" c="dimmed">
                  No documents found matching filters.
                </Text>
              </Box>
            ) : (
              <>
                {filteredDocs.slice(0, flatDisplayCount).map((doc) => (
                  <FileCard
                    key={doc.id}
                    document={doc}
                    isSelected={doc.id === selectedDocId}
                    collections={collections}
                    onSelect={onSelectDoc}
                    onDelete={onDeleteDoc}
                    onRename={onRenameDoc}
                    onAssignCollection={onAssignCollection}
                  />
                ))}

                {filteredDocs.length > flatDisplayCount && (
                  <Button
                    fullWidth
                    variant="subtle"
                    color="emerald"
                    size="xs"
                    my="xs"
                    onClick={() => setFlatDisplayCount((prev) => prev + 40)}
                    style={{
                      border: '1px dashed var(--brand-primary-border)',
                      backgroundColor: 'var(--surface-card)',
                      fontWeight: 600,
                    }}
                  >
                    Load More Files ({Math.min(flatDisplayCount, filteredDocs.length)} of {filteredDocs.length})
                  </Button>
                )}
              </>
            )
          )}
        </Stack>
      </ScrollArea>

      {/* Modal: Create Collection from Sidebar */}
      <Modal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Document Collection"
        size="sm"
        radius="md"
      >
        <form onSubmit={handleCreateCollection}>
          <Stack gap="sm">
            <TextInput
              label="Collection Name"
              placeholder="e.g. Tax 2024, Blood Reports, Client NDAs"
              required
              autoFocus
              value={newColName}
              onChange={(e) => setNewColName(e.currentTarget.value)}
              leftSection={<FolderPlus size={16} color="#0284c7" />}
            />

            <Select
              label="Assign to Group (Optional)"
              placeholder="Select a Group"
              value={newColGroupId}
              onChange={(val) => setNewColGroupId(val || '')}
              data={[
                { label: '📁 None / General', value: '' },
                ...groups.map((g) => ({
                  label: `🗂️ ${g.name}`,
                  value: g.id,
                })),
              ]}
              leftSection={<FolderKanban size={14} color="#6366f1" />}
            />

            <div>
              <Text size="xs" fw={500} mb={4}>
                Scope
              </Text>
              <SegmentedControl
                size="xs"
                value={newColScope}
                onChange={setNewColScope}
                data={[
                  { label: '💼 Work / Professional', value: 'professional' },
                  { label: '👤 Personal', value: 'personal' },
                ]}
              />
            </div>

            <Group justify="flex-end" mt="md">
              <Button variant="default" size="xs" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="xs" color="blue" loading={isSubmittingCol} disabled={!newColName.trim()}>
                Create Collection
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Modal: Edit Collection from Sidebar */}
      <Modal
        opened={!!editingCol}
        onClose={() => setEditingCol(null)}
        title="Edit Collection"
        size="sm"
        radius="md"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!editColName.trim() || !onUpdateCollection) return;
            try {
              setIsSubmittingEdit(true);
              const matchedGroup = groups.find((g) => g.id === editColGroupId);
              await onUpdateCollection(editingCol.id, {
                name: editColName.trim(),
                scope: editColScope,
                groupId: editColGroupId || null,
                groupName: matchedGroup ? matchedGroup.name : 'General',
              });
              setEditingCol(null);
              loadCollections();
            } catch (err) {
              console.error('Update error:', err);
            } finally {
              setIsSubmittingEdit(false);
            }
          }}
        >
          <Stack gap="md">
            <TextInput
              label="Collection Name"
              required
              value={editColName}
              onChange={(e) => setEditColName(e.currentTarget.value)}
            />

            <Select
              label="Parent Group"
              placeholder="Select a Group"
              value={editColGroupId}
              onChange={(val) => setEditColGroupId(val || '')}
              data={[
                { label: '📁 None / General', value: '' },
                ...groups.map((g) => ({
                  label: `🗂️ ${g.name}`,
                  value: g.id,
                })),
              ]}
              leftSection={<FolderKanban size={14} color="#6366f1" />}
            />

            <div>
              <Text size="xs" fw={500} mb={4}>
                Scope
              </Text>
              <SegmentedControl
                size="xs"
                value={editColScope}
                onChange={setEditColScope}
                data={[
                  { label: '💼 Work / Professional', value: 'professional' },
                  { label: '👤 Personal', value: 'personal' },
                ]}
              />
            </div>
            <Group justify="flex-end" mt="md">
              <Button variant="default" size="xs" onClick={() => setEditingCol(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="xs"
                color="blue"
                loading={isSubmittingEdit}
                disabled={!editColName.trim()}
              >
                Save Changes
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Modal: Create Group */}
      <Modal
        opened={createGroupModalOpen}
        onClose={() => setCreateGroupModalOpen(false)}
        title="Create New Organizational Group"
        size="sm"
        radius="md"
      >
        <form onSubmit={handleCreateGroupSubmit}>
          <Stack gap="sm">
            <TextInput
              label="Group Name"
              placeholder="e.g. Legal, Finance, Research, Projects"
              required
              autoFocus
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.currentTarget.value)}
              leftSection={<FolderKanban size={16} color="#6366f1" />}
            />

            <Textarea
              label="Description (Optional)"
              placeholder="What belongs in this domain group?"
              value={newGroupDesc}
              onChange={(e) => setNewGroupDesc(e.currentTarget.value)}
              rows={2}
            />

            <ColorInput
              label="Theme Color"
              value={newGroupColor}
              onChange={setNewGroupColor}
              swatches={['#6366f1', '#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']}
            />

            <div>
              <Text size="xs" fw={500} mb={4}>
                Accessibility Scope
              </Text>
              <SegmentedControl
                size="xs"
                fullWidth
                value={newGroupScope}
                onChange={setNewGroupScope}
                data={[
                  { label: '🌐 All', value: 'all' },
                  { label: '💼 Work', value: 'professional' },
                  { label: '👤 Personal', value: 'personal' },
                ]}
              />
            </div>

            <Group justify="flex-end" mt="md">
              <Button variant="default" size="xs" onClick={() => setCreateGroupModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="xs" color="indigo" loading={isSubmittingGroup} disabled={!newGroupName.trim()}>
                Create Group
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Modal: Edit Group */}
      <Modal
        opened={!!editingGroup}
        onClose={() => setEditingGroup(null)}
        title="Edit Group"
        size="sm"
        radius="md"
      >
        <form onSubmit={handleSaveGroupEdit}>
          <Stack gap="sm">
            <TextInput
              label="Group Name"
              required
              value={editGroupName}
              onChange={(e) => setEditGroupName(e.currentTarget.value)}
            />

            <Textarea
              label="Description"
              value={editGroupDesc}
              onChange={(e) => setEditGroupDesc(e.currentTarget.value)}
              rows={2}
            />

            <ColorInput
              label="Theme Color"
              value={editGroupColor}
              onChange={setEditGroupColor}
              swatches={['#6366f1', '#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']}
            />

            <div>
              <Text size="xs" fw={500} mb={4}>
                Accessibility Scope
              </Text>
              <SegmentedControl
                size="xs"
                fullWidth
                value={editGroupScope}
                onChange={setEditGroupScope}
                data={[
                  { label: '🌐 All', value: 'all' },
                  { label: '💼 Work', value: 'professional' },
                  { label: '👤 Personal', value: 'personal' },
                ]}
              />
            </div>

            <Group justify="flex-end" mt="md">
              <Button variant="default" size="xs" onClick={() => setEditingGroup(null)}>
                Cancel
              </Button>
              <Button type="submit" size="xs" color="indigo" loading={isSubmittingGroupEdit} disabled={!editGroupName.trim()}>
                Save Changes
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Modal: Delete Group */}
      <Modal
        opened={!!deletingGroup}
        onClose={() => setDeletingGroup(null)}
        title={<Text fw={600} c="red">Delete Group</Text>}
        size="sm"
        radius="md"
      >
        <Stack gap="md">
          <Text size="sm">
            Are you sure you want to delete group <strong>"{deletingGroup?.name}"</strong>?
          </Text>

          <Paper p="sm" radius="md" withBorder style={{ backgroundColor: '#fef2f2' }}>
            <Checkbox
              label="Cascade Delete: Permanently delete member collections and files"
              color="red"
              checked={cascadeGroupDelete}
              onChange={(e) => setCascadeGroupDelete(e.currentTarget.checked)}
            />
          </Paper>

          <Text size="xs" c="dimmed">
            {cascadeGroupDelete
              ? '⚠️ Warning: Member files and collections will be permanently deleted.'
              : 'Safe Disband: Group is deleted, but all files and collections are safely preserved in General.'}
          </Text>

          <Group justify="flex-end" mt="md">
            <Button variant="default" size="xs" onClick={() => setDeletingGroup(null)}>
              Cancel
            </Button>
            <Button color="red" size="xs" loading={isDeletingGroup} onClick={handleConfirmDeleteGroup}>
              {cascadeGroupDelete ? 'Permanently Delete' : 'Disband Safely'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
