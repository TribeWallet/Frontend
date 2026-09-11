import { Alert, Platform, Share } from 'react-native';

import type { ReportSummary } from './reportBuilder';
import {
  reportToHtml,
  reportToText,
} from './reportBuilder';

export interface ShareOptions {
  message?: string;
}

declare const Buffer: { from(value: string, encoding: string): { toString(encoding: string): string } } | undefined;

export async function shareReport(
  summary: ReportSummary,
  options: ShareOptions = {},
): Promise<void> {
  try {
    const html = reportToHtml(summary);
    const text = reportToText(summary);
    const title = options.message ?? 'Relatório Financeiro - TribeWallet';
    const dataUrl = `data:text/html;base64,${toBase64(html)}`;
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      await Share.share(
        {
          title,
          message: text,
          url: dataUrl,
        },
        {
          dialogTitle: title,
          subject: title,
        },
      );
    } else {
      await Share.share({ title, message: text });
    }
  } catch (error) {
    Alert.alert('Erro', 'Não foi possível compartilhar o relatório.');
  }
}

function toBase64(value: string): string {
  const g = globalThis as unknown as { btoa?: (value: string) => string };
  if (typeof g.btoa === 'function') {
    return g.btoa(unescape(encodeURIComponent(value)));
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(value, 'utf-8').toString('base64');
  }
  return value;
}
