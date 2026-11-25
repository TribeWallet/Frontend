import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../../../components/Modal';
import { Button } from '../../../../components/Button';
import { Pill } from '../../../../components/Pill';
import { Box, Text, PressableBox } from '../../../../theme';
import { useTranslation } from '../../../../hooks/useTranslation';
import { PaymentCard } from '../../../pagamentos/components/PaymentCard/PaymentCard';
import { NewPaymentModal } from '../../../pagamentos/components/NewPaymentModal/NewPaymentModal';
import { EditPaymentModal } from '../../../pagamentos/components/EditPaymentModal/EditPaymentModal';
import { useAppCommitments, useAppGroups } from '../../../../contexts/AppContext';
import { getErrorMessage } from '../../../../services/api/apiClient';
import { getGrupo, toGroup } from '../../../../features/grupos/services/grupoService';
import { commitmentPayments, summarizeCommitment } from '../../services/split';
import type { Commitment } from '../../types/Commitment';
import type { Payment } from '../../../pagamentos/types/Payment';
import type { Group } from '../../../../features/grupos/types/Group';
import { MoneyValue } from '../../../../components/MoneyValue';
import { useFormatMoney } from '../../../../hooks/useFormatMoney';
import { diffDays, isCommitmentOverdue } from '../../../../utils/date';
import { translateCategory } from '../../../../utils/categoryTranslations';

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
  const queryClient = useQueryClient();
  const { t, language } = useTranslation();
  const formatMoney = useFormatMoney();

  const [payingShareId, setPayingShareId] = useState<string | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [busy, setBusy] = useState(false);
  const [groupMembers, setGroupMembers] = useState<Group['members']>([]);
  const [groupLoading, setGroupLoading] = useState(false);
  const [dropdownShareId, setDropdownShareId] = useState<string | null>(null);

  useEffect(() => {
    if (!commitment) return;
    let active = true;
    const groupId = commitment.groupId;
    const cachedGroup = getGroup(groupId);

    async function loadGroup() {
      if (cachedGroup?.members?.length) {
        setGroupMembers(cachedGroup.members);
        setGroupLoading(false);
        return;
      }

      setGroupLoading(true);
      try {
        const dto = await getGrupo(groupId);
        const group = await toGroup(dto);
        if (active) {
          setGroupMembers(group.members ?? []);
          setGroupLoading(false);
        }
      } catch {
        if (active) setGroupLoading(false);
      }
    }

    loadGroup();
    return () => {
      active = false;
    };
  }, [commitment, getGroup]);

  if (!commitment) return null;

  // Integrantes do grupo que ainda não entraram nesta divisão.
  const missingMembers = groupMembers.filter(
    (member) =>
      !commitment.splits.some((split) => split.integranteToken === member.integranteToken),
  );
  const relatedPayments = commitmentPayments(commitment);
  const summary = summarizeCommitment(commitment);
  const due = diffDays(commitment.dueDate);
  const isOverdue = isCommitmentOverdue(commitment);
  const settledCount = commitment.splits.filter((split) => split.paid).length;

  const handleDelete = () => {
    Alert.alert(t('commitments.deleteTitle'), t('commitments.deleteConfirm', { name: commitment.name }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await deleteCommitment(commitment.id);
            // Quem passa onDeleted já decide para onde ir; sem ele, só fecha.
            if (onDeleted) onDeleted();
            else onClose();
          } catch (error) {
            Alert.alert(t('common.errorTitle'), getErrorMessage(error));
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
      t('commitments.includeInDivision'),
      t('commitments.includeMember', { name, amount: formatMoney(share) }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('commitments.addMember'),
          onPress: async () => {
            setBusy(true);
            try {
              await addCommitmentMembers(commitment.id, [
                { integranteToken, amount: Number(share.toFixed(2)) },
              ]);
              // Atualiza a tela de detalhe do compromisso para refletir o novo membro
              queryClient.invalidateQueries({ queryKey: ['compromisso', commitment.id] });
            } catch (error) {
              Alert.alert(t('common.errorTitle'), getErrorMessage(error));
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  const handleRemoveShare = (shareId: string, name: string) => {
    Alert.alert(t('commitments.removeFromDivision'), t('commitments.removeMember', { name }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('commitments.remove'),
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await removeCommitmentMember(shareId);
            // Atualiza a tela de detalhe do compromisso para refletir a remoção
            queryClient.invalidateQueries({ queryKey: ['compromisso', commitment.id] });
          } catch (error) {
            Alert.alert(t('common.errorTitle'), getErrorMessage(error));
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
      subtitle={translateCategory(commitment.category, language)}
      showCloseButton
      footer={
        <Box flexDirection="row" gap="sm">
          <Box flex={1}>
            <Button
              title={t('commitmentDetail.edit')}
              variant="outline"
              fullWidth
              onPress={() => onEdit?.(commitment)}
            />
          </Box>
          <Box flex={1}>
            <Button
              title={t('commitmentDetail.delete')}
              variant="danger"
              fullWidth
              loading={busy}
              onPress={handleDelete}
            />
          </Box>
        </Box>
      }
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
              <Text variant="captionStrong" color="primary">
                {t('commitments.total')}
              </Text>
              <Text variant="display" color="primary" numberOfLines={1} ellipsizeMode="tail">
                <MoneyValue amount={commitment.amount} variant="display" />
              </Text>
              <Text variant="caption" color="textSecondary" mt="xs">
                {t('commitments.paid')}: <MoneyValue amount={summary.paid} />
              </Text>
              <Text variant="caption" color="textSecondary" mt="xs">
                {t('commitments.remaining')}:{' '}
                <MoneyValue amount={summary.remaining} />
              </Text>
            </Box>
          </Box>

          <Box flexDirection="row" alignItems="center" justifyContent="space-between" gap="xs" flexWrap="wrap" mb="sm">
            <Box flexDirection="row" alignItems="center" gap="xs" flexWrap="wrap">
              <Pill label={commitment.groupName} tone="neutral" />
              <Pill label={translateCategory(commitment.category, language)} tone="neutral" />
              <Pill
                label={commitment.splitMode === 'equal' ? t('commitments.equalSplit') : t('commitments.exactSplit')}
                tone="primary"
              />
              {due !== null && (
                <Pill
                  label={
                    isOverdue
                      ? t('commitments.overdueOn', { date: commitment.dueDate })
                      : t('commitments.dueOn', { date: commitment.dueDate })
                  }
                  tone={isOverdue ? 'danger' : 'primary'}
                />
              )}
            </Box>
          </Box>

          <Box
            bg="surface"
            borderRadius="md"
            borderWidth={1}
            borderColor="cardBorder"
            p="md"
          >
            <Box flexDirection="row" alignItems="center" justifyContent="space-between">
              <Text variant="bodyStrong">{t('commitments.members')}</Text>
              <Text variant="caption" color="textSecondary">
                {t('commitments.membersCount', { settled: settledCount, total: commitment.splits.length })}
              </Text>
            </Box>
            {commitment.splits.length === 0 ? (
              <Text variant="caption" color="textSecondary" mt="sm">
                {t('commitments.noMembers')}
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
                        {t('commitments.paidOf', {
                          paid: formatMoney(split.paidAmount),
                          total: formatMoney(split.amount),
                        })}
                      </Text>
                    </Box>
                  </Box>
                  <Box alignItems="flex-end" gap="xs">
                    <Button
                      title={`${t('commitments.actions')} ${dropdownShareId === split.shareId ? '▲' : '▼'}`}
                      variant="outline"
                      size="sm"
                      onPress={() => setDropdownShareId(dropdownShareId === split.shareId ? null : split.shareId)}
                      disabled={busy}
                    />
                    {dropdownShareId === split.shareId && (
                      <Box
                        flexDirection="column"
                        alignItems="flex-end"
                        gap="none"
                        mt="xxs"
                        bg="surface"
                        borderTopLeftRadius="none"
                        borderTopRightRadius="none"
                        borderBottomRightRadius="md"
                        borderBottomLeftRadius="md"
                        borderWidth={1}
                        borderColor="border"
                        p="none"
                        overflow="hidden"
                      >
                        {!split.paid && (
                          <PressableBox
                            onPress={() => {
                              setPayingShareId(split.shareId);
                              setDropdownShareId(null);
                            }}
                            accessibilityRole="button"
                            hitSlop={8}
                          >
                            <Box
                              flexDirection="row"
                              alignItems="center"
                              justifyContent="flex-start"
                              px="xs"
                              py="sm"
                              borderBottomWidth={0.5}
                              borderColor="border"
                            >
                              <Text variant="captionStrong" color="primary" style={{ fontSize: 13 }}>
                                {t('commitments.register')}
                              </Text>
                            </Box>
                          </PressableBox>
                        )}
                        <PressableBox
                          onPress={() => {
                            handleRemoveShare(split.shareId, split.name);
                            setDropdownShareId(null);
                          }}
                          accessibilityRole="button"
                          hitSlop={8}
                        >
                          <Box
                            flexDirection="row"
                            alignItems="center"
                            justifyContent="flex-start"
                            px="xs"
                            py="sm"
                          >
                            <Text variant="captionStrong" color="danger" style={{ fontSize: 13 }}>
                              {t('commitments.remove')}
                            </Text>
                          </Box>
                        </PressableBox>
                      </Box>
                    )}
                  </Box>
                </Box>
              ))
            )}
          </Box>

          {!groupLoading && missingMembers.length > 0 ? (
            <Box
              bg="surface"
              borderRadius="md"
              borderWidth={1}
              borderColor="cardBorder"
              p="md"
            >
              <Text variant="bodyStrong">{t('commitments.outsideDivision')}</Text>
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
                    <Text variant="captionStrong" color="primary">{t('commitments.addMember')}</Text>
                  </PressableBox>
                </Box>
              ))}
            </Box>
          ) : null}

          <Box flexDirection="row" alignItems="center" justifyContent="space-between">
            <Text variant="bodyStrong">{t('commitments.paymentsCount', { count: relatedPayments.length })}</Text>
            <Button
              title={t('newPayment.modalTitle')}
              variant="outline"
              size="sm"
              onPress={() => setPayingShareId('')}
            />
          </Box>
          {relatedPayments.length === 0 ? (
            <Text variant="caption" color="textSecondary">
              {t('commitments.noPaymentsYet')}
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
