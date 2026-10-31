import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  timeout: 45000,
});

export const getStatus = async () => {
  const res = await API.get('/status');
  return res.data;
};

export const getDocuments = async (filters = {}) => {
  const res = await API.get('/documents', { params: filters });
  return res.data.documents || [];
};

export const getDocumentContent = async (id) => {
  const res = await API.get(`/documents/${id}`);
  return res.data;
};

export const uploadDocument = async (file, onProgress = null, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  if (options.scope) formData.append('scope', options.scope);
  if (options.group) formData.append('group', options.group);
  if (options.securityLevel) formData.append('securityLevel', options.securityLevel);
  if (options.documentDate) formData.append('documentDate', options.documentDate);
  if (options.collectionId) formData.append('collectionId', options.collectionId);
  if (options.collectionName) formData.append('collectionName', options.collectionName);

  const res = await API.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });

  return res.data;
};

export const ingestGoogleLink = async (url, title = '', options = {}) => {
  const res = await API.post('/google-link', { url, title, ...options });
  return res.data;
};

export const deleteDocument = async (id) => {
  const res = await API.delete(`/documents/${id}`);
  return res.data;
};

export const getCollections = async (scope = 'all') => {
  const res = await API.get('/collections', { params: { scope } });
  return res.data.collections || [];
};

export const getCollection = async (id) => {
  const res = await API.get(`/collections/${id}`);
  return res.data.collection;
};

export const createCollection = async (data) => {
  const res = await API.post('/collections', data);
  return res.data.collection;
};

export const updateCollection = async (id, updates) => {
  const res = await API.patch(`/collections/${id}`, updates);
  return res.data.collection;
};

export const deleteCollection = async (id, cascade = false) => {
  const res = await API.delete(`/collections/${id}`, { params: { cascade } });
  return res.data;
};

export const assignDocumentCollection = async (docId, collectionId, collectionName) => {
  const res = await API.patch(`/documents/${docId}/collection`, {
    collectionId,
    collectionName,
  });
  return res.data.document;
};

export const batchMoveDocuments = async (documentIds, collectionId) => {
  const res = await API.post('/documents/batch-move', {
    documentIds,
    collectionId,
  });
  return res.data;
};

export const updateDocument = async (docId, updates) => {
  const res = await API.patch(`/documents/${docId}`, updates);
  return res.data.document;
};

export const getTimelineAnalytics = async (scope = 'all') => {
  const res = await API.get('/analytics/timeline', { params: { scope } });
  return res.data.timeline || [];
};

export const getGroupAnalytics = async (scope = 'all') => {
  const res = await API.get('/analytics/groups', { params: { scope } });
  return res.data.groups || [];
};

export default API;
