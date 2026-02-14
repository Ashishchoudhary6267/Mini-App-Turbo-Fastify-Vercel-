import 'dotenv/config';
import { IncomingMessage, ServerResponse } from 'http';
import { handleTransaction, handleTransactions, handleRoot } from './routes/transaction';


// Serverless handler for Vercel
export default async function handler(req: IncomingMessage, res: ServerResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
    }

    const url = req.url || '/';

    if (url === '/' && req.method === 'GET') {
        return handleRoot(req, res);
    }

    if (url === '/transaction' && req.method === 'POST') {
        return handleTransaction(req, res);
    }

    if (url === '/transactions' && req.method === 'GET') {
        return handleTransactions(req, res);
    }

    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Not Found' }));
}
