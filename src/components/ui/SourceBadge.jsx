import React from 'react';
import { Badge, Group } from '@mantine/core';
import { getDocTypeMeta } from '../../utils/docTypes';

export default function SourceBadge({ type, format, size = 'xs', showIcon = true }) {
  const meta = getDocTypeMeta(type, format);
  const IconComponent = meta.icon;

  return (
    <Badge
      size={size}
      variant="light"
      color={meta.badgeColor}
      radius="sm"
      leftSection={showIcon && <IconComponent size={11} style={{ marginRight: 2 }} />}
      styles={{
        root: {
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
        },
      }}
    >
      {meta.label}
    </Badge>
  );
}

