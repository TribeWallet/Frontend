import { useEffect, useRef, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '../../../../services/api/apiClient';
import { aceitarConvite, getConvite, parseConviteUrl } from '../../services/conviteService';

interface ConviteLinkHandlerProps {
  isAuthenticated: boolean;
}

/**
 * Escuta os links tribewallet://convite/{token}. Se o usuário ainda não está logado, guarda o
 * token e retoma o convite assim que o login acontecer.
 */
export function ConviteLinkHandler({ isAuthenticated }: ConviteLinkHandlerProps) {
  const queryClient = useQueryClient();
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const processing = useRef(false);

  useEffect(() => {
    Linking.getInitialURL()
      .then((url) => {
        const token = parseConviteUrl(url);
        if (token) setPendingToken(token);
      })
      .catch(() => {});
    const subscription = Linking.addEventListener('url', ({ url }) => {
      const token = parseConviteUrl(url);
      if (token) setPendingToken(token);
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !pendingToken || processing.current) return;
    processing.current = true;
    const token = pendingToken;
    setPendingToken(null);

    (async () => {
      try {
        const convite = await getConvite(token);
        Alert.alert(
          'Convite para grupo',
          `${convite.convidadoPor} convidou você para o grupo "${convite.grupoNome}".`,
          [
            { text: 'Agora não', style: 'cancel' },
            {
              text: 'Entrar no grupo',
              onPress: async () => {
                try {
                  await aceitarConvite(token);
                  await queryClient.invalidateQueries({ queryKey: ['grupos'] });
                  Alert.alert('Pronto!', `Você entrou no grupo "${convite.grupoNome}".`);
                } catch (error) {
                  Alert.alert('Não foi possível entrar no grupo', getErrorMessage(error));
                }
              },
            },
          ],
        );
      } catch (error) {
        Alert.alert('Convite inválido', getErrorMessage(error));
      } finally {
        processing.current = false;
      }
    })();
  }, [isAuthenticated, pendingToken, queryClient]);

  return null;
}
