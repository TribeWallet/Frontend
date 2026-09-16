import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Modal } from '../../../../components/Modal';
import { Pill } from '../../../../components/Pill';
import { Button } from '../../../../components/Button';
import { Box, Text } from '../../../../theme';
import { CommitmentCard } from '../../../../features/compromissos/components/CommitmentCard/CommitmentCard';
import { CommitmentDetailModal } from '../../../../features/compromissos/components/CommitmentDetailModal/CommitmentDetailModal';
import { NewGroupModal } from '../NewGroupModal/NewGroupModal';
import { NewCommitmentModal } from '../../../../features/compromissos/components/NewCommitmentModal/NewCommitmentModal';
import {
  useAppCommitments,
  useAppPayments,
} from '../../../../contexts/AppContext';
import type { Group } from '../../types/Group';
import type { Commitment } from '../../../../features/compromissos/types/Commitment';
import { formatCurrency } from '../../../../utils/currency';

interface GroupDetailModalProps {
  visible: boolean;
  group?: Group;
  onClose: () => void;
}

export function GroupDetailModal({ visible, group, onClose }: GroupDetailModalProps) {
  const { commitments } = useAppCommitments();
  const { payments } = useAppPayments();

  const [editing, setEditing] = useState(false);
  const [newCommitment, setNewCommitment] = useState(false);
  const [detailCommitment, setDetailCommitment] = useState<Commitment | null>(null);

  if (!group) return null;

  const groupCommitments = commitments.filter((c) => c.groupId === group.id);
  const groupPayments = payments.filter((p) => p.groupId === group.id);
  const totalOpen = groupCommitments.reduce((sum, c) => {
    const remaining = c.splits.filter((s) => !s.paid).reduce((s2, s) => s2 + s.amount, 0);
    return sum + remaining;
  }, 0);
  const totalPaid = groupPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={group.name}
      subtitle={group.description}
      showCloseButton
      footer={
        <Button
          title="Editar grupo"
          onPress={() => setEditing(true)}
          variant="outline"
          fullWidth
        />
      }
    >
      <ScrollView
        style={{ maxHeight: 540 }}
        contentContainerStyle={{ paddingBottom: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <Box gap="md">
          <Box
            bg="primaryLight"
            borderRadius="md"
            p="md"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box flex={1}>
              <Text variant="captionStrong" color="primary">RESUMO</Text>
              <Text variant="display" color="primary">
                {formatCurrency(totalPaid)}
              </Text>
              <Text variant="caption" color="textSecondary">
                Pago • Em aberto {formatCurrency(totalOpen)}
              </Text>
            </Box>
            <Pill label={`${group.summary.members} membros`} tone="primary" />
          </Box>

          <Text variant="bodySmall" color="textSecondary">
            {group.description}
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
                {group.members.length} {group.members.length === 1 ? 'pessoa' : 'pessoas'}
              </Text>
            </Box>
            {group.members.map((member) => (
              <Box
                key={member.id}
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                py="sm"
                borderTopWidth={1}
                borderColor="border"
              >
                <Box flexDirection="row" alignItems="center" gap="sm">
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 9999,
                      backgroundColor: '#0071DF',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text variant="captionStrong" color="white">
                      {member.initials}
                    </Text>
                  </View>
                  <Box>
                    <Text variant="bodyStrong">{member.name}</Text>
                    {member.email ? (
                      <Text variant="caption" color="textSecondary">
                        {member.email}
                      </Text>
                    ) : null}
                  </Box>
                </Box>
              </Box>
            ))}

          </Box>

          <Box flexDirection="row" alignItems="center" justifyContent="space-between">
            <Text variant="bodyStrong">Compromissos ({groupCommitments.length})</Text>
            <Button
              title="Novo compromisso"
              variant="outline"
              size="sm"
              onPress={() => setNewCommitment(true)}
            />
          </Box>
          {groupCommitments.length === 0 ? (
            <Text variant="caption" color="textSecondary">
              Nenhum compromisso cadastrado neste grupo ainda.
            </Text>
          ) : (
            groupCommitments.map((commitment) => (
              <CommitmentCard
                key={commitment.id}
                commitment={commitment}
                onPress={() => setDetailCommitment(commitment)}
              />
            ))
          )}
        </Box>
      </ScrollView>
      <NewGroupModal
        visible={editing}
        group={group}
        onClose={() => setEditing(false)}
        onDeleted={onClose}
      />
      <NewCommitmentModal
        visible={newCommitment}
        onClose={() => setNewCommitment(false)}
      />
      <CommitmentDetailModal
        visible={detailCommitment !== null}
        commitment={detailCommitment ?? undefined}
        onClose={() => setDetailCommitment(null)}
        onEdit={() => {
          if (!detailCommitment) return;
          setDetailCommitment(null);
        }}
      />
    </Modal>
  );
}

export default GroupDetailModal;
