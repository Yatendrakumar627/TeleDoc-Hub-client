import { useState, useCallback } from 'react';
import { uploadDocument, ingestGoogleLink } from '../services/apiClient';
import { notifications } from '@mantine/notifications';
import { extractErrorMessage } from '../utils/formatters';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB Telegram limit

export function useUpload(onSuccess) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const clearError = useCallback(() => setError(''), []);

  // Upload local file(s)
  const uploadFile = useCallback(
    async (fileOrFiles, options = {}) => {
      setError('');

      if (!fileOrFiles) return;
      const fileList = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
      if (fileList.length === 0) return;

      // 20 MB size validation per file
      for (const f of fileList) {
        if (f.size > MAX_FILE_SIZE) {
          const msg = `File "${f.name}" (${(f.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 20 MB Telegram limit.`;
          setError(msg);
          throw new Error(msg);
        }
      }

      try {
        setIsProcessing(true);
        setUploadProgress(10);

        const res = await uploadDocument(
          fileList,
          (progress) => {
            setUploadProgress(progress);
          },
          options
        );

        const docList = res.documents || (res.document ? [res.document] : []);

        if (docList.length > 1) {
          notifications.show({
            title: `${docList.length} Files Saved to Vault`,
            message: `Each file encrypted with individual AES-256 keys & archived in Telegram + MongoDB.`,
            color: 'teal',
          });
        } else if (res.document) {
          const scopeLabel = res.document.scope === 'personal' ? 'Personal' : 'Work';
          const groupLabel = res.document.taxonomy?.group ? ` [${res.document.taxonomy.group}]` : '';

          notifications.show({
            title: `Document Saved to Vault (${scopeLabel})`,
            message: `"${res.document.title}"${groupLabel} encrypted & archived in Telegram + MongoDB.`,
            color: 'teal',
          });
        }

        if (onSuccess) {
          onSuccess(docList.length > 1 ? docList : res.document, res.content);
        }

        return res;
      } catch (err) {
        const msg = extractErrorMessage(err, 'Upload failed.');
        setError(msg);
        notifications.show({
          title: 'Upload Failed',
          message: msg,
          color: 'red',
        });
        throw err;
      } finally {
        setIsProcessing(false);
        setUploadProgress(0);
      }
    },
    [onSuccess]
  );

  // Ingest Google Link
  const ingestLink = useCallback(
    async (url, title = '', options = {}) => {
      setError('');
      if (!url || !url.trim()) return;

      try {
        setIsProcessing(true);
        const res = await ingestGoogleLink(url.trim(), title.trim(), options);

        notifications.show({
          title: 'Google Link Ingested',
          message: `Snapshot of "${res.document.title}" archived in Telegram Vault.`,
          color: 'teal',
        });

        if (onSuccess) {
          onSuccess(res.document, res.content);
        }

        return res;
      } catch (err) {
        const msg = extractErrorMessage(err, 'Upload failed.');
        setError(msg);
        notifications.show({
          title: 'Ingestion Error',
          message: msg,
          color: 'red',
        });
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [onSuccess]
  );

  return {
    isProcessing,
    uploadProgress,
    error,
    clearError,
    uploadFile,
    ingestLink,
  };
}

