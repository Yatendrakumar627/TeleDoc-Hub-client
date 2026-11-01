import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT, UPLOAD_TIMEOUT } from '../config';

const TOKEN_KEY = 'teledoc_vault_jwt';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
});

// Interceptor: Inject JWT token into every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: Handle 401 Unauthorized sessions
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/register') && !url.includes('/auth/status')) {
        localStorage.removeItem(TOKEN_KEY);
        window.dispatchEvent(new CustomEvent('teledoc_auth_expired'));
      }
    }
    return Promise.reject(error);
  }
);

// ===================== AUTHENTICATION API =====================

export const loginUser = async (email, password) => {
  const res = await apiClient.post('/auth/login', { email, password });
  if (res.data.token) {
    localStorage.setItem(TOKEN_KEY, res.data.token);
  }
  return res.data;
};

export const registerUser = async (data) => {
  const res = await apiClient.post('/auth/register', data);
  if (res.data.token) {
    localStorage.setItem(TOKEN_KEY, res.data.token);
  }
  return res.data;
};

export const getCurrentUser = async () => {
  const res = await apiClient.get('/auth/me');
  return res.data.user;
};

export const getAuthStatus = async () => {
  const res = await apiClient.get('/auth/status');
  return res.data;
};

export const logoutUser = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const getStoredToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getStatus = async () => {
  const res = await apiClient.get('/status');
  return res.data;
};

export const getDocuments = async (filters = {}) => {
  const res = await apiClient.get('/documents', { params: filters });
  return res.data.documents || [];
};

export const getDocumentContent = async (id) => {
  const res = await apiClient.get(`/documents/${id}`);
  return res.data;
};

export const uploadDocument = async (fileOrFiles, onProgress = null, options = {}) => {
  const formData = new FormData();
  const fileList = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
  fileList.forEach((file) => {
    formData.append('files', file);
  });

  if (options.scope) formData.append('scope', options.scope);
  if (options.group) formData.append('group', options.group);
  if (options.securityLevel) formData.append('securityLevel', options.securityLevel);
  if (options.documentDate) formData.append('documentDate', options.documentDate);
  if (options.collectionId) formData.append('collectionId', options.collectionId);
  if (options.collectionName) formData.append('collectionName', options.collectionName);

  // Dynamic timeout: scales with file count so large batches have ample processing headroom
  const dynamicTimeout = Math.max(UPLOAD_TIMEOUT, fileList.length * 60000);

  const res = await apiClient.post('/documents/upload', formData, {
    timeout: dynamicTimeout,
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });

  return res.data;
};

export const uploadFiles = uploadDocument;

export const ingestGoogleLink = async (url, title = '', options = {}) => {
  const res = await apiClient.post('/google/ingest', { url, title, ...options });
  return res.data;
};

export const deleteDocument = async (id) => {
  const res = await apiClient.delete(`/documents/${id}`);
  return res.data;
};

export const reorderDocuments = async (orderedIds) => {
  const res = await apiClient.put('/documents/reorder', { orderedIds });
  return res.data;
};

// ===================== COLLECTIONS =====================

export const getCollections = async (scope = 'all') => {
  const res = await apiClient.get('/collections', { params: { scope } });
  return res.data.collections || [];
};

export const getCollection = async (id) => {
  const res = await apiClient.get(`/collections/${id}`);
  return res.data.collection;
};

export const createCollection = async (data) => {
  const res = await apiClient.post('/collections', data);
  return res.data.collection;
};

export const updateCollection = async (id, updates) => {
  const res = await apiClient.patch(`/collections/${id}`, updates);
  return res.data.collection;
};

export const deleteCollection = async (id, cascade = false) => {
  const res = await apiClient.delete(`/collections/${id}`, { params: { cascade } });
  return res.data;
};

export const reorderCollections = async (orderedIds) => {
  const res = await apiClient.put('/collections/reorder', { orderedIds });
  return res.data;
};

export const assignDocumentCollection = async (docId, collectionId, collectionName) => {
  const res = await apiClient.patch(`/documents/${docId}/collection`, {
    collectionId,
    collectionName,
  });
  return res.data.document;
};

export const batchMoveDocuments = async (documentIds, collectionId) => {
  const res = await apiClient.post('/documents/batch-move', {
    documentIds,
    collectionId,
  });
  return res.data;
};

export const batchDeleteDocuments = async (documentIds) => {
  const res = await apiClient.post('/documents/batch-delete', {
    documentIds,
  });
  return res.data;
};

export const updateDocument = async (docId, updates) => {
  const res = await apiClient.patch(`/documents/${docId}`, updates);
  return res.data.document;
};

// ===================== GROUPS (FILES & COLLECTIONS TAXONOMY) =====================

export const getGroups = async (scope = 'all') => {
  const res = await apiClient.get('/groups', { params: { scope } });
  return res.data.groups || [];
};

export const getGroup = async (id) => {
  const res = await apiClient.get(`/groups/${id}`);
  return res.data.group;
};

export const createGroup = async (data) => {
  const res = await apiClient.post('/groups', data);
  return res.data.group;
};

export const updateGroup = async (id, updates) => {
  const res = await apiClient.patch(`/groups/${id}`, updates);
  return res.data.group;
};

export const deleteGroup = async (id, cascade = false) => {
  const res = await apiClient.delete(`/groups/${id}`, { params: { cascade } });
  return res.data;
};

export const reorderGroups = async (orderedIds) => {
  const res = await apiClient.put('/groups/reorder', { orderedIds });
  return res.data;
};

export const assignCollectionGroup = async (collectionId, groupId, groupName) => {
  const res = await apiClient.patch(`/collections/${collectionId}/group`, {
    groupId,
    groupName,
  });
  return res.data.collection;
};

export const assignDocumentGroup = async (docId, groupId, groupName) => {
  const res = await apiClient.patch(`/documents/${docId}/group`, {
    groupId,
    groupName,
  });
  return res.data.document;
};

export const assignToGroup = async (targetType, targetId, groupId, groupName) => {
  const res = await apiClient.post('/groups/assign', {
    targetType,
    targetId,
    groupId,
    groupName,
  });
  return res.data.item;
};

export const batchAssignToGroup = async (targetType, targetIds, groupId, groupName) => {
  const res = await apiClient.post('/groups/batch-assign', {
    targetType,
    targetIds,
    groupId,
    groupName,
  });
  return res.data;
};

// ===================== ANALYTICS =====================

export const getTimelineAnalytics = async (scope = 'all') => {
  const res = await apiClient.get('/analytics/timeline', { params: { scope } });
  return res.data.timeline || [];
};

export const getGroupAnalytics = async (scope = 'all') => {
  const res = await apiClient.get('/analytics/groups', { params: { scope } });
  return res.data.groups || [];
};

export default apiClient;
