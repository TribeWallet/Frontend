import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';

import { SideMenu, SideMenuAction } from '../components/SideMenu/SideMenu';
import { NotificationsModal } from '../features/notificacoes/components/NotificationsModal/NotificationsModal';
import { useUserStore } from '../features/usuario/stores/userStore';
import { buildNotifications } from '../features/notificacoes/services/notificationSync';
import { useAuthStore } from '../features/auth/stores/authStore';
import {
  addIntegrantes,
  createGrupo,
  deleteGrupo,
  listGrupos,
  removeIntegrante,
  saveGroupTone,
  toGroup,
  updateGrupo,
} from '../features/grupos/services/grupoService';
import {
  addParticipacoes,
  createCompromisso,
  deleteCompromisso,
  listCompromissosByGrupo,
  removeParticipacao,
  toCommitment,
  updateCompromisso,
} from '../features/compromissos/services/compromissoService';
import {
  createPagamento,
  deletePagamento,
  updatePagamento,
} from '../features/pagamentos/services/pagamentoService';
import { ApiError, getErrorMessage } from '../services/api/apiClient';
import { formatCurrency } from '../utils/currency';
import { parseBRDate } from '../utils/date';
import type { NotificationItem } from '../features/notificacoes/types/Notification';
import type { NotificationSettings } from '../features/notificacoes/components/NotificationsModal/NotificationsModal';
import type { Group } from '../features/grupos/types/Group';
import type { Commitment, CommitmentInput } from '../features/compromissos/types/Commitment';
import type { Payment, PaymentDraft, PaymentPatch } from '../features/pagamentos/types/Payment';

export interface TopBarActions {
  openMenu: () => void;
  openNotifications: () => void;
  openProfile: () => void;
}

export interface NewGroupInput {
  name: string;
  description: string;
  tone: Group['tone'];
  /** usuarioToken de cada integrante. Quem cria o grupo entra automaticamente. */
  memberTokens: string[];
}

export interface UpdateGroupInput {
  name: string;
  description: string;
  tone: Group['tone'];
}

interface NotificationsContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  refreshDueNotifications: () => void;
  settings: NotificationSettings;
  updateSettings: (next: NotificationSettings) => void;
}

interface GroupsContextValue {
  groups: Group[];
  groupsLoading: boolean;
  groupsError: string | null;
  refetchGroups: () => void;
  addGroup: (input: NewGroupInput) => Promise<Group>;
  updateGroup: (id: string, input: UpdateGroupInput) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  addGroupMembers: (id: string, usuarioTokens: string[]) => Promise<void>;
  removeGroupMember: (id: string, integranteToken: string) => Promise<void>;
  getGroup: (id: string) => Group | undefined;
}

interface CommitmentsContextValue {
  commitments: Commitment[];
  commitmentsLoading: boolean;
  commitmentsError: string | null;
  refetchCommitments: () => void;
  addCommitment: (input: CommitmentInput) => Promise<Commitment>;
  updateCommitment: (id: string, input: CommitmentInput) => Promise<void>;
  deleteCommitment: (id: string) => Promise<void>;
  addCommitmentMembers: (
    id: string,
    participacoes: { integranteToken: string; amount: number }[],
  ) => Promise<void>;
  removeCommitmentMember: (shareId: string) => Promise<void>;
  getCommitment: (id: string) => Commitment | undefined;
}

interface PaymentsContextValue {
  payments: Payment[];
  addPayment: (draft: PaymentDraft) => Promise<void>;
  updatePayment: (id: string, patch: PaymentPatch) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
}

interface AppContextValue
  extends NotificationsContextValue,
    GroupsContextValue,
    CommitmentsContextValue,
    PaymentsContextValue {
  topBar: TopBarActions;
}

// Preferências de notificação não existem na API: ficam só na sessão do app.
const DEFAULT_SETTINGS: NotificationSettings = {
  pushEnabled: true,
  emailEnabled: false,
  overdueAlerts: true,
  weeklyDigest: false,
};

const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext deve ser usado dentro de AppProvider');
  }
  return ctx;
}

export function useTopBarActions(): TopBarActions {
  return useAppContext().topBar;
}

export function useAppNotifications(): NotificationsContextValue {
  const ctx = useAppContext();
  return {
    notifications: ctx.notifications,
    unreadCount: ctx.unreadCount,
    markAsRead: ctx.markAsRead,
    markAllAsRead: ctx.markAllAsRead,
    deleteNotification: ctx.deleteNotification,
    refreshDueNotifications: ctx.refreshDueNotifications,
    settings: ctx.settings,
    updateSettings: ctx.updateSettings,
  };
}

export function useAppGroups(): GroupsContextValue {
  const ctx = useAppContext();
  return {
    groups: ctx.groups,
    groupsLoading: ctx.groupsLoading,
    groupsError: ctx.groupsError,
    refetchGroups: ctx.refetchGroups,
    addGroup: ctx.addGroup,
    updateGroup: ctx.updateGroup,
    deleteGroup: ctx.deleteGroup,
    addGroupMembers: ctx.addGroupMembers,
    removeGroupMember: ctx.removeGroupMember,
    getGroup: ctx.getGroup,
  };
}

export function useAppCommitments(): CommitmentsContextValue {
  const ctx = useAppContext();
  return {
    commitments: ctx.commitments,
    commitmentsLoading: ctx.commitmentsLoading,
    commitmentsError: ctx.commitmentsError,
    refetchCommitments: ctx.refetchCommitments,
    addCommitment: ctx.addCommitment,
    updateCommitment: ctx.updateCommitment,
    deleteCommitment: ctx.deleteCommitment,
    addCommitmentMembers: ctx.addCommitmentMembers,
    removeCommitmentMember: ctx.removeCommitmentMember,
    getCommitment: ctx.getCommitment,
  };
}

export function useAppPayments(): PaymentsContextValue {
  const ctx = useAppContext();
  return {
    payments: ctx.payments,
    addPayment: ctx.addPayment,
    updatePayment: ctx.updatePayment,
    deletePayment: ctx.deletePayment,
  };
}

interface AppProviderProps {
  children: React.ReactNode;
  onOpenProfile: () => void;
  onNavigate: (action: SideMenuAction) => void;
  onLogout?: () => void;
  activeTab?: string;
}

export function AppProvider({
  children,
  onOpenProfile,
  onNavigate,
  onLogout,
  activeTab,
}: AppProviderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  // Ler e dispensar aviso é estado de tela: a API não guarda isso.
  const [readIds, setReadIds] = useState<string[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const usuarioToken = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  const groupsQuery = useQuery({
    queryKey: ['grupos', usuarioToken],
    queryFn: () => listGrupos(usuarioToken as string),
    enabled: Boolean(usuarioToken),
  });
  const { refetch: refetchGroupsQuery } = groupsQuery;
  const groupsLoading = groupsQuery.isLoading;
  const groupsError = groupsQuery.error ? getErrorMessage(groupsQuery.error) : null;

  const baseGroups = useMemo<Group[]>(
    () => (groupsQuery.data ?? []).map(toGroup),
    [groupsQuery.data],
  );

  // A listagem de grupos não traz as participações; os compromissos vêm por grupo.
  const commitmentQueries = useQueries({
    queries: baseGroups.map((group) => ({
      queryKey: ['compromissos', group.id],
      queryFn: () => listCompromissosByGrupo(group.id),
    })),
  });

  // Os compromissos dependem da lista de grupos: enquanto ela carrega, ainda não há o que buscar.
  const commitmentsLoading =
    groupsLoading || commitmentQueries.some((query) => query.isLoading);
  const commitmentsError =
    commitmentQueries.find((query) => query.error)?.error ?? null;

  const commitments = useMemo<Commitment[]>(
    () =>
      baseGroups.flatMap((group, index) =>
        (commitmentQueries[index]?.data ?? []).map((dto) =>
          toCommitment(dto, { id: group.id, name: group.name }),
        ),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [baseGroups, commitmentQueries.map((query) => query.dataUpdatedAt).join('|')],
  );

  // Mais recentes primeiro: as telas mostram "últimos pagamentos".
  const payments = useMemo<Payment[]>(
    () =>
      commitments
        .flatMap((commitment) => commitment.splits.flatMap((split) => split.payments))
        .sort(
          (a, b) =>
            (parseBRDate(b.date)?.getTime() ?? 0) - (parseBRDate(a.date)?.getTime() ?? 0),
        ),
    [commitments],
  );

  const groups = useMemo<Group[]>(
    () =>
      baseGroups.map((group) => {
        const groupCommitments = commitments.filter(
          (commitment) => commitment.groupId === group.id,
        );
        const paidAmount = groupCommitments.reduce(
          (sum, commitment) =>
            sum + commitment.splits.reduce((inner, split) => inner + split.paidAmount, 0),
          0,
        );
        const openAmount = groupCommitments.reduce(
          (sum, commitment) =>
            sum +
            commitment.splits.reduce(
              (inner, split) => inner + Math.max(0, split.amount - split.paidAmount),
              0,
            ),
          0,
        );
        return {
          ...group,
          summary: {
            ...group.summary,
            openValue: formatCurrency(openAmount),
            paidValue: formatCurrency(paidAmount),
          },
        };
      }),
    [baseGroups, commitments],
  );

  const profile = useUserStore((state) => state.profile);

  const notifications = useMemo<NotificationItem[]>(
    () =>
      buildNotifications(commitments, payments)
        .filter((item) => !dismissedIds.includes(item.id))
        .map((item) =>
          readIds.includes(item.id) ? { ...item, status: 'paid' as const } : item,
        ),
    [commitments, payments, dismissedIds, readIds],
  );

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.status !== 'paid').length,
    [notifications],
  );

  const invalidateGroups = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['grupos'] }),
    [queryClient],
  );

  const invalidateCommitments = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['compromissos'] }),
    [queryClient],
  );

  const refetchGroups = useCallback(() => {
    refetchGroupsQuery();
    invalidateCommitments();
  }, [refetchGroupsQuery, invalidateCommitments]);

  const refetchCommitments = useCallback(() => {
    invalidateCommitments();
  }, [invalidateCommitments]);

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadIds(notifications.map((item) => item.id));
  }, [notifications]);

  const deleteNotification = useCallback((id: string) => {
    setDismissedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const updateSettings = useCallback((next: NotificationSettings) => {
    setSettings(next);
  }, []);

  const addGroup = useCallback(
    async (input: NewGroupInput) => {
      if (!usuarioToken) {
        throw new ApiError('Sua sessão expirou. Entre novamente.', 401);
      }
      // A listagem só traz grupos em que o usuário é integrante, então quem cria entra também.
      const memberTokens = Array.from(new Set([usuarioToken, ...input.memberTokens]));
      const created = await createGrupo({
        nome: input.name.trim(),
        descricao: input.description.trim(),
        usuarioTokens: memberTokens,
      });
      saveGroupTone(created.grupoToken, input.tone);
      await invalidateGroups();
      return toGroup(created);
    },
    [usuarioToken, invalidateGroups],
  );

  const updateGroup = useCallback(
    async (id: string, input: UpdateGroupInput) => {
      await updateGrupo(id, {
        nome: input.name.trim(),
        descricao: input.description.trim(),
      });
      saveGroupTone(id, input.tone);
      await invalidateGroups();
    },
    [invalidateGroups],
  );

  const deleteGroup = useCallback(
    async (id: string) => {
      await deleteGrupo(id);
      await invalidateGroups();
      await invalidateCommitments();
    },
    [invalidateGroups, invalidateCommitments],
  );

  const addGroupMembers = useCallback(
    async (id: string, usuarioTokens: string[]) => {
      await addIntegrantes(id, usuarioTokens);
      await invalidateGroups();
    },
    [invalidateGroups],
  );

  const removeGroupMember = useCallback(
    async (id: string, integranteToken: string) => {
      await removeIntegrante(id, integranteToken);
      await invalidateGroups();
      await invalidateCommitments();
    },
    [invalidateGroups, invalidateCommitments],
  );

  const getGroup = useCallback(
    (id: string) => groups.find((group) => group.id === id),
    [groups],
  );

  const addCommitment = useCallback(
    async (input: CommitmentInput) => {
      const created = await createCompromisso(input);
      await invalidateCommitments();
      const group = groups.find((item) => item.id === input.groupId);
      return toCommitment(created, {
        id: input.groupId,
        name: group?.name ?? created.grupo?.nome ?? '',
      });
    },
    [invalidateCommitments, groups],
  );

  const updateCommitment = useCallback(
    async (id: string, input: CommitmentInput) => {
      await updateCompromisso(id, input);
      await invalidateCommitments();
    },
    [invalidateCommitments],
  );

  const deleteCommitment = useCallback(
    async (id: string) => {
      await deleteCompromisso(id);
      await invalidateCommitments();
    },
    [invalidateCommitments],
  );

  const addCommitmentMembers = useCallback(
    async (id: string, participacoes: { integranteToken: string; amount: number }[]) => {
      await addParticipacoes(id, participacoes);
      await invalidateCommitments();
    },
    [invalidateCommitments],
  );

  const removeCommitmentMember = useCallback(
    async (shareId: string) => {
      await removeParticipacao(shareId);
      await invalidateCommitments();
    },
    [invalidateCommitments],
  );

  const getCommitment = useCallback(
    (id: string) => commitments.find((item) => item.id === id),
    [commitments],
  );

  const addPayment = useCallback(
    async (draft: PaymentDraft) => {
      await createPagamento(draft);
      await invalidateCommitments();
    },
    [invalidateCommitments],
  );

  const updatePayment = useCallback(
    async (id: string, patch: PaymentPatch) => {
      await updatePagamento(id, patch);
      await invalidateCommitments();
    },
    [invalidateCommitments],
  );

  const deletePayment = useCallback(
    async (id: string) => {
      await deletePagamento(id);
      await invalidateCommitments();
    },
    [invalidateCommitments],
  );

  const topBar = useMemo<TopBarActions>(
    () => ({
      openMenu: () => setMenuOpen(true),
      openNotifications: () => setNotificationsOpen(true),
      openProfile: () => onOpenProfile(),
    }),
    [onOpenProfile],
  );

  const handleCloseMenu = useCallback(() => setMenuOpen(false), []);
  const handleCloseNotifications = useCallback(() => setNotificationsOpen(false), []);

  const value = useMemo<AppContextValue>(
    () => ({
      topBar,
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      refreshDueNotifications: refetchCommitments,
      settings,
      updateSettings,
      groups,
      groupsLoading,
      groupsError,
      refetchGroups,
      addGroup,
      updateGroup,
      deleteGroup,
      addGroupMembers,
      removeGroupMember,
      getGroup,
      commitments,
      commitmentsLoading,
      commitmentsError: commitmentsError ? getErrorMessage(commitmentsError) : null,
      refetchCommitments,
      addCommitment,
      updateCommitment,
      deleteCommitment,
      addCommitmentMembers,
      removeCommitmentMember,
      getCommitment,
      payments,
      addPayment,
      updatePayment,
      deletePayment,
    }),
    [
      topBar,
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      settings,
      updateSettings,
      groups,
      groupsLoading,
      groupsError,
      refetchGroups,
      addGroup,
      updateGroup,
      deleteGroup,
      addGroupMembers,
      removeGroupMember,
      getGroup,
      commitments,
      commitmentsLoading,
      commitmentsError,
      refetchCommitments,
      addCommitment,
      updateCommitment,
      deleteCommitment,
      addCommitmentMembers,
      removeCommitmentMember,
      getCommitment,
      payments,
      addPayment,
      updatePayment,
      deletePayment,
    ],
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      <SideMenu
        visible={menuOpen}
        userInitials={profile?.initials ?? ''}
        userName={profile?.name ?? ''}
        userEmail={profile?.email ?? ''}
        activeTab={activeTab}
        onClose={handleCloseMenu}
        onSelect={(action) => {
          if (action === 'logout') {
            onLogout?.();
            return;
          }
          onNavigate(action);
          if (action === 'profile') {
            onOpenProfile();
          }
        }}
      />
      <NotificationsModal
        visible={notificationsOpen}
        onClose={handleCloseNotifications}
        notifications={notifications}
        unreadCount={unreadCount}
        settings={settings}
        onMarkAllRead={markAllAsRead}
        onMarkRead={markAsRead}
        onDelete={deleteNotification}
        onConfigureChange={updateSettings}
      />
    </AppContext.Provider>
  );
}
