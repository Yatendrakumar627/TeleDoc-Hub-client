import React, { useState } from 'react';
import {
  Modal,
  Tabs,
  Stack,
  Group,
  Text,
  Button,
  TextInput,
  Progress,
  Alert,
  Box,
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import {
  UploadCloud,
  Link as LinkIcon,
  FileText,
  AlertCircle,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';

export default function IngestionModal({
  opened,
  onClose,
  onUploadFile,
  onIngestGoogleLink,
  isProcessing,
  uploadProgress,
}) {
  const [activeTab, setActiveTab] = useState('upload');
  const [googleUrl, setGoogleUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [localError, setLocalError] = useState('');

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB Smart Ingestion Limit

  const handleDrop = async (files) => {
    setLocalError('');
    if (!files || files.length === 0) return;
    const file = files[0];

    // Client-side 50 MB limit verification
    if (file.size > MAX_FILE_SIZE) {
      setLocalError(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 50 MB limit.`);
      return;
    }

    try {
      await onUploadFile(file);
      onClose();
    } catch (err) {
      setLocalError(err.response?.data?.error || err.message);
    }
  };

  const handleGoogleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!googleUrl.trim()) return;

    try {
      await onIngestGoogleLink(googleUrl.trim(), customTitle.trim());
      setGoogleUrl('');
      setCustomTitle('');
      onClose();
    } catch (err) {
      setLocalError(err.response?.data?.error || err.message);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="md">
          Add Document to TeleDoc Vault
        </Text>
      }
      size="lg"
      radius="md"
    >
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List mb="md">
          <Tabs.Tab value="upload" leftSection={<UploadCloud size={16} />}>
            Upload Local File
          </Tabs.Tab>
          <Tabs.Tab value="google" leftSection={<LinkIcon size={16} />}>
            Google Workspace Link
          </Tabs.Tab>
        </Tabs.List>

        {localError && (
          <Alert
            icon={<AlertCircle size={16} />}
            color="red"
            variant="light"
            radius="md"
            mb="md"
            onClose={() => setLocalError('')}
            withCloseButton
          >
            {localError}
          </Alert>
        )}

        {/* Tab 1: Local File Upload */}
        <Tabs.Panel value="upload">
          <Stack gap="md">
            <Dropzone
              onDrop={handleDrop}
              onReject={(files) => {
                const rej = files[0];
                if (rej?.errors?.[0]?.code === 'file-too-large') {
                  setLocalError('File exceeds the 50 MB limit.');
                } else {
                  setLocalError('Invalid file type. Please upload .pdf, .docx, .txt, or .csv');
                }
              }}
              maxSize={MAX_FILE_SIZE}
              accept={[
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain',
                'text/csv',
              ]}
              loading={isProcessing}
              radius="md"
              p="xl"
              style={{
                border: '2px dashed #cbd5e1',
                backgroundColor: '#f8fafc',
                cursor: 'pointer',
              }}
            >
              <Group justify="center" gap="xl" mih={140} style={{ pointerEvents: 'none' }}>
                <Dropzone.Accept>
                  <FileCheck size={48} color="#059669" />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <AlertCircle size={48} color="#dc2626" />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <UploadCloud size={48} color="#0284c7" />
                </Dropzone.Idle>

                <Box ta="center">
                  <Text size="md" fw={600} inline>
                    Drag & Drop document here, or click to browse
                  </Text>
                  <Text size="xs" c="dimmed" mt={7}>
                    Supports PDF, Word (.docx), Plain Text (.txt), and Spreadsheets (.csv) up to 50 MB (Smart Auto-Compressed)
                  </Text>
                </Box>
              </Group>
            </Dropzone>

            {isProcessing && uploadProgress > 0 && (
              <Stack gap={4}>
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    Uploading & parsing to Telegram Vault...
                  </Text>
                  <Text size="xs" fw={600} c="blue">
                    {uploadProgress}%
                  </Text>
                </Group>
                <Progress value={uploadProgress} animated size="sm" radius="xl" color="blue" />
              </Stack>
            )}
          </Stack>
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
                leftSection={<LinkIcon size={16} color="#0284c7" />}
              />

              <TextInput
                label="Custom Document Title (Optional)"
                placeholder="Leave blank to use automatic title"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.currentTarget.value)}
                radius="md"
              />

              <Alert color="blue" variant="light" radius="md">
                <Text size="xs">
                  💡 TeleDoc Hub will fetch the live export directly from Google and archive an encrypted snapshot into your Telegram Vault.
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
                  disabled={!googleUrl.trim() || isProcessing}
                >
                  Fetch & Ingest
                </Button>
              </Group>
            </Stack>
          </form>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
}

