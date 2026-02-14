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

fastify.register(sensible);

fastify.register(transactionRoutes);

fastify.get('/', async (request, reply) => {
    return { status: 'ok', service: 'Transaction API' };
});

const start = async () => {
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
