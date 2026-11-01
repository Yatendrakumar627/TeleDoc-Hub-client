import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { formatBytes, formatDate, extractDateFromName } from '../utils/formatters';
import { API_BASE_URL } from '../config';

/**
 * Authentic Document Brand Icon (Word, PDF, Excel, PPT, Image, Video, Media)
 */
function DocumentBrandIcon({ type, format, filename, size = 38 }) {
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
      <Box style={{ width: size, height: size, borderRadius: 9, backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
      <Box style={{ width: size, height: size, borderRadius: 9, backgroundColor: '#ffe4e6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
      <Box style={{ width: size, height: size, borderRadius: 9, backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
      <Box style={{ width: size, height: size, borderRadius: 9, backgroundColor: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
      <Box style={{ width: size, height: size, borderRadius: 9, backgroundColor: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <ImageIcon size={size * 0.52} color="#7c3aed" />
      </Box>
    );
  }

  if (isVideo) {
    return (
      <Box style={{ width: size, height: size, borderRadius: 9, backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Film size={size * 0.52} color="#4f46e5" />
      </Box>
    );
  }

  if (isAudio) {
    return (
      <Box style={{ width: size, height: size, borderRadius: 9, backgroundColor: '#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Music size={size * 0.52} color="#db2777" />
      </Box>
    );
  }

  return (
    <Box style={{ width: size, height: size, borderRadius: 9, backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <FileText size={size * 0.52} color="#64748b" />
    </Box>
  );
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

  // 3. Derived Top Active Collections
  const topCollections = useMemo(() => {
    const map = new Map();
    (allDocuments || []).forEach((doc) => {
      if (doc.collectionId && doc.collectionId !== 'unassigned') {
        if (!map.has(doc.collectionId)) {
          map.set(doc.collectionId, {
            id: doc.collectionId,
            name: doc.collectionName || 'Collection',
            group: doc.group || doc.taxonomy?.group || null,
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
    return Array.from(map.values()).sort((a, b) => b.fileCount - a.fileCount).slice(0, 4);
  }, [allDocuments]);

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

  return (
    <Box p={isMobile ? 'sm' : 'xl'} className="luxury-hero-canvas" style={{ minHeight: 'calc(100vh - 65px)', width: '100%' }}>
      <Stack gap="xl" style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        
        {/* ================= 1. LIVE HERO COMMAND HEADER ================= */}
        <Paper
          p={isMobile ? 'md' : 'xl'}
          radius="lg"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 247, 242, 0.9) 100%)',
            border: '1px solid var(--border-gold)',
            boxShadow: '0 8px 30px rgba(24, 88, 68, 0.08), 0 2px 10px rgba(176, 138, 79, 0.12)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Group justify="space-between" align="center" wrap="wrap" gap="md">
            <Stack gap={6} style={{ maxWidth: 680 }}>
              <Group gap={8} wrap="nowrap">
                {/* Live Pulse Indicator */}
                <Box
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '3px 10px',
                    borderRadius: 999,
                    backgroundColor: status?.connected ? 'rgba(24, 88, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${status?.connected ? 'rgba(24, 88, 68, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                  }}
                >
                  <Box
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      backgroundColor: status?.connected ? '#10b981' : '#ef4444',
                      boxShadow: status?.connected ? '0 0 8px #10b981' : 'none',
                    }}
                  />
                  <Text size="11px" fw={700} style={{ color: status?.connected ? 'var(--brand-primary)' : '#dc2626', letterSpacing: '0.03em' }}>
                    {status?.connected
                      ? (status.channel ? `VAULT CONNECTED • ${status.channel}` : 'VAULT CONNECTED')
                      : 'OFFLINE / CONNECTING'}
                  </Text>
                </Box>

                <Badge size="sm" variant="outline" color="yellow" style={{ fontSize: '10px', borderColor: 'var(--border-gold)', color: 'var(--brand-gold)' }}>
                  AES-256 ZERO-KNOWLEDGE
                </Badge>
              </Group>

              <Title order={1} className="luxury-gradient-text" style={{ fontSize: isMobile ? '1.8rem' : '2.4rem', fontWeight: 800, lineHeight: 1.15 }}>
                Vault Command Center
              </Title>
              <Text size="sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Your private zero-knowledge encrypted vault is live and standing by. Search files, launch high-fidelity readers, or drop new assets to encrypt & save.
              </Text>
            </Stack>

            {/* Quick Action Button */}
            <Group gap="sm" wrap="nowrap">
              <Button
                size={isMobile ? 'sm' : 'md'}
                radius="md"
                className="btn-premium-primary"
                leftSection={<UploadCloud size={18} color="#eedebd" />}
                onClick={() => onOpenUpload && onOpenUpload(null)}
                loading={isProcessing}
                style={{
                  background: 'linear-gradient(135deg, #185844 0%, #102F27 100%)',
                  border: '1px solid rgba(176, 138, 79, 0.45)',
                  boxShadow: '0 4px 18px rgba(24, 88, 68, 0.32), 0 0 0 1px rgba(176, 138, 79, 0.25)',
                  fontWeight: 600,
                }}
              >
                Upload to Vault
              </Button>
            </Group>
          </Group>
        </Paper>

        {/* ================= 2. LIVE METRICS KPI CARDS ================= */}
        <SimpleGrid cols={{ base: 2, md: 4 }} spacing={isMobile ? 'xs' : 'md'}>
          {/* KPI 1: Total Documents */}
          <Card
            p={isMobile ? 'sm' : 'md'}
            radius="md"
            withBorder
            style={{
              backgroundColor: '#ffffff',
              borderColor: 'rgba(24, 88, 68, 0.15)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
              transition: 'transform 0.15s ease',
            }}
          >
            <Group justify="space-between" align="flex-start" mb={4}>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.04em' }}>
                Total Vault Files
              </Text>
              <ThemeIcon size={32} radius="md" variant="light" color="emerald">
                <FileText size={17} color="var(--brand-primary)" />
              </ThemeIcon>
            </Group>
            <Text fw={800} size={isMobile ? 'xl' : '1.75rem'} style={{ color: 'var(--brand-forest)' }}>
              {allDocuments.length}
            </Text>
            <Text size="11px" c="dimmed" mt={2}>
              {categoryStats.docs} docs • {categoryStats.images} photos • {categoryStats.videos} media
            </Text>
          </Card>

          {/* KPI 2: Total Storage */}
          <Card
            p={isMobile ? 'sm' : 'md'}
            radius="md"
            withBorder
            style={{
              backgroundColor: '#ffffff',
              borderColor: 'rgba(176, 138, 79, 0.2)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
            }}
          >
            <Group justify="space-between" align="flex-start" mb={4}>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.04em' }}>
                Encrypted Storage
              </Text>
              <ThemeIcon size={32} radius="md" variant="light" color="yellow">
                <HardDrive size={17} color="var(--brand-gold)" />
              </ThemeIcon>
            </Group>
            <Text fw={800} size={isMobile ? 'xl' : '1.75rem'} style={{ color: 'var(--brand-forest)' }}>
              {formatBytes(totalVaultSize)}
            </Text>
            <Text size="11px" c="dimmed" mt={2}>
              AES-256 Encrypted Storage
            </Text>
          </Card>

          {/* KPI 3: Folders & Collections */}
          <Card
            p={isMobile ? 'sm' : 'md'}
            radius="md"
            withBorder
            style={{
              backgroundColor: '#ffffff',
              borderColor: 'rgba(124, 58, 237, 0.15)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
            }}
          >
            <Group justify="space-between" align="flex-start" mb={4}>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.04em' }}>
                Collections
              </Text>
              <ThemeIcon size={32} radius="md" variant="light" color="grape">
                <Folder size={17} color="#7c3aed" />
              </ThemeIcon>
            </Group>
            <Text fw={800} size={isMobile ? 'xl' : '1.75rem'} style={{ color: 'var(--brand-forest)' }}>
              {topCollections.length > 0 ? `${topCollections.length}+` : '0'}
            </Text>
            <Text size="11px" c="dimmed" mt={2}>
              Organized binders & folders
            </Text>
          </Card>

          {/* KPI 4: Taxonomy Groups */}
          <Card
            p={isMobile ? 'sm' : 'md'}
            radius="md"
            withBorder
            style={{
              backgroundColor: '#ffffff',
              borderColor: 'rgba(37, 99, 235, 0.15)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
            }}
          >
            <Group justify="space-between" align="flex-start" mb={4}>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.04em' }}>
                Active Groups
              </Text>
              <ThemeIcon size={32} radius="md" variant="light" color="blue">
                <FolderKanban size={17} color="#2563eb" />
              </ThemeIcon>
            </Group>
            <Text fw={800} size={isMobile ? 'xl' : '1.75rem'} style={{ color: 'var(--brand-forest)' }}>
              {groups.length}
            </Text>
            <Text size="11px" c="dimmed" mt={2}>
              Multi-project group workspaces
            </Text>
          </Card>
        </SimpleGrid>

        {/* ================= 3. TOP ACTIVE COLLECTIONS SHOWCASE ================= */}
        {topCollections.length > 0 && (
          <Stack gap="xs">
            <Group justify="space-between" align="center">
              <Group gap={8}>
                <Folder size={16} color="var(--brand-gold)" />
                <Text size="sm" fw={700} style={{ color: 'var(--brand-forest)', letterSpacing: '0.02em' }}>
                  ACTIVE COLLECTIONS & BINDERS
                </Text>
              </Group>
              <Text size="xs" c="dimmed">
                {topCollections.length} featured folders
              </Text>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="sm">
              {topCollections.map((col) => (
                <Card
                  key={col.id}
                  p="sm"
                  radius="md"
                  withBorder
                  style={{
                    backgroundColor: '#ffffff',
                    borderColor: 'rgba(176, 138, 79, 0.22)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => {
                    if (onSelectCollection) onSelectCollection(col);
                  }}
                >
                  <Group justify="space-between" align="flex-start" wrap="nowrap" mb={6}>
                    <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                      <Folder size={20} color="var(--brand-gold)" style={{ flexShrink: 0 }} />
                      <Text size="xs" fw={700} truncate style={{ color: 'var(--brand-forest)' }}>
                        {col.name}
                      </Text>
                    </Group>
                    <Badge size="xs" variant="filled" color="emerald" style={{ flexShrink: 0 }}>
                      {col.fileCount} files
                    </Badge>
                  </Group>

                  <Group justify="space-between" align="center" mt={8}>
                    <Text size="10px" c="dimmed">
                      {formatBytes(col.totalSize)}
                    </Text>
                    <Group gap={4} wrap="nowrap" style={{ color: 'var(--brand-primary)', fontWeight: 600, fontSize: '11px' }}>
                      <span>View Folder</span>
                      <ArrowRight size={12} />
                    </Group>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>
        )}

        {/* ================= 4. REAL-TIME SEARCH, FILTER & RECENT FILES ================= */}
        <Stack gap="sm">
          {/* Filter Bar */}
          <Paper
            p="sm"
            radius="md"
            withBorder
            style={{
              backgroundColor: '#ffffff',
              borderColor: 'rgba(24, 88, 68, 0.12)',
            }}
          >
            <Group justify="space-between" align="center" wrap="wrap" gap="sm">
              {/* Category Pills */}
              <Group gap={6} wrap="wrap">
                <Button
                  size="xs"
                  radius="xl"
                  variant={selectedCategory === 'all' ? 'filled' : 'subtle'}
                  color={selectedCategory === 'all' ? 'emerald' : 'gray'}
                  onClick={() => setSelectedCategory('all')}
                  style={{ fontWeight: 600 }}
                >
                  All ({allDocuments.length})
                </Button>
                <Button
                  size="xs"
                  radius="xl"
                  variant={selectedCategory === 'docs' ? 'filled' : 'subtle'}
                  color={selectedCategory === 'docs' ? 'emerald' : 'gray'}
                  onClick={() => setSelectedCategory('docs')}
                >
                  📄 Docs ({categoryStats.docs})
                </Button>
                <Button
                  size="xs"
                  radius="xl"
                  variant={selectedCategory === 'images' ? 'filled' : 'subtle'}
                  color={selectedCategory === 'images' ? 'emerald' : 'gray'}
                  onClick={() => setSelectedCategory('images')}
                >
                  🖼️ Photos ({categoryStats.images})
                </Button>
                <Button
                  size="xs"
                  radius="xl"
                  variant={selectedCategory === 'media' ? 'filled' : 'subtle'}
                  color={selectedCategory === 'media' ? 'emerald' : 'gray'}
                  onClick={() => setSelectedCategory('media')}
                >
                  🎥 Media ({categoryStats.videos})
                </Button>
                <Button
                  size="xs"
                  radius="xl"
                  variant={selectedCategory === 'sheets' ? 'filled' : 'subtle'}
                  color={selectedCategory === 'sheets' ? 'emerald' : 'gray'}
                  onClick={() => setSelectedCategory('sheets')}
                >
                  📊 Sheets ({categoryStats.sheets})
                </Button>
              </Group>

              {/* Search & Sort Controls */}
              <Group gap="xs" wrap="nowrap" style={{ flexGrow: isMobile ? 1 : 0 }}>
                <TextInput
                  placeholder="Quick search file or collection..."
                  size="xs"
                  radius="md"
                  leftSection={<Search size={14} color="var(--brand-sage)" />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.currentTarget.value)}
                  rightSection={
                    searchQuery ? (
                      <ActionIcon size="xs" variant="transparent" onClick={() => setSearchQuery('')}>
                        <X size={12} />
                      </ActionIcon>
                    ) : null
                  }
                  style={{ minWidth: isMobile ? '100%' : 220 }}
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
                  style={{ width: 110 }}
                />
              </Group>
            </Group>
          </Paper>

          {/* Files Grid (1-Click Open) */}
          {filteredDocuments.length > 0 ? (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="sm">
              {filteredDocuments.slice(0, 12).map((doc) => {
                const downloadUrl = `${API_BASE_URL}/documents/${doc.id}/download`;
                const dateDisplay = doc.createdAt ? formatDate(doc.createdAt) : null;
                const ext = (doc.filename || doc.title || '').split('.').pop().toUpperCase();

                return (
                  <Card
                    key={doc.id}
                    p="sm"
                    radius="md"
                    withBorder
                    style={{
                      backgroundColor: '#ffffff',
                      borderColor: 'rgba(24, 88, 68, 0.1)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      {/* Top Row: Brand Icon + Title + Action */}
                      <Group justify="space-between" align="flex-start" wrap="nowrap" mb="xs">
                        <Group gap="xs" wrap="nowrap" style={{ minWidth: 0, overflow: 'hidden' }}>
                          <DocumentBrandIcon
                            type={doc.type}
                            format={doc.format}
                            filename={doc.filename || doc.title}
                            size={36}
                          />
                          <Box style={{ minWidth: 0 }}>
                            <Tooltip label={doc.title || doc.filename} position="top" withArrow>
                              <Text size="xs" fw={700} truncate style={{ color: 'var(--brand-forest)' }}>
                                {doc.title || doc.filename}
                              </Text>
                            </Tooltip>
                            <Group gap={4} mt={2}>
                              <Badge size="xs" variant="light" color="gray" style={{ fontSize: '9px', height: 16 }}>
                                .{ext}
                              </Badge>
                              {doc.scope && (
                                <Badge
                                  size="xs"
                                  variant="subtle"
                                  color={doc.scope === 'personal' ? 'grape' : 'emerald'}
                                  style={{ fontSize: '9px', height: 16 }}
                                >
                                  {doc.scope === 'personal' ? 'Personal' : 'Work'}
                                </Badge>
                              )}
                            </Group>
                          </Box>
                        </Group>

                        {/* Quick Download Action */}
                        <Tooltip label="Download file" withArrow>
                          <ActionIcon
                            component="a"
                            href={downloadUrl}
                            download={doc.filename}
                            size="sm"
                            variant="subtle"
                            color="gray"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Download size={14} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>

                      {/* File Metadata Row */}
                      <Group justify="space-between" align="center" mt={6} style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                        <Group gap={4}>
                          <Clock size={11} />
                          <span>{dateDisplay || 'Archived'}</span>
                        </Group>
                        <Text size="11px" fw={600} style={{ color: 'var(--brand-sage)' }}>
                          {formatBytes(doc.fileSize)}
                        </Text>
                      </Group>

                      {/* Collection Assignment Tag */}
                      {doc.collectionName && (
                        <Box mt={6}>
                          <Badge
                            size="xs"
                            variant="outline"
                            color="yellow"
                            style={{
                              borderColor: 'var(--border-gold)',
                              color: 'var(--text-gold)',
                              fontSize: '9.5px',
                              maxWidth: '100%',
                            }}
                          >
                            📁 {doc.collectionName}
                          </Badge>
                        </Box>
                      )}
                    </div>

                    {/* Bottom Primary Action: 1-Click Open */}
                    <Button
                      fullWidth
                      size="xs"
                      mt="sm"
                      radius="md"
                      variant="light"
                      color="emerald"
                      rightSection={<ArrowRight size={13} />}
                      onClick={() => onSelectFile && onSelectFile(doc.id)}
                      style={{
                        fontWeight: 600,
                        backgroundColor: 'var(--surface-selected)',
                        color: 'var(--brand-primary)',
                      }}
                    >
                      Open Document
                    </Button>
                  </Card>
                );
              })}
            </SimpleGrid>
          ) : (
            <Paper p="xl" radius="md" withBorder ta="center" style={{ backgroundColor: '#ffffff' }}>
              <Text size="sm" fw={600} c="dimmed">
                No matching documents found in this view.
              </Text>
              <Button size="xs" variant="subtle" color="emerald" mt="xs" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
                Reset Filters
              </Button>
            </Paper>
          )}
        </Stack>

        {/* ================= 5. INTEGRATED DROP-TO-UPLOAD ZONE ================= */}
        <Paper
          p="lg"
          radius="lg"
          withBorder
          onClick={() => onOpenUpload && onOpenUpload(null)}
          style={{
            border: '2px dashed var(--brand-gold)',
            backgroundColor: 'var(--surface-card-warm)',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          <Group justify="center" gap="md" align="center">
            <ThemeIcon size={44} radius="xl" variant="light" color="emerald" style={{ background: 'rgba(24, 88, 68, 0.1)' }}>
              <UploadCloud size={24} color="var(--brand-primary)" />
            </ThemeIcon>
            <Box ta="left">
              <Text size="sm" fw={700} style={{ color: 'var(--brand-forest)' }}>
                Drag & drop files anywhere, or click here to upload
              </Text>
              <Text size="xs" style={{ color: 'var(--text-muted)' }}>
                Supports PDF, Word, Excel, PPT, Photos, Videos, and Code • Up to 50 MB each (Smart auto-compressed)
              </Text>
            </Box>
          </Group>
        </Paper>

        {/* ================= 6. SECURITY & ZERO-KNOWLEDGE ASSURANCE FOOTER ================= */}
        <Paper
          p="sm"
          px="md"
          radius="md"
          style={{
            backgroundColor: 'var(--surface-card-warm)',
            border: '1px solid var(--border-gold)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <Group gap="md" justify="center" wrap="wrap">
            <Group gap={6}>
              <ShieldCheck size={16} color="var(--brand-gold)" />
              <Text size="xs" fw={600} style={{ color: 'var(--brand-forest)' }}>
                AES-256-GCM Zero-Knowledge Encryption
              </Text>
            </Group>
            <Text size="xs" c="dimmed">•</Text>
            <Group gap={6}>
              <Zap size={15} color="var(--brand-primary)" />
              <Text size="xs" fw={600} style={{ color: 'var(--brand-forest)' }}>
                Progressive Byte-Range HTTP Streaming
              </Text>
            </Group>
            <Text size="xs" c="dimmed">•</Text>
            <Group gap={6}>
              <CheckCircle2 size={15} color="#10b981" />
              <Text size="xs" fw={600} style={{ color: 'var(--brand-forest)' }}>
                No Unencrypted Blobs on Cloud Disks
              </Text>
            </Group>
          </Group>
        </Paper>

      </Stack>
    </Box>
  );
}
