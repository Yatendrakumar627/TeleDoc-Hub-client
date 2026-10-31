import React, { useState, useEffect } from 'react';
import {
  Tabs,
  Stack,
  Group,
  Text,
  Button,
  TextInput,
  Alert,
  SegmentedControl,
  Select,
  Paper,
  Badge,
  Box,
  Divider,
} from '@mantine/core';
import {
  UploadCloud,
  Link as LinkIcon,
  FolderPlus,
  CheckCircle2,
  Lock,
  ArrowRight,
  Folder,
} from 'lucide-react';
import ModalWrapper from '../../components/ui/ModalWrapper';
import FeedbackBanner from '../../components/ui/FeedbackBanner';
import UploadDropzone from './UploadDropzone';
import {
  getCollections,
  createCollection,
  assignDocumentCollection,
  batchMoveDocuments,
} from '../../services/apiClient';

export default function IngestionModal({
  opened,
  onClose,
  targetCollection = null, // e.g. { id: '...', name: 'Tax 2024' }
  onUploadFile,
  onIngestGoogleLink,
  isProcessing,
  uploadProgress,
  uploadStatusText = '',
  error,
  onClearError,
  onSuccessNavigate,
  onRefreshVault,
}) {
  const [step, setStep] = useState('upload'); // 'upload' | 'collection'
  const [activeTab, setActiveTab] = useState('upload');
  const [googleUrl, setGoogleUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');

  // Post-upload state
  const [uploadedResult, setUploadedResult] = useState(null); // { document, content }
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionScope, setNewCollectionScope] = useState('professional');
  const [savingCollection, setSavingCollection] = useState(false);

  // Fetch collections when modal opens or step changes
  useEffect(() => {
    if (opened) {
      setStep('upload');
      setUploadedResult(null);
      setIsCreatingNew(false);
      setNewCollectionName('');
      setSelectedCollectionId(targetCollection ? targetCollection.id : '');
      loadCollections();
    }
  }, [opened, targetCollection]);

  const loadCollections = async () => {
    try {
      const list = await getCollections('all');
      setCollections(list);
    } catch (err) {
      console.warn('Could not load collections:', err.message);
    }
  };

  const handleDrop = async (files) => {
    if (onClearError) onClearError();
    if (!files || files.length === 0) return;

    try {
      const options = targetCollection
        ? {
            collectionId: targetCollection.id,
            collectionName: targetCollection.name,
            scope: targetCollection.scope,
            groupId: targetCollection.groupId,
            group: targetCollection.groupName || (targetCollection.groupId ? targetCollection.name : undefined),
          }
        : {};
      // Pass all dropped files - server handles single or batch array
      const res = await onUploadFile(files, options);
      if (res && (res.documents || res.document)) {
        setUploadedResult(res);
        setStep('collection');
        setSelectedCollectionId(targetCollection && targetCollection.id ? targetCollection.id : '');
        await loadCollections();
      }
    } catch {
      // Handled in useUpload
    }
  };

  const handleGoogleSubmit = async (e) => {
    e.preventDefault();
    if (onClearError) onClearError();
    if (!googleUrl.trim() || !customTitle.trim()) return;

    try {
      const options = targetCollection
        ? {
            collectionId: targetCollection.id,
            collectionName: targetCollection.name,
            scope: targetCollection.scope,
            groupId: targetCollection.groupId,
            group: targetCollection.groupName || (targetCollection.groupId ? targetCollection.name : undefined),
          }
        : {};
      const res = await onIngestGoogleLink(googleUrl.trim(), customTitle.trim(), options);
      setGoogleUrl('');
      setCustomTitle('');
      if (res && (res.documents || res.document)) {
        setUploadedResult(res);
        setStep('collection');
        setSelectedCollectionId(targetCollection && targetCollection.id ? targetCollection.id : '');
        await loadCollections();
      }
    } catch {
      // Handled in useUpload
    }
  };

  // Helper to extract array of uploaded documents
  const getUploadedDocs = () => {
    return uploadedResult?.documents || (uploadedResult?.document ? [uploadedResult.document] : []);
  };

  // Create new collection and assign all uploaded file instances
  const handleCreateAndAssign = async () => {
    const docs = getUploadedDocs();
    if (!newCollectionName.trim() || docs.length === 0) return;

    try {
      setSavingCollection(true);
      const newCol = await createCollection({
        name: newCollectionName.trim(),
        scope: newCollectionScope,
        groupId: targetCollection?.groupId,
        groupName: targetCollection?.groupName,
      });

      // Batch assign all individual uploaded file instances
      const docIds = docs.map((d) => d.id);
      await batchMoveDocuments(docIds, newCol.id);

      const updatedDocs = docs.map((d) => ({
        ...d,
        collectionId: newCol.id,
        collectionName: newCol.name,
        scope: newCol.scope,
      }));

      finishAndClose(updatedDocs, newCol);
    } catch (err) {
      console.error('Error creating collection & moving files:', err);
    } finally {
      setSavingCollection(false);
    }
  };

  // Assign existing selected collection to all uploaded file instances
  const handleAssignExisting = async () => {
    const docs = getUploadedDocs();
    if (docs.length === 0) {
      onClose();
      return;
    }

    if (!selectedCollectionId) {
      finishAndClose(docs, null);
      return;
    }

    try {
      setSavingCollection(true);
      const matchedCol = collections.find((c) => c.id === selectedCollectionId);
      const docIds = docs.map((d) => d.id);

      await batchMoveDocuments(docIds, selectedCollectionId);

      const updatedDocs = docs.map((d) => ({
        ...d,
        collectionId: selectedCollectionId,
        collectionName: matchedCol ? matchedCol.name : 'Collection',
      }));

      finishAndClose(updatedDocs, matchedCol);
    } catch (err) {
      console.error('Error assigning collection to files:', err);
      finishAndClose(docs, null);
    } finally {
      setSavingCollection(false);
    }
  };

  const finishAndClose = (finalDocs, targetCol = null) => {
    if (onSuccessNavigate && finalDocs) {
      onSuccessNavigate(finalDocs, uploadedResult?.content, targetCol);
    }
    onClose();
  };

  return (
    <ModalWrapper
      opened={opened}
      onClose={onClose}
      title={
        step === 'upload'
          ? (targetCollection ? `Upload to "${targetCollection.name}"` : 'Upload to Zero-Knowledge Vault')
          : 'Organize into Collection'
      }
    >
      {step === 'upload' ? (
        // ================= STEP 1: UPLOAD =================
        <div>
          {targetCollection && (
            <Paper p="xs" radius="md" mb="sm" style={{ backgroundColor: 'var(--surface-selected)', border: '1px solid var(--brand-primary-border)' }}>
              <Group gap="xs">
                <Folder size={16} color="var(--brand-primary)" />
                <Text size="xs" fw={600} style={{ color: 'var(--brand-forest)' }}>
                  Target Collection: 📁 {targetCollection.name}
                </Text>
              </Group>
            </Paper>
          )}

          <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List mb="md">
            <Tabs.Tab value="upload" leftSection={<UploadCloud size={16} />}>
              Upload Any File
            </Tabs.Tab>
            <Tabs.Tab value="google" leftSection={<LinkIcon size={16} />}>
              Google Workspace Link
            </Tabs.Tab>
          </Tabs.List>

          <FeedbackBanner type="error" message={error} onClose={onClearError} />

          {error && (
            <Group justify="flex-end" mb="xs">
              <Button
                size="xs"
                variant="light"
                color="emerald"
                onClick={async () => {
                  if (onRefreshVault) onRefreshVault();
                  await loadCollections();
                  if (onClearError) onClearError();
                  onClose();
                }}
              >
                🔄 Refresh Vault & Close
              </Button>
            </Group>
          )}

          {/* Tab 1: Local File Upload */}
          <Tabs.Panel value="upload">
            <UploadDropzone
              onDrop={handleDrop}
              onReject={(files) => {
                const rej = files[0];
                const err =
                  rej?.errors?.[0]?.code === 'file-too-large'
                    ? 'File exceeds the 50 MB limit.'
                    : 'File upload error.';
                if (onClearError) onClearError();
              }}
              loading={isProcessing}
              uploadProgress={uploadProgress}
              statusText={uploadStatusText}
            />
          </Tabs.Panel>

          {/* Tab 2: Google Workspace Link */}
          <Tabs.Panel value="google">
            <form onSubmit={handleGoogleSubmit}>
              <Stack gap="md">
                <TextInput
                  label="Google Docs or Google Sheets URL"
                  description="Must be set to 'Anyone with the link can view'"
                  placeholder="https://docs.google.com/document/d/... or /spreadsheets/d/..."
                  required
                  value={googleUrl}
                  onChange={(e) => setGoogleUrl(e.currentTarget.value)}
                  radius="md"
                  leftSection={<LinkIcon size={16} color="var(--brand-primary)" />}
                />

                <TextInput
                  label="Document Title"
                  description="Required — give this Google Workspace file a recognizable title"
                  placeholder="e.g. Q4 Financial Audit, Oct 2026 Strategy, Team Roadmap..."
                  required
                  withAsterisk
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.currentTarget.value)}
                  radius="md"
                />

                <Alert color="emerald" variant="light" radius="md">
                  <Text size="xs">
                    💡 TeleDoc Hub will fetch the snapshot, encrypt it with AES-256, and archive it into your Telegram + MongoDB Vault.
                  </Text>
                </Alert>

                <Group justify="flex-end" mt="xs">
                  <Button variant="default" onClick={onClose} disabled={isProcessing}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    color="blue"
                    loading={isProcessing}
                    disabled={!googleUrl.trim() || !customTitle.trim() || isProcessing}
                  >
                    Fetch & Ingest
                  </Button>
                </Group>
              </Stack>
            </form>
          </Tabs.Panel>
        </Tabs>
      </div>
      ) : (
        // ================= STEP 2: CREATE / ASSIGN COLLECTION AFTER UPLOAD =================
        <Stack gap="md">
          {/* Success Summary Pill */}
          <Paper p="sm" radius="md" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <Group justify="space-between" align="center" mb={getUploadedDocs().length > 1 ? 'xs' : 0}>
              <Group gap="xs">
                <CheckCircle2 size={20} color="#16a34a" />
                <Box>
                  <Text size="sm" fw={600} c="green.9">
                    {getUploadedDocs().length > 1
                      ? `${getUploadedDocs().length} Individual Files Uploaded & Encrypted!`
                      : 'Uploaded & Vault Encrypted!'}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {getUploadedDocs().length > 1
                      ? 'Each file stored as an independent instance with its own AES-256 key'
                      : `${uploadedResult?.document?.filename} (${((uploadedResult?.document?.fileSize || 0) / 1024).toFixed(1)} KB)`}
                  </Text>
                </Box>
              </Group>
              <Badge color="teal" variant="light" leftSection={<Lock size={10} />}>
                Zero-Knowledge AES-256
              </Badge>
            </Group>

            {/* If multiple files were uploaded, show clean scrollable list of instances */}
            {getUploadedDocs().length > 1 && (
              <Box
                mt="xs"
                pt="xs"
                mah={140}
                style={{ overflowY: 'auto', borderTop: '1px dashed #bbf7d0' }}
              >
                {getUploadedDocs().map((doc, idx) => (
                  <Group key={doc.id || idx} justify="space-between" py={3}>
                    <Group gap="xs" style={{ minWidth: 0, flex: 1 }}>
                      <Text size="xs" fw={500} truncate>
                        📄 {doc.filename}
                      </Text>
                      <Text size="xs" c="dimmed">
                        ({((doc.fileSize || 0) / 1024).toFixed(1)} KB)
                      </Text>
                    </Group>
                    <Badge size="xs" variant="outline" color={doc.scope === 'personal' ? 'violet' : 'blue'}>
                      {doc.taxonomy?.group || doc.format || 'file'}
                    </Badge>
                  </Group>
                ))}
              </Box>
            )}
          </Paper>

          <Text size="xs" c="dimmed">
            {getUploadedDocs().length > 1
              ? `Choose a collection to organize all ${getUploadedDocs().length} files together, or keep them individually in Inbox:`
              : 'Choose where to file this document, or create a brand new collection right now:'}
          </Text>

          {/* Mode Selector: Existing vs Create New */}
          <SegmentedControl
            size="xs"
            value={isCreatingNew ? 'new' : 'existing'}
            onChange={(val) => setIsCreatingNew(val === 'new')}
            data={[
              { label: 'Choose Existing Collection', value: 'existing' },
              { label: '+ Create New Collection', value: 'new' },
            ]}
          />

          {!isCreatingNew ? (
            // Select Existing Collection
            <Stack gap="xs">
              <Select
                label="Assign to Collection"
                placeholder="Select a collection (or leave unassigned)"
                value={selectedCollectionId}
                onChange={(v) => setSelectedCollectionId(v || '')}
                data={[
                  { label: '📁 Inbox / Unassigned', value: '' },
                  ...collections.map((c) => ({
                    label: `📁 ${c.name} (${c.scope === 'personal' ? 'Personal' : 'Work'})`,
                    value: c.id,
                  })),
                ]}
                leftSection={<Folder size={16} color="var(--brand-primary)" />}
              />
              <Text size="xs" c="dimmed">
                Don't have a matching collection? Switch to "+ Create New Collection" above.
              </Text>
            </Stack>
          ) : (
            // Inline Create New Collection Form
            <Paper p="sm" radius="md" withBorder style={{ backgroundColor: 'var(--surface-card-subtle)' }}>
              <Stack gap="xs">
                <TextInput
                  label="New Collection Name"
                  placeholder="e.g. Tax 2024, Blood Reports, Project Alpha..."
                  required
                  autoFocus
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.currentTarget.value)}
                  leftSection={<FolderPlus size={16} color="var(--brand-primary)" />}
                />

                <div>
                  <Text size="xs" fw={500} mb={4}>
                    Collection Scope
                  </Text>
                  <SegmentedControl
                    size="xs"
                    value={newCollectionScope}
                    onChange={setNewCollectionScope}
                    data={[
                      { label: '💼 Work / Professional', value: 'professional' },
                      { label: '👤 Personal', value: 'personal' },
                    ]}
                  />
                </div>
              </Stack>
            </Paper>
          )}

          <Divider my="xs" />

          {/* Action Buttons */}
          <Group justify="space-between">
            <Button
              variant="subtle"
              color="gray"
              size="xs"
              onClick={() => finishAndClose(getUploadedDocs(), null)}
            >
              Skip (Keep in Inbox)
            </Button>

            <Group gap="xs">
              <Button
                color="indigo"
                className="btn-premium-primary"
                size="sm"
                loading={savingCollection}
                disabled={isCreatingNew && !newCollectionName.trim()}
                onClick={isCreatingNew ? handleCreateAndAssign : handleAssignExisting}
                rightSection={<ArrowRight size={16} />}
              >
                {isCreatingNew
                  ? `Create Collection & Add ${getUploadedDocs().length > 1 ? `${getUploadedDocs().length} Files` : 'File'}`
                  : selectedCollectionId
                  ? `Move ${getUploadedDocs().length > 1 ? `${getUploadedDocs().length} Files` : 'File'} to Collection`
                  : 'Done (Keep in Inbox)'}
              </Button>
            </Group>
          </Group>
        </Stack>
      )}
    </ModalWrapper>
  );
}
