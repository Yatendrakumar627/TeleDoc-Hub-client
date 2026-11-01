import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  RotateCcw,
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
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FlipHorizontal,
  FlipVertical,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import SourceBadge from '../../components/ui/SourceBadge';
import SearchFilterInput from '../../components/ui/SearchFilterInput';
import EditableDocumentTitle from '../../components/ui/EditableDocumentTitle';
import { formatBytes } from '../../utils/formatters';
import { API_BASE_URL } from '../../config';

export default function MediaBinaryViewer({
  document,
  content,
  collectionFiles = [],
  onSelectFile,
  onRenameFile,
  onCloseFile,
}) {
  const format = (content?.format || document?.format || '').toLowerCase();
  const docType = (document?.type || content?.type || '').toLowerCase();

  const isImage = format === 'image' || ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp', 'ico', 'tiff', 'avif'].includes(docType);
  const isVideo = format === 'video' || (format === 'media' && docType === 'video') || ['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v', 'ogv'].includes(docType);
  const isAudio = format === 'audio' || (format === 'media' && docType === 'audio') || ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma'].includes(docType);
  const isArchive = format === 'archive' || docType === 'zip';

  // Compute all available images in the current collection/scope
  const isImageDoc = (doc) => {
    if (!doc) return false;
    const fmt = (doc.format || '').toLowerCase();
    const typ = (doc.type || '').toLowerCase();
    const ext = (doc.filename || doc.title || '').split('.').pop().toLowerCase();
    return (
      fmt === 'image' ||
      ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp', 'ico', 'tiff', 'avif'].includes(typ) ||
      ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp', 'ico', 'tiff', 'avif'].includes(ext)
    );
  };

  const imageFiles = useMemo(() => {
    const list = Array.isArray(collectionFiles) && collectionFiles.length > 0 ? collectionFiles : [document];
    const filtered = list.filter(isImageDoc);
    return filtered.length > 0 ? filtered : [document];
  }, [collectionFiles, document]);

  const currentIndex = useMemo(() => {
    return imageFiles.findIndex((f) => f.id === document.id);
  }, [imageFiles, document.id]);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < imageFiles.length - 1;

  const handlePrevImage = () => {
    if (hasPrev && onSelectFile) {
      onSelectFile(imageFiles[currentIndex - 1].id);
    }
  };

  const handleNextImage = () => {
    if (hasNext && onSelectFile) {
      onSelectFile(imageFiles[currentIndex + 1].id);
    }
  };

  // Image manipulation state
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [backdropTheme, setBackdropTheme] = useState('dark'); // 'dark' | 'light' | 'grid'
  const [showFilmstrip, setShowFilmstrip] = useState(true);
  const [dimensions, setDimensions] = useState(null);

  // Pan / Dragging state
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const activeThumbRef = useRef(null);

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

  // Auto-scroll active thumbnail into view in filmstrip
  useEffect(() => {
    if (activeThumbRef.current) {
      activeThumbRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [document.id, showFilmstrip]);

  // High-Performance Predictive Preloading: Preload prev & next images into browser cache for 0ms instant switching
  useEffect(() => {
    if (!isImage || imageFiles.length <= 1) return;

    const toPreload = [];
    if (hasNext && imageFiles[currentIndex + 1]) toPreload.push(imageFiles[currentIndex + 1]);
    if (hasPrev && imageFiles[currentIndex - 1]) toPreload.push(imageFiles[currentIndex - 1]);

    toPreload.forEach((img) => {
      if (img?.id) {
        const preloadImg = new Image();
        preloadImg.decoding = 'async';
        preloadImg.src = `${API_BASE_URL}/documents/${img.id}/view?token=${encodeURIComponent(token)}`;
      }
    });
  }, [currentIndex, isImage, imageFiles, hasNext, hasPrev, token]);

  // Reset zoom, pan, and transforms when document changes
  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setPanOffset({ x: 0, y: 0 });
    videoRetryRef.current = 0;
    setVideoError(null);
  }, [document.id]);

  // Global Keyboard Navigation for Image Studio
  useEffect(() => {
    if (!isImage) return;
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextImage();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoom((z) => Math.min(5, +(z + 0.25).toFixed(2)));
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setZoom((z) => Math.max(0.25, +(z - 0.25).toFixed(2)));
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        setRotation((r) => (r + 90) % 360);
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsFullscreen((f) => !f);
      } else if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        setShowFilmstrip((s) => !s);
      } else if (e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setFlipH((h) => !h);
      } else if (e.key === '0') {
        e.preventDefault();
        setZoom(1);
        setRotation(0);
        setFlipH(false);
        setFlipV(false);
        setPanOffset({ x: 0, y: 0 });
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else if (zoom !== 1 || rotation !== 0 || panOffset.x !== 0 || panOffset.y !== 0) {
          setZoom(1);
          setRotation(0);
          setFlipH(false);
          setFlipV(false);
          setPanOffset({ x: 0, y: 0 });
        } else if (onCloseFile) {
          onCloseFile();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isImage, hasPrev, hasNext, currentIndex, imageFiles, zoom, rotation, panOffset, isFullscreen]);

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

  // Dragging handlers for smooth pan (RAF-throttled to 60/120Hz display refresh rate)
  const rafRef = useRef(null);

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
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setPanOffset({
        x: clientX - dragStartRef.current.x,
        y: clientY - dragStartRef.current.y,
      });
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
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

              <Tooltip label="Encrypted in Vault • Verified" withArrow>
                <Badge
                  variant="light"
                  color="teal"
                  size="sm"
                  leftSection={<ShieldCheck size={12} />}
                  style={{
                    height: 32,
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(24, 88, 68, 0.08)',
                    color: 'var(--brand-forest)',
                    border: '1px solid rgba(24, 88, 68, 0.2)',
                  }}
                >
                  Vault Synced
                </Badge>
              </Tooltip>

              <Button
                component="a"
                href={downloadUrl}
                download={document.filename}
                size="xs"
                variant="filled"
                leftSection={<Download size={13} />}
                style={{
                  height: 32,
                  fontWeight: 600,
                  borderRadius: '8px',
                  backgroundColor: 'var(--brand-forest)',
                  color: '#ffffff',
                  boxShadow: '0 2px 6px rgba(24, 88, 68, 0.2)',
                  transition: 'all 0.15s ease',
                }}
              >
                Download File
              </Button>

              {onCloseFile && (
                <Tooltip
                  label={
                    document?.collectionName && document.collectionName !== 'Unassigned'
                      ? `Back to "${document.collectionName}" folder (Esc)`
                      : 'Close file preview (Esc)'
                  }
                  withArrow
                  position="bottom-end"
                >
                  <Button
                    size="xs"
                    variant="subtle"
                    color="gray"
                    leftSection={
                      document?.collectionName && document.collectionName !== 'Unassigned' ? (
                        <ArrowLeft size={14} />
                      ) : (
                        <X size={14} />
                      )
                    }
                    onClick={onCloseFile}
                    style={{
                      height: 32,
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--surface-card)',
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {document?.collectionName && document.collectionName !== 'Unassigned'
                      ? 'Back to Folder (Esc)'
                      : 'Close (Esc)'}
                  </Button>
                </Tooltip>
              )}
            </Group>
          </Group>
        </Stack>
      </Paper>

      {/* 2. Visual Content Stage */}
      {isImage ? (
        /* Enterprise Non-Overlapping Image Studio Stage */
        <Box
          style={{
            ...getBackdropStyle(),
            height: isFullscreen ? 'calc(100vh - 100px)' : '78vh',
            minHeight: '560px',
            borderRadius: '14px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
          }}
        >
          {/* Top Non-Overlapping HUD Header Strip */}
          <Group
            justify="space-between"
            align="center"
            px="md"
            py={8}
            wrap="nowrap"
            style={{
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              zIndex: 10,
              flexShrink: 0,
            }}
          >
            {/* Left: Index badge & Dimensions */}
            <Group gap="xs" align="center" wrap="nowrap" style={{ minWidth: 0 }}>
              {imageFiles.length > 1 && (
                <Badge
                  size="sm"
                  variant="filled"
                  color="emerald"
                  style={{ fontWeight: 700, borderRadius: '6px', flexShrink: 0 }}
                >
                  {currentIndex + 1} / {imageFiles.length}
                </Badge>
              )}
              {dimensions && (
                <Text size="xs" style={{ color: '#cbd5e1', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  {dimensions.w} × {dimensions.h} px
                </Text>
              )}
              {document.fileSize && (
                <Text size="xs" style={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>
                  • {formatBytes(document.fileSize)}
                </Text>
              )}
            </Group>

            {/* Right: Filmstrip Toggle, Canvas Theme, Download & Fullscreen */}
            <Group gap={6} align="center" wrap="nowrap" style={{ flexShrink: 0 }}>
              {imageFiles.length > 1 && (
                <Tooltip label={showFilmstrip ? 'Hide Filmstrip' : 'Show Filmstrip'} withArrow>
                  <ActionIcon
                    variant={showFilmstrip ? 'filled' : 'subtle'}
                    color={showFilmstrip ? 'emerald' : 'gray'}
                    size="sm"
                    c="white"
                    onClick={() => setShowFilmstrip(!showFilmstrip)}
                  >
                    <Layers size={15} />
                  </ActionIcon>
                </Tooltip>
              )}

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

              <Tooltip label="Download Original Image" withArrow>
                <ActionIcon
                  component="a"
                  href={downloadUrl}
                  download={document.filename}
                  variant="subtle"
                  color="gray"
                  size="sm"
                  c="white"
                >
                  <Download size={15} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label={isFullscreen ? 'Exit Fullscreen (F)' : 'View Fullscreen (F)'} withArrow>
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
          </Group>

          {/* Central Dedicated Image Stage (100% Free of any Overlays) */}
          <Box
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onDoubleClick={handleDoubleClick}
            style={{
              flex: 1,
              minHeight: 0,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              userSelect: 'none',
              cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
              padding: '16px 20px',
            }}
          >

            {/* Stage Left: Previous Image Floating Action Button */}
            {hasPrev && (
              <Tooltip
                label={`Previous: ${imageFiles[currentIndex - 1]?.title || imageFiles[currentIndex - 1]?.filename} (←)`}
                withArrow
                position="right"
              >
                <ActionIcon
                  variant="filled"
                  size="44px"
                  radius="xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevImage();
                  }}
                  style={{
                    position: 'absolute',
                    left: 20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 25,
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <ChevronLeft size={22} />
                </ActionIcon>
              </Tooltip>
            )}

            {/* Stage Right: Next Image Floating Action Button */}
            {hasNext && (
              <Tooltip
                label={`Next: ${imageFiles[currentIndex + 1]?.title || imageFiles[currentIndex + 1]?.filename} (→)`}
                withArrow
                position="left"
              >
                <ActionIcon
                  variant="filled"
                  size="44px"
                  radius="xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  style={{
                    position: 'absolute',
                    right: 20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 25,
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <ChevronRight size={22} />
                </ActionIcon>
              </Tooltip>
            )}

            {/* Active Rendered Image Canvas */}
            <img
              src={activeMediaUrl}
              alt={document.title}
              decoding="async"
              onLoad={(e) => {
                setDimensions({
                  w: e.currentTarget.naturalWidth,
                  h: e.currentTarget.naturalHeight,
                });
              }}
              draggable={false}
              style={{
                transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(${zoom}) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1}) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.2, 0, 0, 1)',
                willChange: isDragging || zoom > 1 ? 'transform' : 'auto',
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
          </Box>

          {/* Bottom Structured Studio Control & Navigation Area (Completely Non-Overlapping) */}
          <Box
            style={{
              flexShrink: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: showFilmstrip && imageFiles.length > 1 ? '8px 16px 12px' : '8px 16px',
              gap: 8,
              zIndex: 15,
            }}
          >
            {/* Filmstrip Carousel Row */}
            {imageFiles.length > 1 && showFilmstrip && (
              <Box
                className="teledoc-filmstrip-scroll"
                style={{
                  maxWidth: 'min(92vw, 760px)',
                  width: '100%',
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch',
                  padding: '4px 6px',
                }}
              >
                <style>{`
                  .teledoc-filmstrip-scroll::-webkit-scrollbar {
                    display: none;
                    width: 0;
                    height: 0;
                  }
                `}</style>
                <Group gap={8} wrap="nowrap" align="center" justify="center" style={{ minWidth: 'min-content', margin: '0 auto' }}>
                  {imageFiles.map((img, idx) => {
                    const isCurrent = img.id === document.id;
                    // Windowed virtualization: Render actual <img> within ±12 window around active photo, or when collection <= 24
                    const isWithinWindow = Math.abs(idx - currentIndex) <= 12 || imageFiles.length <= 24;
                    const imgThumbUrl = `${API_BASE_URL}/documents/${img.id}/view?token=${encodeURIComponent(token)}`;
                    const tooltipText = `${img.title || img.filename} (${idx + 1} of ${imageFiles.length})`;

                    return (
                      <Box
                        key={img.id}
                        ref={isCurrent ? activeThumbRef : null}
                        title={tooltipText}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectFile) onSelectFile(img.id);
                        }}
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: '8px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: isCurrent ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.16)',
                          boxShadow: isCurrent ? '0 0 12px rgba(16, 185, 129, 0.65)' : 'none',
                          opacity: isCurrent ? 1 : 0.6,
                          transform: isCurrent ? 'scale(1.06)' : 'scale(1)',
                          transition: 'all 0.15s ease',
                          flexShrink: 0,
                          backgroundColor: '#090d16',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isWithinWindow ? (
                          <img
                            src={imgThumbUrl}
                            alt={img.title || img.filename}
                            loading="lazy"
                            decoding="async"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />
                        ) : (
                          <ImageIcon size={16} color="rgba(255, 255, 255, 0.2)" />
                        )}
                      </Box>
                    );
                  })}
                </Group>
              </Box>
            )}

            {/* Studio Action Dock (Pill toolbar) */}
            <Group
              gap={6}
              align="center"
              wrap="nowrap"
              style={{
                backgroundColor: 'rgba(30, 41, 59, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '9999px',
                padding: '4px 12px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                maxWidth: '95vw',
                overflowX: 'auto',
              }}
            >
              {/* 1. Image Navigation Segment */}
              {imageFiles.length > 1 && (
                <>
                  <Tooltip label="Previous Image (←)" withArrow>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="sm"
                      c="white"
                      disabled={!hasPrev}
                      onClick={handlePrevImage}
                      style={{ opacity: hasPrev ? 1 : 0.35 }}
                    >
                      <ChevronLeft size={16} />
                    </ActionIcon>
                  </Tooltip>

                  <Text size="11px" fw={600} c="white" px={4} style={{ whiteSpace: 'nowrap', userSelect: 'none' }}>
                    {currentIndex + 1} / {imageFiles.length}
                  </Text>

                  <Tooltip label="Next Image (→)" withArrow>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="sm"
                      c="white"
                      disabled={!hasNext}
                      onClick={handleNextImage}
                      style={{ opacity: hasNext ? 1 : 0.35 }}
                    >
                      <ChevronRight size={16} />
                    </ActionIcon>
                  </Tooltip>

                  <Box style={{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />
                </>
              )}

              {/* 2. Zoom Controls Segment */}
              <Tooltip label="Zoom Out (-)" withArrow>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  c="white"
                  onClick={() => setZoom((z) => Math.max(0.25, +(z - 0.25).toFixed(2)))}
                >
                  <ZoomOut size={15} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Click to reset zoom to Fit (0)" withArrow>
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

              <Tooltip label="Zoom In (+)" withArrow>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  c="white"
                  onClick={() => setZoom((z) => Math.min(5, +(z + 0.25).toFixed(2)))}
                >
                  <ZoomIn size={15} />
                </ActionIcon>
              </Tooltip>

              <Box style={{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />

              {/* 3. Transform Segment: Rotate & Flip */}
              <Tooltip label="Rotate 90° CCW" withArrow>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  c="white"
                  onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                >
                  <RotateCcw size={15} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Rotate 90° CW (R)" withArrow>
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

              <Tooltip label={flipH ? 'Unflip Horizontal' : 'Flip Horizontally (H)'} withArrow>
                <ActionIcon
                  variant={flipH ? 'filled' : 'subtle'}
                  color={flipH ? 'emerald' : 'gray'}
                  size="sm"
                  c="white"
                  onClick={() => setFlipH((h) => !h)}
                >
                  <FlipHorizontal size={15} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label={flipV ? 'Unflip Vertical' : 'Flip Vertically'} withArrow>
                <ActionIcon
                  variant={flipV ? 'filled' : 'subtle'}
                  color={flipV ? 'emerald' : 'gray'}
                  size="sm"
                  c="white"
                  onClick={() => setFlipV((v) => !v)}
                >
                  <FlipVertical size={15} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Reset All Transforms" withArrow>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  c="white"
                  onClick={() => {
                    setZoom(1);
                    setRotation(0);
                    setFlipH(false);
                    setFlipV(false);
                    setPanOffset({ x: 0, y: 0 });
                  }}
                >
                  <RefreshCw size={14} />
                </ActionIcon>
              </Tooltip>

              {/* 4. Filmstrip Toggle (if multiple images) */}
              {imageFiles.length > 1 && (
                <>
                  <Box style={{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />
                  <Tooltip label={showFilmstrip ? 'Hide Thumbnails' : 'Show Thumbnails'} withArrow>
                    <ActionIcon
                      variant={showFilmstrip ? 'filled' : 'subtle'}
                      color={showFilmstrip ? 'emerald' : 'gray'}
                      size="sm"
                      c="white"
                      onClick={() => setShowFilmstrip(!showFilmstrip)}
                    >
                      <Layers size={15} />
                    </ActionIcon>
                  </Tooltip>
                </>
              )}
            </Group>
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
                Binary format (.{document.type?.toUpperCase()}) stored securely in Cloud Vault.
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
