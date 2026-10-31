import React from 'react';
import { Dropzone } from '@mantine/dropzone';
import { Group, Box, Text, Progress, Stack } from '@mantine/core';
import { UploadCloud, FileCheck, AlertCircle } from 'lucide-react';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB Smart Ingestion Limit (Auto-compressed to < 19.5 MB)

export default function UploadDropzone({
  onDrop,
  onReject,
  loading = false,
  uploadProgress = 0,
  statusText = '',
}) {
  return (
    <Stack gap="md">
      <Dropzone
        onDrop={onDrop}
        onReject={onReject}
        maxSize={MAX_FILE_SIZE}
        multiple={true}
        loading={loading}
        radius="md"
        p="xl"
        style={{
          border: '2px dashed var(--brand-gold)',
          backgroundColor: 'var(--surface-card-warm)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <Group justify="center" gap="xl" mih={140} style={{ pointerEvents: 'none' }}>
          <Dropzone.Accept>
            <FileCheck size={48} color="var(--brand-primary)" />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <AlertCircle size={48} color="var(--jewel-ruby)" />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <UploadCloud size={48} color="var(--brand-primary)" />
          </Dropzone.Idle>

          <Box ta="center">
            <Text size="md" fw={600} inline style={{ color: 'var(--brand-forest)' }}>
              Drag & Drop single or multiple files here, or click to browse
            </Text>
            <Text size="xs" style={{ color: 'var(--text-muted)' }} mt={7}>
              Auto-detects multiple files as individual instances • Up to 50 MB each (Smart auto-compressed)
            </Text>
          </Box>
        </Group>
      </Dropzone>

      {loading && (
        <Stack gap={4}>
          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              {statusText || 'Smart-compressing & encrypting into Telegram Vault...'}
            </Text>
            {uploadProgress > 0 && (
              <Text size="xs" fw={600} c="emerald">
                {uploadProgress}%
              </Text>
            )}
          </Group>
          <Progress value={uploadProgress > 0 ? uploadProgress : 60} animated size="sm" radius="xl" color="emerald" />
        </Stack>
      )}
    </Stack>
  );
}
