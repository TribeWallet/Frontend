import * as Sharing from 'expo-sharing';
import { apiClient } from '../../../services/api/apiClient';
import { endpoints } from '../../../config/api';

export async function shareReport(usuarioToken: string, grupoToken?: string): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('O compartilhamento de arquivos não está disponível neste dispositivo.');
  }

  const file = await apiClient.downloadPdf(
    grupoToken
      ? endpoints.relatorios.pdfByGrupo(usuarioToken, grupoToken)
      : endpoints.relatorios.pdfByUsuario(usuarioToken),
    `tribewallet-relatorio-${Date.now()}.pdf`,
  );

  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: 'Relatório Financeiro - TribeWallet',
  });
}
