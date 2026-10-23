import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '../../auth/stores/authStore';
import { toAuthUser } from '../../auth/services/authService';
import { updateUsuario } from '../services/usuarioService';
import { splitFullName } from '../../../utils/formatters';
import type { ProfileSaveData } from '../components/ProfileModal/ProfileModal';

export function useSaveProfile() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const queryClient = useQueryClient();

  return useCallback(
    async (data: ProfileSaveData) => {
      if (!user) return;
      const nameChanged = data.name.trim() !== user.name;
      if (!nameChanged && !data.imagem) {
        updateUser({ initials: data.initials });
        return;
      }
      const { nome, sobrenome } = nameChanged
        ? splitFullName(data.name)
        : { nome: undefined, sobrenome: undefined };
      const updated = await updateUsuario(user.id, {
        nome,
        sobrenome,
        imagem: data.imagem,
      });
      updateUser({
        ...toAuthUser(updated),
        initials: data.initials,
        notificationCount: user.notificationCount,
      });
      await queryClient.invalidateQueries({ queryKey: ['grupos'] });
    },
    [user, updateUser, queryClient],
  );
}
