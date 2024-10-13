import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { verifyToken } from "../../middlewares/verifyToken";
import { prisma } from "../../lib/prisma";
import { generateUniqueSlug } from "../../utils/generateUniqueSlug";
import { RaffleStatus } from "../../constants/raffleStatus";

interface RaffleCreateRequest {
  name: string;
  drawDate: Date;
  ticketPrice: number;
  totalNumbers: number;
  drawType: "automatic" | "manual";
}

const raffleSchema = z.object({
  name: z.string().min(1, { message: "O nome da rifa é obrigatório." }),
  description: z.string().max(500).nullable().optional(),
  prizeImage: z.string().nullable().optional(),
  supportPhone: z.string().nullable().optional(),
  drawDate: z
    .union([
      z.date(),
      z
        .string()
        .refine((dateStr) => !isNaN(Date.parse(dateStr)), {
          message: "Data inválida. Por favor, forneça uma data válida.",
        })
        .transform((dateStr) => new Date(dateStr)),
    ])
    .refine((date) => date instanceof Date && !isNaN(date.getTime()), {
      message: "A data do sorteio é obrigatória.",
    }),
  ticketPrice: z
    .number()
    .positive({ message: "O preço do bilhete deve ser um número positivo." }),
  totalNumbers: z
    .number()
    .int()
    .positive({ message: "O número total deve ser um inteiro positivo." }),
  availableNumbersCount: z
    .number()
    .min(0, { message: "O número total deve ser um inteiro positivo." }),
  drawType: z.enum(["automatico", "manual"], {
    required_error: "O tipo de sorteio é obrigatório.",
  }),
});

export async function raffleRoutes(app: FastifyInstance) {

  app.post<{ Body: RaffleCreateRequest }>(
    "/raffles",
    { preHandler: verifyToken },
    async (
      request: FastifyRequest<{ Body: RaffleCreateRequest }>,
      reply: FastifyReply
    ) => {
      try {
        const raffleData = raffleSchema.parse({
          ...request.body,
          drawDate: new Date(request.body.drawDate),
        });

        if (!request.userId) {
          return reply
            .code(400)
            .send({ message: "ID do criador não encontrado." });
        }

        const uniqueLink = await generateUniqueSlug(raffleData.name);

        const raffle = await prisma.raffle.create({
          data: {
            name: raffleData.name,
            drawDate: raffleData.drawDate,
            ticketPrice: raffleData.ticketPrice,
            totalNumbers: raffleData.totalNumbers,
            availableNumbersCount: raffleData.totalNumbers,
            drawType: raffleData.drawType,
            status: RaffleStatus.ONLINE,
            closed: false,
            creatorId: request.userId,
            uniqueLink,
          },
        });

        reply.code(201).send(raffle);
      } catch (error) {
        console.error("Erro ao criar rifa:", error);
        if (error instanceof z.ZodError) {
          return reply.code(400).send({ message: error.errors });
        }
        reply.code(500).send({ message: "Internal server error" });
      }
    }
  );

  app.get(
    "/raffles/:slug",
    async (
      request: FastifyRequest<{ Params: { slug: string } }>,
      reply: FastifyReply
    ) => {
      const { slug } = request.params as { slug: string };
      try {
        const { slug } = request.params;

        const raffle = await prisma.raffle.findUnique({
          where: { uniqueLink: slug },
        });

        if (!raffle) {
          return reply.code(404).send({ message: "Rifa não encontrada." });
        }

        reply.code(200).send(raffle);
      } catch (error) {
        console.error("Erro ao buscar a rifa:", error);
        reply.code(500).send({ message: "Erro interno do servidor." });
      }
    }
  );

  app.get(
    "/raffles",
    { preHandler: verifyToken },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.userId;

        const userRaffles = await prisma.raffle.findMany({
          where: {
            creatorId: userId,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        console.log(`Buscando rifas para o usuário ID: ${userId}`);
        console.log(`Rifas encontradas:`, userRaffles);

        if (userRaffles.length === 0) {
          return reply
            .code(404)
            .send({ message: "Você não possui nenhuma rifa cadastrada." });
        }

        reply.send(userRaffles);
      } catch (error) {
        console.error("Erro ao buscar rifas:", error);
        reply.code(500).send({ message: "Internal server error" });
      }
    }
  );

  app.put(
    "/raffles/:id",
    { preHandler: [verifyToken] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const { userId } = request;

      try {
        const raffleData = raffleSchema.parse(request.body);
        const raffle = await prisma.raffle.findUnique({
          where: { id },
        });

        if (!raffle)
          return reply.code(404).send({ message: "Rifa não encontradado" });

        if (raffle.creatorId !== userId) {
          return reply
            .code(403)
            .send({ message: "Você não tem permissão para editar essa rifa!" });
        }

        if(raffle.status !== 'Online'){
          return reply
            .code(400)
            .send({ message: 'Essa rifa não pode mais ser editada.'})
        }

        const uniqueLink = raffleData.name !== raffle.name ? await generateUniqueSlug(raffleData.name) : raffle.uniqueLink

        const updatedRaffle = await prisma.raffle.update({
          where: { id },
          data: {
            ...raffleData,
            uniqueLink,
          },
        });
        reply.code(200).send(updatedRaffle);
      } catch (error) {
        if (error instanceof z.ZodError) {
          reply.code(400).send({ message: error.errors });
        }
        reply.code(500).send({ message: "Erro ao atualizar a rifa" });
      }
    }
  );
}