import React from 'react';
import { Box, Text } from '../../theme';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { useTranslation } from '../../hooks/useTranslation';

interface LegalModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
}

export function LegalModal({ visible, onClose, title, content }: LegalModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={title}
      variant="center"
      showCloseButton
      scrollable
      footer={
        <Button
          title={t('common.close')}
          variant="primary"
          fullWidth
          onPress={onClose}
        />
      }
    >
      <Box gap="md">
        <Text variant="body">{content}</Text>
      </Box>
    </Modal>
  );
}

export default LegalModal;
