import { z } from 'zod';

export const TRANSACTION_TYPES = ['PAYMENT', 'REFUND'] as const;

export const TransactionSchema = z.object({
    id: z.string().optional(),
    amount: z.number().positive(),
    currency: z.string().length(3),
    recipient: z.string().min(1),
    type: z.enum(TRANSACTION_TYPES),
    timestamp: z.string().datetime().optional(),
});

export type Transaction = z.infer<typeof TransactionSchema>;
