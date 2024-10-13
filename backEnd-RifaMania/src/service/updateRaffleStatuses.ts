import { RaffleStatus } from "../constants/raffleStatus";
import { prisma } from "../lib/prisma";


export async function updateRaffleStatuses(){
    const now = new Date();

    await prisma.raffle.updateMany({
        where: {
            drawDate:{
                lte: now
            },
            status:{
                not: RaffleStatus.SORTING
            },
        },
        data:{
            status: RaffleStatus.SORTING,
            closed: true
        }
    })

    const rafflesToUpdate = await prisma.raffle.findMany({
        where:{
            closed: false,
            status: RaffleStatus.ONLINE,
            availableNumbersCount: 0
        }
    })

    await prisma.raffle.updateMany({
        where:{
            id:{
                in: rafflesToUpdate.map(r => r.id)
            },
        },
        data:{
            status: RaffleStatus.SORTING,
            closed: true
        }
    })
}