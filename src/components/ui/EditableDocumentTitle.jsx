import React, { useState, useEffect, useRef } from 'react';
import { Group, Title, TextInput, ActionIcon, Tooltip, Box } from '@mantine/core';
import { Pencil, Check, X } from 'lucide-react';

export default function EditableDocumentTitle({
  document,
  onRename,
  order = 3,
  style = {},
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [titleValue, setTitleValue] = useState(document?.title || document?.filename || '');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setTitleValue(document?.title || document?.filename || '');
    setIsEditing(false);
  }, [document?.id, document?.title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    const trimmed = titleValue.trim();
    if (!trimmed || trimmed === document.title) {
      setIsEditing(false);
      setTitleValue(document?.title || document?.filename || '');
      return;
    }

    try {
      setIsSaving(true);
      if (onRename) {
        await onRename(document.id, trimmed);
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to rename document:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setTitleValue(document?.title || document?.filename || '');
    }
  };

  if (isEditing) {
    return (
      <Group gap={6} align="center" style={{ width: '100%', maxWidth: 720, margin: '2px 0' }}>
        <TextInput
          ref={inputRef}
          value={titleValue}
          onChange={(e) => setTitleValue(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          size="sm"
          placeholder="Enter new file name..."
          style={{ flex: 1 }}
          disabled={isSaving}
          styles={{
            input: {
              fontWeight: 600,
              fontSize: '1.05rem',
              borderColor: '#0284c7',
              backgroundColor: '#f8fafc',
            },
          }}
        />
        <Tooltip label="Save (Enter)" withArrow position="top">
          <ActionIcon
            color="teal"
            variant="filled"
            size="md"
            radius="md"
            onClick={handleSave}
            loading={isSaving}
            aria-label="Save file name"
          >
            <Check size={15} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Cancel (Esc)" withArrow position="top">
          <ActionIcon
            color="gray"
            variant="subtle"
            size="md"
            radius="md"
            onClick={() => {
              setIsEditing(false);
              setTitleValue(document?.title || document?.filename || '');
            }}
            disabled={isSaving}
            aria-label="Cancel rename"
          >
            <X size={15} />
          </ActionIcon>
        </Tooltip>
      </Group>
    );
  }

  return (
    <Group gap={8} align="center" wrap="wrap" style={{ ...style }}>
      <Title
        order={order}
        onDoubleClick={() => setIsEditing(true)}
        style={{
          wordBreak: 'break-word',
          color: '#0f172a',
          fontWeight: 600,
          cursor: 'pointer',
          lineHeight: 1.35,
        }}
        title="Double-click to rename"
      >
        {document?.title || document?.filename || 'Untitled File'}
      </Title>

      <Tooltip label="Edit File Name" withArrow position="top">
        <ActionIcon
          size="sm"
          variant="subtle"
          color="gray"
          onClick={() => setIsEditing(true)}
          style={{
            cursor: 'pointer',
            opacity: 0.7,
            transition: 'opacity 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
          aria-label="Rename file"
        >
          <Pencil size={13} color="#475569" />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}

