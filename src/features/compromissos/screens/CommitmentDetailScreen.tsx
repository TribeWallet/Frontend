import React, { useCallback } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';

import { CommitmentDetailModal } from '../components/CommitmentDetailModal/CommitmentDetailModal';
import { NewCommitmentModal } from '../components/NewCommitmentModal/NewCommitmentModal';
import { useAppCommitments } from '../../../contexts/AppContext';
import { getCompromisso, toCommitment } from '../services/compromissoService';
import type { RootStackParamList } from '../../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CommitmentDetail'>;
type Route = RouteProp<RootStackParamList, 'CommitmentDetail'>;

export function CommitmentDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<Route>();
  const { getCommitment } = useAppCommitments();
  const cachedCommitment = getCommitment(route.params.id);
  const detailQuery = useQuery({
    queryKey: ['compromisso', route.params.id],
    queryFn: async () => {
      const dto = await getCompromisso(route.params.id);
      return toCommitment(dto, {
        id: dto.grupo?.grupoToken ?? route.params.groupId ?? '',
        name: dto.grupo?.nome ?? route.params.groupName ?? '',
      });
    },
    enabled: !cachedCommitment,
  });
  const commitment = cachedCommitment ?? detailQuery.data;

  const [editing, setEditing] = React.useState(false);

  const handleEdit = useCallback(() => setEditing(true), []);
  const handleCloseEdit = useCallback(() => setEditing(false), []);

  return (
    <>
      <CommitmentDetailModal
        visible
        commitment={commitment}
        onClose={() => navigation.goBack()}
        onEdit={handleEdit}
        onDeleted={() => navigation.goBack()}
      />
      <NewCommitmentModal
        visible={editing}
        commitment={commitment}
        onClose={handleCloseEdit}
      />
    </>
  );
}

export default CommitmentDetailScreen;
