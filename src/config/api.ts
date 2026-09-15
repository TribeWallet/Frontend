export const endpoints = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
  },
  usuarios: {
    list: '/api/usuarios',
    byToken: (usuarioToken: string) => `/api/usuarios/${usuarioToken}`,
  },
  grupos: {
    create: '/api/grupos',
    byUsuario: (usuarioToken: string) => `/api/grupos/${usuarioToken}`,
    byToken: (grupoToken: string) => `/api/grupos/${grupoToken}`,
  },
} as const;
