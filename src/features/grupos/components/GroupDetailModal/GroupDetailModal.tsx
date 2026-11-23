import React, { useState } from 'react';
import { Alert, Share, View } from 'react-native';
import { Modal } from '../../../../components/Modal';
import { Pill } from '../../../../components/Pill';
import { Button } from '../../../../components/Button';
import { Box, Text, useTheme } from '../../../../theme';
import { useTranslation } from '../../../../hooks/useTranslation';
import { CommitmentCard } from '../../../../features/compromissos/components/CommitmentCard/CommitmentCard';
import { CommitmentDetailModal } from '../../../../features/compromissos/components/CommitmentDetailModal/CommitmentDetailModal';
import { NewGroupModal } from '../NewGroupModal/NewGroupModal';
import { NewCommitmentModal } from '../../../../features/compromissos/components/NewCommitmentModal/NewCommitmentModal';
import { useAppCommitments, useAppGroups } from '../../../../contexts/AppContext';
import { getErrorMessage } from '../../../../services/api/apiClient';
import { createConvite } from '../../services/conviteService';
import type { Group } from '../../types/Group';
import type { Commitment } from '../../../../features/compromissos/types/Commitment';
import { MoneyValue } from '../../../../components/MoneyValue';

interface GroupDetailModalProps {
  visible: boolean;
  group?: Group;
  onClose: () => void;
}

export function GroupDetailModal({ visible, group, onClose }: GroupDetailModalProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { commitments } = useAppCommitments();
  const { deleteGroup } = useAppGroups();

  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [newCommitment, setNewCommitment] = useState(false);
  const [detailCommitment, setDetailCommitment] = useState<Commitment | null>(null);
  const [editingCommitment, setEditingCommitment] = useState<Commitment | null>(null);

  const handleDelete = () => {
    if (!group) return;
    Alert.alert(t('grupos.deleteGroupTitle'), t('grupos.deleteGroupConfirm', { name: group.name }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteGroup(group.id);
            onClose();
          } catch (error) {
            Alert.alert(t('grupos.groupDeleteErrorTitle'), getErrorMessage(error));
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  const handleInvite = async () => {
    if (!group) return;
    setInviting(true);
    try {
      const convite = await createConvite(group.id);
      await Share.share({
        message: t('grupos.inviteShareMessage', { groupName: group.name, link: convite.link }),
      });
    } catch (error) {
      Alert.alert(t('grupos.groupLinkErrorTitle'), getErrorMessage(error));
    } finally {
      setInviting(false);
    }
  };

  if (!group) return null;

  const groupCommitments = commitments.filter(
    (commitment) => commitment.groupId === group.id,
  );
  const totalPaid = groupCommitments.reduce(
    (sum, commitment) =>
      sum + commitment.splits.reduce((inner, split) => inner + split.paidAmount, 0),
    0,
  );
  const totalOpen = groupCommitments.reduce(
    (sum, commitment) =>
      sum +
      commitment.splits.reduce(
        (inner, split) => inner + Math.max(0, split.amount - split.paidAmount),
        0,
      ),
    0,
  );

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={group.name}
      subtitle={group.description}
      showCloseButton
      footer={
        <Box flexDirection="row" gap="sm">
          <Box flex={1}>
            <Button
              title={t('groupDetail.edit')}
              onPress={() => setEditing(true)}
              variant="outline"
              disabled={deleting}
              fullWidth
            />
          </Box>
          <Box flex={1}>
            <Button
              title={t('groupDetail.delete')}
              onPress={handleDelete}
              variant="danger"
              loading={deleting}
              disabled={deleting}
              fullWidth
            />
          </Box>
        </Box>
      }
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
              <Text variant="captionStrong" color="primary">
                {t('groupDetail.summary')}
              </Text>
              <Text variant="display" color="primary" numberOfLines={1} ellipsizeMode="tail">
                <MoneyValue amount={totalPaid} variant="display" />
              </Text>
              <Text variant="caption" color="textSecondary" mt="xs">
                {t('groupDetail.paid')}: <MoneyValue amount={totalPaid} />
              </Text>
              <Text variant="caption" color="textSecondary" mt="xs">
                {t('groupDetail.open')}: <MoneyValue amount={totalOpen} />
              </Text>
            </Box>
            <Pill label={t('groupDetail.membersCount', { count: group.summary.members })} tone="primary" />
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
              <Text variant="bodyStrong">{t('common.members')}</Text>
              <Box mb="sm">
                <Button
                  title={t('groupDetail.inviteLink')}
                  variant="outline"
                  size="sm"
                  onPress={handleInvite}
                  loading={inviting}
                  disabled={inviting}
                />
              </Box>
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
                      backgroundColor: theme.colors.primary,
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
            <Text variant="bodyStrong">{t('groupDetail.commitments', { count: groupCommitments.length })}</Text>
            <Button
              title={t('groupDetail.newCommitment')}
              variant="outline"
              size="sm"
              onPress={() => setNewCommitment(true)}
            />
          </Box>
          {groupCommitments.length === 0 ? (
            <Text variant="caption" color="textSecondary">
              {t('groupDetail.noCommitments')}
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
      <NewGroupModal
        visible={editing}
        group={group}
        onClose={() => setEditing(false)}
      />
      <NewCommitmentModal
        visible={newCommitment}
        lockedGroupId={group.id}
        onClose={() => setNewCommitment(false)}
      />
      <CommitmentDetailModal
        visible={detailCommitment !== null}
        commitment={detailCommitment ?? undefined}
        onClose={() => setDetailCommitment(null)}
        onEdit={(commitment) => {
          setDetailCommitment(null);
          setEditingCommitment(commitment);
        }}
        onDeleted={() => setDetailCommitment(null)}
      />
      <NewCommitmentModal
        visible={editingCommitment !== null}
        commitment={editingCommitment}
        onClose={() => setEditingCommitment(null)}
      />
    </Modal>
  );
}

export default GroupDetailModal;
