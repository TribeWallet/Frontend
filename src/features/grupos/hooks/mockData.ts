import type { Group, GroupMember } from '../types/Group';

const buildMember = (name: string, email?: string): GroupMember => {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');
  return {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    email,
    initials,
  };
};

export const groupsMock: Group[] = [
  {
    id: 'rep-universitaria',
    tone: 'blue',
    name: 'República Universitária',
    description: 'Despesas do apartamento compartilhado',
    tags: [
      { label: 'Casa', tone: 'neutral' },
      { label: 'Alto', tone: 'blue' },
      { label: 'Ativo', tone: 'green' },
    ],
    summary: {
      members: 4,
      openValue: 'R$ 2.450,00',
      paidValue: 'R$ 8.750,00',
    },
    members: [
      buildMember('Ana Lima', 'ana@tribewallet.com'),
      buildMember('João Costa', 'joao@tribewallet.com'),
      buildMember('Maria Silva', 'maria@tribewallet.com'),
      buildMember('Rafael Torres', 'rafael@tribewallet.com'),
    ],
    createdAt: new Date('2025-01-01').toISOString(),
  },
  {
    id: 'viagem-rj',
    tone: 'green',
    name: 'Viagem RJ - Carnaval',
    description: 'Custos da viagem de carnaval para o Rio',
    tags: [
      { label: 'Viagem', tone: 'neutral' },
      { label: 'Alto', tone: 'blue' },
      { label: 'Ativo', tone: 'green' },
    ],
    summary: {
      members: 6,
      openValue: 'R$ 1.280,00',
      paidValue: 'R$ 4.520,00',
    },
    members: [
      buildMember('Ana Beatriz'),
      buildMember('Carlos Dias'),
      buildMember('Eduardo Faria'),
      buildMember('Gabriela Henrique'),
      buildMember('Igor Jansen'),
    ],
    extraMembers: 2,
    createdAt: new Date('2025-02-01').toISOString(),
  },
  {
    id: 'familia-silva',
    tone: 'family',
    name: 'Família Silva',
    description: 'Despesas compartilhadas da família',
    tags: [
      { label: 'Família', tone: 'neutral' },
      { label: 'Médio', tone: 'blue' },
      { label: 'Ativo', tone: 'green' },
    ],
    summary: {
      members: 3,
      openValue: 'R$ 890,00',
      paidValue: 'R$ 3.200,00',
    },
    members: [
      buildMember('Felipe Silva'),
      buildMember('Julia Silva'),
      buildMember('Marcos Silva'),
    ],
    createdAt: new Date('2025-01-15').toISOString(),
  },
];
