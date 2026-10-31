import { useState, useCallback } from 'react';
import { uploadDocument, ingestGoogleLink, getDocuments } from '../services/apiClient';
import { notifications } from '@mantine/notifications';
import { extractErrorMessage } from '../utils/formatters';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB limit with smart auto-compression
const BATCH_SIZE = 2; // Process in small batches of 2 files to prevent HTTP timeouts & Telegram rate limits

export function useUpload(onSuccess) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [error, setError] = useState('');

  const clearError = useCallback(() => setError(''), []);

  // Auto-reconciliation: Verify if files actually landed in the vault when a network timeout occurs
  const verifyVaultDocuments = async (uploadedFilenames, collectionId) => {
    try {
      const docs = await getDocuments(collectionId ? { collectionId } : {});
      const now = Date.now();
      const matched = docs.filter((d) => {
        const isNameMatch = uploadedFilenames.some((fname) => {
          const baseName = fname.replace(/\.[^/.]+$/, '');
          return (
            fname === d.originalFilename ||
            fname === d.filename ||
            d.title === baseName ||
            (d.title && fname.startsWith(d.title))
          );
        });
        const isRecent = d.createdAt && now - new Date(d.createdAt).getTime() < 10 * 60 * 1000;
        return isNameMatch && isRecent;
      });
      return matched;
    } catch (checkErr) {
      console.warn('Vault auto-reconciliation check error:', checkErr);
      return [];
    }
  };

  // Upload local file(s)
  const uploadFile = useCallback(
    async (fileOrFiles, options = {}) => {
      setError('');
      setUploadStatusText('');

      if (!fileOrFiles) return;
      const fileList = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
      if (fileList.length === 0) return;

      // 50 MB size validation per file
      for (const f of fileList) {
        if (f.size > MAX_FILE_SIZE) {
          const msg = `File "${f.name}" (${(f.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 50 MB limit.`;
          setError(msg);
          throw new Error(msg);
        }
      }

      setIsProcessing(true);
      setUploadProgress(5);
      setUploadStatusText(
        fileList.length > 1
          ? `Preparing ${fileList.length} files for upload & encryption...`
          : `Preparing "${fileList[0].name}"...`
      );

      const allCreatedDocs = [];
      let firstContent = null;
      const totalFiles = fileList.length;

      try {
        // Chunk into small batches to guarantee fast processing and prevent timeouts
        for (let b = 0; b < totalFiles; b += BATCH_SIZE) {
          const chunk = fileList.slice(b, b + BATCH_SIZE);
          const startIdx = b + 1;
          const endIdx = Math.min(b + BATCH_SIZE, totalFiles);
          const label =
            totalFiles > 1
              ? `Encrypting & saving files ${startIdx}${endIdx > startIdx ? `-${endIdx}` : ''} of ${totalFiles}...`
              : `Encrypting & saving "${chunk[0].name}"...`;

          setUploadStatusText(label);

          let chunkRes = null;
          try {
            chunkRes = await uploadDocument(
              chunk,
              (percent) => {
                const baseProgress = Math.round((b / totalFiles) * 100);
                const chunkWeight = (chunk.length / totalFiles) * 100;
                const overallPercent = Math.min(98, Math.round(baseProgress + (percent * chunkWeight) / 100));
                setUploadProgress(overallPercent);
              },
              options
            );
          } catch (err) {
            const isTimeout =
              err.code === 'ECONNABORTED' ||
              (typeof err.message === 'string' &&
                (err.message.toLowerCase().includes('timeout') || err.message.includes('exceeded')));

            if (isTimeout) {
              // Wait 2.5s for server event-loop write to finalize, then auto-reconcile
              setUploadStatusText('Verifying server synchronization...');
              await new Promise((r) => setTimeout(r, 2500));
              const recovered = await verifyVaultDocuments(
                chunk.map((f) => f.name),
                options.collectionId
              );

              if (recovered && recovered.length > 0) {
                console.log(`[useUpload] Auto-reconciled ${recovered.length} files that saved in background.`);
                chunkRes = {
                  success: true,
                  documents: recovered,
                  document: recovered[0],
                };
              } else {
                throw err;
              }
            } else {
              throw err;
            }
          }

          if (chunkRes) {
            const docs = chunkRes.documents || (chunkRes.document ? [chunkRes.document] : []);
            allCreatedDocs.push(...docs);
            if (!firstContent && chunkRes.content) {
              firstContent = chunkRes.content;
            }
          }

          const completedPercent = Math.min(99, Math.round((endIdx / totalFiles) * 100));
          setUploadProgress(completedPercent);
        }

        setUploadProgress(100);
        setUploadStatusText('Upload complete! Finalizing vault records...');

        const finalResult = {
          success: true,
          count: allCreatedDocs.length,
          documents: allCreatedDocs,
          document: allCreatedDocs[0],
          content: firstContent,
        };

        if (allCreatedDocs.length > 1) {
          notifications.show({
            title: `${allCreatedDocs.length} Files Saved to Vault`,
            message: `Each file encrypted with individual AES-256 keys & archived in Telegram + MongoDB.`,
            color: 'teal',
          });
        } else if (allCreatedDocs[0]) {
          const doc = allCreatedDocs[0];
          const scopeLabel = doc.scope === 'personal' ? 'Personal' : 'Work';
          const groupLabel = doc.taxonomy?.group ? ` [${doc.taxonomy.group}]` : '';

          notifications.show({
            title: `Document Saved to Vault (${scopeLabel})`,
            message: `"${doc.title}"${groupLabel} encrypted & archived in Telegram + MongoDB.`,
            color: 'teal',
          });
        }

        if (onSuccess) {
          onSuccess(allCreatedDocs.length > 1 ? allCreatedDocs : allCreatedDocs[0], firstContent);
        }

        return finalResult;
      } catch (err) {
        // Even if an error was thrown on later files, preserve any files that already succeeded
        if (allCreatedDocs.length > 0) {
          notifications.show({
            title: 'Partial Upload Saved',
            message: `${allCreatedDocs.length} of ${fileList.length} files were successfully saved to the vault.`,
            color: 'yellow',
          });
          const partialResult = {
            success: true,
            count: allCreatedDocs.length,
            documents: allCreatedDocs,
            document: allCreatedDocs[0],
            content: firstContent,
          };
          if (onSuccess) {
            onSuccess(allCreatedDocs, firstContent);
          }
          return partialResult;
        }

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
        setUploadStatusText('');
      }
    },
    [onSuccess]
  );

  // Ingest Google Link
  const ingestLink = useCallback(
    async (url, title = '', options = {}) => {
      setError('');
      setUploadStatusText('');
      if (!url || !url.trim()) return;

      try {
        setIsProcessing(true);
        setUploadStatusText(`Fetching "${title || 'Google Doc'}"...`);
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
        setUploadStatusText('');
      }
    },
    [onSuccess]
  );

  return {
    isProcessing,
    uploadProgress,
    uploadStatusText,
    error,
    clearError,
    uploadFile,
    ingestLink,
  };
}

