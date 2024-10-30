import { Bolt, Ticket, TimerReset } from "lucide-react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { RaffleProps } from "@/@types/Raffle"
import { calculateRemainingDays } from "@/utils/dateUtils"
import imgDefault from "@/assets/sorteio.webp"
import { Link } from "react-router-dom" 

const statusColors: Record<string, string> = {
  Online: "bg-raffle-main hover:bg-raffle-main/90 shadow-none",
  Cancelado: "bg-red-500 shadow-none",
  Expirado: "bg-gray-500 shadow-none",
  Sortear:
    "bg-raffle-highlight hover:bg-raffle-highlight/90 shadow-none text-raffle-main",
  Concluído: "bg-blue-500 shadow-none",
}

const defaultImage = imgDefault

export const CardRaffles = ({
  id,
  name,
  img,
  status,
  drawDate,
  uniqueLink
}: RaffleProps) => {
  const badgeClass = statusColors[status] || "bg-gray-400"
  const remainingDays = calculateRemainingDays(drawDate)

  const handleOpenRaffle = () => {
    if (uniqueLink) {
      window.open(`/comprar-rifa/${uniqueLink}`, "_blank"); 
    }
  };

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
        <Badge
          className={`flex min-w-20 items-center justify-center rounded-full border font-bold uppercase ${badgeClass} p-2`}
        >
          {status}
        </Badge>
      </div>
      <div>
        <p className="text-lg font-semibold">{name}</p>
        <p className="flex items-center gap-1 text-sm">
          <TimerReset className="w-4" /> Faltam {remainingDays} dia(s) para o
          sorteio.
        </p>
      </div>
      <div className="flex w-full gap-2">
        
          <Button onClick={handleOpenRaffle} className="flex w-full items-center gap-1 rounded-xl bg-raffle-main hover:bg-raffle-main/90">
            Visualizar Rifa <Ticket />
          </Button>
        
        <Link to={`/editar-campanha/${id}`} className="w-full">
          <Button className="flex w-full items-center gap-1 rounded-xl bg-raffle-highlight text-raffle-main hover:bg-raffle-highlight/90">
            Gerenciar <Bolt />
          </Button>
        </Link>
      </div>
    </div>
  )
}
