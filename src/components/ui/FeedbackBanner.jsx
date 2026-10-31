import React from 'react';
import { Alert } from '@mantine/core';
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

export default function FeedbackBanner({
  type = 'warning',
  title,
  message,
  onClose,
  mb = 'md',
}) {
  if (!message) return null;

  const iconMap = {
    warning: <AlertTriangle size={18} />,
    error: <AlertCircle size={18} />,
    info: <Info size={18} />,
    success: <CheckCircle2 size={18} />,
  };

  const colorMap = {
    warning: 'yellow',
    error: 'red',
    info: 'blue',
    success: 'teal',
  };

  return (
    <Alert
      icon={iconMap[type]}
      title={title}
      color={colorMap[type]}
      variant="light"
      radius="md"
      mb={mb}
      withCloseButton={Boolean(onClose)}
      onClose={onClose}
    >
      {message}
    </Alert>
  );
}

