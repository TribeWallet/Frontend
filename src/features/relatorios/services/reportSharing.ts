import * as Sharing from 'expo-sharing';
import { apiClient } from '../../../services/api/apiClient';

export async function shareReport(usuarioToken: string): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('O compartilhamento de arquivos não está disponível neste dispositivo.');
  }

  const file = await apiClient.downloadPdf(
    `/api/relatorios/usuario/${encodeURIComponent(usuarioToken)}`,
    `tribewallet-relatorio-${Date.now()}.pdf`,
  );

  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: 'Relatório Financeiro - TribeWallet',
  });
}
