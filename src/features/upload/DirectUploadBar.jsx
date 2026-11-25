import React from 'react';
import { Dropzone } from '@mantine/dropzone';
import { Group, Box, Text, ThemeIcon } from '@mantine/core';
import { UploadCloud, FileCheck, AlertCircle } from 'lucide-react';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

/**
 * Shared direct drag-and-drop + click-to-browse upload bar.
 * Clicking opens the native file picker directly (no intermediate modal step);
 * dropping files uploads them immediately to the target folder or vault.
 */
export default function DirectUploadBar({
  onFilesSelected,
  targetName = '',
  mt = 0,
}) {
  const destinationLabel = targetName ? ` to "${targetName}"` : '';

  return (
    <Dropzone
      onDrop={(files) => {
        if (files && files.length > 0 && onFilesSelected) {
          onFilesSelected(files);
        }
      }}
      maxSize={MAX_FILE_SIZE}
      multiple={true}
      radius="md"
      py={10}
      px={12}
      mt={mt}
      style={{
        border: '1.5px dashed var(--brand-gold)',
        backgroundColor: 'var(--surface-card-warm)',
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'all 0.2s ease',
      }}
    >
      <Group justify="center" gap="sm" align="center" style={{ pointerEvents: 'none' }}>
        <Dropzone.Accept>
          <ThemeIcon size={30} radius="xl" variant="light" color="emerald" style={{ background: 'rgba(24, 88, 68, 0.15)' }}>
            <FileCheck size={16} color="var(--brand-primary)" />
          </ThemeIcon>
        </Dropzone.Accept>
        <Dropzone.Reject>
          <ThemeIcon size={30} radius="xl" variant="light" color="red">
            <AlertCircle size={16} color="var(--jewel-ruby)" />
          </ThemeIcon>
        </Dropzone.Reject>
        <Dropzone.Idle>
          <ThemeIcon size={30} radius="xl" variant="light" color="emerald" style={{ background: 'rgba(24, 88, 68, 0.1)' }}>
            <UploadCloud size={16} color="var(--brand-primary)" />
          </ThemeIcon>
        </Dropzone.Idle>

        <Box ta="left">
          <Dropzone.Accept>
            <Text size="xs" fw={700} style={{ color: 'var(--brand-primary)' }}>
              Release files to upload{destinationLabel}
            </Text>
          </Dropzone.Accept>
          <Dropzone.Reject>
            <Text size="xs" fw={700} c="red">
              File exceeds 50 MB limit
            </Text>
          </Dropzone.Reject>
          <Dropzone.Idle>
            <Text size="xs" fw={700} style={{ color: 'var(--brand-forest)' }}>
              Drag & drop files here, or click to browse & upload{destinationLabel}
            </Text>
          </Dropzone.Idle>
          <Text size="10.5px" style={{ color: 'var(--text-muted)' }}>
            Supports PDF, Word, Excel, PPT, Photos, Videos, and Code • Up to 50 MB each
          </Text>
        </Box>
      </Group>
    </Dropzone>
  );
}
