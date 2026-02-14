import { IncomingMessage, ServerResponse } from 'http';
import { z } from 'zod';
import crypto from 'crypto';
import { Transaction, TransactionSchema } from '@repo/shared';
import { encrypt, decrypt } from '../encryption';

// In-memory storage
const transactions: Transaction[] = [];

// Schema for the incoming encrypted payload
const EncryptedBodySchema = z.object({
    data: z.string(),
});

// Helper to parse request body
function parseBody(req: IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(new Error('Invalid JSON'));
            }
        });
        req.on('error', reject);
    });
}

// Handle root route
export async function handleRoot(req: IncomingMessage, res: ServerResponse) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'ok', service: 'Transaction API' }));
}

// Handle POST /transaction
export async function handleTransaction(req: IncomingMessage, res: ServerResponse) {
    try {
        const body = await parseBody(req);

        // 1. Validate that body has 'data' field
        const { data } = EncryptedBodySchema.parse(body);

        // 2. Decrypt
        const decryptedData = decrypt(data);

        // 3. Validate the actual transaction data
        const transactionData = TransactionSchema.parse(decryptedData);

        // 4. Store (Generate ID if not present)
        const newTransaction: Transaction = {
            ...transactionData,
            id: transactionData.id || crypto.randomUUID(),
            timestamp: new Date().toISOString(),
        };

        transactions.push(newTransaction);

        console.log('Transaction stored:', newTransaction.id);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, id: newTransaction.id }));
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Validation Error', details: error.errors }));
        } else if (error instanceof Error) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message }));
        } else {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
        }
    }
}

// Handle GET /transactions
export async function handleTransactions(req: IncomingMessage, res: ServerResponse) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ transactions }));
}
