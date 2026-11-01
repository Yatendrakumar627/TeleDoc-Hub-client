import React, { useState, useMemo, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { Box, Stack, Loader, Text } from '@mantine/core';
import { useAuth } from './context/AuthContext';
import { useTelegramStatus } from './hooks/useTelegramStatus';
import { useDocuments } from './hooks/useDocuments';
import { useUpload } from './hooks/useUpload';
import { useGroups } from './hooks/useGroups';
import {
  assignDocumentCollection,
  updateCollection,
  deleteCollection,
  createCollection,
  createGroup,
  updateGroup,
  deleteGroup,
  assignCollectionGroup,
  batchMoveDocuments,
  batchDeleteDocuments,
} from './services/apiClient';

import WorkspaceLayout from './components/layout/WorkspaceLayout';
import ViewerContainer from './features/viewer/ViewerContainer';
import IngestionModal from './features/upload/IngestionModal';
import AuthPage from './features/auth/AuthPage';
import { extractErrorMessage } from './utils/formatters';

function VaultWorkspace() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadTargetCollection, setUploadTargetCollection] = useState(null);

  // Collection Navigation State
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [isViewingCollectionHub, setIsViewingCollectionHub] = useState(false);
  const [collectionsVersion, setCollectionsVersion] = useState(0);

  // Group Navigation State
  const [isViewingGroupHub, setIsViewingGroupHub] = useState(false);

  // 1. Data Hooks
  const { status, loading: statusLoading } = useTelegramStatus();
  const {
    documents,
    selectedDocId,
    currentDoc,
    currentContent,
    loadingContent,
    selectDocument,
    closeDocument,
    addDocument,
    removeDocument,
    renameDocument,
    refreshDocuments,
  } = useDocuments();

  // 2. Groups Hook
  const {
    groups,
    selectedGroupId,
    currentGroup,
    loadingGroupDetail,
    selectGroup,
    addGroup,
    updateGroupInState,
    removeGroupFromState,
    reorderGroupsInState,
    loadGroups,
  } = useGroups();

  // 3. Upload / Ingest Hook
  const {
    isProcessing,
    uploadProgress,
    uploadStatusText,
    error: uploadError,
    clearError,
    uploadFile,
    ingestLink,
  } = useUpload(async (newDoc, newContent) => {
    addDocument(newDoc, newContent);
    await refreshDocuments();
    await loadGroups();
    setCollectionsVersion((v) => v + 1);
  });

  // Open Upload Modal with optional target collection/group pre-selected
  const handleOpenUpload = (targetCol = null) => {
    setUploadTargetCollection(targetCol);
    setUploadModalOpen(true);
  };

  // Handle selecting a collection folder
  const handleSelectCollection = (col) => {
    setSelectedCollection(col);
    setIsViewingCollectionHub(true);
    setIsViewingGroupHub(false);
  };

  // Handle selecting a group
  const handleSelectGroup = async (grp) => {
    const groupId = typeof grp === 'string' ? grp : grp?.id;
    if (groupId) {
      setIsViewingGroupHub(true);
      setIsViewingCollectionHub(false);
      await selectGroup(groupId);
    }
  };

  // Handle selecting an individual file
  const handleSelectDoc = (id) => {
    selectDocument(id);
    setIsViewingCollectionHub(false);
    setIsViewingGroupHub(false);
  };

  // Handle closing active file preview (returns to folder/collection view where files are available)
  const handleCloseDoc = () => {
    if (currentDoc?.collectionId && currentDoc.collectionId !== 'unassigned') {
      setSelectedCollection((prev) => {
        if (prev && prev.id === currentDoc.collectionId) {
          return prev;
        }
        return {
          id: currentDoc.collectionId,
          name: currentDoc.collectionName,
          scope: currentDoc.scope,
        };
      });
      setIsViewingCollectionHub(true);
      setIsViewingGroupHub(false);
    } else if (selectedCollection) {
      setIsViewingCollectionHub(true);
      setIsViewingGroupHub(false);
    } else if (currentDoc?.groupId || selectedGroupId) {
      setIsViewingGroupHub(true);
      setIsViewingCollectionHub(false);
    } else {
      setIsViewingCollectionHub(false);
      setIsViewingGroupHub(false);
    }
    closeDocument();
  };

  // Keyboard shortcut: Press Escape (Esc) on PC to close active document & return to folder view
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        const activeTag = document.activeElement?.tagName;
        // Don't close file if user is currently inside an input/textarea (e.g. rename or search)
        if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') {
          return;
        }
        // Don't close if modal is open (Mantine Modal handles its own Esc)
        if (uploadModalOpen) {
          return;
        }
        if (selectedDocId) {
          handleCloseDoc();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDocId, uploadModalOpen, currentDoc, selectedCollection, selectedGroupId]);

  // Switch to collection overview hub
  const handleOpenCollectionHub = () => {
    if (currentDoc?.collectionId) {
      setSelectedCollection({
        id: currentDoc.collectionId,
        name: currentDoc.collectionName,
        scope: currentDoc.scope,
      });
      setIsViewingCollectionHub(true);
      setIsViewingGroupHub(false);
    }
  };

  // Re-assign or move an existing document to a collection
  const handleAssignDocumentCollection = async (docId, colId, colName) => {
    try {
      const updated = await assignDocumentCollection(docId, colId, colName);
      addDocument(updated, currentDoc?.id === docId ? currentContent : null);
      loadGroups();
      notifications.show({
        title: 'Collection Updated',
        message: `"${updated.title}" moved to ${colName || 'Inbox'}.`,
        color: 'teal',
      });
    } catch (err) {
      notifications.show({
        title: 'Failed to Move File',
        message: extractErrorMessage(err, 'Failed to move file.'),
        color: 'red',
      });
    }
  };

  // Update collection metadata (CRUD: Update)
  const handleUpdateCollection = async (colId, updates) => {
    try {
      const updated = await updateCollection(colId, updates);
      if (selectedCollection?.id === colId) {
        setSelectedCollection(updated);
      }
      refreshDocuments();
      loadGroups();
      setCollectionsVersion((v) => v + 1);
      notifications.show({
        title: 'Collection Updated',
        message: `Saved changes to "${updated.name}".`,
        color: 'teal',
      });
      return updated;
    } catch (err) {
      notifications.show({
        title: 'Update Failed',
        message: extractErrorMessage(err, 'Failed to update collection.'),
        color: 'red',
      });
      throw err;
    }
  };

  // Delete collection (CRUD: Delete)
  const handleDeleteCollection = async (colId, cascade = false) => {
    try {
      await deleteCollection(colId, cascade);
      if (selectedCollection?.id === colId) {
        setSelectedCollection(null);
        setIsViewingCollectionHub(false);
      }
      if (cascade && currentDoc?.collectionId === colId) {
        closeDocument();
      }
      await refreshDocuments();
      await loadGroups();
      setCollectionsVersion((v) => v + 1);
      notifications.show({
        title: 'Collection Deleted',
        message: cascade
          ? 'Collection and all associated files deleted from database and Telegram.'
          : 'Collection deleted. Files moved to Inbox.',
        color: 'gray',
      });
    } catch (err) {
      notifications.show({
        title: 'Delete Failed',
        message: extractErrorMessage(err, 'Failed to delete collection.'),
        color: 'red',
      });
    }
  };

  // Create Group (CRUD: Create)
  const handleCreateGroup = async (data) => {
    try {
      const created = await createGroup(data);
      addGroup(created);
      notifications.show({
        title: 'Group Created',
        message: `Group "${created.name}" created.`,
        color: 'teal',
      });
      return created;
    } catch (err) {
      notifications.show({
        title: 'Failed to Create Group',
        message: extractErrorMessage(err, 'Failed to update collection.'),
        color: 'red',
      });
      throw err;
    }
  };

  // Update Group (CRUD: Update)
  const handleUpdateGroup = async (id, updates) => {
    try {
      const updated = await updateGroup(id, updates);
      updateGroupInState(updated);
      refreshDocuments();
      notifications.show({
        title: 'Group Updated',
        message: `Saved changes to "${updated.name}".`,
        color: 'teal',
      });
      return updated;
    } catch (err) {
      notifications.show({
        title: 'Update Failed',
        message: extractErrorMessage(err, 'Failed to update collection.'),
        color: 'red',
      });
      throw err;
    }
  };

  // Delete Group (CRUD: Delete)
  const handleDeleteGroup = async (id, cascade = false) => {
    try {
      await deleteGroup(id, cascade);
      removeGroupFromState(id);
      if (selectedGroupId === id) {
        setIsViewingGroupHub(false);
      }
      await refreshDocuments();
      await loadGroups();
      setCollectionsVersion((v) => v + 1);
      notifications.show({
        title: 'Group Deleted',
        message: cascade
          ? 'Group and all member files permanently deleted from database.'
          : 'Group disbanded. Items safely preserved in General.',
        color: 'gray',
      });
    } catch (err) {
      notifications.show({
        title: 'Delete Failed',
        message: extractErrorMessage(err, 'Failed to delete group.'),
        color: 'red',
      });
      throw err;
    }
  };

  // Create Collection inside a Group
  const handleCreateCollectionInGroup = async ({ name, scope, groupId, groupName }) => {
    try {
      const created = await createCollection({ name, scope, groupId, groupName });
      notifications.show({
        title: 'Collection Created',
        message: `Collection "${created.name}" created in ${groupName || 'group'}.`,
        color: 'teal',
      });
      setCollectionsVersion((v) => v + 1);
      if (groupId) {
        await selectGroup(groupId);
      }
      await loadGroups();
      return created;
    } catch (err) {
      notifications.show({
        title: 'Failed to Create Collection',
        message: extractErrorMessage(err, 'Failed to update collection.'),
        color: 'red',
      });
      throw err;
    }
  };

  // Assign an existing Collection into a Group
  const handleAssignCollectionToGroup = async (collectionId, groupId, groupName) => {
    try {
      const updated = await assignCollectionGroup(collectionId, groupId, groupName);
      notifications.show({
        title: 'Collection Added to Group',
        message: `"${updated.name}" is now in ${groupName}.`,
        color: 'teal',
      });
      setCollectionsVersion((v) => v + 1);
      if (groupId) {
        await selectGroup(groupId);
      }
      await loadGroups();
      return updated;
    } catch (err) {
      notifications.show({
        title: 'Failed to Add Collection to Group',
        message: extractErrorMessage(err, 'Failed to update collection.'),
        color: 'red',
      });
      throw err;
    }
  };

  // Remove document with group sync
  const handleRemoveDoc = async (id) => {
    try {
      await removeDocument(id);
      if (isViewingGroupHub && selectedGroupId) {
        await selectGroup(selectedGroupId);
      }
      await refreshDocuments();
      await loadGroups();
      setCollectionsVersion((v) => v + 1);
    } catch (err) {
      console.error('handleRemoveDoc error:', err);
    }
  };

  // Batch Move multiple documents to another collection or inbox
  const handleBatchMoveDocs = async (docIds, targetColId) => {
    try {
      const res = await batchMoveDocuments(docIds, targetColId);
      await refreshDocuments();
      await loadGroups();
      setCollectionsVersion((v) => v + 1);
      notifications.show({
        title: 'Files Moved',
        message: res.message || `Moved ${docIds.length} file(s).`,
        color: 'teal',
      });
      return res;
    } catch (err) {
      notifications.show({
        title: 'Batch Move Failed',
        message: extractErrorMessage(err, 'Failed to move selected files.'),
        color: 'red',
      });
      throw err;
    }
  };

  // Batch Permanently Delete multiple documents
  const handleBatchDeleteDocs = async (docIds) => {
    try {
      const res = await batchDeleteDocuments(docIds);
      if (currentDoc && docIds.includes(currentDoc.id)) {
        closeDocument();
      }
      await refreshDocuments();
      await loadGroups();
      setCollectionsVersion((v) => v + 1);
      notifications.show({
        title: 'Files Deleted',
        message: `Permanently removed ${res.deletedCount || docIds.length} file(s) from database and Telegram.`,
        color: 'gray',
      });
      return res;
    } catch (err) {
      notifications.show({
        title: 'Batch Delete Failed',
        message: extractErrorMessage(err, 'Failed to delete selected files.'),
        color: 'red',
      });
      throw err;
    }
  };

  // Calculate files belonging to the active collection context
  const activeCollectionFiles = useMemo(() => {
    const list = Array.isArray(documents) ? documents : [];
    if (isViewingCollectionHub && selectedCollection) {
      return list.filter((d) => d.collectionId === selectedCollection.id);
    }
    if (currentDoc?.collectionId) {
      return list.filter((d) => d.collectionId === currentDoc.collectionId);
    }
    return [];
  }, [documents, isViewingCollectionHub, selectedCollection, currentDoc]);

  return (
    <>
      <WorkspaceLayout
        sidebarProps={{
          documents,
          selectedDocId: isViewingCollectionHub || isViewingGroupHub ? null : selectedDocId,
          selectedCollectionId: isViewingCollectionHub && selectedCollection ? selectedCollection.id : null,
          groups,
          selectedGroupId: isViewingGroupHub ? selectedGroupId : null,
          collectionsVersion,
          onSelectDoc: handleSelectDoc,
          onSelectCollection: handleSelectCollection,
          onSelectGroup: handleSelectGroup,
          onCreateGroup: handleCreateGroup,
          onUpdateGroup: handleUpdateGroup,
          onDeleteGroup: handleDeleteGroup,
          onReorderGroups: reorderGroupsInState,
          onDeleteDoc: handleRemoveDoc,
          onRenameDoc: renameDocument,
          onAssignCollection: handleAssignDocumentCollection,
          onUpdateCollection: handleUpdateCollection,
          onDeleteCollection: handleDeleteCollection,
          onOpenUpload: handleOpenUpload,
          status,
          statusLoading,
        }}
        topbarProps={{
          onOpenUploadModal: () => handleOpenUpload(null),
          onIngestGoogleLink: ingestLink,
          isIngesting: isProcessing,
        }}
      >
        <ViewerContainer
          document={currentDoc}
          content={currentContent}
          loading={loadingContent || (isViewingGroupHub && loadingGroupDetail)}
          collection={selectedCollection}
          collectionFiles={activeCollectionFiles}
          allDocuments={documents}
          isViewingCollectionHub={isViewingCollectionHub}
          group={currentGroup}
          isViewingGroupHub={isViewingGroupHub}
          onSelectCollection={handleSelectCollection}
          onSelectFile={handleSelectDoc}
          onDeleteFile={handleRemoveDoc}
          onRenameFile={renameDocument}
          onOpenCollectionHub={handleOpenCollectionHub}
          onOpenUpload={(target) => handleOpenUpload(target || (isViewingCollectionHub ? selectedCollection : null))}
          onUpdateCollection={handleUpdateCollection}
          onDeleteCollection={handleDeleteCollection}
          onUpdateGroup={handleUpdateGroup}
          onDeleteGroup={handleDeleteGroup}
          onCreateCollectionInGroup={handleCreateCollectionInGroup}
          onAssignCollectionToGroup={handleAssignCollectionToGroup}
          onBatchMoveFiles={handleBatchMoveDocs}
          onBatchDeleteFiles={handleBatchDeleteDocs}
          onCloseFile={handleCloseDoc}
          isProcessing={isProcessing}
        />
      </WorkspaceLayout>

      <IngestionModal
        opened={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false);
          setUploadTargetCollection(null);
          refreshDocuments();
          loadGroups();
          setCollectionsVersion((v) => v + 1);
        }}
        targetCollection={uploadTargetCollection}
        onUploadFile={uploadFile}
        onIngestGoogleLink={ingestLink}
        isProcessing={isProcessing}
        uploadProgress={uploadProgress}
        uploadStatusText={uploadStatusText}
        error={uploadError}
        onClearError={clearError}
        onRefreshVault={refreshDocuments}
        onSuccessNavigate={async (docs, content, col) => {
          const docList = Array.isArray(docs) ? docs : [docs];
          addDocument(docs, content);
          await refreshDocuments();
          await loadGroups();
          setCollectionsVersion((v) => v + 1);

          if (col) {
            setSelectedCollection(col);
            setIsViewingCollectionHub(true);
            setIsViewingGroupHub(false);
          } else if (docList.length > 0) {
            handleSelectDoc(docList[0].id);
          }
        }}
      />
    </>
  );
}

export default function App() {
  const { isAuthenticated, loading: authLoading } = useAuth();

  // If verifying token, show splash loader
  if (authLoading) {
    return (
      <Box
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
        }}
      >
        <Stack align="center" gap="sm">
          <Loader color="blue" size="lg" />
          <Text size="sm" c="gray.4" fw={500}>
            Verifying Zero-Knowledge Vault Session...
          </Text>
        </Stack>
      </Box>
    );
  }

  // Dedicated Login & Security Portal
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return <VaultWorkspace />;
}
