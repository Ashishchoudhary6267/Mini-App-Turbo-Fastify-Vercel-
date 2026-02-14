import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import { transactionRoutes } from './routes/transaction';

const fastify = Fastify({
    logger: true
});

fastify.register(cors, {
    origin: '*' // In production, lock this down
});

fastify.register(transactionRoutes);
fastify.register(sensible);

fastify.get('/', async (request, reply) => {
    return { status: 'ok', service: 'Transaction API' };
});

export default function handler(req: any, res: any) {
    fastify.ready((err) => {
        if (err) {
            fastify.log.error(err);
            res.statusCode = 500;
            res.end('Internal Server Error');
            return;
        }
        fastify.server.emit('request', req, res);
    });
}

const start = async () => {
    if (process.env.NODE_ENV === 'production') return; // Vercel handles invocation
    try {
        const port = parseInt(process.env.PORT || '3001');
        await fastify.listen({ port, host: '0.0.0.0' });
        console.log(`Server listening on http://localhost:${port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
