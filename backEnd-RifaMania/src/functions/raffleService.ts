import { prisma } from "../lib/prisma";

export async function listRaffles(userId: string) {

  const raffles = await prisma.raffle.findMany({
    where: {
      creatorId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  
  const rafflesWithDetails = await Promise.all(
    raffles.map(async (raffle) => {
      const soldTicketsCount = await prisma.participation.count({
        where: { raffleId: raffle.id },
      });

      const availableNumbersCount = raffle.totalNumbers - soldTicketsCount;

      return {
        ...raffle,
        soldTicketsCount,           
        availableNumbersCount,      
      };
    })
  );

  return rafflesWithDetails;
}
