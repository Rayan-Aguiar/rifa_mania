import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { verifyToken } from "../../middlewares/verifyToken";
import { prisma } from "../../lib/prisma";
import { generateUniqueSlug } from "../../utils/generateUniqueSlug";
import { RaffleStatus } from "../../constants/raffleStatus";
import { listRaffles } from "../../functions/raffleService";
import { drawRaffle } from "../../functions/drawRaffle";
import { ALLOWED_TOTAL_NUMBERS } from "../../rules/raffleRules";

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
    {
      preHandler: verifyToken,
      schema: {
        description:
          "Cria uma nova rifa com as informações fornecidas, incluindo nome, data do sorteio e preço do bilhete.",
        tags: ["Rifa"],
        body: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 3, description: "Nome da rifa" },
            drawDate: {
              type: "string",
              format: "date-time",
              description: "Data e hora do sorteio",
            },
            ticketPrice: {
              type: "number",
              minimum: 0,
              description: "Preço do bilhete",
            },
            totalNumbers: {
              type: "number",
              minimum: 1,
              description: "Número total de bilhetes disponíveis",
            },
            drawType: {
              type: "string",
              enum: ["automatico", "manual"],
              description: "Tipo de sorteio (automático ou manual)",
            },
            supportPhone: {
              type: "string",
              description: "Número de telefone para suporte",
            },
          },
          required: ["name", "drawDate", "ticketPrice", "totalNumbers"],
        },
        response: {
          201: {
            description:
              "Rifa criada com sucesso, retorna as informações da rifa criada.",
            type: "object",
            properties: {
              id: { type: "string", description: "ID da rifa criada" },
              name: { type: "string", description: "Nome da rifa" },
              drawDate: {
                type: "string",
                format: "date-time",
                description: "Data e hora do sorteio",
              },
              ticketPrice: { type: "number", description: "Preço do bilhete" },
              totalNumbers: {
                type: "number",
                description: "Número total de bilhetes disponíveis",
              },
              availableNumbersCount: {
                type: "number",
                description: "Número de bilhetes disponíveis",
              },
              drawType: { type: "string", description: "Tipo de sorteio" },
              supportPhone: {
                type: "string",
                description: "Número de telefone para suporte",
              },
              status: { type: "string", description: "Status da rifa" },
              creatorId: {
                type: "string",
                description: "ID do criador da rifa",
              },
              uniqueLink: {
                type: "string",
                description: "Link único gerado para a rifa",
              },
            },
          },
          400: {
            description:
              "Erro de validação (dados inválidos ou campo ausente).",
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          500: {
            description: "Erro interno do servidor.",
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Body: RaffleCreateRequest }>,
      reply: FastifyReply
    ) => {
      try {
        const raffleData = raffleSchema.parse({
          ...request.body,
          drawDate: new Date(request.body.drawDate),
          availableNumbersCount: request.body.totalNumbers,
          drawType: request.body.drawType || "automatico",
        });

        if (raffleData.drawDate < new Date()) {
          return reply.code(400).send({
            message: "A data do sorteio não pode ser anterior à data atual.",
          });
        }

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
            availableNumbersCount: raffleData.availableNumbersCount,
            drawType: raffleData.drawType,
            supportPhone: raffleData.supportPhone,
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
    "/raffles/slug/:slug",
    {
      schema: {
        description:
          "Retorna os dados de uma rifa com base no slug único fornecido, incluindo o número de bilhetes disponíveis e vendidos.",
        tags: ["Rifa"],
        params: {
          type: "object",
          properties: {
            slug: {
              type: "string",
              description: "Slug único da rifa para identificação",
            },
          },
          required: ["slug"],
        },
        response: {
          200: {
            description:
              "Rifa encontrada com sucesso, retorna as informações da rifa e o status dos bilhetes.",
            type: "object",
            properties: {
              id: { type: "string", description: "ID da rifa" },
              name: { type: "string", description: "Nome da rifa" },
              drawDate: {
                type: "string",
                format: "date-time",
                description: "Data e hora do sorteio",
              },
              ticketPrice: { type: "number", description: "Preço do bilhete" },
              totalNumbers: {
                type: "number",
                description: "Número total de bilhetes disponíveis",
              },
              availableNumbers: {
                type: "array",
                items: { type: "number" },
                description: "Lista de números de bilhetes disponíveis",
              },
              availableCount: {
                type: "number",
                description: "Quantidade de bilhetes disponíveis",
              },
              soldTicketsCount: {
                type: "number",
                description: "Quantidade de bilhetes vendidos",
              },
              creatorName: {
                type: "string",
                description: "Nome do criador da rifa",
              },
              uniqueLink: {
                type: "string",
                description: "Link único gerado para a rifa",
              },
              supportPhone: {
                type: "string",
                description: "Número de telefone para suporte",
              },
              drawType: {
                type: "string",
                description: "Tipo de sorteio (automático ou manual)",
              },
              status: { type: "string", description: "Status da rifa" },
              closed: {
                type: "boolean",
                description: "Indica se a rifa está fechada",
              },
            },
          },
          404: {
            description: "Rifa não encontrada.",
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          500: {
            description: "Erro interno do servidor.",
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { slug: string } }>,
      reply: FastifyReply
    ) => {
      const { slug } = request.params as { slug: string };
      try {
        const raffle = await prisma.raffle.findUnique({
          where: { uniqueLink: slug },
          include: {
            creator: {
              select: { name: true },
            },
          },
        });

        if (!raffle) {
          return reply.code(404).send({ message: "Rifa não encontrada." });
        }

        const soldTickets = await prisma.participation.findMany({
          where: { raffleId: raffle.id },
          select: { number: true },
        });

        const soldNumbers = soldTickets.map((ticket) => ticket.number);
        const availableNumbers = Array.from(
          { length: raffle.totalNumbers },
          (_, i) => i + 1
        ).filter((number) => !soldNumbers.includes(number));

        const availableCount = availableNumbers.length;

        reply.code(200).send({
          ...raffle,
          availableNumbers,
          availableCount,
          soldTicketsCount: soldNumbers.length,
          creatorName: raffle.creator?.name,
        });
      } catch (error) {
        console.error("Erro ao buscar a rifa:", error);
        reply.code(500).send({ message: "Erro interno do servidor." });
      }
    }
  );

  app.get(
    "/raffles",
    {
      preHandler: verifyToken,
      schema: {
        description:
          "Retorna todas as rifas cadastradas pelo usuário autenticado.",
        tags: ["Rifa"],
        response: {
          200: {
            description:
              "Lista de rifas do usuário, com os dados das rifas cadastradas.",
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string", description: "ID da rifa" },
                name: { type: "string", description: "Nome da rifa" },
                drawDate: {
                  type: "string",
                  format: "date-time",
                  description: "Data e hora do sorteio",
                },
                ticketPrice: {
                  type: "number",
                  description: "Preço do bilhete",
                },
                totalNumbers: {
                  type: "number",
                  description: "Número total de bilhetes disponíveis",
                },
                availableNumbersCount: {
                  type: "number",
                  description: "Quantidade de bilhetes disponíveis",
                },
                drawType: {
                  type: "string",
                  description: "Tipo de sorteio (automático ou manual)",
                },
                status: { type: "string", description: "Status da rifa" },
                creatorId: {
                  type: "string",
                  description: "ID do criador da rifa",
                },
                uniqueLink: {
                  type: "string",
                  description: "Link único gerado para a rifa",
                },
                supportPhone: {
                  type: "string",
                  description: "Número de telefone para suporte",
                },
                closed: {
                  type: "boolean",
                  description: "Indica se a rifa está fechada",
                },
              },
            },
          },
          400: {
            description: "Usuário não autenticado.",
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          404: {
            description: "Nenhuma rifa cadastrada pelo usuário.",
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          500: {
            description: "Erro interno do servidor.",
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.userId;

        if (!userId) {
          return reply.code(400).send({ message: "Usuário não autenticado." });
        }

        const userRaffles = await listRaffles(userId);

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

  app.get(
    "/raffles/:id",
    {
      preHandler: verifyToken,
      schema: {
        description:
          "Retorna os detalhes de uma rifa específica com base no ID fornecido.",
        tags: ["Rifa"],
        params: {
          type: "object",
          properties: {
            id: { type: "string", description: "ID da rifa a ser recuperada" },
          },
          required: ["id"],
        },
        response: {
          200: {
            description: "Dados da rifa especificada.",
            type: "object",
            properties: {
              name: { type: "string", description: "Nome da rifa" },
              description: { type: "string", description: "Descrição da rifa" },
              prizeImage: {
                type: "string",
                description: "URL da imagem do prêmio",
              },
              supportPhone: {
                type: "string",
                description: "Telefone de suporte para a rifa",
              },
              drawDate: {
                type: "string",
                format: "date-time",
                description: "Data e hora do sorteio",
              },
              ticketPrice: { type: "number", description: "Preço do bilhete" },
              totalNumbers: {
                type: "number",
                description: "Número total de bilhetes disponíveis",
              },
              soldTicketsCount: { type: "number", description: "Quantidade de bilhetes vendidos" },
            },
          },
          404: {
            description: "Rifa não encontrada.",
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          500: {
            description: "Erro interno do servidor.",
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };

      try {
        const soldTicketsCount = await prisma.participation.count({
          where: { raffleId: id }
        })
        console.log("Tickets vendidos:", soldTicketsCount);

        const raffle = await prisma.raffle.findUnique({
          where: { id },
          select: {
            name: true,
            description: true,
            prizeImage: true,
            supportPhone: true,
            drawDate: true,
            ticketPrice: true,
            totalNumbers: true,
          },
        });
        if (!raffle) {
          return reply.code(404).send({ message: "Rifa não encontrada." });
        }
        const response = { ...raffle, soldTicketsCount };
        reply.code(200).send(response);
      } catch (error) {
        return reply.code(500).send({ message: "Internal server error" });
      }
    }
  );

  app.put(
    "/raffles/:id",
    { 
      preHandler: [verifyToken],
      schema: {
        description: "Permite a edição de uma rifa específica, caso o usuário seja o criador e a rifa esteja no status 'Online'.",
        tags: ["Rifa"],
        params: {
          type: "object",
          properties: {
            id: { type: "string", description: "ID da rifa a ser editada" },
          },
          required: ["id"],
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string", description: "Nome da rifa" },
            totalNumbers: { type: "number", description: "Número total de bilhetes disponíveis" },
            prizeImage: { type: "string", nullable: true, description: "URL da imagem do prêmio (opcional)" },
          },
          required: ["name", "totalNumbers"],
        },
        response: {
          200: {
            description: "Rifa atualizada com sucesso.",
            type: "object",
            properties: {
              id: { type: "string", description: "ID da rifa" },
              name: { type: "string", description: "Nome da rifa" },
              totalNumbers: { type: "number", description: "Número total de bilhetes disponíveis" },
              prizeImage: { type: "string", nullable: true, description: "URL da imagem do prêmio" },
              status: { type: "string", description: "Status da rifa" },
              creatorId: { type: "string", description: "ID do criador da rifa" },
            },
          },
          400: {
            description: "Erro ao tentar editar a rifa. Pode ser devido a rifa não estar no status 'Online' ou dados inválidos.",
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          403: {
            description: "Usuário não tem permissão para editar essa rifa.",
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          404: {
            description: "Rifa não encontrada.",
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          500: {
            description: "Erro interno do servidor.",
          },
        },
      },
     },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const { userId } = request;

      try {
        const raffleSchema = z.object({
          name: z.string(),
          totalNumbers: z.number(),
          prizeImage: z.string().nullable().optional(),
        });
        const raffleData = raffleSchema.parse(request.body);

        const raffle = await prisma.raffle.findUnique({ where: { id } });
        if (!raffle)
          return reply.code(404).send({ message: "Rifa não encontrada" });

        if (raffle.creatorId !== userId)
          return reply
            .code(403)
            .send({ message: "Você não tem permissão para editar essa rifa!" });

        if (raffle.status !== "Online")
          return reply
            .code(400)
            .send({ message: "Essa rifa não pode mais ser editada." });

        const uniqueLink =
          raffleData.name !== raffle.name
            ? await generateUniqueSlug(raffleData.name)
            : raffle.uniqueLink;

        const imagePath = raffleData.prizeImage
          ? raffleData.prizeImage
          : raffle.prizeImage;

        const updatedRaffle = await prisma.raffle.update({
          where: { id },
          data: {
            ...raffleData,
            uniqueLink,
            availableNumbersCount: raffleData.totalNumbers,
            prizeImage: imagePath,
          },
        });
        reply.code(200).send(updatedRaffle);
      } catch (error) {
        if (error instanceof z.ZodError) {
          reply.code(400).send({ message: error.errors });
        } else {
          reply.code(500).send({ message: "Erro ao atualizar a rifa" });
        }
      }
    }
  );

  app.post(
    "/raffles/:id/draw",
    { preHandler: [verifyToken],
      schema: {
        description: "Realiza o sorteio de uma rifa com base nos números vendidos.",
        tags: ["Rifa"],
        params: {
          type: "object",
          properties: {
            id: { type: "string", description: "ID da rifa para a qual o sorteio será realizado" },
          },
          required: ["id"],
        },
        response: {
          200: {
            description: "Sorteio realizado com sucesso.",
            type: "object",
            properties: {
              message: { type: "string", example: "Sorteio realizado com sucesso!" },
              result: {
                type: "object",
                properties: {
                  winningNumber: { type: "string", description: "Número sorteado vencedor" },
                  buyerName: { type: "string", description: "Nome do comprador do bilhete vencedor" },
                  buyerEmail: { type: "string", description: "Email do comprador do bilhete vencedor" },
                  buyerPhone: { type: "string", description: "Telefone do comprador do bilhete vencedor" },
                },
              },
            },
          },
          400: {
            description: "Erro ao realizar o sorteio. Pode ser causado por problemas na rifa ou dados inválidos.",
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          500: {
            description: "Erro interno do servidor.",
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };

      try {
        const result = await drawRaffle(id);
        reply
          .code(200)
          .send({ message: "Sorteio realizado com sucesso!", result });
      } catch (error) {
        if (error instanceof Error) {
          return reply.code(400).send({ message: error.message });
        }
        reply.code(500).send({ message: "Erro ao realizar o sorteio." });
      }
    }
  );

  app.get(
    "/raffles/ticket-quantities",
    { preHandler: [verifyToken],
      schema: {
        description: "Retorna as quantidades de números permitidas para a criação de rifas.",
        tags: ["Rifa"],
        response: {
          200: {
            description: "Lista de quantidades de números permitidas para a criação de rifas.",
            type: "array",
            items: {
              type: "number",
              description: "Quantidade de números disponível para a rifa",
            },
          },
          500: {
            description: "Erro interno do servidor.",
          },
        },
      },
     },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      const quantities = ALLOWED_TOTAL_NUMBERS;
      reply.send(quantities);
    }
  );
}
