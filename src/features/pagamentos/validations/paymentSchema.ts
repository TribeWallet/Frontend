import { z } from 'zod';

export const paymentMethodSchema = z.enum(['pix', 'card', 'boleto', 'other']);
export const cardBrandSchema = z.enum(['credit', 'debit']);

export const paymentRecurrenceSchema = z.enum([
  'unique',
  'weekly',
  'monthly',
  'yearly',
]);

const amountRegex = /^[0-9]+(?:[,.][0-9]{1,2})?$/;

export const paymentDraftSchema = z
  .object({
    description: z
      .string()
      .min(3, 'Informe uma descrição com pelo menos 3 caracteres'),
    amount: z
      .string()
      .min(1, 'Informe um valor')
      .regex(amountRegex, 'Valor inválido')
      .refine((value) => {
        const num = Number(value.replace(',', '.'));
        return !Number.isNaN(num) && num > 0;
      }, 'O valor precisa ser maior que zero'),
    groupId: z.string().min(1, 'Selecione um grupo'),
    commitmentId: z.string().optional(),
    payerId: z.string().min(1, 'Selecione o pagador'),
    payerName: z.string().optional(),
    category: z.string().min(1, 'Selecione uma categoria'),
    method: paymentMethodSchema,
    cardBrand: cardBrandSchema.optional(),
    otherMethod: z.string().optional(),
    recurrence: paymentRecurrenceSchema,
    date: z.string().min(1, 'Informe a data'),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.method === 'card' && !data.cardBrand) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cardBrand'],
        message: 'Selecione crédito ou débito',
      });
    }
    if (data.method === 'other') {
      const trimmed = (data.otherMethod ?? '').trim();
      if (trimmed.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['otherMethod'],
          message: 'Especifique a forma de pagamento',
        });
      }
    }
  });

export type PaymentFormValues = z.infer<typeof paymentDraftSchema>;

export const defaultPaymentFormValues: PaymentFormValues = {
  description: '',
  amount: '',
  groupId: '',
  commitmentId: '',
  payerId: '',
  payerName: '',
  category: '',
  method: 'pix',
  cardBrand: 'credit',
  otherMethod: '',
  recurrence: 'unique',
  date: '',
  notes: '',
};
