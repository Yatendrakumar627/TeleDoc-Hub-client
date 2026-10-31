import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Stack,
  Group,
  Text,
  Title,
  Button,
  Badge,
  Alert,
  Tooltip,
  ActionIcon,
  Divider,
  Select,
  ScrollArea,
} from '@mantine/core';
import {
  Download,
  Lock,
  Film,
  Music,
  Archive,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  RefreshCw,
  FileCode,
  Folder,
  File,
  ShieldCheck,
  Sun,
  Moon,
  Grid,
  Sparkles,
  X,
} from 'lucide-react';
import SourceBadge from '../../components/ui/SourceBadge';
import SearchFilterInput from '../../components/ui/SearchFilterInput';
import EditableDocumentTitle from '../../components/ui/EditableDocumentTitle';
import { formatBytes } from '../../utils/formatters';
import { API_BASE_URL } from '../../config';

export default function MediaBinaryViewer({ document, content, onRenameFile, onCloseFile }) {
  const format = (content?.format || document?.format || '').toLowerCase();
  const docType = (document?.type || content?.type || '').toLowerCase();

  const isImage = format === 'image' || ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp', 'ico', 'tiff', 'avif'].includes(docType);
  const isVideo = format === 'video' || (format === 'media' && docType === 'video') || ['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v', 'ogv'].includes(docType);
  const isAudio = format === 'audio' || (format === 'media' && docType === 'audio') || ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma'].includes(docType);
  const isArchive = format === 'archive' || docType === 'zip';

  // Image manipulation state
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [backdropTheme, setBackdropTheme] = useState('dark'); // 'dark' | 'light' | 'grid'
  const [dimensions, setDimensions] = useState(null);

  // Pan / Dragging state
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Video & Audio state
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const videoRetryRef = useRef(0);
  const [videoError, setVideoError] = useState(null);
  const [playbackRate, setPlaybackRate] = useState('1');

  // Archive search
  const [archiveSearch, setArchiveSearch] = useState('');

  const token = localStorage.getItem('teledoc_vault_jwt') || '';
  const streamUrl = `${API_BASE_URL}/documents/${document.id}/view?token=${encodeURIComponent(token)}`;
  // Videos and Audio always stream progressively via HTTP 206 Range requests like YouTube
  const activeMediaUrl = isVideo || isAudio ? streamUrl : (content?.dataUrl || streamUrl);
  const downloadUrl = `${API_BASE_URL}/documents/${document.id}/download`;

  // Reset zoom, pan, and playback errors when document changes
  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setPanOffset({ x: 0, y: 0 });
    videoRetryRef.current = 0;
    setVideoError(null);
  }, [document.id]);

  const handleVideoError = () => {
    if (videoRetryRef.current < 4 && videoRef.current) {
      videoRetryRef.current += 1;
      const savedTime = videoRef.current.currentTime || 0;
      const wasPlaying = !videoRef.current.paused;
      console.warn(`[Video] Progressive stream hiccup detected, recovering (attempt ${videoRetryRef.current})...`);
      
      const retryUrl = `${streamUrl}&_r=${Date.now()}`;
      videoRef.current.src = retryUrl;
      videoRef.current.load();
      videoRef.current.currentTime = savedTime;
      if (wasPlaying) {
        videoRef.current.play().catch(() => {});
      }
    } else {
      setVideoError('Video stream connection stalled. Click to reconnect.');
    }
  };

  const handleManualVideoRetry = () => {
    videoRetryRef.current = 0;
    setVideoError(null);
    if (videoRef.current) {
      const savedTime = videoRef.current.currentTime || 0;
      videoRef.current.src = `${streamUrl}&_r=${Date.now()}`;
      videoRef.current.load();
      videoRef.current.currentTime = savedTime;
      videoRef.current.play().catch(() => {});
    }
  };

  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate);
    const speed = parseFloat(rate);
    if (videoRef.current) videoRef.current.playbackRate = speed;
    if (audioRef.current) audioRef.current.playbackRate = speed;
  };

  // Dragging handlers for smooth pan
  const handleMouseDown = (e) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || zoom <= 1) return;
    setPanOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = (e) => {
    if (!isImage) return;
    if (e.ctrlKey || e.metaKey || zoom > 1) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.15 : -0.15;
      setZoom((z) => Math.min(4, Math.max(0.5, +(z + delta).toFixed(2))));
    }
  };

  // Double click toggles fit vs 175%
  const handleDoubleClick = () => {
    if (zoom === 1) {
      setZoom(1.75);
    } else {
      setZoom(1);
      setPanOffset({ x: 0, y: 0 });
    }
  };

  // Filtered Archive Entries
  const filteredArchiveEntries = (content?.entries || []).filter((entry) => {
    if (!archiveSearch.trim()) return true;
    return entry.path.toLowerCase().includes(archiveSearch.toLowerCase());
  });

  // Calculate backdrop styling for clean studio viewing
  const getBackdropStyle = () => {
    if (backdropTheme === 'light') {
      return {
        backgroundColor: '#f1f5f9',
        border: '1px solid #cbd5e1',
      };
    }
    if (backdropTheme === 'grid') {
      return {
        backgroundColor: '#090d16',
        backgroundImage:
          'radial-gradient(#1e293b 1px, transparent 1px), radial-gradient(#1e293b 1px, #090d16 1px)',
        backgroundSize: '24px 24px',
        backgroundPosition: '0 0, 12px 12px',
        border: '1px solid #1e293b',
      };
    }
    // Default: 'dark' Studio
    return {
      backgroundColor: '#0b0f19',
      backgroundImage: 'radial-gradient(circle at 50% 50%, #111827 0%, #070a12 100%)',
      border: '1px solid #1f2937',
    };
  };

  return (
    <Box
      p={isFullscreen ? 'xs' : 'lg'}
      style={{
        maxWidth: isFullscreen ? '100%' : 1100,
        margin: '0 auto',
        width: '100%',
        transition: 'all 0.2s ease-in-out',
      }}
    >
      {/* 1. Polished Header Card - Metadata, Badges & Actions */}
      <Paper
        p="md"
        radius="md"
        mb="md"
        className="premium-header-card"
        style={{
          border: '1px solid var(--border-card)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <Stack gap="xs">
          <Group justify="space-between" align="flex-start" wrap="wrap">
            <Box style={{ flex: 1, minWidth: 260 }}>
              <Group gap="xs" mb={6} wrap="wrap">
                <SourceBadge type={document.type} format={document.format} />

                {document.collectionName && document.collectionName !== 'Unassigned' && (
                  <Badge color="emerald" variant="filled" size="xs">
                    📁 {document.collectionName}
                  </Badge>
                )}

                {document.scope && (
                  <Badge
                    color={document.scope === 'personal' ? 'sage' : 'emerald'}
                    variant="light"
                    size="xs"
                  >
                    {document.scope === 'personal' ? 'Personal' : 'Work'}
                  </Badge>
                )}

                {document.security?.isEncrypted && (
                  <Badge color="teal" variant="light" size="xs" leftSection={<Lock size={10} />} className="badge-emerald">
                    AES-256 Zero-Knowledge Encrypted
                  </Badge>
                )}

                {dimensions && (
                  <Badge color="gray" variant="light" size="xs">
                    {dimensions.w} × {dimensions.h} px
                  </Badge>
                )}
              </Group>

              <EditableDocumentTitle document={document} onRename={onRenameFile} order={3} />
              <Text size="xs" c="dimmed" mt={2}>
                Original file: {document?.filename} • {formatBytes(document?.fileSize || content?.fileSize || 0)}
              </Text>
            </Box>

            {/* Clean Right Actions */}
            <Group gap="xs" align="center">
              {(isVideo || isAudio) && (
                <Select
                  size="xs"
                  w={110}
                  value={playbackRate}
                  onChange={handlePlaybackRateChange}
                  data={[
                    { value: '0.5', label: '0.5x Speed' },
                    { value: '1', label: '1.0x Normal' },
                    { value: '1.25', label: '1.25x' },
                    { value: '1.5', label: '1.5x' },
                    { value: '2', label: '2.0x' },
                  ]}
                />
              )}

              <Button
                component="a"
                href={downloadUrl}
                download={document.filename}
                size="xs"
                variant="filled"
                className="btn-premium-primary"
                leftSection={<Download size={14} />}
              >
                Download File
              </Button>

              <Tooltip label="Decrypted in memory. Telegram file storage verified." withArrow>
                <Badge
                  variant="light"
                  color="teal"
                  size="sm"
                  leftSection={<ShieldCheck size={12} />}
                  className="mono-badge badge-emerald"
                >
                  Vault Synced
                </Badge>
              </Tooltip>

              {onCloseFile && (
                <Tooltip label="Close file preview (Esc)" withArrow position="bottom-end">
                  <Button
                    size="xs"
                    variant="subtle"
                    color="gray"
                    leftSection={<X size={14} />}
                    onClick={onCloseFile}
                    style={{
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--surface-card)',
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    Close (Esc)
                  </Button>
                </Tooltip>
              )}
            </Group>
          </Group>
        </Stack>
      </Paper>

      {/* 2. Visual Content Stage */}
      {isImage ? (
        /* Image Studio Stage with Floating Toolbar */
        <Box
          style={{
            position: 'relative',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Studio Viewport */}
          <Box
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onDoubleClick={handleDoubleClick}
            style={{
              ...getBackdropStyle(),
              height: isFullscreen ? 'calc(100vh - 120px)' : '74vh',
              minHeight: '480px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              userSelect: 'none',
              cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
              position: 'relative',
              padding: '32px 24px 64px 24px', // Extra bottom padding so bottom text is never cut off by dock
            }}
          >
            <img
              src={activeMediaUrl}
              alt={document.title}
              onLoad={(e) => {
                setDimensions({
                  w: e.currentTarget.naturalWidth,
                  h: e.currentTarget.naturalHeight,
                });
              }}
              draggable={false}
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.2, 0, 0, 1)',
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '6px',
                boxShadow:
                  backdropTheme === 'light'
                    ? '0 12px 30px -5px rgba(0, 0, 0, 0.2)'
                    : '0 20px 45px -10px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.08)',
              }}
            />

            {/* Floating Studio Dock (Frosted Glass) */}
            <Box
              style={{
                position: 'absolute',
                bottom: 18,
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '9999px',
                padding: '6px 14px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
                zIndex: 20,
              }}
            >
              <Group gap={6} align="center">
                <Tooltip label="Zoom Out" withArrow>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    c="white"
                    onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}
                  >
                    <ZoomOut size={15} />
                  </ActionIcon>
                </Tooltip>

                <Tooltip label="Click to reset to Fit" withArrow>
                  <Button
                    variant="subtle"
                    size="compact-xs"
                    c="white"
                    px={6}
                    onClick={() => {
                      setZoom(1);
                      setPanOffset({ x: 0, y: 0 });
                    }}
                    style={{ fontWeight: 600, fontSize: '0.78rem' }}
                  >
                    {Math.round(zoom * 100)}%
                  </Button>
                </Tooltip>

                <Tooltip label="Zoom In" withArrow>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    c="white"
                    onClick={() => setZoom((z) => Math.min(4, +(z + 0.25).toFixed(2)))}
                  >
                    <ZoomIn size={15} />
                  </ActionIcon>
                </Tooltip>

                <Box style={{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />

                <Tooltip label="Rotate 90° Clockwise" withArrow>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    c="white"
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                  >
                    <RotateCw size={15} />
                  </ActionIcon>
                </Tooltip>

                <Tooltip label="Reset Zoom & Rotation" withArrow>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    c="white"
                    onClick={() => {
                      setZoom(1);
                      setRotation(0);
                      setPanOffset({ x: 0, y: 0 });
                    }}
                  >
                    <RefreshCw size={14} />
                  </ActionIcon>
                </Tooltip>

                <Box style={{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />

                {/* Canvas Theme Toggle */}
                <Tooltip
                  label={
                    backdropTheme === 'dark'
                      ? 'Switch to Light Backdrop'
                      : backdropTheme === 'light'
                      ? 'Switch to Studio Grid'
                      : 'Switch to Dark Studio'
                  }
                  withArrow
                >
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    c="white"
                    onClick={() => {
                      if (backdropTheme === 'dark') setBackdropTheme('light');
                      else if (backdropTheme === 'light') setBackdropTheme('grid');
                      else setBackdropTheme('dark');
                    }}
                  >
                    {backdropTheme === 'dark' ? (
                      <Sun size={15} />
                    ) : backdropTheme === 'light' ? (
                      <Grid size={15} />
                    ) : (
                      <Moon size={15} />
                    )}
                  </ActionIcon>
                </Tooltip>

                <Tooltip label={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'} withArrow>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    c="white"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                  >
                    {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Box>
          </Box>
        </Box>
      ) : isVideo ? (
        /* Video Player Stage */
        <Paper
          p="xs"
          radius="md"
          withBorder
          ta="center"
          style={{ backgroundColor: '#050811', overflow: 'hidden', position: 'relative' }}
        >
          {videoError && (
            <Box
              style={{
                position: 'absolute',
                top: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                backgroundColor: 'rgba(15, 23, 42, 0.92)',
                backdropFilter: 'blur(12px)',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              }}
            >
              <Group gap="xs">
                <Text size="xs" c="red.3" fw={500}>
                  {videoError}
                </Text>
                <Button
                  size="compact-xs"
                  variant="filled"
                  color="blue"
                  leftSection={<RefreshCw size={12} />}
                  onClick={handleManualVideoRetry}
                >
                  Reconnect
                </Button>
              </Group>
            </Box>
          )}

          <video
            ref={videoRef}
            controls
            playsInline
            preload="auto"
            src={activeMediaUrl}
            onError={handleVideoError}
            onCanPlay={() => {
              videoRetryRef.current = 0;
              setVideoError(null);
            }}
            style={{
              width: '100%',
              maxHeight: isFullscreen ? 'calc(100vh - 120px)' : '72vh',
              borderRadius: '6px',
              display: 'block',
              margin: '0 auto',
            }}
          />
        </Paper>
      ) : isAudio ? (
        /* Audio Player Stage */
        <Paper p="xl" radius="md" withBorder ta="center" style={{ backgroundColor: '#ffffff', minHeight: 380 }}>
          <Stack align="center" justify="center" gap="lg" py="xl">
            <Box
              style={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.15)',
              }}
            >
              <Music size={46} color="#0284c7" />
            </Box>

            <Box style={{ width: '100%', maxWidth: 540, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <EditableDocumentTitle document={document} onRename={onRenameFile} order={3} />
              <Text size="xs" c="dimmed" mt={4}>
                Audio Track • {document.filename} • {formatBytes(document.fileSize || 0)}
              </Text>
            </Box>

            <audio
              ref={audioRef}
              controls
              preload="auto"
              src={activeMediaUrl}
              style={{ width: '100%', maxWidth: '640px' }}
            />
          </Stack>
        </Paper>
      ) : isArchive ? (
        /* ZIP Archive Explorer */
        <Paper p="md" radius="md" withBorder style={{ backgroundColor: '#ffffff' }}>
          <Stack gap="sm">
            <Group justify="space-between" align="center" wrap="wrap">
              <Group gap="xs">
                <Archive size={20} color="#0284c7" />
                <Text fw={600} size="sm">
                  Archive Contents ({content?.fileCount || 0} items)
                </Text>
                {content?.totalUncompressedSize && (
                  <Badge size="xs" variant="light" color="blue">
                    Uncompressed: {formatBytes(content?.totalUncompressedSize || 0)}
                  </Badge>
                )}
              </Group>

              <SearchFilterInput
                placeholder="Search archive files..."
                value={archiveSearch}
                onChange={setArchiveSearch}
                width={220}
              />
            </Group>

            <Divider />

            <ScrollArea h={450}>
              <Stack gap={4}>
                {filteredArchiveEntries.map((entry, idx) => (
                  <Group
                    key={idx}
                    justify="space-between"
                    p="xs"
                    style={{
                      borderRadius: '6px',
                      backgroundColor: idx % 2 === 0 ? '#f8fafc' : '#ffffff',
                    }}
                  >
                    <Group gap="xs">
                      {entry.dir ? (
                        <Folder size={15} color="#eab308" />
                      ) : (
                        <File size={15} color="#64748b" />
                      )}
                      <Text size="xs" fw={entry.dir ? 600 : 400} c="#1e293b" style={{ fontFamily: 'monospace' }}>
                        {entry.path}
                      </Text>
                    </Group>
                    {!entry.dir && (
                      <Text size="xs" c="dimmed">
                        {formatBytes(entry.size)}
                      </Text>
                    )}
                  </Group>
                ))}
              </Stack>
            </ScrollArea>
          </Stack>
        </Paper>
      ) : (
        /* Generic Binary Format */
        <Paper p="xl" radius="md" withBorder ta="center" style={{ backgroundColor: '#ffffff' }}>
          <Stack align="center" gap="md" py="xl">
            <Box
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileCode size={36} color="#475569" />
            </Box>

            <Box>
              <Title order={4} mb={4}>
                {document.filename}
              </Title>
              <Text size="sm" c="dimmed">
                Binary format (.{document.type?.toUpperCase()}) stored securely in Telegram Vault.
              </Text>
              {document.checksumSha256 && (
                <Text size="xs" c="dimmed" mt={4} className="mono-badge">
                  SHA-256: {document.checksumSha256}
                </Text>
              )}
            </Box>

            <Button
              component="a"
              href={downloadUrl}
              download={document.filename}
              color="blue"
              size="sm"
              mt="md"
              leftSection={<Download size={16} />}
            >
              Download Decrypted File
            </Button>
          </Stack>
        </Paper>
      )}

      {content?.warning && (
        <Alert color="blue" variant="light" radius="md" mt="md">
          {content?.warning}
        </Alert>
      )}
    </Box>
  );
}
