import { useEffect, useRef, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '../../../../services/api/apiClient';
import { aceitarConvite, getConvite, parseConviteUrl } from '../../services/conviteService';
import { useTranslation } from '../../../../hooks/useTranslation';

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
  const { t } = useTranslation();

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
          t('grupos.inviteTitle'),
          t('grupos.inviteMessage', { convidadoPor: convite.convidadoPor, grupoNome: convite.grupoNome }),
          [
            { text: t('grupos.inviteCancel'), style: 'cancel' },
            {
              text: t('grupos.inviteJoin'),
              onPress: async () => {
                try {
                  await aceitarConvite(token);
                  await queryClient.invalidateQueries({ queryKey: ['grupos'] });
                  Alert.alert(t('grupos.inviteJoinedTitle'), t('grupos.inviteJoinedMsg', { grupoNome: convite.grupoNome }));
                } catch (error) {
                  Alert.alert(t('grupos.inviteJoinErrorTitle'), getErrorMessage(error));
                }
              },
            },
          ],
        );
      } catch (error) {
        Alert.alert(t('grupos.inviteInvalidTitle'), getErrorMessage(error));
      } finally {
        processing.current = false;
      }
    })();
  }, [isAuthenticated, pendingToken, queryClient]);

  return null;
}
