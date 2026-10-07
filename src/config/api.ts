export const endpoints = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
  },
  usuarios: {
    list: '/api/usuarios',
    byNome: (nome: string) => `/api/usuarios/${encodeURIComponent(nome)}`,
    byToken: (usuarioToken: string) => `/api/usuarios/${usuarioToken}`,
  },
  grupos: {
    create: '/api/grupos',
    byUsuario: (usuarioToken: string) => `/api/grupos/usuario/${usuarioToken}`,
    byToken: (grupoToken: string) => `/api/grupos/${grupoToken}`,
    integrantes: (grupoToken: string) => `/api/grupos/${grupoToken}/integrantes`,
    integrante: (grupoToken: string, integranteToken: string) =>
      `/api/grupos/${grupoToken}/integrantes/${integranteToken}`,
  },
  compromissos: {
    byGrupo: (grupoToken: string) => `/api/compromissos/${grupoToken}`,
    byToken: (compromissoToken: string) => `/api/compromissos/${compromissoToken}`,
    /** Participações de um compromisso. */
    participacoes: (compromissoToken: string) =>
      `/api/compromissos/${compromissoToken}/integrantes`,
    participacao: (integranteCompromissoToken: string) =>
      `/api/compromissos/integrantes/${integranteCompromissoToken}`,
  },
  // O controller usa a rota padrão api/[controller], por isso o nome no singular e capitalizado.
  pagamentos: {
    create: '/api/Pagamento',
    byToken: (pagamentoToken: string) => `/api/Pagamento/${pagamentoToken}`,
  },
} as const;
