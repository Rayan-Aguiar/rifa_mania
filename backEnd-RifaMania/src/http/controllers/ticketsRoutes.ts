import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { PurchaseTicket } from "../../rules/ticketRules";
import { processPixPayment } from "../../service/pixPaymentService";
import { prisma } from "../../lib/prisma";

const purchaseTicketSchema = z.object({
  name: z.string().min(3).nonempty("Nome é obrigatório"),
  email: z.string().email("Email inválido").nonempty("Email obrigatório"),
  phone: z.string().nonempty("Telefone obrigatório"),
  numbers: z
    .array(z.number().min(1, "Número inválido."))
    .nonempty("Você deve escolher ao menos um número."),
  paymentMethod: z.enum(["pix"]),
  transactionAmount: z
    .number()
    .positive("Valor da transação deve ser positivo"),
  description: z.string().min(1, "Descrição é obrigatória"),
  notificationUrl: z.string().optional(),
});

export async function purchaseTicketRoutes(app: FastifyInstance) {
  app.post(
    "/raffles/:id/tickets",
    {
      schema: {
        description:
          "Permite a compra de bilhetes para uma rifa, incluindo o pagamento via Pix.",
        tags: ["Rifa Pagamento"],
        params: {
          type: "object",
          properties: {
            id: { type: "string", description: "ID da rifa" },
          },
          required: ["id"],
        },
        body: {
          type: "object",
          properties: {
            name: {
              type: "string",
              minLength: 3,
              description: "Nome do comprador",
            },
            email: {
              type: "string",
              format: "email",
              description: "Email do comprador",
            },
            phone: { type: "string", description: "Telefone do comprador" },
            numbers: {
              type: "array",
              items: { type: "number", minimum: 1 },
              description: "Lista de números escolhidos para o bilhete",
            },
            paymentMethod: {
              type: "string",
              enum: ["pix"],
              description: "Método de pagamento utilizado",
            },
            transactionAmount: {
              type: "number",
              minimum: 0,
              description: "Valor da transação (valor do bilhete)",
            },
            description: {
              type: "string",
              minLength: 1,
              description: "Descrição da transação",
            },
            notificationUrl: {
              type: "string",
              description: "URL para notificação de pagamento",
            },
          },
          required: [
            "name",
            "email",
            "phone",
            "numbers",
            "paymentMethod",
            "transactionAmount",
            "description",
          ],
        },
        response: {
          201: {
            description:
              "Compra do bilhete bem-sucedida, retorna informações sobre o ticket e o pagamento.",
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Ticket comprado com sucesso",
              },
              tickets: {
                type: "array",
                items: { type: "object" },
                description: "Detalhes dos bilhetes comprados",
              },
              payment: {
                type: "object",
                description: "Detalhes do pagamento realizado",
              },
            },
          },
          400: {
            description:
              "Erro de validação (dados inválidos no corpo da requisição).",
            type: "object",
            properties: {
              message: { type: "string" },
              errors: { type: "array", items: { type: "object" } },
            },
          },
          404: {
            description:
              "Rifa não encontrada ou dono da rifa não identificado.",
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
        const ticketData = purchaseTicketSchema.parse(request.body);

        const raffle = await prisma.raffle.findUnique({
          where: { id },
          select: { creatorId: true },
        });

        if (!raffle || !raffle.creatorId) {
          return reply
            .code(404)
            .send({ message: "Rifa não encontrada ou dono não identificado." });
        }

        const paymentRequestData = {
          transaction_amount: ticketData.transactionAmount,
          description: ticketData.description,
          payment_method_id: ticketData.paymentMethod,
          payer: {
            email: ticketData.email,
          },
          notification_url:
            ticketData.notificationUrl ||
            "https://seusite.com/webhook/mercadopago",
        };

        const paymentResult = await processPixPayment(
          raffle.creatorId,
          paymentRequestData
        );
        const result = await PurchaseTicket(id, ticketData);

        if (result.error) {
          return reply.code(400).send({ message: result.error });
        }

        reply.code(201).send({
          message: "Ticket comprado com sucesso",
          tickets: result.tickets,
          payment: paymentResult,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply
            .code(400)
            .send({ message: "Erro de validação", errors: error.errors });
        }

        reply.code(500).send({
          message:
            error instanceof Error
              ? error.message
              : "Erro ao comprar os bilhetes",
        });
      }
    }
  );
}
