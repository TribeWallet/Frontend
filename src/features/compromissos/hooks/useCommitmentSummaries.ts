import { useQuery } from '@tanstack/react-query';
import { getErrorMessage } from '../../../services/api/apiClient';
import { useAuthStore } from '../../auth/stores/authStore';
import { listCompromissosByUsuario } from '../services/compromissoService';

export function useCommitmentSummaries() {
  const usuarioToken = useAuthStore((state) => state.user?.id);
  const query = useQuery({
    queryKey: ['compromissos', 'usuario', usuarioToken],
    queryFn: () => listCompromissosByUsuario(usuarioToken as string),
    enabled: Boolean(usuarioToken),
  });

  return {
    commitments: query.data ?? [],
    commitmentsLoading: query.isLoading,
    commitmentsError: query.error ? getErrorMessage(query.error) : null,
    refetchCommitments: query.refetch,
  };
}