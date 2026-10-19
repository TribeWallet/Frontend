import { apiClient } from '../../../services/api/apiClient';
import { endpoints } from '../../../config/api';
import { getStoredValue, setStoredValue, StorageKeys } from '../../../services/storage';
import { formatCurrency } from '../../../utils/currency';
import { fullName, initialsFromName } from '../../../utils/formatters';
import type { GrupoResponse } from '../../../types/ApiResponse';
import type { Group, GroupMember, GroupTone } from '../types/Group';

export interface CreateGrupoInput {
  nome: string;
  descricao: string;
  usuarioTokens: string[];
}

export interface UpdateGrupoInput {
  nome: string;
  descricao: string;
}

export async function listGrupos(usuarioToken: string): Promise<GrupoResponse[]> {
  const grupos = await apiClient.get<GrupoResponse[]>(
    `${endpoints.grupos.byUsuario(usuarioToken)}?deleted=false`,
  );
  // A exclusão é soft delete: filtra o que já foi excluído.
  const activeGroups = grupos.filter((grupo) => !grupo.deletedAt);
  const uniqueGroups = new Map<string, GrupoResponse>();
  activeGroups.forEach((grupo) => uniqueGroups.set(grupo.grupoToken, grupo));
  return [...uniqueGroups.values()];
}

export function getGrupo(grupoToken: string): Promise<GrupoResponse> {
  return apiClient.get<GrupoResponse>(
    `${endpoints.grupos.byToken(grupoToken)}?deleted=false`,
  );
}

export function createGrupo({
  nome,
  descricao,
  usuarioTokens,
}: CreateGrupoInput): Promise<GrupoResponse> {
  return apiClient.post<GrupoResponse>(endpoints.grupos.create, {
    nome,
    descricao,
    integrantes: usuarioTokens.map((usuarioToken) => ({ usuarioToken })),
  });
}

export function updateGrupo(grupoToken: string, input: UpdateGrupoInput): Promise<GrupoResponse> {
  return apiClient.put<GrupoResponse>(endpoints.grupos.byToken(grupoToken), input);
}

export function deleteGrupo(grupoToken: string): Promise<void> {
  return apiClient.delete(endpoints.grupos.byToken(grupoToken));
}

/** Inclui novos integrantes num grupo existente. */
export function addIntegrantes(
  grupoToken: string,
  usuarioTokens: string[],
): Promise<unknown> {
  return apiClient.put(
    endpoints.grupos.integrantes(grupoToken),
    usuarioTokens.map((usuarioToken) => ({ usuarioToken })),
  );
}

export function removeIntegrante(
  grupoToken: string,
  integranteToken: string,
): Promise<GrupoResponse> {
  return apiClient.delete<GrupoResponse>(
    endpoints.grupos.integrante(grupoToken, integranteToken),
  );
}

// A API não tem categoria de grupo; a escolhida no app fica guardada no aparelho.
type ToneMap = Record<string, GroupTone>;

export async function saveGroupTone(grupoToken: string, tone: GroupTone): Promise<void> {
  const tones = (await getStoredValue<ToneMap>(StorageKeys.groupTones)) ?? {};
  await setStoredValue(StorageKeys.groupTones, { ...tones, [grupoToken]: tone });
}

const TONE_LABELS: Record<GroupTone, string> = {
  blue: 'Casa',
  green: 'Viagem',
  family: 'Família',
};

const TONE_KEYWORDS: { tone: GroupTone; keywords: string[] }[] = [
  { tone: 'green', keywords: ['viagem', 'travel', 'ferias', 'férias', 'carnaval'] },
  { tone: 'family', keywords: ['família', 'familia', 'family'] },
];

function resolveTone(name: string): GroupTone {
  const lowered = name.toLowerCase();
  const found = TONE_KEYWORDS.find((entry) =>
    entry.keywords.some((keyword) => lowered.includes(keyword)),
  );
  return found?.tone ?? 'blue';
}

export async function toGroup(grupo: GrupoResponse): Promise<Group> {
  const tone =
    (await getStoredValue<ToneMap>(StorageKeys.groupTones))?.[grupo.grupoToken] ??
    resolveTone(grupo.nome);

  const members: GroupMember[] = (grupo.integrantes ?? [])
    .filter((integrante) => !integrante.deletedAt && !integrante.usuario.deletedAt)
    .map((integrante) => {
      const { usuario } = integrante;
      const name = fullName(usuario.nome, usuario.sobrenome);
      // O id do integrante é o usuarioToken, o mesmo id que o app usa para o usuário logado.
      return {
        id: usuario.usuarioToken,
        integranteToken: integrante.integranteToken,
        name,
        email: usuario.email,
        initials: initialsFromName(name),
      };
    });

  return {
    id: grupo.grupoToken,
    tone,
    name: grupo.nome,
    description: grupo.descricao ?? '',
    tags: [{ label: TONE_LABELS[tone], tone: 'neutral' }],
    summary: {
      members: members.length,
      openValue: formatCurrency(0),
      paidValue: formatCurrency(0),
    },
    members,
  };
}
