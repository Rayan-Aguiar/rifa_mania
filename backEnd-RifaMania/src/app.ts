import fastify from 'fastify';
import cors from '@fastify/cors'
import { ZodError } from 'zod';
import { env } from './env';
import { PrismaClient } from '@prisma/client';
import { userRoutes } from './http/controllers/userRoutes';
import { authRoutes } from './http/controllers/authRoutes';
import { raffleRoutes } from './http/controllers/rafflesRoutes';
import { startCronJob } from './utils/cron';
import { purchaseTicketRoutes } from './http/controllers/ticketsRoutes';

export const app = fastify();
const prisma = new PrismaClient();


app.register(cors, {
  origin: '*',
  methods: 'GET, POST, PATCH,PUT, DELETE',
})

app.register(userRoutes);
app.register(authRoutes);
app.register(raffleRoutes);
app.register(purchaseTicketRoutes)


//Iniciar Cron Job
startCronJob()


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
