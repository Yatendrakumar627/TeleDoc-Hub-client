import React, { Suspense, lazy } from 'react';
import StateFallback from '../../components/ui/StateFallback';
import CollectionNavBar from '../collection/CollectionNavBar';

// Route/Feature Level Code Splitting: Lazy load heavy format viewers and hubs
const DocReader = lazy(() => import('./DocReader'));
const PdfViewer = lazy(() => import('./PdfViewer'));
const WordViewer = lazy(() => import('./WordViewer'));
const PresentationViewer = lazy(() => import('./PresentationViewer'));
const SheetTable = lazy(() => import('./SheetTable'));
const MediaBinaryViewer = lazy(() => import('./MediaBinaryViewer'));
const EmptyState = lazy(() => import('../../components/EmptyState'));
const CollectionHubView = lazy(() => import('../collection/CollectionHubView'));
const GroupHubView = lazy(() => import('../group/GroupHubView'));

export default function ViewerContainer({
  document,
  content,
  loading = false,
  collection = null,
  collectionFiles = [],
  allDocuments = [],
  groups = [],
  status = null,
  isViewingCollectionHub = false,
  group = null,
  isViewingGroupHub = false,
  onSelectCollection,
  onSelectFile,
  onDeleteFile,
  onRenameFile,
  onOpenCollectionHub,
  onOpenUpload,
  onUpdateCollection,
  onDeleteCollection,
  onUpdateGroup,
  onDeleteGroup,
  onCreateCollectionInGroup,
  onAssignCollectionToGroup,
  onBatchMoveFiles,
  onBatchDeleteFiles,
  onCloseFile,
  onNavigateHome,
  isProcessing = false,
}) {
  // Only show full fallback if no document metadata exists yet
  if (loading && !document) {
    return (
      <StateFallback
        type="loading"
        message="Decrypting and loading document..."
        height={450}
      />
    );
  }

  // 1. Viewing Group Overview Hub (Collections + Files in Group)
  if (isViewingGroupHub) {
    if (!group) {
      return (
        <StateFallback
          type="loading"
          message="Loading Group Overview & Members..."
          height={450}
        />
      );
    }
    return (
      <Suspense fallback={<StateFallback type="loading" message="Loading Group Overview..." height={450} />}>
        <GroupHubView
          group={group}
          onSelectCollection={onSelectCollection}
          onSelectFile={onSelectFile}
          onDeleteFile={onDeleteFile}
          onOpenUpload={onOpenUpload}
          onUpdateGroup={onUpdateGroup}
          onDeleteGroup={onDeleteGroup}
          onCreateCollectionInGroup={onCreateCollectionInGroup}
          onAssignCollectionToGroup={onAssignCollectionToGroup}
          onBatchMoveFiles={onBatchMoveFiles}
          onBatchDeleteFiles={onBatchDeleteFiles}
          onNavigateHome={onNavigateHome}
        />
      </Suspense>
    );
  }

  // 2. Viewing Collection Overview Hub
  if (isViewingCollectionHub) {
    if (!collection) {
      return (
        <StateFallback
          type="loading"
          message="Loading Collection Overview..."
          height={450}
        />
      );
    }
    return (
      <Suspense fallback={<StateFallback type="loading" message="Loading Collection Overview..." height={450} />}>
        <CollectionHubView
          collection={collection}
          files={collectionFiles}
          onSelectFile={onSelectFile}
          onDeleteFile={onDeleteFile}
          onOpenUpload={onOpenUpload}
          onUpdateCollection={onUpdateCollection}
          onDeleteCollection={onDeleteCollection}
          onBatchMoveFiles={onBatchMoveFiles}
          onBatchDeleteFiles={onBatchDeleteFiles}
          onNavigateHome={onNavigateHome}
        />
      </Suspense>
    );
  }

  // 3. Vault Command Center (Dashboard when no document is active)
  if (!document) {
    return (
      <Suspense fallback={<StateFallback type="loading" message="Loading Vault Command Center..." height={450} />}>
        <EmptyState
          onOpenUpload={onOpenUpload}
          isProcessing={isProcessing}
          allDocuments={allDocuments}
          groups={groups}
          status={status}
          onSelectFile={onSelectFile}
          onSelectCollection={onSelectCollection}
          onOpenCollectionHub={onOpenCollectionHub}
        />
      </Suspense>
    );
  }

  // 3. Document Reader with Top Collection Strip
  const docType = (document?.type || '').toLowerCase();
  const format = (content?.format || document?.format || '').toLowerCase();

  const isPdf = format === 'pdf' || docType === 'pdf';
  const isWord = format === 'docx' || ['docx', 'doc'].includes(docType);
  const isPresentation = format === 'presentation' || ['pptx', 'ppt'].includes(docType);
  const isSpreadsheet = format === 'spreadsheet' || ['xlsx', 'xls', 'csv', 'tsv', 'ods'].includes(docType);
  const isMediaOrBinary =
    ['image', 'media', 'video', 'audio', 'archive', 'binary'].includes(format) ||
    ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp', 'ico', 'tiff', 'avif', 'mp4', 'webm', 'mov', 'mkv', 'avi', 'mp3', 'wav', 'ogg', 'm4a', 'flac', 'zip', 'tar', 'gz'].includes(docType);

  return (
    <div>
      {/* Top Collection Strip Bar if part of a multi-file collection */}
      <CollectionNavBar
        collectionName={document.collectionName}
        files={collectionFiles}
        currentDocId={document.id}
        onSelectFile={onSelectFile}
        onOpenCollectionHub={onOpenCollectionHub}
        onCloseFile={onCloseFile}
        onNavigateHome={onNavigateHome}
      />

      {/* Enterprise Multi-Format High-Fidelity Viewer (Lazy loaded on demand) */}
      <Suspense fallback={<StateFallback type="loading" message="Loading document viewer..." height={450} />}>
        {isPdf ? (
          <PdfViewer document={document} content={content} onRenameFile={onRenameFile} onCloseFile={onCloseFile} />
        ) : isWord ? (
          <WordViewer document={document} content={content} onRenameFile={onRenameFile} onCloseFile={onCloseFile} />
        ) : isPresentation ? (
          <PresentationViewer document={document} content={content} onRenameFile={onRenameFile} onCloseFile={onCloseFile} />
        ) : isSpreadsheet ? (
          <SheetTable document={document} content={content} onRenameFile={onRenameFile} onCloseFile={onCloseFile} />
        ) : isMediaOrBinary ? (
          <MediaBinaryViewer
            document={document}
            content={content}
            collectionFiles={collectionFiles && collectionFiles.length > 0 ? collectionFiles : allDocuments}
            onSelectFile={onSelectFile}
            onRenameFile={onRenameFile}
            onCloseFile={onCloseFile}
          />
        ) : (
          <DocReader document={document} content={content} onRenameFile={onRenameFile} onCloseFile={onCloseFile} />
        )}
      </Suspense>
    </div>
  );
}
