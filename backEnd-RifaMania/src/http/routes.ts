import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function appRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    return { message: 'API is running!' };
  });

}
