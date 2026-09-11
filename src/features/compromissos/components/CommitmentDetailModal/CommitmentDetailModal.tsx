import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { Modal } from '../../../../components/Modal';
import { Button } from '../../../../components/Button';
import { Pill } from '../../../../components/Pill';
import { Box, Text, PressableBox } from '../../../../theme';
import { PaymentCard } from '../../../pagamentos/components/PaymentCard/PaymentCard';
import { NewPaymentModal } from '../../../pagamentos/components/NewPaymentModal/NewPaymentModal';
import { EditPaymentModal } from '../../../pagamentos/components/EditPaymentModal/EditPaymentModal';
import {
  useAppCommitments,
  useAppGroups,
  useAppPayments,
} from '../../../../contexts/AppContext';
import { applySplitPaid, summarizeCommitment } from '../../services/split';
import type { Commitment } from '../../types/Commitment';
import type { Payment } from '../../../pagamentos/types/Payment';
import { formatCurrency } from '../../../../utils/currency';
import { diffDays } from '../../../../utils/date';

interface CommitmentDetailModalProps {
  visible: boolean;
  commitment?: Commitment;
  onClose: () => void;
  onEdit?: (commitment: Commitment) => void;
  onDeleted?: () => void;
}

export function CommitmentDetailModal({
  visible,
  commitment,
  onClose,
  onEdit,
  onDeleted,
}: CommitmentDetailModalProps) {
  const { getGroup } = useAppGroups();
  const { payments } = useAppPayments();
  const { updateCommitment, deleteCommitment } = useAppCommitments();

  const [paying, setPaying] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

  if (!commitment) return null;

  const group = getGroup(commitment.groupId);
  const relatedPayments = payments.filter(
    (payment) => payment.commitmentId === commitment.id,
  );
  const summary = summarizeCommitment(commitment);
  const due = diffDays(commitment.dueDate);

  const toggleMemberPaid = (memberId: string) => {
    const memberSplit = commitment.splits.find(
      (split) => split.memberId === memberId,
    );
    if (!memberSplit) return;
    updateCommitment(commitment.id, {
      splits: applySplitPaid(commitment.splits, memberId, !memberSplit.paid),
    });
  };

  const handleDelete = () => {
    deleteCommitment(commitment.id);
    onDeleted?.();
    onClose();
  };

  const memberName = (id: string) =>
    group?.members.find((member) => member.id === id)?.name ?? id;

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={commitment.name}
      subtitle={commitment.category}
      showCloseButton
      footer={
        <Box flexDirection="row" gap="sm">
          <Box flex={1}>
            <Button
              title="Editar"
              variant="outline"
              fullWidth
              onPress={() => {
                onEdit?.(commitment);
              }}
            />
          </Box>
          <Box flex={1}>
            <Button
              title="Excluir"
              variant="danger"
              fullWidth
              onPress={handleDelete}
            />
          </Box>
        </Box>
      }
    >
      <ScrollView
        style={{ maxHeight: 540 }}
        contentContainerStyle={{ paddingBottom: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <Box gap="md">
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            bg="primaryLight"
            borderRadius="md"
            p="md"
          >
            <Box flex={1}>
              <Text variant="captionStrong" color="primary">TOTAL</Text>
              <Text variant="display" color="primary">{formatCurrency(commitment.amount)}</Text>
              <Text variant="caption" color="textSecondary">
                Pago: {formatCurrency(summary.paid)} • Restante:{' '}
                {formatCurrency(summary.remaining)}
              </Text>
            </Box>
            <Box alignItems="flex-end">
              {commitment.dueDate ? (
                <Pill
                  label={
                    due !== null && due < 0
                      ? `Venceu em ${commitment.dueDate}`
                      : `Vence em ${commitment.dueDate}`
                  }
                  tone={due !== null && due < 0 ? 'danger' : 'primary'}
                />
              ) : null}
            </Box>
          </Box>

          <Box flexDirection="row" gap="xs" flexWrap="wrap">
            <Pill label={commitment.groupName} tone="neutral" />
            <Pill label={commitment.category} tone="neutral" />
            <Pill
              label={
                commitment.splitMode === 'equal'
                  ? 'Divisão igual'
                  : 'Divisão personalizada'
              }
              tone="primary"
            />
          </Box>

          <Text variant="bodySmall" color="textSecondary">
            {commitment.description}
          </Text>

          <Box
            bg="surface"
            borderRadius="md"
            borderWidth={1}
            borderColor="cardBorder"
            p="md"
          >
            <Box flexDirection="row" alignItems="center" justifyContent="space-between">
              <Text variant="bodyStrong">Integrantes</Text>
              <Text variant="caption" color="textSecondary">
                {commitment.splits.filter((s) => s.paid).length}/{commitment.splits.length} pagos
              </Text>
            </Box>
            {commitment.splits.map((split) => (
              <PressableBox
                key={split.memberId}
                onPress={() => toggleMemberPaid(split.memberId)}
                accessibilityRole="button"
              >
                <Box
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                  py="sm"
                  borderTopWidth={1}
                  borderColor="border"
                >
                  <Box flexDirection="row" alignItems="center" gap="sm">
                    <Box
                      width={28}
                      height={28}
                      borderRadius="full"
                      bg={split.paid ? 'success' : 'border'}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text variant="captionStrong" color={split.paid ? 'white' : 'text'}>
                        {split.paid ? '✓' : '•'}
                      </Text>
                    </Box>
                    <Text variant="body">{memberName(split.memberId)}</Text>
                  </Box>
                  <Text variant="bodyStrong">
                    {formatCurrency(split.amount)}
                  </Text>
                </Box>
              </PressableBox>
            ))}
          </Box>

          <Box flexDirection="row" alignItems="center" justifyContent="space-between">
            <Text variant="bodyStrong">Pagamentos ({relatedPayments.length})</Text>
            <Button
              title="Registrar pagamento"
              variant="outline"
              size="sm"
              onPress={() => setPaying(true)}
            />
          </Box>
          {relatedPayments.length === 0 ? (
            <Text variant="caption" color="textSecondary">
              Nenhum pagamento registrado para este compromisso ainda.
            </Text>
          ) : (
            relatedPayments.map((payment) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                onPress={() => setEditingPayment(payment)}
              />
            ))
          )}
        </Box>
      </ScrollView>
      <NewPaymentModal
        visible={paying}
        onClose={() => setPaying(false)}
        commitmentId={commitment.id}
      />
      <EditPaymentModal
        visible={editingPayment !== null}
        payment={editingPayment}
        onClose={() => setEditingPayment(null)}
      />
    </Modal>
  );
}

export default CommitmentDetailModal;
