import { Bolt, Ticket, TimerReset } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { RaffleProps } from "@/@types/Raffle";
import { calculateRemainingDays } from "@/utils/dateUtils";
import imgDefault from "@/assets/sorteio.webp"

const statusColors: Record<string, string> = {
    ONLINE: "bg-raffle-main",
    CANCELLED: "bg-red-500 ",
    EXPIRED: "bg-gray-500 ",
    SORTING: "bg-yellow-500 ",
    CONCLUDED: "bg-blue-500 ",
};

const statusLabels: Record<string, string> = {
    ONLINE: "Online",
    CANCELLED: "Cancelado",
    EXPIRED: "Expirado",
    SORTING: "Sortear",
    CONCLUDED: "Concluído",
};

const defaultImage = imgDefault

export const CardRaffles = ({
    name,
    img,
    status,
    drawDate,
}: Omit<RaffleProps, 'id'>) => { 
    const normalizedStatus = status.toUpperCase(); 
    const badgeClass = statusColors[normalizedStatus] || "";
    const statusLabel = statusLabels[normalizedStatus] || "Desconhecido";
    const remainingDays = calculateRemainingDays(drawDate);

    return (
        <div className="flex h-fit w-full flex-col gap-2 rounded-xl bg-white/40 p-4 shadow-sm">
            <div className="flex w-full items-center justify-between">
                <div className="h-24 w-36 overflow-hidden rounded-lg">
                    <img
                        src={img || defaultImage}
                        alt="campanha"
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                </div>
                <Badge className={`rounded-full border min-w-20 flex justify-center items-center uppercase hover:${badgeClass} ${badgeClass} p-2`}>
                    {statusLabel}
                </Badge>
            </div>
            <div>
                <p className="text-lg font-semibold">{name}</p>
                <p className="flex items-center gap-1 text-sm">
                    <TimerReset className="w-4" /> Faltam {remainingDays} dia(s) para o sorteio.
                </p>
            </div>
            <div className="flex w-full gap-2">
                <Button className="flex w-full items-center gap-1 rounded-xl bg-raffle-main hover:bg-raffle-main/90">
                    Visualizar Rifa <Ticket />
                </Button>
                <Button className="flex w-full items-center gap-1 rounded-xl bg-raffle-highlight text-raffle-main hover:bg-raffle-highlight/90">
                    Gerenciar <Bolt />
                </Button>
            </div>
        </div>
    );
};
