import { useState, useEffect, useCallback, useRef } from 'react';
import { getDocuments, getDocumentContent, deleteDocument, updateDocument } from '../services/apiClient';
import { notifications } from '@mantine/notifications';
import { extractErrorMessage } from '../utils/formatters';

const MAX_CACHE_ITEMS = 40;

export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [currentContent, setCurrentContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);

  // In-memory LRU document content cache to eliminate duplicate API requests
  const contentCacheRef = useRef(new Map());
  // Active request tracking to cancel obsolete asynchronous requests
  const activeRequestIdRef = useRef(0);

  // Cache helper: set item with LRU pruning
  const setCachedContent = useCallback((id, data) => {
    if (!id || !data) return;
    const cache = contentCacheRef.current;
    if (cache.has(id)) {
      cache.delete(id);
    } else if (cache.size >= MAX_CACHE_ITEMS) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }
    cache.set(id, data);
  }, []);

  // Load vault document index
  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const docs = await getDocuments();
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch (err) {
      console.error('Failed to load documents:', err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Select document and fetch content with LRU caching and obsolete request cancellation
  const selectDocument = useCallback(
    async (id) => {
      if (!id) {
        setSelectedDocId(null);
        setCurrentDoc(null);
        setCurrentContent(null);
        setLoadingContent(false);
        return;
      }

      if (id === selectedDocId && currentDoc) return;

      const target = documents.find((d) => d.id === id);
      setSelectedDocId(id);
      setCurrentDoc(target || null);

      const ext = (target?.filename || target?.title || '').split('.').pop().toLowerCase();
      const isMedia =
        ['image', 'video', 'audio', 'media'].includes(target?.format) ||
        ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp', 'ico', 'tiff', 'avif', 'mp4', 'webm', 'mov', 'mp3', 'wav', 'ogg'].includes(ext);

      // Fast-path: Check in-memory cache for immediate zero-latency content delivery
      const cached = contentCacheRef.current.get(id);
      if (cached && !isMedia) {
        setCurrentDoc(cached.metadata || target);
        setCurrentContent(cached.content);
        setLoadingContent(false);
        return;
      }

      // For media/image files, the viewer streams directly via /view without needing blocking content parsing
      if (!isMedia) {
        setCurrentContent(null);
        setLoadingContent(true);
      }

      const currentReqId = ++activeRequestIdRef.current;

      try {
        const res = await getDocumentContent(id);

        // Cancel obsolete response if user has already selected a different document
        if (activeRequestIdRef.current !== currentReqId) {
          return;
        }

        const freshDoc = res.metadata || target;
        setCurrentDoc(freshDoc);
        setCurrentContent(res.content);

        // Cache document content for instant subsequent views
        if (!isMedia && res.content) {
          setCachedContent(id, { content: res.content, metadata: freshDoc });
        }
      } catch (err) {
        if (activeRequestIdRef.current === currentReqId && !isMedia) {
          notifications.show({
            title: 'Error Loading Document',
            message: extractErrorMessage(err, 'Operation failed.'),
            color: 'red',
          });
        }
      } finally {
        if (activeRequestIdRef.current === currentReqId) {
          setLoadingContent(false);
        }
      }
    },
    [documents, selectedDocId, currentDoc, setCachedContent]
  );

  // Explicit helper to close/deselect the current document
  const closeDocument = useCallback(() => {
    setSelectedDocId(null);
    setCurrentDoc(null);
    setCurrentContent(null);
    setLoadingContent(false);
  }, []);

  // Add or update document(s) locally (Supports single or batch array)
  const addDocument = useCallback((docOrDocs, content) => {
    if (!docOrDocs) return;
    const docList = Array.isArray(docOrDocs) ? docOrDocs : [docOrDocs];
    if (docList.length === 0) return;

    setDocuments((prev) => {
      const newIds = new Set(docList.map((d) => d.id));
      const filtered = prev.filter((d) => !newIds.has(d.id));
      return [...docList, ...filtered];
    });

    const activeDoc = docList[0];
    setSelectedDocId(activeDoc.id);
    setCurrentDoc(activeDoc);
    if (content) {
      setCurrentContent(content);
      setCachedContent(activeDoc.id, { content, metadata: activeDoc });
    }
  }, [setCachedContent]);

  // Remove document from Telegram vault and index
  const removeDocument = useCallback(
    async (id) => {
      try {
        await deleteDocument(id);
        // Invalidate cache entry
        contentCacheRef.current.delete(id);
        setDocuments((prev) => prev.filter((d) => d.id !== id));

        if (selectedDocId === id) {
          setSelectedDocId(null);
          setCurrentDoc(null);
          setCurrentContent(null);
        }

        notifications.show({
          title: 'Deleted from Vault',
          message: 'File removed from database and Telegram.',
          color: 'gray',
        });
        return true;
      } catch (err) {
        notifications.show({
          title: 'Delete Failed',
          message: extractErrorMessage(err, 'Operation failed.'),
          color: 'red',
        });
        throw err;
      }
    },
    [selectedDocId]
  );

  // Rename document title and filename
  const renameDocument = useCallback(
    async (id, newTitle) => {
      const trimmed = (newTitle || '').trim();
      if (!trimmed) return;
      try {
        const target = documents.find((d) => d.id === id);
        const ext = target?.filename ? target.filename.split('.').pop() : '';
        const newFilename = ext && !trimmed.toLowerCase().endsWith(`.${ext.toLowerCase()}`)
          ? `${trimmed}.${ext}`
          : trimmed;

        const updated = await updateDocument(id, {
          title: trimmed.replace(/\.[^/.]+$/, ''),
          filename: newFilename,
        });

        setDocuments((prev) =>
          prev.map((d) => (d.id === id ? { ...d, ...updated } : d))
        );

        if (currentDoc && currentDoc.id === id) {
          setCurrentDoc((prev) => ({ ...prev, ...updated }));
        }

        // Update cached metadata if present
        const cached = contentCacheRef.current.get(id);
        if (cached) {
          contentCacheRef.current.set(id, {
            ...cached,
            metadata: { ...(cached.metadata || target), ...updated },
          });
        }

        notifications.show({
          title: 'Renamed Successfully',
          message: `File renamed to "${updated.title}".`,
          color: 'teal',
        });
        return updated;
      } catch (err) {
        notifications.show({
          title: 'Rename Failed',
          message: extractErrorMessage(err, 'Operation failed.'),
          color: 'red',
        });
        throw err;
      }
    },
    [documents, currentDoc]
  );

  return {
    documents,
    selectedDocId,
    currentDoc,
    currentContent,
    loading,
    loadingContent,
    selectDocument,
    closeDocument,
    addDocument,
    removeDocument,
    renameDocument,
    refreshDocuments: loadDocuments,
  };
}

