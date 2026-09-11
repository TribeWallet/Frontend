import type { Commitment } from '../types/Commitment';

const today = new Date();

const buildDate = (offsetDays: number): string => {
  const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offsetDays);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
};

export const commitmentsMock: Commitment[] = [
  {
    id: 'rent-jan',
    initials: 'AJ',
    avatarTone: 'blue',
    name: 'Aluguel Janeiro',
    status: 'paid',
    description: 'Aluguel do apartamento referente a janeiro',
    groupId: 'rep-universitaria',
    groupName: 'República Universitária',
    category: 'Aluguel',
    dueDate: buildDate(-12),
    amount: 2800,
    splitMode: 'equal',
    splits: [
      { memberId: 'ana-lima', amount: 700, paid: true },
      { memberId: 'joao-costa', amount: 700, paid: true },
      { memberId: 'maria-silva', amount: 700, paid: true },
      { memberId: 'rafael-torres', amount: 700, paid: true },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'power',
    initials: 'CL',
    avatarTone: 'teal',
    name: 'Conta de Luz',
    status: 'paid',
    description: 'Conta de energia elétrica de janeiro',
    groupId: 'rep-universitaria',
    groupName: 'República Universitária',
    category: 'Contas',
    dueDate: buildDate(-4),
    amount: 450,
    splitMode: 'equal',
    splits: [
      { memberId: 'ana-lima', amount: 112.5, paid: true },
      { memberId: 'joao-costa', amount: 112.5, paid: true },
      { memberId: 'maria-silva', amount: 112.5, paid: true },
      { memberId: 'rafael-torres', amount: 112.5, paid: true },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rent-feb',
    initials: 'AF',
    avatarTone: 'blue',
    name: 'Aluguel Fevereiro',
    status: 'partial',
    description: 'Aluguel do apartamento referente a fevereiro',
    groupId: 'rep-universitaria',
    groupName: 'República Universitária',
    category: 'Aluguel',
    amount: 2800,
    splitMode: 'equal',
    splits: [
      { memberId: 'ana-lima', amount: 700, paid: true },
      { memberId: 'joao-costa', amount: 700, paid: false },
      { memberId: 'maria-silva', amount: 700, paid: false },
      { memberId: 'rafael-torres', amount: 700, paid: false },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'internet',
    initials: 'IN',
    avatarTone: 'indigo',
    name: 'Internet + TV',
    status: 'pending',
    description: 'Mensalidade do combo internet e TV a cabo',
    groupId: 'rep-universitaria',
    groupName: 'República Universitária',
    category: 'Contas',
    dueDate: buildDate(2),
    amount: 320,
    splitMode: 'equal',
    splits: [
      { memberId: 'ana-lima', amount: 80, paid: false },
      { memberId: 'joao-costa', amount: 80, paid: false },
      { memberId: 'maria-silva', amount: 80, paid: false },
      { memberId: 'rafael-torres', amount: 80, paid: false },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
