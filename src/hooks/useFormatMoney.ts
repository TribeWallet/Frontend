import { usePreferencesStore } from '../features/configuracoes/stores/preferencesStore';
import { formatCurrency } from '../utils/currency';

export function useFormatMoney() {
  const hideValues = usePreferencesStore((state) => state.hideValues);
  return (amount: number) => (hideValues ? '••••' : formatCurrency(amount));
}
