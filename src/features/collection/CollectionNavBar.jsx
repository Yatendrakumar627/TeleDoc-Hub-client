import React from 'react';
import { Paper, Group, Text, Button, ActionIcon, Tooltip, ScrollArea, Box, Badge } from '@mantine/core';
import { ChevronLeft, ChevronRight, Folder, Grid, FileText, X } from 'lucide-react';
import { getDocTypeMeta } from '../../utils/docTypes';

export default function CollectionNavBar({
  collectionName,
  files = [],
  currentDocId,
  onSelectFile,
  onOpenCollectionHub,
  onCloseFile,
}) {
  if (!collectionName || collectionName === 'Unassigned' || files.length <= 1) {
    return null;
  }

  const currentIndex = files.findIndex((f) => f.id === currentDocId);
  const prevFile = currentIndex > 0 ? files[currentIndex - 1] : null;
  const nextFile = currentIndex < files.length - 1 ? files[currentIndex + 1] : null;

  return (
    <Paper
      p="xs"
      radius="md"
      withBorder
      mb="md"
      style={{
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Group justify="space-between" align="center" wrap="nowrap">
        {/* Left: Collection Name & Back to Collection Grid */}
        <Group gap="xs" wrap="nowrap">
          <Tooltip label="View all files in this collection" withArrow>
            <Button
              variant="light"
              color="blue"
              size="xs"
              leftSection={<Grid size={13} />}
              onClick={onOpenCollectionHub}
            >
              {collectionName}
            </Button>
          </Tooltip>

          <Text size="xs" c="dimmed" className="mono-badge">
            {currentIndex + 1} of {files.length}
          </Text>
        </Group>

        {/* Center: Scrollable Horizontal Strip of Sister Files */}
        <ScrollArea style={{ flex: 1, maxWidth: 480 }} offsetScrollbars scrollbarSize={4}>
          <Group gap={6} wrap="nowrap" px="xs">
            {files.map((file, idx) => {
              const isActive = file.id === currentDocId;
              const meta = getDocTypeMeta(file.type, file.format);
              const Icon = meta.icon;

              return (
                <Tooltip key={file.id} label={file.filename} withArrow>
                  <Button
                    size="compact-xs"
                    variant={isActive ? 'filled' : 'subtle'}
                    color={isActive ? 'blue' : 'gray'}
                    radius="xl"
                    leftSection={<Icon size={12} />}
                    onClick={() => onSelectFile(file.id)}
                    style={{
                      fontWeight: isActive ? 600 : 400,
                      maxWidth: 160,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {file.title}
                  </Button>
                </Tooltip>
              );
            })}
          </Group>
        </ScrollArea>

        {/* Right: Prev & Next Navigation Buttons */}
        <Group gap={4} wrap="nowrap">
          <Tooltip label={prevFile ? `Previous: ${prevFile.title}` : 'No previous file'} withArrow>
            <ActionIcon
              size="sm"
              variant="default"
              disabled={!prevFile}
              onClick={() => prevFile && onSelectFile(prevFile.id)}
            >
              <ChevronLeft size={14} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label={nextFile ? `Next: ${nextFile.title}` : 'No next file'} withArrow>
            <ActionIcon
              size="sm"
              variant="default"
              disabled={!nextFile}
              onClick={() => nextFile && onSelectFile(nextFile.id)}
            >
              <ChevronRight size={14} />
            </ActionIcon>
          </Tooltip>

          {onCloseFile && (
            <Tooltip label="Close File (Esc)" withArrow position="bottom-end">
              <ActionIcon
                size="sm"
                variant="subtle"
                color="gray"
                onClick={onCloseFile}
                style={{
                  marginLeft: 4,
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--surface-card)',
                }}
              >
                <X size={14} color="var(--text-secondary)" />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Group>
    </Paper>
  );
}

