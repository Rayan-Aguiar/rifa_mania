import fastify from 'fastify';
import { ZodError } from 'zod';
import { env } from './env';
import { PrismaClient } from '@prisma/client';
import { appRoutes } from './http/routes';

export const app = fastify();
const prisma = new PrismaClient();


app.register(appRoutes);


app.setErrorHandler((error, _request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Validation error',
      issues: error.format(),
    });
  }

  if (env.NODE_ENV === 'production') {

    console.error(error);
  } else {
    reply.log.error(error);
  }

  return reply.status(500).send({ message: 'Internal server error' });
});
