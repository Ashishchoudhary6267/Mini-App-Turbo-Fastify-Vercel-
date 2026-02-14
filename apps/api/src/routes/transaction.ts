import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import crypto from 'crypto';
import { TransactionSchema, Transaction } from '@repo/shared/dist/index'; // Import from dist in monorepo if using compiled
// Or if using tsx/ts-node, straight from source might work if configured, but dist is safer for standard node
// Wait, in dev mode with tsx we can import from source if we use workspaces correctly or if we just rely on node resolution
// But commonly in turbo with simple setup, we use the "main" from package.json which points to src/index.ts if we set it so for dev?
// Actually my package.json for shared says main: src/index.ts. So this should work with tsx.
import { encrypt, decrypt } from '../encryption';

// In-memory storage
const transactions: Transaction[] = [];

// Schema for the incoming encrypted payload
const EncryptedBodySchema = z.object({
    data: z.string(),
});

export async function transactionRoutes(fastify: FastifyInstance) {
    fastify.post('/transaction', async (request, reply) => {
        try {
            // 1. Validate that body has 'data' field
            const body = EncryptedBodySchema.parse(request.body);

            // 2. Decrypt
            const decryptedData = decrypt(body.data);

            // 3. Validate the actual transaction data
            const transactionData = TransactionSchema.parse(decryptedData);

            // 4. Store (Generate ID if not present)
            const newTransaction: Transaction = {
                ...transactionData,
                id: transactionData.id || crypto.randomUUID(),
                timestamp: new Date().toISOString(),
            };

            transactions.push(newTransaction);

            fastify.log.info({ msg: 'Transaction stored', id: newTransaction.id });

            return { success: true, id: newTransaction.id };
        } catch (error) {
            if (error instanceof z.ZodError) {
                reply.status(400).send({ error: 'Validation Error', details: error.errors });
            } else if (error instanceof Error) {
                reply.status(400).send({ error: error.message }); // Could be decryption error
            } else {
                reply.status(500).send({ error: 'Internal Server Error' });
            }
        }
    });

    fastify.get('/transactions', async (request, reply) => {
        // Return plain list for debugging/viewing, or encrypted if required. 
        // Requirement says: "Display transaction status/results".
        // Let's return them plain for the secure-admin-like view
        return { transactions };
    });
}
