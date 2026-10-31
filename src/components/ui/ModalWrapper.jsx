import React from 'react';
import { Modal, Text } from '@mantine/core';

export default function ModalWrapper({
  opened,
  onClose,
  title,
  size = 'lg',
  children,
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        typeof title === 'string' ? (
          <Text fw={700} size="md">
            {title}
          </Text>
        ) : (
          title
        )
      }
      size={size}
      radius="md"
    >
      {children}
    </Modal>
  );
}

