import { describe, it, expect } from 'vitest';
import { TransactionSchema } from './index';

describe('TransactionSchema', () => {
    it('should validate a valid transaction', () => {
        const valid = {
            amount: 100.50,
            currency: 'USD',
            recipient: 'Bob',
            type: 'PAYMENT',
            timestamp: new Date().toISOString()
        };

        const result = TransactionSchema.safeParse(valid);
        expect(result.success).toBe(true);
    });

    it('should fail on negative amount', () => {
        const invalid = {
            amount: -10,
            currency: 'USD',
            recipient: 'Bob',
            type: 'PAYMENT'
        };

        const result = TransactionSchema.safeParse(invalid);
        expect(result.success).toBe(false);
    });

    it('should fail on invalid currency', () => {
        const invalid = {
            amount: 10,
            currency: 'US', // too short
            recipient: 'Bob',
            type: 'PAYMENT'
        };

        const result = TransactionSchema.safeParse(invalid);
        expect(result.success).toBe(false);
    });
});
