import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { PurchaseTicket } from "../../rules/ticketRules";

const purchaseTicketSchema = z.object({
    name: z.string().min(3).nonempty('Nome é obrigatório'),
    email: z.string().email('Email invalido').nonempty('Email obrigatório'),
    phone: z.string().nonempty('Telefone obrigatório'),
    numbers: z.array(z.number().min(1, "Número inválido.")).nonempty("Você deve escolher ao menos um número."),
})


export async function purchaseTicketRoutes(app: FastifyInstance){

    app.post('/raffles/:id/tickets', async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };

        try {

            const ticketData = purchaseTicketSchema.parse(request.body);

            const result = await PurchaseTicket(id, ticketData);

            if (result.error) {
                return reply.code(400).send({ message: result.error });
            }

            reply.code(201).send({ message: 'Ticket comprado com sucesso', tickets: result.tickets });
        } catch (error) {

            if (error instanceof z.ZodError) {
                return reply.code(400).send({ message: 'Erro de validação', errors: error.errors });
            }

            reply.code(500).send({ message: error || "Erro ao comprar os bilhetes" });
        }
    });
}