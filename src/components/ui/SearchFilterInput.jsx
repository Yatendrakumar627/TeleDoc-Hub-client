import React, { useEffect, useRef } from 'react';
import { TextInput, ActionIcon, Kbd, Group } from '@mantine/core';
import { Search, X } from 'lucide-react';

export default function SearchFilterInput({
  value,
  onChange,
  onClear,
  placeholder = 'Search title, content, tags...',
  size = 'xs',
  width = '100%',
}) {
  const inputRef = useRef(null);

  // Global hotkey: Ctrl+K or Cmd+K focuses search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <TextInput
      ref={inputRef}
      placeholder={placeholder}
      size={size}
      radius="md"
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      leftSection={<Search size={14} color="var(--brand-sage)" />}
      rightSection={
        value ? (
          <ActionIcon
            size="xs"
            variant="subtle"
            color="gray"
            onClick={onClear || (() => onChange(''))}
            title="Clear search"
          >
            <X size={12} />
          </ActionIcon>
        ) : (
          <Kbd
            size="xs"
            visibleFrom="sm"
            style={{
              fontSize: '9px',
              padding: '1px 5px',
              color: 'var(--text-muted)',
              backgroundColor: 'var(--surface-sunken)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              userSelect: 'none',
            }}
          >
            Ctrl K
          </Kbd>
        )
      }
      styles={{
        input: {
          backgroundColor: '#ffffff',
          borderColor: 'var(--border-subtle)',
          fontSize: '12px',
          height: '32px',
          minHeight: '32px',
          transition: 'all 0.15s ease',
          '&:focus': {
            borderColor: 'var(--brand-emerald)',
            boxShadow: '0 0 0 2px rgba(24, 88, 68, 0.12)',
          },
        },
      }}
      style={{ width }}
    />
  );
}

