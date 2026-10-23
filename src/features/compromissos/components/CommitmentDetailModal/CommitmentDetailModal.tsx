import React, { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { Modal } from '../../../../components/Modal';
import { Button } from '../../../../components/Button';
import { Pill } from '../../../../components/Pill';
import { Box, Text, PressableBox } from '../../../../theme';
import { PaymentCard } from '../../../pagamentos/components/PaymentCard/PaymentCard';
import { NewPaymentModal } from '../../../pagamentos/components/NewPaymentModal/NewPaymentModal';
import { EditPaymentModal } from '../../../pagamentos/components/EditPaymentModal/EditPaymentModal';
import { useAppCommitments, useAppGroups } from '../../../../contexts/AppContext';
import { getErrorMessage } from '../../../../services/api/apiClient';
import { commitmentPayments, summarizeCommitment } from '../../services/split';
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
  const { deleteCommitment, addCommitmentMembers, removeCommitmentMember } =
    useAppCommitments();
  const { getGroup } = useAppGroups();

  const [payingShareId, setPayingShareId] = useState<string | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [busy, setBusy] = useState(false);

  if (!commitment) return null;

  const group = getGroup(commitment.groupId);
  // Integrantes do grupo que ainda não entraram nesta divisão.
  const missingMembers = (group?.members ?? []).filter(
    (member) =>
      !commitment.splits.some((split) => split.integranteToken === member.integranteToken),
  );
  const relatedPayments = commitmentPayments(commitment);
  const summary = summarizeCommitment(commitment);
  const due = diffDays(commitment.dueDate);
  const settledCount = commitment.splits.filter((split) => split.paid).length;

  const handleDelete = () => {
    Alert.alert('Excluir compromisso', `Excluir "${commitment.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await deleteCommitment(commitment.id);
            // Quem passa onDeleted já decide para onde ir; sem ele, só fecha.
            if (onDeleted) onDeleted();
            else onClose();
          } catch (error) {
            Alert.alert('Erro', getErrorMessage(error));
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  const handleAddShare = (integranteToken: string, name: string) => {
    const share = commitment.splits.length
      ? commitment.amount / (commitment.splits.length + 1)
      : commitment.amount;
    Alert.alert(
      'Incluir na divisão',
      `Incluir ${name} com ${formatCurrency(share)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Incluir',
          onPress: async () => {
            setBusy(true);
            try {
              await addCommitmentMembers(commitment.id, [
                { integranteToken, amount: Number(share.toFixed(2)) },
              ]);
            } catch (error) {
              Alert.alert('Erro', getErrorMessage(error));
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  const handleRemoveShare = (shareId: string, name: string) => {
    Alert.alert('Remover da divisão', `Remover ${name} deste compromisso?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await removeCommitmentMember(shareId);
          } catch (error) {
            Alert.alert('Erro', getErrorMessage(error));
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

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
              onPress={() => onEdit?.(commitment)}
            />
          </Box>
          <Box flex={1}>
            <Button
              title="Excluir"
              variant="danger"
              fullWidth
              loading={busy}
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
              <Text variant="display" color="primary">
                {formatCurrency(commitment.amount)}
              </Text>
              <Text variant="caption" color="textSecondary">
                Pago: {formatCurrency(summary.paid)} • Restante:{' '}
                {formatCurrency(summary.remaining)}
              </Text>
            </Box>
            <Box alignItems="flex-end">
              <Pill
                label={
                  due !== null && due < 0
                    ? `Venceu em ${commitment.dueDate}`
                    : `Vence em ${commitment.dueDate}`
                }
                tone={due !== null && due < 0 ? 'danger' : 'primary'}
              />
            </Box>
          </Box>

          <Box flexDirection="row" gap="xs" flexWrap="wrap">
            <Pill label={commitment.groupName} tone="neutral" />
            <Pill label={commitment.category} tone="neutral" />
            <Pill
              label={commitment.splitMode === 'equal' ? 'Divisão igual' : 'Valor exato'}
              tone="primary"
            />
          </Box>

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
                {settledCount}/{commitment.splits.length} quitados
              </Text>
            </Box>
            {commitment.splits.length === 0 ? (
              <Text variant="caption" color="textSecondary" mt="sm">
                Nenhum integrante nesta divisão.
              </Text>
            ) : (
              commitment.splits.map((split) => (
                <Box
                  key={split.shareId}
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                  py="sm"
                  borderTopWidth={1}
                  borderColor="border"
                >
                  <Box flexDirection="row" alignItems="center" gap="sm" flex={1}>
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
                    <Box flex={1}>
                      <Text variant="body">{split.name}</Text>
                      <Text variant="caption" color="textSecondary">
                        Pago {formatCurrency(split.paidAmount)} de{' '}
                        {formatCurrency(split.amount)}
                      </Text>
                    </Box>
                  </Box>
                  <Box alignItems="flex-end" gap="xxs">
                    {split.paid ? (
                      <Text variant="captionStrong" color="success">Quitado</Text>
                    ) : (
                      <PressableBox
                        onPress={() => setPayingShareId(split.shareId)}
                        accessibilityRole="button"
                        hitSlop={4}
                      >
                        <Text variant="captionStrong" color="primary">Registrar</Text>
                      </PressableBox>
                    )}
                    <PressableBox
                      onPress={() => handleRemoveShare(split.shareId, split.name)}
                      accessibilityRole="button"
                      hitSlop={4}
                    >
                      <Text variant="caption" color="danger">Remover</Text>
                    </PressableBox>
                  </Box>
                </Box>
              ))
            )}
          </Box>

          {missingMembers.length > 0 ? (
            <Box
              bg="surface"
              borderRadius="md"
              borderWidth={1}
              borderColor="cardBorder"
              p="md"
            >
              <Text variant="bodyStrong">Fora da divisão</Text>
              {missingMembers.map((member, index) => (
                <Box
                  key={member.integranteToken}
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                  py="sm"
                  borderTopWidth={index === 0 ? 0 : 1}
                  borderColor="border"
                >
                  <Text variant="body" flex={1}>{member.name}</Text>
                  <PressableBox
                    onPress={() => handleAddShare(member.integranteToken, member.name)}
                    accessibilityRole="button"
                    hitSlop={4}
                  >
                    <Text variant="captionStrong" color="primary">Incluir</Text>
                  </PressableBox>
                </Box>
              ))}
            </Box>
          ) : null}

          <Box flexDirection="row" alignItems="center" justifyContent="space-between">
            <Text variant="bodyStrong">Pagamentos ({relatedPayments.length})</Text>
            <Button
              title="Registrar pagamento"
              variant="outline"
              size="sm"
              onPress={() => setPayingShareId('')}
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
        visible={payingShareId !== null}
        onClose={() => setPayingShareId(null)}
        commitmentId={commitment.id}
        shareId={payingShareId || undefined}
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
