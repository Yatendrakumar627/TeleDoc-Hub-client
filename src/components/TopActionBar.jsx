import React, { useState } from 'react';
import {
  Group,
  Button,
  TextInput,
  Paper,
  Box,
  Divider,
} from '@mantine/core';
import { UploadCloud, Link as LinkIcon, ArrowRight, Loader2 } from 'lucide-react';

export default function TopActionBar({
  onOpenUploadModal,
  onIngestGoogleLink,
  isIngesting,
}) {
  const [googleUrl, setGoogleUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!googleUrl.trim() || isIngesting) return;
    onIngestGoogleLink(googleUrl.trim());
    setGoogleUrl('');
  };

  return (
    <Paper
      p="sm"
      px="md"
      style={{
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
      }}
    >
      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
        {/* Quick Google Ingestion Input Bar */}
        <Box style={{ flex: 1, minWidth: 280, maxWidth: 640 }}>
          <form onSubmit={handleSubmit}>
            <TextInput
              placeholder="Paste public Google Docs or Sheets link..."
              leftSection={<LinkIcon size={16} color="#0284c7" />}
              rightSection={
                <Button
                  size="compact-xs"
                  variant="filled"
                  color="blue"
                  type="submit"
                  loading={isIngesting}
                  disabled={!googleUrl.trim() || isIngesting}
                  rightSection={!isIngesting && <ArrowRight size={13} />}
                >
                  Ingest
                </Button>
              }
              value={googleUrl}
              onChange={(e) => setGoogleUrl(e.currentTarget.value)}
              radius="md"
              size="sm"
              styles={{
                input: {
                  paddingRight: 80,
                },
              }}
            />
          </form>
        </Box>

        {/* Upload File Button */}
        <Group gap="xs">
          <Button
            leftSection={<UploadCloud size={16} />}
            variant="light"
            color="blue"
            size="sm"
            radius="md"
            onClick={onOpenUploadModal}
          >
            Upload File
          </Button>
        </Group>
      </Group>
    </Paper>
  );
}

