import React, { useState } from 'react';
import {
  Card,
  Box,
  Text,
  Group,
  ActionIcon,
  Tooltip,
  Menu,
  Skeleton,
  Badge,
} from '@mantine/core';
import {
  Calendar,
  MoreVertical,
  ExternalLink,
  Download,
  Link as LinkIcon,
  FolderInput,
  Trash2,
  Check,
  Play,
  Image as ImageIcon,
  Film,
  FileText,
} from 'lucide-react';
import { formatBytes } from '../../utils/formatters';
import { API_BASE_URL } from '../../config';
import { notifications } from '@mantine/notifications';

/**
 * Helper to check if file is an image
 */
export const isImageFile = (file) => {
  if (!file) return false;
  const f = (file.format || '').toLowerCase();
  const t = (file.type || '').toLowerCase();
  const ext = (file.filename || file.title || '').split('.').pop().toLowerCase();
  return (
    f === 'image' ||
    ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp', 'ico', 'tiff', 'avif'].includes(t) ||
    ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp', 'ico', 'tiff', 'avif'].includes(ext)
  );
};

/**
 * Helper to check if file is a video
 */
export const isVideoFile = (file) => {
  if (!file) return false;
  const f = (file.format || '').toLowerCase();
  const t = (file.type || '').toLowerCase();
  const ext = (file.filename || file.title || '').split('.').pop().toLowerCase();
  return (
    f === 'video' ||
    (f === 'media' && t === 'video') ||
    ['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v', 'ogv'].includes(t) ||
    ['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v', 'ogv'].includes(ext)
  );
};

export const isMediaFile = (file) => isImageFile(file) || isVideoFile(file);

/**
 * GalleryMediaCard
 * Elegant visual photo & video card matching luxury Mantine UI design
 */
export default function GalleryMediaCard({
  file,
  token = '',
  isSelected = false,
  onToggleSelect,
  onSelectFile,
  onDeleteFile,
  onMoveFile,
  isMobile = false,
  draggable = false,
  isDropBefore = false,
  isDropAfter = false,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isImg = isImageFile(file);
  const isVid = isVideoFile(file);

  const rawExt = (file.filename ? file.filename.split('.').pop() : file.type || 'file').toUpperCase();
  const ext = rawExt.length > 5 ? rawExt.slice(0, 4) : rawExt;

  const mediaUrl = `${API_BASE_URL}/documents/${file.id}/view?token=${encodeURIComponent(token || '')}`;

  return (
    <Card
      radius="16px"
      withBorder
      p={0}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`gallery-media-card ${isSelected ? 'is-selected' : ''}`}
      style={{
        position: 'relative',
        backgroundColor: '#ffffff',
        borderColor: isSelected ? 'var(--brand-emerald, #185844)' : '#e2e8f0',
        borderWidth: isSelected ? '1.5px' : '1px',
        boxShadow: isSelected
          ? '0 0 0 2px var(--brand-emerald, #185844), 0 10px 25px -4px rgba(24, 88, 68, 0.22)'
          : '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={() => onSelectFile && onSelectFile(file.id)}
    >
      {/* Visual Insertion Drop Indicator Line */}
      {isDropBefore && (
        <Box
          style={{
            position: 'absolute',
            left: -4,
            top: 4,
            bottom: 4,
            width: 4,
            backgroundColor: 'var(--brand-emerald, #185844)',
            borderRadius: 99,
            zIndex: 35,
            boxShadow: '0 0 8px rgba(24, 88, 68, 0.8)',
            pointerEvents: 'none',
          }}
        />
      )}
      {isDropAfter && (
        <Box
          style={{
            position: 'absolute',
            right: -4,
            top: 4,
            bottom: 4,
            width: 4,
            backgroundColor: 'var(--brand-emerald, #185844)',
            borderRadius: 99,
            zIndex: 35,
            boxShadow: '0 0 8px rgba(24, 88, 68, 0.8)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Top Thumbnail Media Viewport */}
      <Box
        style={{
          position: 'relative',
          width: '100%',
          height: isMobile ? 165 : 185,
          backgroundColor: '#0f172a',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Skeleton while lazy loading */}
        {isImg && !imgLoaded && !imgError && (
          <Skeleton
            height="100%"
            width="100%"
            style={{ position: 'absolute', inset: 0, zIndex: 1 }}
            animate
          />
        )}

        {/* High Resolution Image Thumbnail */}
        {isImg && !imgError ? (
          <img
            src={mediaUrl}
            alt={file.title}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className="gallery-thumb-image"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              transition: 'transform 0.35s ease',
            }}
          />
        ) : isVid ? (
          /* Progressive Video Thumbnail + Centered Play Icon */
          <Box style={{ width: '100%', height: '100%', position: 'relative' }}>
            <video
              src={`${mediaUrl}#t=0.5`}
              preload="metadata"
              muted
              playsInline
              className="gallery-thumb-image"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            {/* Centered Glassmorphic Play Button */}
            <Box
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.28)',
              }}
            >
              <Box
                className="gallery-play-btn"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(8px)',
                  border: '1.5px solid rgba(255, 255, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                  transition: 'transform 0.18s ease, background-color 0.18s ease',
                }}
              >
                <Play size={18} fill="#ffffff" style={{ marginLeft: 2 }} />
              </Box>
            </Box>
          </Box>
        ) : (
          /* Elegant Document / Code / Archive Fallback Banner */
          <Box
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: 12,
            }}
          >
            <Box
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={24} color="#94a3b8" />
            </Box>
            <Badge size="xs" variant="filled" color="dark" style={{ letterSpacing: '0.04em' }}>
              {ext} DOCUMENT
            </Badge>
          </Box>
        )}

        {/* Top-Right Selection Checkbox (Exact Match to Image 2) */}
        {onToggleSelect && (
          <Tooltip label={isSelected ? 'Deselect item' : 'Select for batch actions'} position="top" withArrow>
            <Box
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect(file.id);
              }}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 10,
                cursor: 'pointer',
              }}
            >
              <Box
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  border: isSelected ? 'none' : '1.8px solid rgba(255, 255, 255, 0.88)',
                  backgroundColor: isSelected ? 'var(--brand-emerald, #185844)' : 'rgba(15, 23, 42, 0.38)',
                  backdropFilter: 'blur(5px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.28)',
                  transition: 'all 0.15s ease',
                }}
              >
                {isSelected && <Check size={14} color="#ffffff" strokeWidth={3} />}
              </Box>
            </Box>
          </Tooltip>
        )}

        {/* Bottom-Left Translucent Pill Overlay (Exact Match to Image 2) */}
        <Box
          style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            zIndex: 10,
            backgroundColor: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            borderRadius: 6,
            padding: '3px 8px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.35)',
            pointerEvents: 'none',
          }}
        >
          {isImg ? (
            <ImageIcon size={11} color="#ffffff" style={{ opacity: 0.95 }} />
          ) : isVid ? (
            <Film size={11} color="#ffffff" style={{ opacity: 0.95 }} />
          ) : (
            <FileText size={11} color="#ffffff" style={{ opacity: 0.95 }} />
          )}
          <Text size="10.5px" fw={700} style={{ color: '#ffffff', letterSpacing: '0.02em', lineHeight: 1 }}>
            {ext}
          </Text>
          <Box style={{ width: 1, height: 9, backgroundColor: 'rgba(255, 255, 255, 0.35)' }} />
          <Text size="10.5px" fw={600} style={{ color: '#ffffff', opacity: 0.95, lineHeight: 1 }}>
            {formatBytes(file.fileSize)}
          </Text>
        </Box>
      </Box>

      {/* Bottom Information Row (Exact Match to Image 2) */}
      <Box
        p="12px 14px 10px 14px"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
        }}
      >
        {/* Truncated File Title */}
        <Tooltip label={file.title} position="top" withArrow openDelay={400}>
          <Text
            fw={700}
            truncate
            style={{
              fontSize: '13px',
              color: '#0f172a',
              lineHeight: 1.3,
              letterSpacing: '-0.01em',
            }}
          >
            {file.title}
          </Text>
        </Tooltip>

        {/* Sub-row: Calendar Date on Left, 3-Dots Menu on Right */}
        <Group justify="space-between" align="center" mt={6} wrap="nowrap">
          <Group gap={5} wrap="nowrap" align="center">
            <Calendar size={13} color="#64748b" style={{ flexShrink: 0 }} />
            <Text size="11.5px" fw={500} style={{ color: '#64748b', whiteSpace: 'nowrap' }}>
              {file.formattedFileDate || '—'}
            </Text>
          </Group>

          {/* 3-Dot Action Menu */}
          <Menu shadow="md" width={185} position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon
                size="26px"
                variant="subtle"
                radius="md"
                onClick={(e) => e.stopPropagation()}
                style={{
                  color: '#64748b',
                  borderRadius: 6,
                  '&:hover': { backgroundColor: '#f1f5f9', color: '#0f172a' },
                }}
              >
                <MoreVertical size={15} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
              <Menu.Item
                leftSection={<ExternalLink size={13} />}
                onClick={() => onSelectFile && onSelectFile(file.id)}
              >
                Open in Viewer
              </Menu.Item>
              <Menu.Item
                leftSection={<Download size={13} />}
                component="a"
                href={`${API_BASE_URL}/documents/${file.id}/download`}
                download={file.filename}
              >
                Download
              </Menu.Item>
              <Menu.Item
                leftSection={<LinkIcon size={13} />}
                onClick={() => {
                  const shareUrl = `${window.location.origin}/#doc=${file.id}`;
                  navigator.clipboard.writeText(shareUrl);
                  notifications.show({
                    title: 'Link Copied',
                    message: 'Media link copied to clipboard.',
                    color: 'emerald',
                    autoClose: 2000,
                  });
                }}
              >
                Copy Direct Link
              </Menu.Item>
              <Menu.Item
                leftSection={<FolderInput size={13} />}
                onClick={() => onMoveFile && onMoveFile(file.id)}
              >
                Move to Collection
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={<Trash2 size={13} />}
                onClick={() => {
                  if (window.confirm(`Delete "${file.filename || file.title}"?`)) {
                    onDeleteFile && onDeleteFile(file.id);
                  }
                }}
              >
                Delete File
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Box>
    </Card>
  );
}

