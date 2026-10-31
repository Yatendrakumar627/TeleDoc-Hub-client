import React from 'react';
import { SegmentedControl } from '@mantine/core';

export default function CategoryFilter({
  value,
  onChange,
  totalCount = 0,
}) {
  return (
    <SegmentedControl
      size="xs"
      radius="md"
      value={value}
      onChange={onChange}
      data={[
        { label: `All (${totalCount})`, value: 'all' },
        { label: 'Docs', value: 'docs' },
        { label: 'Sheets', value: 'sheets' },
        { label: 'Google', value: 'google' },
      ]}
    />
  );
}

