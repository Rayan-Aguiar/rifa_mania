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
  paymentMethod: z.enum(["pix"]), // Removido 'card' da enumeração
  transactionAmount: z
    .number()
    .positive("Valor da transação deve ser positivo"),
  description: z.string().min(1, "Descrição é obrigatória"),
  notificationUrl: z.string().optional(), // Campo de URL de notificação opcional
});

export async function purchaseTicketRoutes(app: FastifyInstance) {
  app.post(
    "/raffles/:id/tickets",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };

      try {

        // Valida os dados do bilhete e do pagamento
        const ticketData = purchaseTicketSchema.parse(request.body);

        const raffle = await prisma.raffle.findUnique({
            where: { id },
            select: { creatorId: true}
        })

        if (!raffle || !raffle.creatorId) {
            return reply.code(404).send({ message: "Rifa não encontrada ou dono não identificado." });
        }
        
        // Prepara os dados do pagamento
        const paymentRequestData = {
          transaction_amount: ticketData.transactionAmount,
          description: ticketData.description,
          payment_method_id: ticketData.paymentMethod,
          payer: {
            email: ticketData.email,
          },
          notification_url: ticketData.notificationUrl || "https://seusite.com/webhook/mercadopago", // URL de notificação opcional
        };

        // Processa o pagamento via Pix
        const paymentResult = await processPixPayment(raffle.creatorId, paymentRequestData);

        // Compra os bilhetes
        const result = await PurchaseTicket(id, ticketData);

        if (result.error) {
          return reply.code(400).send({ message: result.error });
        }

        reply
          .code(201)
          .send({
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

        reply
          .code(500)
          .send({
            message:
              error instanceof Error
                ? error.message
                : "Erro ao comprar os bilhetes",
          });
      }
    }
  );
}
