import React, { useState } from 'react';
import { TextInput, Button, Box } from '@mantine/core';
import { Link as LinkIcon, ArrowRight } from 'lucide-react';

export default function GoogleLinkInput({
  onIngest,
  loading = false,
  placeholder = 'Paste public Google Docs or Sheets link...',
  isMobile = false,
}) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim() || loading) return;
    onIngest(url.trim());
    setUrl('');
  };

  return (
    <Box style={{ width: '100%' }}>
      <form onSubmit={handleSubmit}>
        <TextInput
          placeholder={isMobile ? 'Paste Google Docs or Sheets link...' : placeholder}
          leftSection={<LinkIcon size={isMobile ? 14 : 16} color="var(--brand-gold)" />}
          rightSection={
            <Button
              size="compact-xs"
              variant="filled"
              type="submit"
              loading={loading}
              disabled={!url.trim() || loading}
              style={{
                background: 'linear-gradient(135deg, #185844 0%, #102F27 100%)',
                border: '1px solid rgba(176, 138, 79, 0.45)',
                boxShadow: '0 2px 6px rgba(24, 88, 68, 0.25)',
                color: '#F2EBDD',
                fontWeight: 600,
                height: isMobile ? '24px' : '26px',
                padding: isMobile ? '0 8px' : '0 10px',
                fontSize: isMobile ? '11px' : '12px',
              }}
              rightSection={!loading && <ArrowRight size={isMobile ? 11 : 13} color="#eedebd" />}
            >
              Ingest
            </Button>
          }
          value={url}
          onChange={(e) => setUrl(e.currentTarget.value)}
          radius="md"
          size={isMobile ? 'xs' : 'sm'}
          styles={{
            input: {
              paddingRight: isMobile ? 74 : 80,
              height: isMobile ? '32px' : '36px',
              fontSize: isMobile ? '12px' : '13px',
              backgroundColor: 'var(--surface-card)',
              borderColor: 'var(--border-subtle)',
            },
          }}
        />
      </form>
    </Box>
  );
}

