import React, { useState } from 'react';
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
  Radio,
  Divider,
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
} from 'lucide-react';
import SourceBadge from '../../components/ui/SourceBadge';
import { formatBytes } from '../../utils/formatters';
import { getDocTypeMeta } from '../../utils/docTypes';

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

      {/* Files Grid Header */}
      <Group justify="space-between" mb="sm" px={4}>
        <Text fw={600} size="sm" c="dimmed">
          FILES IN THIS COLLECTION ({files.length})
        </Text>
        <Text size="xs" c="dimmed">
          Click any file to read or view details
        </Text>
      </Group>

      {/* Grid of Individual Files */}
      {files.length === 0 ? (
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
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {files.map((file) => {
            const meta = getDocTypeMeta(file.type, file.format);
            const Icon = meta.icon;

            return (
              <Card
                key={file.id}
                p="md"
                radius="md"
                withBorder
                style={{
                  cursor: 'pointer',
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    borderColor: '#0284c7',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.08)',
                  },
                }}
                onClick={() => onSelectFile(file.id)}
              >
                <Stack justify="space-between" h="100%">
                  <div>
                    <Group justify="space-between" align="flex-start" mb="xs">
                      <Box
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          backgroundColor: `${meta.accentColor}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: meta.accentColor,
                        }}
                      >
                        <Icon size={18} />
                      </Box>

                      <Group gap={4}>
                        <Tooltip label="Download Decrypted File" withArrow>
                          <ActionIcon
                            size="sm"
                            variant="subtle"
                            color="gray"
                            component="a"
                            href={`/api/documents/${file.id}/download`}
                            download={file.filename}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Download size={13} />
                          </ActionIcon>
                        </Tooltip>

                        <Tooltip label="Delete File" withArrow>
                          <ActionIcon
                            size="sm"
                            variant="subtle"
                            color="red"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Delete "${file.filename}" from vault?`)) {
                                onDeleteFile(file.id);
                              }
                            }}
                          >
                            <Trash2 size={13} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Group>

                    {/* File Title & Original Name */}
                    <Text fw={600} size="sm" truncate mb={2} style={{ color: '#0f172a' }}>
                      {file.title}
                    </Text>
                    <Text size="xs" c="dimmed" truncate mb="xs">
                      {file.filename}
                    </Text>

                    {/* Preview Snippet */}
                    {file.previewSnippet && (
                      <Text size="xs" c="dimmed" lineClamp={2} style={{ minHeight: '32px' }}>
                        {file.previewSnippet}
                      </Text>
                    )}
                  </div>

                  {/* Card Bottom Meta */}
                  <Box mt="xs" pt="xs" style={{ borderTop: '1px solid #f1f5f9' }}>
                    <Group justify="space-between" align="center">
                      <Group gap={6}>
                        <SourceBadge type={file.type} format={file.format} showIcon={false} />
                        <Text size="xs" c="dimmed" className="mono-badge">
                          {formatBytes(file.fileSize)}
                        </Text>
                      </Group>

                      <Group gap={2} c="blue" style={{ fontSize: '12px', fontWeight: 500 }}>
                        <span>Open</span>
                        <ArrowRight size={13} />
                      </Group>
                    </Group>
                  </Box>
                </Stack>
              </Card>
            );
          })}
        </SimpleGrid>
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
