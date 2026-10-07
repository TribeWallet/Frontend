import { z } from 'zod';

const amountRegex = /^[0-9]+(?:[,.][0-9]{1,2})?$/;
const dateRegex = /^[0-3][0-9]\/[0-1][0-9]\/[0-9]{4}$/;

export const paymentMethodSchema = z.enum([
  'pix',
  'dinheiro',
  'credito',
  'debito',
  'transferencia',
  'boleto',
]);

export const paymentFormSchema = z.object({
  groupId: z.string().min(1, 'Selecione um grupo'),
  commitmentId: z.string().min(1, 'Selecione um compromisso'),
  /** integranteCompromissoToken da fatia que está sendo quitada. */
  shareId: z.string().min(1, 'Selecione o integrante'),
  amount: z
    .string()
    .min(1, 'Informe um valor')
    .regex(amountRegex, 'Valor inválido')
    .refine((value) => Number(value.replace(',', '.')) > 0, 'O valor precisa ser maior que zero'),
  date: z.string().regex(dateRegex, 'Use o formato DD/MM/AAAA'),
  method: paymentMethodSchema,
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export const defaultPaymentFormValues: PaymentFormValues = {
  groupId: '',
  commitmentId: '',
  shareId: '',
  amount: '',
  date: '',
  method: 'pix',
};
