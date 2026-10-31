import React from 'react';
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
} from '@mantine/core';
import {
  UploadCloud,
  FileText,
  ShieldCheck,
  FolderKanban,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function EmptyState({
  onOpenUpload,
  isProcessing,
}) {
  const capabilityCards = [
    {
      title: 'Universal High-Fidelity Reader',
      tag: 'Any File Format',
      badgeColor: 'emerald',
      className: 'capability-card-emerald',
      iconColor: '#185844',
      description: 'Native rendering for PDF, Word (.docx), Excel (.xlsx, .csv), Presentations (.pptx), media, and code.',
      icon: <FileText size={20} color="#185844" />,
    },
    {
      title: 'Zero-Knowledge AES-256 Vault',
      tag: 'Military-Grade Security',
      badgeColor: 'gold',
      className: 'capability-card-gold',
      iconColor: '#B08A4F',
      description: 'Files are encrypted in memory before storage. No unencrypted blobs ever touch cloud disks.',
      icon: <ShieldCheck size={20} color="#B08A4F" />,
    },
    {
      title: 'Hierarchical Taxonomy',
      tag: 'Groups & Collections',
      badgeColor: 'grape',
      className: 'capability-card-amethyst',
      iconColor: '#7c3aed',
      description: 'Organize related documents into multi-file collections and assign them to business or personal groups.',
      icon: <FolderKanban size={20} color="#7c3aed" />,
    },
    {
      title: 'Progressive Chunked Streaming',
      tag: 'Sub-100ms Playback',
      badgeColor: 'blue',
      className: 'capability-card-sapphire',
      iconColor: '#2563eb',
      description: 'Byte-range chunking and LRU buffer caching for instant video and audio streaming without loading lag.',
      icon: <Zap size={20} color="#2563eb" />,
    },
  ];

  return (
    <Box p="xl" className="luxury-hero-canvas" style={{ minHeight: 'calc(100vh - 65px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Stack align="center" gap="lg" ta="center" style={{ maxWidth: 880, margin: '0 auto', width: '100%' }}>
        {/* Luxury Hero Shimmer Badge */}
        <Group
          gap={8}
          px="md"
          py={6}
          style={{
            background: 'linear-gradient(135deg, #fbf7ef 0%, #F2EBDD 100%)',
            border: '1px solid var(--border-gold)',
            boxShadow: '0 2px 8px rgba(176, 138, 79, 0.18)',
            borderRadius: 999,
          }}
        >
          <Sparkles size={15} color="var(--brand-gold)" />
          <Text size="xs" fw={700} style={{ color: 'var(--text-gold)', letterSpacing: '0.04em' }}>
            ZERO-KNOWLEDGE CLOUD VAULT & HIGH-FIDELITY READER
          </Text>
        </Group>

        {/* Brand Luxury Gradient Title */}
        <Title order={1} className="luxury-gradient-text" style={{ fontSize: '2.5rem', fontWeight: 800 }}>
          Select or Upload a Document
        </Title>

        <Text size="md" style={{ maxWidth: 620, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Your vault is currently standing by. Select a document from the sidebar to inspect it in high fidelity, or upload new files to begin.
        </Text>

        {/* Primary Action Button (Royal Emerald with Antique Gold Foil Border) */}
        <Group mt="xs">
          <Button
            size="md"
            radius="md"
            className="btn-premium-primary"
            leftSection={<UploadCloud size={18} color="#eedebd" />}
            onClick={onOpenUpload}
            loading={isProcessing}
            style={{
              background: 'linear-gradient(135deg, #185844 0%, #102F27 100%)',
              border: '1px solid rgba(176, 138, 79, 0.45)',
              boxShadow: '0 4px 18px rgba(24, 88, 68, 0.32), 0 0 0 1px rgba(176, 138, 79, 0.25)',
              padding: '0 26px',
              height: 44,
              fontSize: '0.95rem',
            }}
          >
            Upload to Vault
          </Button>
        </Group>

        {/* Multi-Colored Capability Cards Grid */}
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mt="lg" style={{ width: '100%', textAlign: 'left' }}>
          {capabilityCards.map((card, idx) => (
            <Card
              key={idx}
              padding="lg"
              radius="md"
              className={card.className}
            >
              <Group justify="space-between" align="flex-start" mb="xs">
                <ThemeIcon size={38} radius="md" variant="light" color={card.badgeColor}>
                  {card.icon}
                </ThemeIcon>
                <Badge size="xs" variant="light" color={card.badgeColor}>
                  {card.tag}
                </Badge>
              </Group>
              <Text fw={700} size="sm" style={{ color: 'var(--brand-forest)', marginTop: 4 }}>
                {card.title}
              </Text>
              <Text size="xs" style={{ color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>
                {card.description}
              </Text>
            </Card>
          ))}
        </SimpleGrid>

        {/* Architecture Security Note */}
        <Paper
          p="sm"
          px="md"
          radius="md"
          mt="md"
          style={{
            backgroundColor: 'var(--surface-card-warm)',
            border: '1px solid var(--border-gold)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <Group gap="xs" justify="center">
            <ShieldCheck size={16} color="var(--brand-gold)" />
            <Text size="xs" fw={500} style={{ color: 'var(--brand-forest)' }}>
              All documents are encrypted in memory with AES-256-GCM and stored securely in your private cloud vault.
            </Text>
          </Group>
        </Paper>
      </Stack>
    </Box>
  );
}
