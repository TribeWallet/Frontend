export interface Dashboard {
    usuarioToken: string;
    gruposAtivosCount: number;
    pagamentosPendentesCount: number;
    compromissosAVencerCount: number;
    compromissosVencidosCount: number;
    taxaDePontualidade: number;
    transacoesEVencimentos: IntegranteCompromissoDashboard[];
}

export interface IntegranteCompromissoDashboard {
    integranteCompromissoToken: string;
    nomeCompromisso: string;
    imagemCompromissoUrl: string | null;
    nomeGrupo: string;
    categoria: string;
    valorDevedor: number;
    valorPago: number;
    situacaoPagamento: SituacaoPagamento;
    dataVencimento: string;
    diasParaVencimento: number;
    vencido: boolean;
}

export enum SituacaoPagamento {
    Pendente = 1,
    Pago = 2,
    Parcial = 3,
}