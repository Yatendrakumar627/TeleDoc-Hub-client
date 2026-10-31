import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import FileCard from '../library/FileCard';
import { getCollections } from '../../services/apiClient';

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
}) {
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

  return (
    <Box p="lg">
      {/* Group Header Hero Banner */}
      <Paper
        p="lg"
        radius="lg"
        withBorder
        mb="xl"
        style={{
          borderLeft: `8px solid ${group.color || '#6366f1'}`,
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
          <Group align="flex-start" gap="md">
            <ThemeIcon
              size={54}
              radius="md"
              style={{ backgroundColor: `${group.color || '#6366f1'}15` }}
            >
              <FolderKanban size={30} color={group.color || '#6366f1'} />
            </ThemeIcon>

            <Box>
              <Group gap="xs" align="center">
                <Title order={2} fw={700}>
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

              <Group gap="md" mt="sm">
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
          <Group gap="xs">
            <Button
              leftSection={<FolderPlus size={16} />}
              variant="light"
              color="indigo"
              size="sm"
              onClick={() => setCreateColOpen(true)}
            >
              Add Collection
            </Button>

            <Button
              leftSection={<UploadCloud size={16} />}
              variant="light"
              color="blue"
              size="sm"
              onClick={onOpenUpload}
            >
              Upload File
            </Button>

            <Tooltip label="Edit Group Details">
              <ActionIcon variant="default" size="lg" radius="md" onClick={handleOpenEdit}>
                <Edit3 size={16} />
              </ActionIcon>
            </Tooltip>

            {!group.isSystem && (
              <Tooltip label="Delete Group">
                <ActionIcon variant="light" color="red" size="lg" radius="md" onClick={() => setDeleteModalOpen(true)}>
                  <Trash2 size={16} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Group>
      </Paper>

      <Stack gap="xl">
        {/* SECTION 1: Member Collections */}
        <Box>
          <Group justify="space-between" align="center" mb="md">
            <Group gap="xs">
              <Folder size={20} color="#0284c7" />
              <Title order={3} size="h4">
                Collections in this Group ({collections.length})
              </Title>
            </Group>
            <Button
              variant="subtle"
              size="xs"
              leftSection={<FolderPlus size={14} />}
              onClick={() => setCreateColOpen(true)}
            >
              New Collection
            </Button>
          </Group>

          {collections.length > 0 ? (
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
              {collections.map((col) => (
                <Card
                  key={col.id}
                  padding="md"
                  radius="md"
                  withBorder
                  style={{
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    borderLeft: `4px solid ${col.color || '#0284c7'}`,
                  }}
                  onClick={() => onSelectCollection && onSelectCollection(col)}
                  className="hover-card"
                >
                  <Group justify="space-between" align="flex-start" mb="xs">
                    <Group gap="xs">
                      <Folder size={20} color={col.color || '#0284c7'} />
                      <Text size="sm" fw={600} truncate maw={180}>
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
              ))}
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
          <Group justify="space-between" align="center" mb="md">
            <Group gap="xs">
              <FileText size={20} color="#10b981" />
              <Title order={3} size="h4">
                Direct Files in this Group ({documents.length})
              </Title>
            </Group>
            <Button
              variant="subtle"
              size="xs"
              leftSection={<UploadCloud size={14} />}
              onClick={onOpenUpload}
            >
              Upload to Group
            </Button>
          </Group>

          {documents.length > 0 ? (
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
              {documents.map((doc) => (
                <FileCard
                  key={doc.id}
                  document={doc}
                  doc={doc}
                  isSelected={false}
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
              label="Cascade Delete: Permanently delete all member collections and files from Telegram Vault"
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
    </Box>
  );
}

