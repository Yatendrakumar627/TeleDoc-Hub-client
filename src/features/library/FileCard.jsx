import React, { useState, useEffect } from 'react';
import { Paper, Group, Box, Text, ActionIcon, Tooltip, Badge, Menu, TextInput } from '@mantine/core';
import { Trash2, Lock, ShieldCheck, FolderInput, Folder, Pencil, Check, X } from 'lucide-react';
import SourceBadge from '../../components/ui/SourceBadge';
import { formatBytes } from '../../utils/formatters';
import { getDocTypeMeta } from '../../utils/docTypes';

export default function FileCard({
  document,
  doc,
  isSelected,
  collections = [],
  onSelect,
  onDelete,
  onRename,
  onAssignCollection,
}) {
  const targetDoc = document || doc;
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(targetDoc?.title || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditTitle(targetDoc?.title || '');
  }, [targetDoc?.title]);

  if (!targetDoc) return null;

  const handleSaveRename = async (e) => {
    if (e) e.stopPropagation();
    const trimmed = editTitle.trim();
    if (!trimmed || trimmed === targetDoc.title) {
      setIsEditing(false);
      setEditTitle(targetDoc.title);
      return;
    }
    try {
      setIsSaving(true);
      if (onRename) {
        await onRename(targetDoc.id, trimmed);
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Rename error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const meta = getDocTypeMeta(targetDoc.type, targetDoc.format);
  const IconComponent = meta.icon;

  const isConfidential =
    targetDoc.security?.level === 'confidential' ||
    targetDoc.security?.level === 'strictly_confidential';

  // Only show real user group if assigned, not auto-classifier categories
  const groupName = targetDoc.groupName || (targetDoc.taxonomy?.group && !['general', 'medical', 'legal', 'technical', 'financial', 'identity'].includes(targetDoc.taxonomy.group.toLowerCase()) ? targetDoc.taxonomy.group : null);
  const groupColor = 'emerald';

  return (
    <Paper
      p="xs"
      radius="md"
      withBorder
      style={{
        cursor: 'pointer',
        borderColor: isSelected ? 'var(--brand-primary)' : 'var(--border-subtle)',
        borderLeft: `4px solid ${meta.accentColor || 'var(--brand-primary)'}`,
        backgroundColor: isSelected ? 'var(--surface-selected)' : 'var(--surface-card)',
        boxShadow: isSelected ? '0 4px 12px rgba(24, 88, 68, 0.12)' : '0 1px 2px rgba(16, 47, 39, 0.04)',
        transition: 'all 0.18s ease-in-out',
      }}
      onClick={() => onSelect && onSelect(targetDoc.id)}
    >
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <Group gap="xs" wrap="nowrap" style={{ overflow: 'hidden' }}>
          <Box
            style={{
              width: 30,
              height: 30,
              borderRadius: 7,
              backgroundColor: `${meta.accentColor || '#185844'}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: 1,
            }}
          >
            <IconComponent size={16} color={meta.accentColor || 'var(--brand-primary)'} />
          </Box>
          <Box style={{ overflow: 'hidden', flex: 1 }}>
            {isEditing ? (
              <Group gap={4} wrap="nowrap" onClick={(e) => e.stopPropagation()} mb={4}>
                <TextInput
                  size="xs"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveRename(e);
                    } else if (e.key === 'Escape') {
                      setIsEditing(false);
                      setEditTitle(targetDoc.title);
                    }
                  }}
                  autoFocus
                  disabled={isSaving}
                  style={{ flex: 1 }}
                  styles={{ input: { height: 24, minHeight: 24, fontSize: '11px', padding: '0 6px' } }}
                />
                <ActionIcon size="xs" color="teal" variant="filled" onClick={handleSaveRename} loading={isSaving}>
                  <Check size={11} />
                </ActionIcon>
                <ActionIcon size="xs" color="gray" variant="subtle" onClick={() => setIsEditing(false)} disabled={isSaving}>
                  <X size={11} />
                </ActionIcon>
              </Group>
            ) : (
              <Group gap={6} wrap="nowrap" align="center">
                <Text
                  size="sm"
                  fw={isSelected ? 600 : 500}
                  truncate
                  style={{ color: isSelected ? 'var(--brand-primary)' : 'var(--text-primary)' }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  title="Double-click to rename"
                >
                  {targetDoc.title}
                </Text>

                {isConfidential && (
                  <Tooltip label="Zero-Knowledge AES-256 Vault Encrypted" withArrow position="top">
                    <Box style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--brand-gold)' }}>
                      <Lock size={12} />
                    </Box>
                  </Tooltip>
                )}
              </Group>
            )}

            {/* Multi-Dimensional Badges */}
            <Group gap={4} mt={3} wrap="wrap">
              {/* Collection Badge */}
              {targetDoc.collectionName && targetDoc.collectionName !== 'Unassigned' && (
                <Badge
                  size="xs"
                  variant="filled"
                  color="emerald"
                  style={{ fontSize: '9px', height: '16px', padding: '0 5px', textTransform: 'none' }}
                >
                  📁 {targetDoc.collectionName}
                </Badge>
              )}

              {/* Scope Badge (Personal vs Work) */}
              {targetDoc.scope && (
                <Badge
                  size="xs"
                  variant="light"
                  color={targetDoc.scope === 'personal' ? 'sage' : 'emerald'}
                  style={{ textTransform: 'capitalize', fontSize: '9px', height: '16px', padding: '0 5px' }}
                >
                  {targetDoc.scope === 'personal' ? 'Personal' : 'Work'}
                </Badge>
              )}

              {/* Group Badge (Only if real group assigned) */}
              {groupName && (
                <Badge
                  size="xs"
                  variant="light"
                  color={groupColor}
                  style={{ textTransform: 'capitalize', fontSize: '9px', height: '16px', padding: '0 5px' }}
                >
                  {groupName}
                </Badge>
              )}

              {/* Time-Wise Year */}
              {targetDoc.temporal?.year && (
                <Badge
                  size="xs"
                  variant="subtle"
                  color="gray"
                  style={{ fontSize: '9px', height: '16px', padding: '0 4px' }}
                >
                  {targetDoc.temporal.year}
                </Badge>
              )}
            </Group>

            {/* Technical Metadata */}
            <Group gap={6} mt={4}>
              <SourceBadge type={targetDoc.type} format={targetDoc.format} showIcon={false} />
              <Text size="xs" c="dimmed" className="mono-badge">
                {formatBytes(targetDoc.fileSize)}
              </Text>
              {targetDoc.wordCount > 0 && (
                <Text size="xs" c="dimmed" className="mono-badge">
                  • {targetDoc.wordCount} words
                </Text>
              )}
            </Group>
          </Box>
        </Group>

        <Group gap={2} wrap="nowrap">
          {collections.length > 0 && onAssignCollection && (
            <Menu shadow="md" width={220} position="left-start" withinPortal>
              <Menu.Target>
                <Tooltip label="Move / Add to Collection" withArrow position="left">
                  <ActionIcon
                    size="xs"
                    variant="subtle"
                    color="indigo"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FolderInput size={13} />
                  </ActionIcon>
                </Tooltip>
              </Menu.Target>

              <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
                <Menu.Label>Move to Collection</Menu.Label>
                {collections.map((col) => (
                  <Menu.Item
                    key={col.id}
                    leftSection={<Folder size={14} color="var(--brand-primary)" />}
                    onClick={() => onAssignCollection(targetDoc.id, col.id, col.name)}
                    style={{
                      fontWeight: targetDoc.collectionId === col.id ? 600 : 400,
                      backgroundColor: targetDoc.collectionId === col.id ? 'var(--surface-selected)' : undefined,
                    }}
                  >
                    {col.name}
                  </Menu.Item>
                ))}
                <Menu.Divider />
                <Menu.Item
                  color="gray"
                  onClick={() => onAssignCollection(targetDoc.id, null, 'Unassigned')}
                >
                  📥 Move to Inbox (Unassign)
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}

          <Tooltip label="Rename File" withArrow position="left">
            <ActionIcon
              size="xs"
              variant="subtle"
              color="gray"
              onClick={(e) => {
                e.stopPropagation();
                setEditTitle(targetDoc.title);
                setIsEditing(true);
              }}
            >
              <Pencil size={12} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Delete from Vault & Telegram" withArrow position="left">
            <ActionIcon
              size="xs"
              variant="subtle"
              color="gray"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Delete "${targetDoc.title}" from MongoDB and Telegram?`)) {
                  onDelete && onDelete(targetDoc.id);
                }
              }}
            >
              <Trash2 size={13} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Paper>
  );
}
