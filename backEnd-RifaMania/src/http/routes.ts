import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function appRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    return { message: 'API is running!' };
  });

  // Exemplo de rota que usa Prisma para listar usuários
  app.get('/users', async (request, reply) => {
    const users = await prisma.user.findMany();
    return reply.send(users);
  });
}
