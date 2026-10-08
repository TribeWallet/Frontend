import type { PaymentMethod } from '../types/Payment';
import { paymentMethodFullLabels } from '../types/Payment';

/** As seis formas de pagamento que o enum MetodoPagamento do backend aceita. */
export const paymentMethodOptions: { id: PaymentMethod; label: string }[] = (
  Object.entries(paymentMethodFullLabels) as [PaymentMethod, string][]
).map(([id, label]) => ({ id, label }));
