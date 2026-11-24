import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Stack,
  Title,
  Text,
  Paper,
  Button,
  Group,
  SimpleGrid,
  Card,
  ThemeIcon,
  Badge,
  TextInput,
  ActionIcon,
  Tooltip,
  Select,
  Pagination,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  UploadCloud,
  FileText,
  ShieldCheck,
  FolderKanban,
  Sparkles,
  Zap,
  HardDrive,
  Folder,
  Search,
  ArrowRight,
  Download,
  Image as ImageIcon,
  Film,
  Music,
  Table2,
  Archive,
  Layers,
  Clock,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  List,
} from 'lucide-react';
import GalleryMediaCard from '../features/collection/GalleryMediaCard';
import { formatBytes, formatNumber, formatDate, extractDateFromName } from '../utils/formatters';
import { API_BASE_URL } from '../config';
import { getDownloadUrl } from '../services/apiClient';

/**
 * Authentic Document Brand Icon (Word, PDF, Excel, PPT, Image, Video, Media)
 */
function DocumentBrandIcon({ type, format, filename, size = 30 }) {
  const t = (type || '').toLowerCase();
  const f = (format || '').toLowerCase();
  const ext = (filename ? filename.split('.').pop() : '').toLowerCase();

  const isWord = ['docx', 'doc'].includes(t) || ['docx', 'doc'].includes(ext) || f === 'word';
  const isPdf = t === 'pdf' || ext === 'pdf' || f === 'pdf';
  const isSheet = ['xlsx', 'xls', 'csv', 'tsv', 'ods'].includes(t) || ['xlsx', 'xls', 'csv'].includes(ext) || f === 'spreadsheet';
  const isPpt = ['pptx', 'ppt'].includes(t) || ['pptx', 'ppt'].includes(ext) || f === 'presentation';
  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp', 'ico'].includes(t) || ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext) || f === 'image';
  const isVideo = ['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(t) || ['mp4', 'webm', 'mov'].includes(ext) || f === 'video';
  const isAudio = ['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(t) || ['mp3', 'wav'].includes(ext) || f === 'audio';

  if (isWord) {
    return (
      <Box style={{ width: size, height: size, borderRadius: 7, backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 36 36" fill="none">
          <rect x="9" y="4" width="22" height="28" rx="3" fill="#185ABD" />
          <path d="M23 4H31V12L23 4Z" fill="#103F91" />
          <rect x="5" y="8" width="18" height="20" rx="3.5" fill="url(#w_grad_es)" style={{ filter: 'drop-shadow(0 2px 4px rgba(16,63,145,0.35))' }} />
          <path d="M8.5 13L10.2 23H11.8L13.5 16.5L15.2 23H16.8L18.5 13H16.8L15.6 19.5L14.1 13H12.9L11.4 19.5L10.2 13H8.5Z" fill="#ffffff" />
          <defs>
            <linearGradient id="w_grad_es" x1="5" y1="8" x2="23" y2="28" gradientUnits="userSpaceOnUse">
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
      <Box style={{ width: size, height: size, borderRadius: 7, backgroundColor: '#ffe4e6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 36 36" fill="none">
          <rect x="7" y="4" width="22" height="28" rx="3" fill="#E11D48" />
          <path d="M21 4H29V12L21 4Z" fill="#9F1239" />
          <rect x="5" y="8" width="18" height="20" rx="3.5" fill="url(#pdf_grad_es)" style={{ filter: 'drop-shadow(0 2px 4px rgba(159,18,57,0.35))' }} />
          <text x="7.5" y="21.5" fill="#ffffff" fontSize="8.5" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.5">PDF</text>
          <defs>
            <linearGradient id="pdf_grad_es" x1="5" y1="8" x2="23" y2="28" gradientUnits="userSpaceOnUse">
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
      <Box style={{ width: size, height: size, borderRadius: 7, backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 36 36" fill="none">
          <rect x="9" y="4" width="22" height="28" rx="3" fill="#107C41" />
          <path d="M23 4H31V12L23 4Z" fill="#0A5028" />
          <rect x="5" y="8" width="18" height="20" rx="3.5" fill="url(#x_grad_es)" style={{ filter: 'drop-shadow(0 2px 4px rgba(10,80,40,0.35))' }} />
          <path d="M9.5 13.5L12.5 18L9.5 22.5H11.5L13.5 19.3L15.5 22.5H17.5L14.5 18L17.5 13.5H15.5L13.5 16.7L11.5 13.5H9.5Z" fill="#ffffff" />
          <defs>
            <linearGradient id="x_grad_es" x1="5" y1="8" x2="23" y2="28" gradientUnits="userSpaceOnUse">
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
      <Box style={{ width: size, height: size, borderRadius: 7, backgroundColor: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 36 36" fill="none">
          <rect x="9" y="4" width="22" height="28" rx="3" fill="#C43E1C" />
          <path d="M23 4H31V12L23 4Z" fill="#8A260D" />
          <rect x="5" y="8" width="18" height="20" rx="3.5" fill="url(#ppt_grad_es)" style={{ filter: 'drop-shadow(0 2px 4px rgba(138,38,13,0.35))' }} />
          <path d="M9.5 13H14C15.5 13 16.5 14 16.5 15.5C16.5 17 15.5 18 14 18H11.5V23H9.5V13ZM11.5 16.2H13.8C14.4 16.2 14.8 15.9 14.8 15.5C14.8 15.1 14.4 14.8 13.8 14.8H11.5V16.2Z" fill="#ffffff" />
          <defs>
            <linearGradient id="ppt_grad_es" x1="5" y1="8" x2="23" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#EA580C" />
              <stop offset="1" stopColor="#C2410C" />
            </linearGradient>
          </defs>
        </svg>
      </Box>
    );
  }

  if (isImage) {
    return (
      <Box style={{ width: size, height: size, borderRadius: 7, backgroundColor: '#fdf4ff', border: '1px solid #fae8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <ImageIcon size={size * 0.54} color="#a855f7" />
      </Box>
    );
  }

  if (isVideo) {
    return (
      <Box style={{ width: size, height: size, borderRadius: 7, backgroundColor: '#eff6ff', border: '1px solid #dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Film size={size * 0.54} color="#2563eb" />
      </Box>
    );
  }

  if (isAudio) {
    return (
      <Box style={{ width: size, height: size, borderRadius: 7, backgroundColor: '#fdf2f8', border: '1px solid #fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Music size={size * 0.54} color="#db2777" />
      </Box>
    );
  }

  return (
    <Box style={{ width: size, height: size, borderRadius: 7, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <FileText size={size * 0.54} color="#64748b" />
    </Box>
  );
}

/**
 * Helper to determine border accent stripe by file type
 */
function getFormatAccentClass(doc) {
  const t = (doc.type || '').toLowerCase();
  const f = (doc.format || '').toLowerCase();
  const ext = (doc.filename || doc.title || '').split('.').pop().toLowerCase();

  if (['docx', 'doc'].includes(t) || ['docx', 'doc'].includes(ext) || f === 'word') return 'filecard-accent-docx';
  if (t === 'pdf' || ext === 'pdf' || f === 'pdf') return 'filecard-accent-pdf';
  if (['pptx', 'ppt'].includes(t) || ['pptx', 'ppt'].includes(ext) || f === 'presentation') return 'filecard-accent-pptx';
  if (['xlsx', 'xls', 'csv', 'tsv'].includes(t) || ['xlsx', 'xls', 'csv'].includes(ext) || f === 'spreadsheet') return 'filecard-accent-spreadsheet';
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp'].includes(t) || ['png', 'jpg', 'jpeg', 'webp'].includes(ext) || f === 'image') return 'filecard-accent-image';
  if (['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(t) || ['mp4', 'webm', 'mov'].includes(ext) || ['video', 'media'].includes(f)) return 'filecard-accent-video';
  if (['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(t) || ['mp3', 'wav'].includes(ext) || f === 'audio') return 'filecard-accent-audio';
  return 'filecard-accent-default';
}

export default function EmptyState({
  onOpenUpload,
  isProcessing = false,
  allDocuments = [],
  groups = [],
  status = null,
  onSelectFile,
  onSelectCollection,
  onOpenCollectionHub,
}) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [activePage, setActivePage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [showAllCollections, setShowAllCollections] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState('auto'); // 'auto' | 'gallery' | 'cards'

  // Visual gallery layout activates automatically for photos and media, or when explicitly toggled
  const isGalleryLayout = viewMode === 'gallery' || (viewMode === 'auto' && (selectedCategory === 'images' || selectedCategory === 'media'));

  // Reset pagination to page 1 whenever filters, search, sorting or page size change
  useEffect(() => {
    setActivePage(1);
  }, [selectedCategory, searchQuery, sortBy, pageSize]);

  const token = localStorage.getItem('teledoc_vault_jwt') || '';

  // 1. Total Vault Storage calculation
  const totalVaultSize = useMemo(() => {
    return (allDocuments || []).reduce((acc, d) => acc + (d.fileSize || 0), 0);
  }, [allDocuments]);

  // 2. Real-time Category Breakdown
  const categoryStats = useMemo(() => {
    let docs = 0;
    let images = 0;
    let videos = 0;
    let sheets = 0;
    let archives = 0;

    (allDocuments || []).forEach((d) => {
      const type = (d.type || '').toLowerCase();
      const format = (d.format || '').toLowerCase();
      const ext = (d.filename || d.title || '').split('.').pop().toLowerCase();

      if (['pdf', 'docx', 'doc', 'txt', 'md'].includes(type) || ['pdf', 'word', 'document'].includes(format) || ['docx', 'doc', 'pdf', 'txt'].includes(ext)) {
        docs += 1;
      } else if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp', 'ico'].includes(type) || format === 'image' || ['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
        images += 1;
      } else if (['mp4', 'webm', 'mov', 'mkv', 'avi', 'mp3', 'wav', 'ogg'].includes(type) || ['video', 'audio', 'media'].includes(format) || ['mp4', 'mov', 'webm'].includes(ext)) {
        videos += 1;
      } else if (['xlsx', 'xls', 'csv', 'tsv'].includes(type) || format === 'spreadsheet' || ['xlsx', 'xls', 'csv'].includes(ext)) {
        sheets += 1;
      } else {
        archives += 1;
      }
    });

    return { docs, images, videos, sheets, archives };
  }, [allDocuments]);

  // 3. Derived Collections Breakdown (All & Top Active)
  const allCollectionsList = useMemo(() => {
    const map = new Map();
    (allDocuments || []).forEach((doc) => {
      if (doc.collectionId && doc.collectionId !== 'unassigned') {
        if (!map.has(doc.collectionId)) {
          map.set(doc.collectionId, {
            id: doc.collectionId,
            name: doc.collectionName || 'Collection',
            group: doc.group || doc.taxonomy?.group || null,
            scope: doc.scope || 'personal',
            fileCount: 1,
            totalSize: doc.fileSize || 0,
            latestDate: doc.createdAt || null,
          });
        } else {
          const col = map.get(doc.collectionId);
          col.fileCount += 1;
          col.totalSize += doc.fileSize || 0;
          if (doc.createdAt && (!col.latestDate || new Date(doc.createdAt) > new Date(col.latestDate))) {
            col.latestDate = doc.createdAt;
          }
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => b.fileCount - a.fileCount);
  }, [allDocuments]);

  const totalCollectionsCount = useMemo(() => {
    if (status?.collectionCount && status.collectionCount > allCollectionsList.length) {
      return status.collectionCount;
    }
    return allCollectionsList.length;
  }, [status, allCollectionsList]);

  const visibleCollections = useMemo(() => {
    const initialLimit = isMobile ? 4 : 8;
    return showAllCollections ? allCollectionsList : allCollectionsList.slice(0, initialLimit);
  }, [showAllCollections, allCollectionsList, isMobile]);

  // Derived distinct groups count
  const distinctGroupsCount = useMemo(() => {
    if (groups && groups.length > 0) return groups.length;
    const set = new Set();
    (allDocuments || []).forEach((d) => {
      const g = d.group || d.taxonomy?.group;
      if (g && g !== 'General' && g !== 'Unassigned') set.add(g);
    });
    return set.size;
  }, [groups, allDocuments]);

  // Real-time Vault Connection State
  const isVaultOnline = Boolean(
    status?.telegram?.connected ||
    status?.connected ||
    (allDocuments && allDocuments.length > 0) ||
    status?.status === 'online'
  );

  const channelTitle =
    status?.telegram?.channel ||
    status?.channel ||
    (isVaultOnline ? 'Telegram Cloud Vault' : '');

  // 4. Filtered & Sorted Documents
  const filteredDocuments = useMemo(() => {
    let list = [...(allDocuments || [])];

    // Filter by category
    if (selectedCategory === 'docs') {
      list = list.filter((d) => {
        const t = (d.type || '').toLowerCase();
        const f = (d.format || '').toLowerCase();
        const ext = (d.filename || d.title || '').split('.').pop().toLowerCase();
        return ['pdf', 'docx', 'doc', 'txt', 'md'].includes(t) || ['pdf', 'word', 'document'].includes(f) || ['docx', 'doc', 'pdf'].includes(ext);
      });
    } else if (selectedCategory === 'images') {
      list = list.filter((d) => {
        const t = (d.type || '').toLowerCase();
        const f = (d.format || '').toLowerCase();
        const ext = (d.filename || d.title || '').split('.').pop().toLowerCase();
        return ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp'].includes(t) || f === 'image' || ['png', 'jpg', 'jpeg', 'webp'].includes(ext);
      });
    } else if (selectedCategory === 'media') {
      list = list.filter((d) => {
        const t = (d.type || '').toLowerCase();
        const f = (d.format || '').toLowerCase();
        const ext = (d.filename || d.title || '').split('.').pop().toLowerCase();
        return ['mp4', 'webm', 'mov', 'mkv', 'avi', 'mp3', 'wav', 'ogg'].includes(t) || ['video', 'audio', 'media'].includes(f) || ['mp4', 'webm', 'mov'].includes(ext);
      });
    } else if (selectedCategory === 'sheets') {
      list = list.filter((d) => {
        const t = (d.type || '').toLowerCase();
        const f = (d.format || '').toLowerCase();
        const ext = (d.filename || d.title || '').split('.').pop().toLowerCase();
        return ['xlsx', 'xls', 'csv', 'tsv'].includes(t) || f === 'spreadsheet' || ['xlsx', 'xls', 'csv'].includes(ext);
      });
    } else if (selectedCategory === 'archives') {
      list = list.filter((d) => {
        const t = (d.type || '').toLowerCase();
        const f = (d.format || '').toLowerCase();
        return ['zip', 'tar', 'gz', 'code', 'archive'].includes(t) || ['archive', 'code'].includes(f);
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((d) => {
        const title = (d.title || '').toLowerCase();
        const fname = (d.filename || '').toLowerCase();
        const cname = (d.collectionName || '').toLowerCase();
        const gname = (d.group || d.taxonomy?.group || '').toLowerCase();
        return title.includes(q) || fname.includes(q) || cname.includes(q) || gname.includes(q);
      });
    }

    // Sort
    if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === 'oldest') {
      list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    } else if (sortBy === 'size') {
      list.sort((a, b) => (b.fileSize || 0) - (a.fileSize || 0));
    } else if (sortBy === 'name') {
      list.sort((a, b) => (a.title || a.filename || '').localeCompare(b.title || b.filename || ''));
    }

    return list;
  }, [allDocuments, selectedCategory, searchQuery, sortBy]);

  // 100-Item High-Performance Pagination Calculation
  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / pageSize));
  const currentPage = Math.min(activePage, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredDocuments.length);
  const paginatedDocuments = useMemo(() => {
    return filteredDocuments.slice(startIndex, endIndex);
  }, [filteredDocuments, startIndex, endIndex]);

  return (
    <Box p={isMobile ? 6 : 10} className="luxury-hero-canvas" style={{ minHeight: 'calc(100vh - 65px)', width: '100%', boxSizing: 'border-box' }}>
      <Stack gap={8} style={{ width: '100%', boxSizing: 'border-box' }}>
        
        {/* ================= 1. LIVE HERO COMMAND HEADER ================= */}
        <Paper
          py={8}
          px={14}
          radius="md"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 247, 242, 0.92) 100%)',
            border: '1px solid var(--border-gold)',
            boxShadow: '0 4px 16px rgba(24, 88, 68, 0.06), 0 1px 6px rgba(176, 138, 79, 0.1)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Group justify="space-between" align="center" wrap="wrap" gap="xs">
            <Stack gap={2} style={{ maxWidth: 680 }}>
              <Group gap={6} wrap="nowrap">
                {/* Live Pulse Indicator */}
                <Box
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '2px 8px',
                    borderRadius: 999,
                    backgroundColor: isVaultOnline ? 'rgba(24, 88, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${isVaultOnline ? 'rgba(24, 88, 68, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                  }}
                >
                  {isVaultOnline ? (
                    <Box className="vault-pulse-dot" />
                  ) : (
                    <Box
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        backgroundColor: '#ef4444',
                      }}
                    />
                  )}
                  <Text size="10.5px" fw={700} style={{ color: isVaultOnline ? 'var(--brand-primary)' : '#dc2626', letterSpacing: '0.02em' }}>
                    {isVaultOnline
                      ? (channelTitle ? `Connected • ${channelTitle}` : 'Connected')
                      : 'Connecting...'}
                  </Text>
                </Box>
              </Group>

              <Title order={1} className="luxury-gradient-text" style={{ fontSize: isMobile ? '1.15rem' : '1.35rem', fontWeight: 800, lineHeight: 1.15 }}>
                Vault Command Center
              </Title>
              <Text size="xs" style={{ color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                Search, preview, and organize all your documents, photos, and media.
              </Text>
            </Stack>

            {/* Quick Action Button */}
            <Group gap="xs" wrap="nowrap">
              <Button
                size="xs"
                h={30}
                px={12}
                radius="md"
                className="btn-premium-primary"
                leftSection={<UploadCloud size={15} color="#eedebd" />}
                onClick={() => onOpenUpload && onOpenUpload(null)}
                loading={isProcessing}
                style={{
                  background: 'linear-gradient(135deg, #185844 0%, #102F27 100%)',
                  border: '1px solid rgba(176, 138, 79, 0.45)',
                  boxShadow: '0 2px 10px rgba(24, 88, 68, 0.25)',
                  fontWeight: 600,
                  fontSize: '11.5px',
                }}
              >
                Upload to Vault
              </Button>
            </Group>
          </Group>
        </Paper>

        {/* ================= 2. LIVE METRICS KPI CARDS ================= */}
        <SimpleGrid cols={{ base: 2, md: 4 }} spacing={8}>
          {/* KPI 1: Total Documents */}
          <Card
            className="filecard-clickable"
            py={7}
            px={11}
            radius="md"
            withBorder
            style={{
              backgroundColor: '#ffffff',
              borderColor: 'rgba(24, 88, 68, 0.18)',
              borderTop: '3px solid var(--brand-primary)',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
            }}
          >
            <Group justify="space-between" align="center" mb={2}>
              <Text size="10px" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.04em' }}>
                Total Files
              </Text>
              <ThemeIcon size={24} radius="sm" variant="light" color="emerald">
                <FileText size={13} color="var(--brand-primary)" />
              </ThemeIcon>
            </Group>
            <Text fw={800} size={isMobile ? 'md' : '1.25rem'} style={{ color: 'var(--brand-forest)', lineHeight: 1.1 }}>
              {formatNumber(allDocuments.length)}
            </Text>
            <Text size="10px" c="dimmed" mt={1} truncate>
              {[
                categoryStats.images > 0 && `${formatNumber(categoryStats.images)} photos`,
                categoryStats.videos > 0 && `${formatNumber(categoryStats.videos)} media`,
                categoryStats.docs > 0 && `${formatNumber(categoryStats.docs)} docs`,
                categoryStats.sheets > 0 && `${formatNumber(categoryStats.sheets)} sheets`,
              ].filter(Boolean).slice(0, 3).join(' • ') || '0 files archived'}
            </Text>
          </Card>

          {/* KPI 2: Total Storage */}
          <Card
            className="filecard-clickable"
            py={7}
            px={11}
            radius="md"
            withBorder
            style={{
              backgroundColor: '#ffffff',
              borderColor: 'rgba(176, 138, 79, 0.25)',
              borderTop: '3px solid var(--brand-gold)',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
            }}
          >
            <Group justify="space-between" align="center" mb={2}>
              <Text size="10px" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.04em' }}>
                Storage Used
              </Text>
              <ThemeIcon size={24} radius="sm" variant="light" color="yellow">
                <HardDrive size={13} color="var(--brand-gold)" />
              </ThemeIcon>
            </Group>
            <Text fw={800} size={isMobile ? 'md' : '1.25rem'} style={{ color: 'var(--brand-forest)', lineHeight: 1.1 }}>
              {formatBytes(totalVaultSize, 2)}
            </Text>
            <Text size="10px" c="dimmed" mt={1}>
              Cloud storage used
            </Text>
          </Card>

          {/* KPI 3: Folders & Collections */}
          <Tooltip label={allCollectionsList.length > 4 ? (showAllCollections ? 'Click to show fewer folders' : 'Click to view all folders') : 'Organized collection folders'} withArrow>
            <Card
              className="filecard-clickable"
              py={7}
              px={11}
              radius="md"
              withBorder
              style={{
                backgroundColor: '#ffffff',
                borderColor: 'rgba(124, 58, 237, 0.2)',
                borderTop: '3px solid #7c3aed',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                cursor: allCollectionsList.length > 4 ? 'pointer' : 'default',
              }}
              onClick={() => {
                if (allCollectionsList.length > 4) {
                  setShowAllCollections((prev) => !prev);
                }
              }}
            >
              <Group justify="space-between" align="center" mb={2}>
                <Text size="10px" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.04em' }}>
                  Collections
                </Text>
                <ThemeIcon size={24} radius="sm" variant="light" color="grape">
                  <Folder size={13} color="#7c3aed" />
                </ThemeIcon>
              </Group>
              <Text fw={800} size={isMobile ? 'md' : '1.25rem'} style={{ color: 'var(--brand-forest)', lineHeight: 1.1 }}>
                {formatNumber(totalCollectionsCount)}
              </Text>
              <Text size="10px" c="dimmed" mt={1}>
                {totalCollectionsCount === 1 ? '1 folder' : `${formatNumber(totalCollectionsCount)} folders`}
              </Text>
            </Card>
          </Tooltip>

          {/* KPI 4: Taxonomy Groups */}
          <Card
            className="filecard-clickable"
            py={7}
            px={11}
            radius="md"
            withBorder
            style={{
              backgroundColor: '#ffffff',
              borderColor: 'rgba(37, 99, 235, 0.2)',
              borderTop: '3px solid #2563eb',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
            }}
          >
            <Group justify="space-between" align="center" mb={2}>
              <Text size="10px" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.04em' }}>
                Groups
              </Text>
              <ThemeIcon size={24} radius="sm" variant="light" color="blue">
                <FolderKanban size={13} color="#2563eb" />
              </ThemeIcon>
            </Group>
            <Text fw={800} size={isMobile ? 'md' : '1.25rem'} style={{ color: 'var(--brand-forest)', lineHeight: 1.1 }}>
              {formatNumber(distinctGroupsCount)}
            </Text>
            <Text size="10px" c="dimmed" mt={1}>
              {distinctGroupsCount > 0
                ? `${distinctGroupsCount} workspace ${distinctGroupsCount === 1 ? 'group' : 'groups'}`
                : 'Work & Personal workspaces'}
            </Text>
          </Card>
        </SimpleGrid>

        {/* ================= 3. TOP ACTIVE COLLECTIONS SHOWCASE ================= */}
        {allCollectionsList.length > 0 && (
          <Stack gap={4}>
            <Group justify="space-between" align="center">
              <Group gap={6}>
                <Folder size={14} color="var(--brand-gold)" />
                <Text size="xs" fw={700} style={{ color: 'var(--brand-forest)', letterSpacing: '0.02em' }}>
                  COLLECTIONS
                </Text>
                <Badge size="xs" variant="light" color="emerald" style={{ height: 16, fontSize: '9px', fontWeight: 600 }}>
                  {formatNumber(allCollectionsList.length)} total
                </Badge>
              </Group>

              <Group gap="xs">
                <Text size="11px" c="dimmed">
                  Showing {visibleCollections.length} of {allCollectionsList.length} folders
                </Text>
                {allCollectionsList.length > 4 && (
                  <Button
                    size="compact-xs"
                    variant="subtle"
                    color="emerald"
                    rightSection={showAllCollections ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    onClick={() => setShowAllCollections((prev) => !prev)}
                    style={{ fontWeight: 600, fontSize: '11px', height: 20 }}
                  >
                    {showAllCollections ? 'Show Less' : `View All (${allCollectionsList.length})`}
                  </Button>
                )}
              </Group>
            </Group>

            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile
                  ? 'repeat(2, minmax(0, 1fr))'
                  : 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: isMobile ? 6 : 8,
              }}
            >
              {visibleCollections.map((col) => (
                <Card
                  key={col.id}
                  className="filecard-clickable"
                  py={isMobile ? 6 : 7}
                  px={isMobile ? 8 : 11}
                  radius="md"
                  withBorder
                  style={{
                    backgroundColor: '#ffffff',
                    borderColor: 'rgba(176, 138, 79, 0.28)',
                    borderTop: '2.5px solid var(--brand-gold)',
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.02)',
                  }}
                  onClick={() => {
                    if (onSelectCollection) onSelectCollection(col);
                  }}
                >
                  <Group justify="space-between" align="center" wrap="nowrap" mb={3}>
                    <Group gap={5} wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
                      <Folder size={isMobile ? 14 : 15} color="var(--brand-gold)" style={{ flexShrink: 0 }} />
                      <Tooltip label={col.name} withArrow position="top">
                        <Text size="xs" fw={700} truncate style={{ color: 'var(--brand-forest)', fontSize: isMobile ? '11px' : '12px' }} className="file-card-title">
                          {col.name}
                        </Text>
                      </Tooltip>
                    </Group>
                    <Badge size="xs" variant="filled" color="emerald" style={{ flexShrink: 0, height: 16, fontSize: isMobile ? '8.5px' : '9px', fontWeight: 600, padding: isMobile ? '0 4px' : undefined }}>
                      {isMobile ? formatNumber(col.fileCount) : `${formatNumber(col.fileCount)} files`}
                    </Badge>
                  </Group>

                  <Group justify="space-between" align="center" mt={3} wrap="nowrap">
                    <Group gap={4} wrap="nowrap" style={{ minWidth: 0 }}>
                      <Text size="10px" c="dimmed" fw={500} style={{ fontSize: isMobile ? '9.5px' : '10px' }}>
                        {formatBytes(col.totalSize)}
                      </Text>
                      {col.scope && !isMobile && (
                        <Badge
                          size="xs"
                          variant="subtle"
                          color={col.scope === 'personal' ? 'violet' : 'blue'}
                          style={{ fontSize: '8px', height: 14 }}
                        >
                          {col.scope === 'personal' ? 'Personal' : 'Work'}
                        </Badge>
                      )}
                    </Group>
                    <Group gap={2} wrap="nowrap" style={{ color: 'var(--brand-primary)', fontWeight: 600, fontSize: isMobile ? '9.5px' : '10.5px', flexShrink: 0 }}>
                      <span>{isMobile ? 'View' : 'View Folder'}</span>
                      <ArrowRight size={10} className="open-arrow-icon" style={{ transition: 'transform 0.15s ease' }} />
                    </Group>
                  </Group>
                </Card>
              ))}
            </Box>
          </Stack>
        )}

        {/* ================= 4. REAL-TIME SEARCH, FILTER & RECENT FILES ================= */}
        <Stack gap={6} id="vault-files-grid-anchor" style={{ scrollMarginTop: 70 }}>
          {/* Filter Bar */}
          <Paper
            py={4}
            px={8}
            radius="md"
            withBorder
            style={{
              backgroundColor: '#ffffff',
              borderColor: 'rgba(24, 88, 68, 0.12)',
            }}
          >
            <Group justify="space-between" align="center" wrap="wrap" gap={6}>
              {/* Category Pills with Professional Lucide Icons */}
              <Group gap={4} wrap="wrap">
                <Button
                  size="compact-xs"
                  h={24}
                  px={8}
                  radius="xl"
                  leftSection={<Layers size={11} />}
                  variant={selectedCategory === 'all' ? 'filled' : 'subtle'}
                  color={selectedCategory === 'all' ? 'emerald' : 'gray'}
                  onClick={() => { setSelectedCategory('all'); setViewMode('auto'); }}
                  style={{
                    fontWeight: 600,
                    fontSize: '11px',
                    backgroundColor: selectedCategory === 'all' ? 'var(--brand-primary)' : 'transparent',
                    color: selectedCategory === 'all' ? '#F2EBDD' : 'var(--text-secondary)',
                  }}
                >
                  All ({formatNumber(allDocuments.length)})
                </Button>
                {categoryStats.images > 0 && (
                  <Button
                    size="compact-xs"
                    h={24}
                    px={8}
                    radius="xl"
                    leftSection={<ImageIcon size={11} color={selectedCategory === 'images' ? '#F2EBDD' : '#7c3aed'} />}
                    variant={selectedCategory === 'images' ? 'filled' : 'subtle'}
                    color={selectedCategory === 'images' ? 'emerald' : 'gray'}
                    onClick={() => { setSelectedCategory('images'); setViewMode('auto'); }}
                    style={{
                      fontWeight: 600,
                      fontSize: '11px',
                      backgroundColor: selectedCategory === 'images' ? 'var(--brand-primary)' : 'transparent',
                      color: selectedCategory === 'images' ? '#F2EBDD' : 'var(--text-secondary)',
                    }}
                  >
                    Photos ({formatNumber(categoryStats.images)})
                  </Button>
                )}
                {categoryStats.videos > 0 && (
                  <Button
                    size="compact-xs"
                    h={24}
                    px={8}
                    radius="xl"
                    leftSection={<Film size={11} color={selectedCategory === 'media' ? '#F2EBDD' : '#2563eb'} />}
                    variant={selectedCategory === 'media' ? 'filled' : 'subtle'}
                    color={selectedCategory === 'media' ? 'emerald' : 'gray'}
                    onClick={() => { setSelectedCategory('media'); setViewMode('auto'); }}
                    style={{
                      fontWeight: 600,
                      fontSize: '11px',
                      backgroundColor: selectedCategory === 'media' ? 'var(--brand-primary)' : 'transparent',
                      color: selectedCategory === 'media' ? '#F2EBDD' : 'var(--text-secondary)',
                    }}
                  >
                    Media ({formatNumber(categoryStats.videos)})
                  </Button>
                )}
                {categoryStats.docs > 0 && (
                  <Button
                    size="compact-xs"
                    h={24}
                    px={8}
                    radius="xl"
                    leftSection={<FileText size={11} color={selectedCategory === 'docs' ? '#F2EBDD' : '#185844'} />}
                    variant={selectedCategory === 'docs' ? 'filled' : 'subtle'}
                    color={selectedCategory === 'docs' ? 'emerald' : 'gray'}
                    onClick={() => { setSelectedCategory('docs'); setViewMode('auto'); }}
                    style={{
                      fontWeight: 600,
                      fontSize: '11px',
                      backgroundColor: selectedCategory === 'docs' ? 'var(--brand-primary)' : 'transparent',
                      color: selectedCategory === 'docs' ? '#F2EBDD' : 'var(--text-secondary)',
                    }}
                  >
                    Docs ({formatNumber(categoryStats.docs)})
                  </Button>
                )}
                {categoryStats.sheets > 0 && (
                  <Button
                    size="compact-xs"
                    h={24}
                    px={8}
                    radius="xl"
                    leftSection={<Table2 size={11} color={selectedCategory === 'sheets' ? '#F2EBDD' : '#107c41'} />}
                    variant={selectedCategory === 'sheets' ? 'filled' : 'subtle'}
                    color={selectedCategory === 'sheets' ? 'emerald' : 'gray'}
                    onClick={() => { setSelectedCategory('sheets'); setViewMode('auto'); }}
                    style={{
                      fontWeight: 600,
                      fontSize: '11px',
                      backgroundColor: selectedCategory === 'sheets' ? 'var(--brand-primary)' : 'transparent',
                      color: selectedCategory === 'sheets' ? '#F2EBDD' : 'var(--text-secondary)',
                    }}
                  >
                    Sheets ({formatNumber(categoryStats.sheets)})
                  </Button>
                )}
                {categoryStats.archives > 0 && (
                  <Button
                    size="compact-xs"
                    h={24}
                    px={8}
                    radius="xl"
                    leftSection={<Archive size={11} color={selectedCategory === 'archives' ? '#F2EBDD' : '#b08a4f'} />}
                    variant={selectedCategory === 'archives' ? 'filled' : 'subtle'}
                    color={selectedCategory === 'archives' ? 'emerald' : 'gray'}
                    onClick={() => setSelectedCategory('archives')}
                    style={{
                      fontWeight: 600,
                      fontSize: '11px',
                      backgroundColor: selectedCategory === 'archives' ? 'var(--brand-primary)' : 'transparent',
                      color: selectedCategory === 'archives' ? '#F2EBDD' : 'var(--text-secondary)',
                    }}
                  >
                    Archives ({formatNumber(categoryStats.archives)})
                  </Button>
                )}
              </Group>

              {/* Search & Sort Controls */}
              <Group gap={6} wrap={isMobile ? 'wrap' : 'nowrap'} style={{ flexGrow: isMobile ? 1 : 0, width: isMobile ? '100%' : 'auto' }}>
                <TextInput
                  placeholder={`Search ${formatNumber(allDocuments.length)} files or collections...`}
                  size="xs"
                  radius="md"
                  leftSection={<Search size={13} color="var(--brand-sage)" />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.currentTarget.value)}
                  rightSection={
                    searchQuery ? (
                      <ActionIcon size="xs" variant="transparent" onClick={() => setSearchQuery('')} aria-label="Clear search">
                        <X size={12} />
                      </ActionIcon>
                    ) : null
                  }
                  styles={{
                    input: { height: 26, minHeight: 26, fontSize: '11.5px' },
                  }}
                  style={{ flex: 1, minWidth: isMobile ? 0 : 210 }}
                />

                <Select
                  size="xs"
                  radius="md"
                  value={sortBy}
                  onChange={(v) => setSortBy(v || 'newest')}
                  data={[
                    { value: 'newest', label: 'Newest' },
                    { value: 'oldest', label: 'Oldest' },
                    { value: 'size', label: 'Size' },
                    { value: 'name', label: 'Name A-Z' },
                  ]}
                  styles={{
                    input: { height: 26, minHeight: 26, fontSize: '11.5px' },
                  }}
                  style={{ width: isMobile ? 95 : 105 }}
                />

                {/* View Mode Switcher: Gallery vs Cards */}
                <Group
                  gap={2}
                  p={2}
                  wrap="nowrap"
                  style={{
                    backgroundColor: '#f1f5f9',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    height: 26,
                  }}
                >
                  <Tooltip label="Gallery View (Visual Photos & Media)" position="top" withArrow>
                    <ActionIcon
                      size="22px"
                      radius="sm"
                      variant={isGalleryLayout ? 'filled' : 'subtle'}
                      color={isGalleryLayout ? 'emerald' : 'gray'}
                      onClick={() => setViewMode('gallery')}
                      aria-label="Gallery View"
                    >
                      <LayoutGrid size={13} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Document Cards View" position="top" withArrow>
                    <ActionIcon
                      size="22px"
                      radius="sm"
                      variant={!isGalleryLayout ? 'filled' : 'subtle'}
                      color={!isGalleryLayout ? 'emerald' : 'gray'}
                      onClick={() => setViewMode('cards')}
                      aria-label="Cards View"
                    >
                      <List size={13} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>
            </Group>
          </Paper>

          {/* Files Grid (Visual Gallery for Photos/Media, Standard Cards for Documents/All) */}
          {filteredDocuments.length > 0 ? (
            <>
              {isGalleryLayout ? (
                <Box
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile
                      ? 'repeat(2, minmax(0, 1fr))'
                      : 'repeat(auto-fill, minmax(210px, 1fr))',
                    gap: isMobile ? 8 : 12,
                  }}
                >
                  {paginatedDocuments.map((doc) => {
                    const fileWithDate = {
                      ...doc,
                      formattedFileDate: doc.formattedFileDate || (doc.createdAt ? formatDate(doc.createdAt) : '—'),
                    };
                    return (
                      <GalleryMediaCard
                        key={doc.id}
                        file={fileWithDate}
                        token={token}
                        onSelectFile={onSelectFile}
                        isMobile={isMobile}
                        draggable={false}
                      />
                    );
                  })}
                </Box>
              ) : (
                <Box
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile
                      ? 'repeat(2, minmax(0, 1fr))'
                      : 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: isMobile ? 6 : 8,
                  }}
                >
                  {paginatedDocuments.map((doc) => {
                    const downloadUrl = getDownloadUrl(doc.id);
                    const dateDisplay = doc.createdAt ? formatDate(doc.createdAt) : null;
                    const ext = (doc.filename || doc.title || '').split('.').pop().toUpperCase();

                    return (
                      <Card
                        key={doc.id}
                        className={`filecard-clickable ${getFormatAccentClass(doc)}`}
                        py={isMobile ? 6 : 7}
                        px={isMobile ? 7 : 9}
                        radius="md"
                        withBorder
                        style={{
                          backgroundColor: '#ffffff',
                          borderColor: 'rgba(24, 88, 68, 0.12)',
                          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.02)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                        onClick={() => onSelectFile && onSelectFile(doc.id)}
                      >
                        <div>
                          {/* Top Row: Brand Icon + Title + Download Action */}
                          <Group justify="space-between" align="flex-start" wrap="nowrap" mb={3}>
                            <Group gap={5} wrap="nowrap" style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                              <DocumentBrandIcon
                                type={doc.type}
                                format={doc.format}
                                filename={doc.filename || doc.title}
                                size={isMobile ? 22 : 28}
                              />
                              <Box style={{ minWidth: 0, flex: 1 }}>
                                <Tooltip label={doc.title || doc.filename} position="top" withArrow>
                                  <Text size="xs" fw={700} truncate style={{ color: 'var(--brand-forest)', lineHeight: 1.25, fontSize: isMobile ? '10.5px' : '12px' }} className="file-card-title">
                                    {doc.title || doc.filename}
                                  </Text>
                                </Tooltip>
                                <Group gap={3} mt={1} wrap="nowrap">
                                  <Badge size="xs" variant="light" color="gray" style={{ fontSize: '8px', height: 13, padding: '0 3px' }}>
                                    .{ext}
                                  </Badge>
                                  {doc.scope && !isMobile && (
                                    <Badge
                                      size="xs"
                                      variant="subtle"
                                      color={doc.scope === 'personal' ? 'grape' : 'emerald'}
                                      style={{ fontSize: '8px', height: 13, padding: '0 3px' }}
                                    >
                                      {doc.scope === 'personal' ? 'Personal' : 'Work'}
                                    </Badge>
                                  )}
                                </Group>
                              </Box>
                            </Group>

                            {/* Quick Download Action */}
                            <Tooltip label="Download file" withArrow position="left">
                              <ActionIcon
                                component="a"
                                href={downloadUrl}
                                download={doc.filename}
                                size="xs"
                                variant="subtle"
                                color="gray"
                                onClick={(e) => e.stopPropagation()}
                                style={{ flexShrink: 0, borderRadius: 6, width: isMobile ? 20 : 22, height: isMobile ? 20 : 22 }}
                                aria-label="Download"
                              >
                                <Download size={isMobile ? 11 : 13} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>

                          {/* File Metadata Row: Date & File Size */}
                          <Group justify="space-between" align="center" mt={2} style={{ color: 'var(--text-muted)', fontSize: '9.5px' }} wrap="nowrap">
                            <Group gap={2} wrap="nowrap" style={{ minWidth: 0 }}>
                              <Clock size={9} style={{ flexShrink: 0 }} />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: isMobile ? 60 : 100 }}>
                                {isMobile && dateDisplay ? dateDisplay.split(',')[0] : (dateDisplay || 'Archived')}
                              </span>
                            </Group>
                            <Text size="9.5px" fw={600} style={{ color: 'var(--brand-sage)', flexShrink: 0 }}>
                              {formatBytes(doc.fileSize)}
                            </Text>
                          </Group>
                        </div>

                        {/* Footer Row: Collection Tag + Integrated Open Action */}
                        <Group justify="space-between" align="center" mt={4} pt={3} wrap="nowrap" style={{ borderTop: '1px solid rgba(24, 88, 68, 0.06)' }}>
                          {doc.collectionName ? (
                            <Badge
                              size="xs"
                              variant="outline"
                              color="yellow"
                              style={{
                                borderColor: 'var(--border-gold)',
                                color: 'var(--text-gold)',
                                fontSize: '8px',
                                height: 15,
                                maxWidth: isMobile ? 65 : 130,
                                textTransform: 'none',
                                fontWeight: 600,
                                padding: '0 3px',
                              }}
                            >
                              📁 {doc.collectionName}
                            </Badge>
                          ) : (
                            <Text size="9px" c="dimmed">
                              Root
                            </Text>
                          )}

                          <Group gap={2} wrap="nowrap" style={{ color: 'var(--brand-primary)', fontWeight: 600, fontSize: isMobile ? '9.5px' : '10.5px', flexShrink: 0 }}>
                            <span>Open</span>
                            <ArrowRight size={10} className="open-arrow-icon" style={{ transition: 'transform 0.15s ease' }} />
                          </Group>
                        </Group>
                      </Card>
                    );
                  })}
                </Box>
              )}

            {/* Clean 100-Item Numbered Pagination Bar with Range Stats and Controls */}
            {filteredDocuments.length > 0 && (
              <Paper
                py={7}
                px={isMobile ? 8 : 12}
                radius="md"
                withBorder
                mt={6}
                style={{
                  backgroundColor: '#ffffff',
                  borderColor: 'rgba(24, 88, 68, 0.12)',
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.02)',
                }}
              >
                <Group justify="space-between" align="center" wrap="wrap" gap="xs">
                  {/* File range text */}
                  <Text size="xs" c="dimmed" fw={500} style={{ fontSize: isMobile ? '10.5px' : '11.5px' }}>
                    Showing <Text span fw={700} c="var(--brand-forest)">{filteredDocuments.length === 0 ? 0 : startIndex + 1}–{endIndex}</Text> of <Text span fw={700} c="var(--brand-forest)">{formatNumber(filteredDocuments.length)}</Text> files
                    {totalPages > 1 && (
                      <Text span c="dimmed" ml={6}>
                        (Page {currentPage} of {totalPages})
                      </Text>
                    )}
                  </Text>

                  {/* Numbered Pagination Control */}
                  {totalPages > 1 && (
                    <Pagination
                      value={currentPage}
                      onChange={(newPage) => {
                        setActivePage(newPage);
                        const anchor = document.getElementById('vault-files-grid-anchor');
                        if (anchor) {
                          anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      total={totalPages}
                      color="emerald"
                      size={isMobile ? 'xs' : 'sm'}
                      radius="md"
                      withEdges
                      boundaries={isMobile ? 0 : 1}
                      siblings={isMobile ? 0 : 1}
                      styles={{
                        control: {
                          fontSize: isMobile ? '11px' : '12px',
                          fontWeight: 600,
                        },
                      }}
                    />
                  )}

                  {/* Items Per Page Selector */}
                  <Group gap={6} align="center">
                    <Text size="11px" c="dimmed" fw={500}>Per page:</Text>
                    <Select
                      size="xs"
                      radius="md"
                      value={String(pageSize)}
                      onChange={(val) => {
                        setPageSize(Number(val) || 100);
                        setActivePage(1);
                      }}
                      data={[
                        { value: '50', label: '50' },
                        { value: '100', label: '100' },
                        { value: '200', label: '200' },
                        { value: '500', label: '500' },
                      ]}
                      styles={{
                        input: {
                          height: 26,
                          minHeight: 26,
                          width: isMobile ? 80 : 95,
                          fontSize: '11px',
                          fontWeight: 600,
                        },
                      }}
                    />
                  </Group>
                </Group>
              </Paper>
            )}
          </>
        ) : (
            <Paper p="md" radius="md" withBorder ta="center" style={{ backgroundColor: '#ffffff', borderColor: 'var(--border-card)' }}>
              <ThemeIcon size={34} radius="xl" variant="light" color="yellow" mb={6} mx="auto">
                <Search size={16} color="var(--brand-gold)" />
              </ThemeIcon>
              <Text size="xs" fw={700} style={{ color: 'var(--brand-forest)' }}>
                {searchQuery ? `No files matching "${searchQuery}"` : 'No files in this category yet'}
              </Text>
              <Text size="11px" c="dimmed" mt={2} style={{ maxWidth: 360, margin: '2px auto 0' }}>
                {searchQuery
                  ? 'Try searching by a different name, extension, or collection keyword.'
                  : 'Upload files to view them here in your vault.'}
              </Text>
              <Group justify="center" gap="xs" mt="xs">
                {(searchQuery || selectedCategory !== 'all') && (
                  <Button
                    size="compact-xs"
                    h={24}
                    variant="subtle"
                    color="emerald"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    style={{ fontSize: '11px' }}
                  >
                    Clear Filters
                  </Button>
                )}
                <Button
                  size="compact-xs"
                  h={24}
                  variant="light"
                  color="emerald"
                  leftSection={<UploadCloud size={12} />}
                  onClick={() => onOpenUpload && onOpenUpload(null)}
                  style={{ fontSize: '11px' }}
                >
                  Upload Files
                </Button>
              </Group>
            </Paper>
          )}
        </Stack>

        {/* ================= 5. INTEGRATED DROP-TO-UPLOAD ZONE ================= */}
        <Paper
          py={8}
          px={12}
          radius="md"
          withBorder
          onClick={() => onOpenUpload && onOpenUpload(null)}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files?.length && onOpenUpload) {
              onOpenUpload(null);
            }
          }}
          style={{
            border: isDragging ? '1.5px dashed var(--brand-primary)' : '1.5px dashed var(--brand-gold)',
            backgroundColor: isDragging ? 'var(--brand-primary-light)' : 'var(--surface-card-warm)',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          <Group justify="center" gap="sm" align="center">
            <ThemeIcon size={30} radius="xl" variant="light" color="emerald" style={{ background: 'rgba(24, 88, 68, 0.1)' }}>
              <UploadCloud size={16} color="var(--brand-primary)" />
            </ThemeIcon>
            <Box ta="left">
              <Text size="xs" fw={700} style={{ color: isDragging ? 'var(--brand-primary)' : 'var(--brand-forest)' }}>
                {isDragging ? 'Release files to upload to vault' : 'Drag & drop files anywhere, or click here to upload'}
              </Text>
              <Text size="10.5px" style={{ color: 'var(--text-muted)' }}>
                Supports PDF, Word, Excel, PPT, Photos, Videos, and Code • Up to 50 MB each
              </Text>
            </Box>
          </Group>
        </Paper>

      </Stack>
    </Box>
  );
}
