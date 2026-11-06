import {deleteUsuario} from "../features/usuario/services/usuarioService";

export const endpoints = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
  },
  usuarios: {
    list: '/api/usuarios',
    byNome: (nome: string) => `/api/usuarios/${encodeURIComponent(nome)}`,
    byToken: (usuarioToken: string) => `/api/usuarios/${usuarioToken}`,
    dashboard: (usuarioToken: string) => `/api/usuarios/${usuarioToken}/dashboard`,
  },
  grupos: {
    create: '/api/grupos',
    byUsuario: (usuarioToken: string) => `/api/grupos/usuario/${usuarioToken}`,
    byToken: (grupoToken: string) => `/api/grupos/${grupoToken}`,
    integrantes: (grupoToken: string) => `/api/grupos/${grupoToken}/integrantes`,
    integrante: (grupoToken: string, integranteToken: string) =>
      `/api/grupos/${grupoToken}/integrantes/${integranteToken}`,
    convites: (grupoToken: string) => `/api/grupos/${grupoToken}/convites`,
  },
  convites: {
    byToken: (conviteToken: string) => `/api/convites/${encodeURIComponent(conviteToken)}`,
    aceitar: (conviteToken: string) =>
      `/api/convites/${encodeURIComponent(conviteToken)}/aceitar`,
  },
  compromissos: {
    byUsuario: (usuarioToken: string) => `/api/compromissos/usuario/${usuarioToken}`,
    byGrupo: (grupoToken: string) => `/api/compromissos/${grupoToken}`,
    byToken: (compromissoToken: string) => `/api/compromissos/${compromissoToken}`,
    /** Participações de um compromisso. */
    participacoes: (compromissoToken: string) =>
      `/api/compromissos/${compromissoToken}/integrantes`,
    participacao: (integranteCompromissoToken: string) =>
      `/api/compromissos/integrantes/${integranteCompromissoToken}`,
  },
  relatorios: {
    byUsuario: (usuarioToken: string) =>
      `/api/relatorios/usuario/${encodeURIComponent(usuarioToken)}`,
    pdfByUsuario: (usuarioToken: string) =>
      `/api/relatorios/usuario/${encodeURIComponent(usuarioToken)}/pdf`,
    byGrupo: (usuarioToken: string, grupoToken: string) =>
      `/api/relatorios/usuario/${encodeURIComponent(usuarioToken)}/grupo/${encodeURIComponent(grupoToken)}`,
    pdfByGrupo: (usuarioToken: string, grupoToken: string) =>
      `/api/relatorios/usuario/${encodeURIComponent(usuarioToken)}/grupo/${encodeURIComponent(grupoToken)}/pdf`,
  },
  notificacoes: {
    list: '/api/notificacoes',
    unreadCount: '/api/notificacoes/nao-lidas/contagem',
    markAllRead: '/api/notificacoes/lidas',
    markRead: (token: string) => `/api/notificacoes/${token}/lida`,
    byToken: (token: string) => `/api/notificacoes/${token}`,
  },
  // O controller usa a rota padrão api/[controller], por isso o nome no singular e capitalizado.
  pagamentos: {
    create: '/api/Pagamento',
    byToken: (pagamentoToken: string) => `/api/Pagamento/${pagamentoToken}`,
  },
} as const;
