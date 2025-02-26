import { RaffleStatus } from "../constants/raffleStatus";
import { prisma } from "../lib/prisma";

export async function drawRaffle(raffleId: string) {
  const raffle = await prisma.raffle.findUnique({
    where: { id: raffleId },
    include: { participants: true },
  });

  if (!raffle) {
    throw new Error("Rifa não encontrada.");
  }

  if (raffle.status !== RaffleStatus.SORTING) {
    throw new Error("A rifa não está pronta para sorteio.");
  }

  const soldTickets = await prisma.participation.findMany({
    where: { raffleId },
  });

  if (soldTickets.length === 0) {
    throw new Error("Não há bilhetes vendidos para sorteio.");
  }

  const randomIndex = Math.floor(Math.random() * soldTickets.length);
  const winningTicket = soldTickets[randomIndex];

  await prisma.raffle.update({
    where: { id: raffleId },
    data: { status: RaffleStatus.CONCLUDED, closed: true },
  });

  return {
    winningNumber: winningTicket.number,
    buyerName: winningTicket.buyerName,
    buyerEmail: winningTicket.buyerEmail,
    buyerPhone: winningTicket.buyerPhone,
  };
}
