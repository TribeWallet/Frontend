import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '../../auth/stores/authStore';
import { toAuthUser } from '../../auth/services/authService';
import { updateUsuario } from '../services/usuarioService';
import { splitFullName } from '../../../utils/formatters';

export interface ProfileFormData {
  initials: string;
  name: string;
  email: string;
}

/** Salva nome no backend. Iniciais não existem na API e ficam só no aparelho. */
export function useSaveProfile() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const queryClient = useQueryClient();

  return useCallback(
    async (data: ProfileFormData) => {
      if (!user) return;
      if (data.name.trim() === user.name) {
        updateUser({ initials: data.initials });
        return;
      }
      const updated = await updateUsuario(user.id, splitFullName(data.name));
      updateUser({
        ...toAuthUser(updated),
        initials: data.initials,
        notificationCount: user.notificationCount,
      });
      // Os grupos exibem o nome dos integrantes vindo da API.
      await queryClient.invalidateQueries({ queryKey: ['grupos'] });
    },
    [user, updateUser, queryClient],
  );
}
