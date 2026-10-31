import React, { useState } from 'react';
import { TextInput, Button, Box } from '@mantine/core';
import { Link as LinkIcon, ArrowRight } from 'lucide-react';

export default function GoogleLinkInput({
  onIngest,
  loading = false,
  placeholder = 'Paste public Google Docs or Sheets link...',
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
          placeholder={placeholder}
          leftSection={<LinkIcon size={16} color="var(--brand-gold)" />}
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
              }}
              rightSection={!loading && <ArrowRight size={13} color="#eedebd" />}
            >
              Ingest
            </Button>
          }
          value={url}
          onChange={(e) => setUrl(e.currentTarget.value)}
          radius="md"
          size="sm"
          styles={{
            input: {
              paddingRight: 80,
              backgroundColor: 'var(--surface-card)',
              borderColor: 'var(--border-subtle)',
            },
          }}
        />
      </form>
    </Box>
  );
}

