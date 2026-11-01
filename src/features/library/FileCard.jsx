import React, { useState, useEffect, useMemo } from 'react';
import { Paper, Group, Box, Text, ActionIcon, Tooltip, Menu, TextInput, Badge, Checkbox } from '@mantine/core';
import { Trash2, Lock, FolderInput, Folder, Pencil, Check, X, FileText } from 'lucide-react';
import { formatBytes } from '../../utils/formatters';
import { getDocTypeMeta } from '../../utils/docTypes';

/**
 * Authentic Document Brand Icon for Sidebar Items
 */
function DocumentBrandIcon({ type, format, filename, size = 28 }) {
  const t = (type || '').toLowerCase();
  const f = (format || '').toLowerCase();
  const ext = (filename ? filename.split('.').pop() : '').toLowerCase();

  const isWord = ['docx', 'doc'].includes(t) || ['docx', 'doc'].includes(ext) || f === 'word';
  const isPdf = t === 'pdf' || ext === 'pdf' || f === 'pdf';
  const isSheet = ['xlsx', 'xls', 'csv', 'tsv', 'ods'].includes(t) || ['xlsx', 'xls', 'csv'].includes(ext) || f === 'spreadsheet';
  const isPpt = ['pptx', 'ppt'].includes(t) || ['pptx', 'ppt'].includes(ext) || f === 'presentation';

  if (isWord) {
    return (
      <Box
        style={{
          width: size,
          height: size,
          borderRadius: 7,
          backgroundColor: '#e0f2fe',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width={size * 0.68} height={size * 0.68} viewBox="0 0 36 36" fill="none">
          <rect x="9" y="4" width="22" height="28" rx="3" fill="#185ABD" />
          <path d="M23 4H31V12L23 4Z" fill="#103F91" />
          <rect x="5" y="8" width="18" height="20" rx="3.5" fill="url(#w_grad_fc)" style={{ filter: 'drop-shadow(0 2px 3px rgba(16,63,145,0.35))' }} />
          <path d="M8.5 13L10.2 23H11.8L13.5 16.5L15.2 23H16.8L18.5 13H16.8L15.6 19.5L14.1 13H12.9L11.4 19.5L10.2 13H8.5Z" fill="#ffffff" />
          <defs>
            <linearGradient id="w_grad_fc" x1="5" y1="8" x2="23" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2B7CD3" />
              <stop offset="1" stopColor="#104A9E" />
            </linearGradient>
          </defs>
        </svg>
      </Box>
    );
  }

  if (isPdf) {
    return (
      <Box
        style={{
          width: size,
          height: size,
          borderRadius: 7,
          backgroundColor: '#ffe4e6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width={size * 0.68} height={size * 0.68} viewBox="0 0 36 36" fill="none">
          <rect x="7" y="4" width="22" height="28" rx="3" fill="#E11D48" />
          <path d="M21 4H29V12L21 4Z" fill="#9F1239" />
          <rect x="5" y="8" width="18" height="20" rx="3.5" fill="url(#pdf_grad_fc)" style={{ filter: 'drop-shadow(0 2px 3px rgba(159,18,57,0.35))' }} />
          <text x="7" y="21.5" fill="#ffffff" fontSize="8.5" fontWeight="900" fontFamily="sans-serif">PDF</text>
          <defs>
            <linearGradient id="pdf_grad_fc" x1="5" y1="8" x2="23" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F43F5E" />
              <stop offset="1" stopColor="#BE123C" />
            </linearGradient>
          </defs>
        </svg>
      </Box>
    );
  }

  if (isSheet) {
    return (
      <Box
        style={{
          width: size,
          height: size,
          borderRadius: 7,
          backgroundColor: '#dcfce7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width={size * 0.68} height={size * 0.68} viewBox="0 0 36 36" fill="none">
          <rect x="9" y="4" width="22" height="28" rx="3" fill="#107C41" />
          <path d="M23 4H31V12L23 4Z" fill="#0A5028" />
          <rect x="5" y="8" width="18" height="20" rx="3.5" fill="url(#x_grad_fc)" style={{ filter: 'drop-shadow(0 2px 3px rgba(10,80,40,0.35))' }} />
          <path d="M9.5 13.5L12.5 18L9.5 22.5H11.5L13.5 19.3L15.5 22.5H17.5L14.5 18L17.5 13.5H15.5L13.5 16.7L11.5 13.5H9.5Z" fill="#ffffff" />
          <defs>
            <linearGradient id="x_grad_fc" x1="5" y1="8" x2="23" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1E8E4F" />
              <stop offset="1" stopColor="#0E6533" />
            </linearGradient>
          </defs>
        </svg>
      </Box>
    );
  }

  if (isPpt) {
    return (
      <Box
        style={{
          width: size,
          height: size,
          borderRadius: 7,
          backgroundColor: '#ffedd5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width={size * 0.68} height={size * 0.68} viewBox="0 0 36 36" fill="none">
          <rect x="9" y="4" width="22" height="28" rx="3" fill="#C43E1C" />
          <path d="M23 4H31V12L23 4Z" fill="#8A260D" />
          <rect x="5" y="8" width="18" height="20" rx="3.5" fill="url(#ppt_grad_fc)" style={{ filter: 'drop-shadow(0 2px 3px rgba(138,38,13,0.35))' }} />
          <path d="M9.5 13H14C15.5 13 16.5 14 16.5 15.5C16.5 17 15.5 18 14 18H11.5V23H9.5V13ZM11.5 16.2H13.8C14.4 16.2 14.8 15.9 14.8 15.5C14.8 15.1 14.4 14.8 13.8 14.8H11.5V16.2Z" fill="#ffffff" />
          <defs>
            <linearGradient id="ppt_grad_fc" x1="5" y1="8" x2="23" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#EA580C" />
              <stop offset="1" stopColor="#C2410C" />
            </linearGradient>
          </defs>
        </svg>
      </Box>
    );
  }

  return (
    <Box
      style={{
        width: size,
        height: size,
        borderRadius: 7,
        backgroundColor: '#f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <FileText size={15} color="#64748b" />
    </Box>
  );
}

function FileCard({
  document,
  doc,
  isSelected,
  collections = [],
  hideCollectionBadge = false,
  hideGroupBadge = false,
  onSelect,
  onDelete,
  onRename,
  onAssignCollection,
  isMultiSelected = false,
  onToggleSelect,
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

  const isConfidential =
    targetDoc.security?.level === 'confidential' ||
    targetDoc.security?.level === 'strictly_confidential';

  const formatLabel = (targetDoc.type || targetDoc.format || 'FILE').toUpperCase();

  // Color theme for format badge
  const badgeStyle = useMemo(() => {
    const ext = (targetDoc.filename ? targetDoc.filename.split('.').pop() : targetDoc.type || '').toLowerCase();
    if (['docx', 'doc'].includes(ext) || targetDoc.format === 'word') {
      return { bg: '#e0f2fe', color: '#0369a1' };
    }
    if (ext === 'pdf' || targetDoc.format === 'pdf') {
      return { bg: '#ffe4e6', color: '#be123c' };
    }
    if (['xlsx', 'xls', 'csv'].includes(ext) || targetDoc.format === 'spreadsheet') {
      return { bg: '#dcfce7', color: '#15803d' };
    }
    if (['pptx', 'ppt'].includes(ext) || targetDoc.format === 'presentation') {
      return { bg: '#ffedd5', color: '#c2410c' };
    }
    return { bg: '#eaf7ee', color: '#185844' };
  }, [targetDoc]);

  return (
    <Paper
      px={10}
      py={7}
      radius="md"
      withBorder
      style={{
        cursor: 'pointer',
        borderColor: isMultiSelected
          ? 'var(--brand-emerald)'
          : isSelected
          ? 'var(--brand-primary)'
          : 'var(--border-subtle, #e2e8f0)',
        borderLeft: `3px solid ${isMultiSelected ? 'var(--brand-emerald)' : meta.accentColor || 'var(--brand-primary)'}`,
        backgroundColor: isMultiSelected
          ? '#f0fdf4'
          : isSelected
          ? 'var(--surface-selected)'
          : '#ffffff',
        boxShadow: isMultiSelected
          ? '0 0 0 1px var(--brand-emerald), 0 2px 8px rgba(16, 185, 129, 0.12)'
          : isSelected
          ? '0 2px 8px rgba(24, 88, 68, 0.12)'
          : '0 1px 3px rgba(16, 47, 39, 0.03)',
        borderRadius: '9px',
        transition: 'all 0.15s ease-in-out',
      }}
      onClick={() => onSelect && onSelect(targetDoc.id)}
    >
      <Group justify="space-between" wrap="nowrap" align="center">
        <Group gap={9} wrap="nowrap" style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
          {onToggleSelect && (
            <Box
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect(targetDoc.id);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <Checkbox
                size="xs"
                color="emerald"
                checked={isMultiSelected}
                onChange={() => {}}
                styles={{ input: { cursor: 'pointer' } }}
              />
            </Box>
          )}

          {/* Authentic Document Brand Icon */}
          <DocumentBrandIcon
            type={targetDoc.type}
            format={targetDoc.format}
            filename={targetDoc.filename || targetDoc.title}
            size={28}
          />

          {/* Doc Title & Subtitle Row */}
          <Box style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
            {isEditing ? (
              <Group gap={4} wrap="nowrap" onClick={(e) => e.stopPropagation()}>
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
                  styles={{ input: { height: 22, minHeight: 22, fontSize: '11px', padding: '0 6px' } }}
                />
                <ActionIcon size="xs" color="teal" variant="filled" onClick={handleSaveRename} loading={isSaving}>
                  <Check size={11} />
                </ActionIcon>
                <ActionIcon size="xs" color="gray" variant="subtle" onClick={() => setIsEditing(false)} disabled={isSaving}>
                  <X size={11} />
                </ActionIcon>
              </Group>
            ) : (
              <Group gap={4} wrap="nowrap" align="center">
                <Text
                  size="12px"
                  fw={isSelected ? 700 : 600}
                  truncate
                  style={{
                    color: isSelected ? 'var(--brand-primary)' : '#0f172a',
                    lineHeight: 1.25,
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  title="Double-click to rename"
                >
                  {targetDoc.title}
                </Text>

                {isSelected && (
                  <Badge
                    size="xs"
                    variant="filled"
                    color="emerald"
                    style={{
                      fontSize: '8.5px',
                      height: '15px',
                      padding: '0 5px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                      flexShrink: 0,
                    }}
                  >
                    Open
                  </Badge>
                )}

                {isConfidential && (
                  <Tooltip label="AES-256 Encrypted" withArrow position="top">
                    <Box style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--brand-gold)', flexShrink: 0 }}>
                      <Lock size={11} />
                    </Box>
                  </Tooltip>
                )}
              </Group>
            )}

            {/* Subtitle Row: Format Pill • Size • Words */}
            <Group gap={6} mt={2} wrap="nowrap" align="center">
              <Box
                style={{
                  backgroundColor: badgeStyle.bg,
                  color: badgeStyle.color,
                  fontSize: '9px',
                  fontWeight: 700,
                  padding: '1px 5px',
                  borderRadius: '4px',
                  lineHeight: 1.2,
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                  flexShrink: 0,
                }}
              >
                {formatLabel}
              </Box>

              <Text size="11px" c="dimmed" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                {formatBytes(targetDoc.fileSize)}
              </Text>

              {targetDoc.wordCount > 0 && (
                <Text size="11px" c="dimmed" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                  • {targetDoc.wordCount}w
                </Text>
              )}
            </Group>
          </Box>
        </Group>

        {/* Quick Action Icons: Move, Rename, Delete */}
        <Group gap={2} wrap="nowrap" style={{ flexShrink: 0 }}>
          {collections.length > 0 && onAssignCollection && (
            <Menu shadow="md" width={200} position="left-start" withinPortal>
              <Menu.Target>
                <Tooltip label="Move to Collection" withArrow position="left">
                  <ActionIcon
                    size="24px"
                    radius="sm"
                    variant="subtle"
                    color="gray"
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
              size="24px"
              radius="sm"
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

          <Tooltip label="Delete File" withArrow position="left">
            <ActionIcon
              size="24px"
              radius="sm"
              variant="subtle"
              color="gray"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Permanently delete "${targetDoc.title}" from Vault?`)) {
                  onDelete && onDelete(targetDoc.id);
                }
              }}
              style={{
                '&:hover': {
                  color: '#ef4444',
                  backgroundColor: '#fef2f2',
                },
              }}
            >
              <Trash2 size={12} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Paper>
  );
}

export default React.memo(FileCard);
