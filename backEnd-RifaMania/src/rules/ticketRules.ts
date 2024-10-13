import { prisma } from "../lib/prisma";

interface PurchaseTicketRequest {
    name: string;
    email: string;
    phone: string;
    numbers: number[];
}

export async function PurchaseTicket(raffleId: string, { name, email, phone, numbers }: PurchaseTicketRequest) {

    const raffle = await prisma.raffle.findUnique({
        where: {
            id: raffleId,
        },
    });

    if (!raffle) {
        return { error: 'Rifa não encontrada.' }
    }


    if (raffle.status !== 'Online') {
        return { error: 'A compra não pode ser realizada. O status da rifa deve ser "Online".' };
    }


    const soldTickets = await prisma.participation.findMany({
        where: { raffleId },
    });

    const soldNumbers = soldTickets.map(ticket => ticket.number);


    const invalidNumbers = numbers.filter(number => soldNumbers.includes(number));

    if (invalidNumbers.length > 0) {
        return { error: `Os números ${invalidNumbers.join(', ')} já foram vendidos.` };
    }


    const tickets = await prisma.participation.createMany({
        data: numbers.map(number => ({
            raffleId,
            number,
            buyerName: name,
            buyerEmail: email,
            buyerPhone: phone,
            status: 'pending', 
        })),
    });
    
    return { tickets };
}
