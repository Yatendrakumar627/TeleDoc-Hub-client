import React from 'react';
import { Group, SegmentedControl, Button, TextInput } from '@mantine/core';
import { Copy, Check, Search } from 'lucide-react';
import SearchFilterInput from './SearchFilterInput';

export default function TypographyToolbar({
  fontSize,
  onChangeFontSize,
  onCopy,
  copied,
  searchTerm,
  onChangeSearch,
}) {
  return (
    <Group gap="xs" wrap="wrap">
      {onChangeSearch && (
        <SearchFilterInput
          placeholder="Find in text..."
          value={searchTerm}
          onChange={onChangeSearch}
          width={150}
        />
      )}

      {onChangeFontSize && (
        <SegmentedControl
          size="xs"
          radius="md"
          value={fontSize}
          onChange={onChangeFontSize}
          data={[
            { label: 'A-', value: 'sm' },
            { label: 'A', value: 'md' },
            { label: 'A+', value: 'lg' },
          ]}
        />
      )}

      {onCopy && (
        <Button
          size="xs"
          variant="light"
          color={copied ? 'teal' : 'gray'}
          leftSection={copied ? <Check size={14} /> : <Copy size={14} />}
          onClick={onCopy}
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
      )}
    </Group>
  );
}

