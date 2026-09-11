import React, { useCallback } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { CommitmentDetailModal } from '../components/CommitmentDetailModal/CommitmentDetailModal';
import { NewCommitmentModal } from '../components/NewCommitmentModal/NewCommitmentModal';
import { useAppCommitments } from '../../../contexts/AppContext';
import type { RootStackParamList } from '../../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CommitmentDetail'>;
type Route = RouteProp<RootStackParamList, 'CommitmentDetail'>;

export function CommitmentDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<Route>();
  const { getCommitment } = useAppCommitments();
  const commitment = getCommitment(route.params.id);

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
