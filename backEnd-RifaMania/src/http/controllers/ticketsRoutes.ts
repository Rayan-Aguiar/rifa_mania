import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { PurchaseTicket } from "../../rules/ticketRules"; // Certifique-se de que essa função ainda é necessária
import { processPixPayment } from "../../service/pixPaymentService"; // Ajuste o caminho conforme necessário
import { processCardPayment } from "../../service/cardPaymentService"; // Ajuste o caminho conforme necessário

const purchaseTicketSchema = z.object({
    name: z.string().min(3).nonempty('Nome é obrigatório'),
    email: z.string().email('Email inválido').nonempty('Email obrigatório'),
    phone: z.string().nonempty('Telefone obrigatório'),
    numbers: z.array(z.number().min(1, "Número inválido.")).nonempty("Você deve escolher ao menos um número."),
    paymentMethod: z.enum(["pix", "card"]),
    transactionAmount: z.number().positive("Valor da transação deve ser positivo"),
    description: z.string().min(1, "Descrição é obrigatória"),
    installments: z.number().int().positive("Número de parcelas deve ser positivo").optional(),
    token: z.string().optional(),
    identificationType: z.string().optional(),
    identificationNumber: z.string().optional(),
});

export async function purchaseTicketRoutes(app: FastifyInstance) {
    app.post('/raffles/:id/tickets', async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };

        try {
            // Valida os dados do bilhete e do pagamento
            const ticketData = purchaseTicketSchema.parse(request.body);
            
            // Obtém os dados do pagador
            const payer = {
                email: ticketData.email,
                identification: ticketData.paymentMethod === "card"
                    ? {
                        type: ticketData.identificationType || "",
                        number: ticketData.identificationNumber || "",
                    }
                    : undefined,
            };

            // Prepara os dados do pagamento
            const paymentRequestData = {
                transaction_amount: ticketData.transactionAmount,
                description: ticketData.description,
                payment_method_id: ticketData.paymentMethod,
                payer,
                notification_url: "https://seusite.com/webhook/mercadopago", // Ajuste conforme necessário
            };

            // Processa o pagamento
            let paymentResult;
            if (ticketData.paymentMethod === "pix") {
                paymentResult = await processPixPayment(paymentRequestData);
            } else {
                paymentResult = await processCardPayment({
                    ...paymentRequestData,
                    token: ticketData.token,
                    installments: ticketData.installments ?? 1,
                });
            }

            // Compra os bilhetes
            const result = await PurchaseTicket(id, ticketData);

            if (result.error) {
                return reply.code(400).send({ message: result.error });
            }

            reply.code(201).send({ message: 'Ticket comprado com sucesso', tickets: result.tickets, payment: paymentResult });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return reply.code(400).send({ message: 'Erro de validação', errors: error.errors });
            }

            reply.code(500).send({ message: error instanceof Error ? error.message : "Erro ao comprar os bilhetes" });
        }
    });
}
