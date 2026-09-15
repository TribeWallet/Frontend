import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { SideMenu, SideMenuAction } from '../components/SideMenu/SideMenu';
import { NotificationsModal } from '../features/notificacoes/components/NotificationsModal/NotificationsModal';
import { useUserStore } from '../features/usuario/stores/userStore';
import { notificationsMock } from '../features/notificacoes/hooks/mockData';
import { commitmentsMock } from '../features/compromissos/hooks/mockData';
import { paymentsMock } from '../features/pagamentos/hooks/mockData';
import { syncDueNotifications } from '../features/notificacoes/services/notificationSync';
import { useAuthStore } from '../features/auth/stores/authStore';
import {
  createGrupo,
  deleteGrupo,
  listGrupos,
  saveGroupTone,
  toGroup,
  updateGrupo,
} from '../features/grupos/services/grupoService';
import { ApiError, getErrorMessage } from '../services/api/apiClient';
import { formatCurrency } from '../utils/currency';
import { initialsFromName } from '../utils/formatters';
import type { NotificationItem } from '../features/notificacoes/types/Notification';
import type { NotificationSettings } from '../features/notificacoes/components/NotificationsModal/NotificationsModal';
import type { Group } from '../features/grupos/types/Group';
import type {
  Commitment,
  CommitmentSplitEntry,
  SplitMode,
} from '../features/compromissos/types/Commitment';
import type {
  Payment,
  PaymentDraft,
} from '../features/pagamentos/types/Payment';

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

export interface NewCommitmentInput {
  name: string;
  description: string;
  groupId: string;
  groupName: string;
  category: string;
  amount: number;
  dueDate?: string;
  status?: Commitment['status'];
  splitMode: SplitMode;
  splits: { memberId: string; amount: number }[];
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
  getGroup: (id: string) => Group | undefined;
}

interface CommitmentsContextValue {
  commitments: Commitment[];
  addCommitment: (input: NewCommitmentInput) => Commitment;
  updateCommitment: (id: string, patch: Partial<Commitment>) => void;
  deleteCommitment: (id: string) => void;
  getCommitment: (id: string) => Commitment | undefined;
}

interface PaymentsContextValue {
  payments: Payment[];
  addPayment: (draft: PaymentDraft) => Payment;
  updatePayment: (id: string, patch: Partial<Payment>) => void;
  deletePayment: (id: string) => void;
}

interface AppContextValue
  extends NotificationsContextValue,
    GroupsContextValue,
    CommitmentsContextValue,
    PaymentsContextValue {
  topBar: TopBarActions;
}

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
    getGroup: ctx.getGroup,
  };
}

export function useAppCommitments(): CommitmentsContextValue {
  const ctx = useAppContext();
  return {
    commitments: ctx.commitments,
    addCommitment: ctx.addCommitment,
    updateCommitment: ctx.updateCommitment,
    deleteCommitment: ctx.deleteCommitment,
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

function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
}

function normalizeMethod(method: string): 'pix' | 'card' | 'boleto' | 'other' {
  if (method === 'pix' || method === 'card' || method === 'boleto' || method === 'other') {
    return method;
  }
  if (method === 'credit' || method === 'debit') return 'card';
  return 'other';
}

function buildCommitment(input: NewCommitmentInput): Commitment {
  const initials = initialsFromName(input.name);
  const splits: CommitmentSplitEntry[] = input.splits.map((split) => ({
    memberId: split.memberId,
    amount: split.amount,
    paid: false,
  }));
  const dueDate = input.dueDate?.trim() || undefined;
  return {
    id: createId('commitment'),
    initials,
    avatarTone: 'blue',
    name: input.name.trim(),
    description: input.description.trim(),
    groupId: input.groupId,
    groupName: input.groupName,
    category: input.category,
    dueDate,
    amount: input.amount,
    splitMode: input.splitMode,
    splits,
    status: input.status ?? 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function AppProvider({ children, onOpenProfile, onNavigate, onLogout, activeTab }: AppProviderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    () => notificationsMock.map((item) => ({ ...item })),
  );
  const [settings, setSettings] =
    useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [commitments, setCommitments] = useState<Commitment[]>(() =>
    commitmentsMock.map((commitment) => buildCommitment({
      name: commitment.name,
      description: commitment.description,
      groupId: commitment.groupId,
      groupName: commitment.groupName,
      category: commitment.category,
      amount: commitment.amount,
      dueDate: commitment.dueDate,
      status: commitment.status,
      splitMode: 'equal',
      splits: [],
    })),
  );
  const [payments, setPayments] = useState<Payment[]>(() =>
    paymentsMock.map((payment) => ({
      ...payment,
      method: normalizeMethod(payment.method),
    })),
  );

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

  const refetchGroups = useCallback(() => {
    refetchGroupsQuery();
  }, [refetchGroupsQuery]);

  // Dados e integrantes vêm da API; os totais saem dos compromissos e pagamentos, que ainda são locais.
  const groups = useMemo<Group[]>(
    () =>
      (groupsQuery.data ?? []).map((grupo) => {
        const group = toGroup(grupo);
        const openAmount = commitments
          .filter((commitment) => commitment.groupId === group.id)
          .flatMap((commitment) => commitment.splits)
          .filter((split) => !split.paid)
          .reduce((sum, split) => sum + split.amount, 0);
        const paidAmount = payments
          .filter((payment) => payment.groupId === group.id)
          .reduce((sum, payment) => sum + payment.amount, 0);
        return {
          ...group,
          summary: {
            ...group.summary,
            openValue: formatCurrency(openAmount),
            paidValue: formatCurrency(paidAmount),
          },
        };
      }),
    [groupsQuery.data, commitments, payments],
  );

  const profile = useUserStore((state) => state.profile);

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.status !== 'paid').length,
    [notifications],
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'paid' as const } : item,
      ),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, status: 'paid' as const })),
    );
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const refreshDueNotifications = useCallback(() => {
    setNotifications((prev) => {
      const generated = syncDueNotifications(commitments, payments);
      const existing = new Set(prev.map((n) => n.id));
      const merged = [...prev];
      generated.forEach((item) => {
        if (!existing.has(item.id)) merged.unshift(item);
      });
      return merged;
    });
  }, [commitments, payments]);

  const updateSettings = useCallback((next: NotificationSettings) => {
    setSettings(next);
  }, []);

  const invalidateGroups = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['grupos'] }),
    [queryClient],
  );

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
      // Compromissos e pagamentos ainda são locais: saem junto com o grupo.
      setCommitments((prev) =>
        prev.filter((commitment) => commitment.groupId !== id),
      );
      setPayments((prev) => prev.filter((payment) => payment.groupId !== id));
      await invalidateGroups();
    },
    [invalidateGroups],
  );

  const getGroup = useCallback(
    (id: string) => groups.find((group) => group.id === id),
    [groups],
  );

  const addCommitment = useCallback((input: NewCommitmentInput) => {
    const commitment = buildCommitment(input);
    setCommitments((prev) => [commitment, ...prev]);
    return commitment;
  }, []);

  const updateCommitment = useCallback(
    (id: string, patch: Partial<Commitment>) => {
      setCommitments((prev) =>
        prev.map((commitment) =>
          commitment.id === id
            ? {
                ...commitment,
                ...patch,
                updatedAt: new Date().toISOString(),
              }
            : commitment,
        ),
      );
    },
    [],
  );

  const deleteCommitment = useCallback((id: string) => {
    setCommitments((prev) => prev.filter((item) => item.id !== id));
    setPayments((prev) =>
      prev.filter((payment) => payment.commitmentId !== id),
    );
  }, []);

  const getCommitment = useCallback(
    (id: string) => commitments.find((item) => item.id === id),
    [commitments],
  );

  const addPayment = useCallback((draft: PaymentDraft) => {
    const payment: Payment = {
      ...draft,
      id: createId('payment'),
      status: draft.status ?? 'paid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPayments((prev) => [payment, ...prev]);
    return payment;
  }, []);

  const updatePayment = useCallback((id: string, patch: Partial<Payment>) => {
    setPayments((prev) =>
      prev.map((payment) =>
        payment.id === id
          ? { ...payment, ...patch, updatedAt: new Date().toISOString() }
          : payment,
      ),
    );
  }, []);

  const deletePayment = useCallback((id: string) => {
    setPayments((prev) => prev.filter((payment) => payment.id !== id));
  }, []);

  const topBar = useMemo<TopBarActions>(
    () => ({
      openMenu: () => setMenuOpen(true),
      openNotifications: () => setNotificationsOpen(true),
      openProfile: () => onOpenProfile(),
    }),
    [onOpenProfile],
  );

  const handleCloseMenu = useCallback(() => setMenuOpen(false), []);
  const handleCloseNotifications = useCallback(
    () => setNotificationsOpen(false),
    [],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      topBar,
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      refreshDueNotifications,
      settings,
      updateSettings,
      groups,
      addGroup,
      updateGroup,
      deleteGroup,
      groupsLoading,
      groupsError,
      refetchGroups,
      getGroup,
      commitments,
      addCommitment,
      updateCommitment,
      deleteCommitment,
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
      refreshDueNotifications,
      settings,
      updateSettings,
      groups,
      addGroup,
      updateGroup,
      deleteGroup,
      groupsLoading,
      groupsError,
      refetchGroups,
      getGroup,
      commitments,
      addCommitment,
      updateCommitment,
      deleteCommitment,
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
        userInitials={profile?.initials ?? 'G'}
        userName={profile?.name ?? 'Gabriel'}
        userEmail={profile?.email ?? 'dev@dev.com'}
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
        onMarkAllRead={markAllAsRead}
        onMarkRead={markAsRead}
        onDelete={deleteNotification}
        onConfigureChange={updateSettings}
      />
    </AppContext.Provider>
  );
}
