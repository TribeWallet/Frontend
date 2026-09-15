import { Platform } from 'react-native';

// O emulador Android enxerga o localhost da máquina em 10.0.2.2; o simulador iOS usa localhost.
// Em celular físico, troque pelo IP da máquina na rede (ex.: http://192.168.0.10:5049).
const DEV_API_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:5049' : 'http://localhost:5049';

export const environment = {
  apiUrl: DEV_API_URL,
  requestTimeoutMs: 15000,
} as const;
