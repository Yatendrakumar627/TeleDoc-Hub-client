import { useState, useCallback } from 'react';
import { uploadDocument, ingestGoogleLink, getDocuments } from '../services/apiClient';
import { notifications } from '@mantine/notifications';
import { extractErrorMessage } from '../utils/formatters';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB limit with smart auto-compression
const BATCH_SIZE = 1; // Atomic single-file pipeline: ensures per-file resilience, eliminates memory spikes, & enables exact failure tracking

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

  // Upload local file(s) with full resilience for 200+ files
  const uploadFile = useCallback(
    async (fileOrFiles, options = {}) => {
      setError('');
      setUploadStatusText('');

      if (!fileOrFiles) return null;
      const fileList = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
      if (fileList.length === 0) return null;

      // 50 MB size validation per file
      const validFiles = [];
      const oversizedFiles = [];
      for (const f of fileList) {
        if (f.size > MAX_FILE_SIZE) {
          oversizedFiles.push({
            file: f,
            filename: f.name,
            size: f.size,
            error: `File exceeds 50 MB limit (${(f.size / (1024 * 1024)).toFixed(1)} MB)`,
          });
        } else {
          validFiles.push(f);
        }
      }

      setIsProcessing(true);
      setUploadProgress(2);
      setUploadStatusText(
        fileList.length > 1
          ? `Preparing ${fileList.length} files for upload & encryption...`
          : `Preparing "${fileList[0].name}"...`
      );

      const allCreatedDocs = [];
      const allFailedFiles = [...oversizedFiles];
      let firstContent = null;
      const totalFiles = fileList.length;

      try {
        for (let i = 0; i < validFiles.length; i++) {
          const currentFile = validFiles[i];
          const fileIndex = i + 1;
          const totalValid = validFiles.length;

          let fileSuccess = false;
          let attempts = 0;
          const MAX_RETRIES = 3;

          while (attempts < MAX_RETRIES && !fileSuccess) {
            attempts++;
            try {
              const basePercent = Math.round((i / totalValid) * 100);
              setUploadProgress(Math.max(5, basePercent));

              const successCount = allCreatedDocs.length;
              const failCount = allFailedFiles.length;
              const statsSuffix =
                totalFiles > 1
                  ? ` • ${successCount} saved${failCount > 0 ? `, ${failCount} failed` : ''}`
                  : '';

              setUploadStatusText(
                totalFiles > 1
                  ? `Encrypting & uploading (${fileIndex}/${totalValid}): "${currentFile.name}"${statsSuffix}...`
                  : `Encrypting & uploading "${currentFile.name}"...`
              );

              const res = await uploadDocument(
                [currentFile],
                (percent) => {
                  const fileWeight = (1 / totalValid) * 100;
                  const overallPercent = Math.min(99, Math.round(basePercent + (percent * fileWeight) / 100));
                  setUploadProgress(overallPercent);
                },
                options
              );

              if (res) {
                const docs = res.documents || (res.document ? [res.document] : []);
                if (docs.length > 0) {
                  allCreatedDocs.push(...docs);
                  if (!firstContent && res.content) {
                    firstContent = res.content;
                  }
                  fileSuccess = true;
                }
              }
            } catch (err) {
              const isRateLimit =
                err.response?.status === 429 ||
                err.response?.data?.isRateLimit ||
                (typeof err.message === 'string' && err.message.toLowerCase().includes('too many requests')) ||
                (typeof err.response?.data?.error === 'string' &&
                  err.response.data.error.toLowerCase().includes('too many requests'));

              const retryAfter =
                err.response?.data?.retryAfter ||
                (typeof err.response?.data?.error === 'string' &&
                err.response.data.error.match(/retry after (\d+)/i)
                  ? parseInt(err.response.data.error.match(/retry after (\d+)/i)[1], 10)
                  : 25);

              if (isRateLimit) {
                // Telegram 20 msgs/min rate limit reached: do clean visible countdown
                let remainingSecs = Math.max(5, retryAfter);
                while (remainingSecs > 0) {
                  setUploadStatusText(
                    `⏳ Telegram rate limit reached. Pausing ${remainingSecs}s before auto-resuming (File ${fileIndex} of ${totalValid})...`
                  );
                  await new Promise((r) => setTimeout(r, 1000));
                  remainingSecs--;
                }
                // Rate-limit cooldown resets quota: do not count as a failed retry
                attempts--;
                continue;
              }

              const isTimeout =
                err.code === 'ECONNABORTED' ||
                (typeof err.message === 'string' &&
                  (err.message.toLowerCase().includes('timeout') || err.message.includes('exceeded')));

              if (isTimeout) {
                setUploadStatusText(`Verifying vault synchronization for "${currentFile.name}"...`);
                await new Promise((r) => setTimeout(r, 2000));
                const recovered = await verifyVaultDocuments([currentFile.name], options.collectionId);

                if (recovered && recovered.length > 0) {
                  allCreatedDocs.push(...recovered);
                  fileSuccess = true;
                  break;
                }
              }

              if (attempts < MAX_RETRIES) {
                setUploadStatusText(
                  `Upload paused. Retrying "${currentFile.name}" (attempt ${attempts + 1} of ${MAX_RETRIES})...`
                );
                await new Promise((r) => setTimeout(r, 1500 * attempts));
              } else {
                // File permanently failed after all retries: record and continue queue!
                allFailedFiles.push({
                  file: currentFile,
                  filename: currentFile.name,
                  size: currentFile.size,
                  error: extractErrorMessage(err, 'Failed after multiple attempts'),
                });
              }
            }
          }

          // Polite 300ms breather between requests to prevent socket congestion
          await new Promise((r) => setTimeout(r, 300));
        }

        setUploadProgress(100);
        setUploadStatusText('Upload queue complete!');

        const finalResult = {
          success: allCreatedDocs.length > 0,
          count: allCreatedDocs.length,
          documents: allCreatedDocs,
          document: allCreatedDocs[0],
          content: firstContent,
          failedFiles: allFailedFiles,
          totalRequested: totalFiles,
        };

        if (allFailedFiles.length > 0) {
          if (allCreatedDocs.length > 0) {
            notifications.show({
              title: 'Upload Partially Complete',
              message: `${allCreatedDocs.length} of ${totalFiles} files saved to vault (${allFailedFiles.length} failed).`,
              color: 'yellow',
            });
          } else {
            const firstErrMsg = allFailedFiles[0]?.error || 'All files failed to upload.';
            setError(firstErrMsg);
            notifications.show({
              title: 'Upload Failed',
              message: firstErrMsg,
              color: 'red',
            });
          }
        } else if (allCreatedDocs.length > 1) {
          notifications.show({
            title: `All ${allCreatedDocs.length} Files Saved to Vault`,
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

        if (onSuccess && allCreatedDocs.length > 0) {
          onSuccess(
            allCreatedDocs.length > 1 ? allCreatedDocs : allCreatedDocs[0],
            firstContent,
            allFailedFiles
          );
        }

        return finalResult;
      } catch (err) {
        const msg = extractErrorMessage(err, 'Upload process encountered an error.');
        setError(msg);
        notifications.show({
          title: 'Upload Interrupted',
          message: msg,
          color: 'red',
        });

        const partialResult = {
          success: allCreatedDocs.length > 0,
          count: allCreatedDocs.length,
          documents: allCreatedDocs,
          document: allCreatedDocs[0],
          content: firstContent,
          failedFiles: allFailedFiles,
          totalRequested: totalFiles,
        };

        if (onSuccess && allCreatedDocs.length > 0) {
          onSuccess(allCreatedDocs, firstContent, allFailedFiles);
        }

        return partialResult;
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

