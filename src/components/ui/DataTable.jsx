import React from 'react';
import { ScrollArea, Text, Group } from '@mantine/core';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export default function DataTable({
  headers = [],
  rows = [],
  sortCol = null,
  sortDirection = 'asc',
  onSort,
  height = 'calc(100vh - 240px)',
  emptyMessage = 'No matching rows found.',
}) {
  return (
    <ScrollArea h={height} offsetScrollbars scrollbarSize={8}>
      <table className="spreadsheet-table">
        <thead>
          <tr>
            <th style={{ width: 50, textAlign: 'center' }}>#</th>
            {headers.map((header, idx) => {
              const isSorted = sortCol === idx;
              return (
                <th
                  key={idx}
                  style={{ cursor: onSort ? 'pointer' : 'default', userSelect: 'none' }}
                  onClick={() => onSort && onSort(idx)}
                >
                  <Group gap={4} wrap="nowrap" justify="space-between">
                    <Text size="xs" fw={600}>
                      {header}
                    </Text>
                    {onSort && (
                      isSorted ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        )
                      ) : (
                        <ArrowUpDown size={12} color="#94a3b8" />
                      )
                    )}
                  </Group>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={headers.length + 1}
                style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIdx) => (
              <tr key={rowIdx}>
                <td
                  style={{
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {rowIdx + 1}
                </td>
                {headers.map((_, colIdx) => (
                  <td key={colIdx}>
                    {row[colIdx] !== undefined && row[colIdx] !== null
                      ? row[colIdx].toString()
                      : ''}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </ScrollArea>
  );
}

