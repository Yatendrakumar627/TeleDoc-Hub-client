import React from 'react';
import {
  FileText,
  Table2,
  Globe,
  FileType,
  Film,
  Music,
  Image,
  Presentation,
  Archive,
  FileCode,
} from 'lucide-react';

export const getDocTypeMeta = (type, format) => {
  const cleanType = (type || '').toLowerCase();
  const cleanFormat = (format || '').toLowerCase();

  // 1. Google Workspace
  if (cleanType === 'google_doc') {
    return {
      label: 'Google Doc',
      badgeColor: 'emerald',
      accentColor: '#185844',
      icon: Globe,
      isSpreadsheet: false,
    };
  }
  if (cleanType === 'google_sheet') {
    return {
      label: 'Google Sheet',
      badgeColor: 'emerald',
      accentColor: '#185844',
      icon: Table2,
      isSpreadsheet: true,
    };
  }

  // 2. PDF
  if (cleanType === 'pdf' || cleanFormat === 'pdf') {
    return {
      label: 'PDF Document',
      badgeColor: 'red',
      accentColor: '#e11d48',
      icon: FileType,
      isSpreadsheet: false,
    };
  }

  // 3. Word Documents
  if (cleanType === 'docx' || cleanType === 'doc' || cleanFormat === 'docx') {
    return {
      label: 'Word Document',
      badgeColor: 'emerald',
      accentColor: '#185844',
      icon: FileText,
      isSpreadsheet: false,
    };
  }

  // 4. Presentations (PPTX, PPT)
  if (['pptx', 'ppt'].includes(cleanType) || cleanFormat === 'presentation') {
    return {
      label: 'PowerPoint Deck',
      badgeColor: 'gold',
      accentColor: '#B08A4F',
      icon: Presentation,
      isSpreadsheet: false,
    };
  }

  // 5. Spreadsheets (XLSX, XLS, ODS, CSV)
  if (['xlsx', 'xls', 'ods', 'xlsm'].includes(cleanType)) {
    return {
      label: 'Excel Workbook',
      badgeColor: 'emerald',
      accentColor: '#185844',
      icon: Table2,
      isSpreadsheet: true,
    };
  }
  if (cleanType === 'csv' || cleanType === 'tsv' || cleanFormat === 'spreadsheet') {
    return {
      label: 'Spreadsheet',
      badgeColor: 'sage',
      accentColor: '#78947F',
      icon: Table2,
      isSpreadsheet: true,
    };
  }

  // 6. Visual Images
  if (
    ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp', 'ico', 'tiff', 'avif'].includes(cleanType) ||
    cleanFormat === 'image'
  ) {
    return {
      label: `${cleanType.toUpperCase()} Image`,
      badgeColor: 'gold',
      accentColor: '#B08A4F',
      icon: Image,
      isSpreadsheet: false,
    };
  }

  // 7. Video Media
  if (['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v', 'ogv'].includes(cleanType) || cleanFormat === 'video') {
    return {
      label: `${cleanType.toUpperCase()} Video`,
      badgeColor: 'forest',
      accentColor: '#102F27',
      icon: Film,
      isSpreadsheet: false,
    };
  }

  // 8. Audio Media
  if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma'].includes(cleanType) || cleanFormat === 'audio') {
    return {
      label: `${cleanType.toUpperCase()} Audio`,
      badgeColor: 'gold',
      accentColor: '#B08A4F',
      icon: Music,
      isSpreadsheet: false,
    };
  }

  // 9. Compressed Archives
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(cleanType) || cleanFormat === 'archive') {
    return {
      label: `${cleanType.toUpperCase()} Archive`,
      badgeColor: 'forest',
      accentColor: '#102F27',
      icon: Archive,
      isSpreadsheet: false,
    };
  }

  // 10. Code & Development Files
  const codeExtensions = [
    'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'scss', 'py', 'sql',
    'xml', 'yaml', 'yml', 'json', 'sh', 'bash', 'zsh', 'c', 'cpp',
    'h', 'java', 'rs', 'go', 'php', 'rb', 'env', 'ini', 'conf', 'log'
  ];
  if (codeExtensions.includes(cleanType) || cleanFormat === 'code') {
    return {
      label: `${cleanType.toUpperCase()} Source`,
      badgeColor: 'dark',
      accentColor: '#334155',
      icon: FileCode,
      isSpreadsheet: false,
    };
  }

  // 11. Markdown
  if (cleanType === 'md' || cleanType === 'markdown' || cleanFormat === 'markdown') {
    return {
      label: 'Markdown Doc',
      badgeColor: 'cyan',
      accentColor: '#0891b2',
      icon: FileText,
      isSpreadsheet: false,
    };
  }

  // Default fallback
  return {
    label: cleanType ? cleanType.toUpperCase() : 'Document',
    badgeColor: 'gray',
    accentColor: '#64748b',
    icon: FileText,
    isSpreadsheet: false,
  };
};
