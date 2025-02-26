import { Bolt, Clover, Ticket, TimerReset, Trophy } from "lucide-react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { RaffleProps } from "@/@types/Raffle"
import { calculateRemainingDays } from "@/utils/dateUtils"
import imgDefault from "@/assets/sorteio.webp"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { DialogRaffle } from "./DialogRaffle"
import { DialogWinnerComponent } from "./DialogWinnerComponent"

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
  prizeImage,
  status,
  drawDate,
  uniqueLink,
}: RaffleProps) => {
  const badgeClass = statusColors[status] || "bg-gray-400"
  const remainingDays = calculateRemainingDays(drawDate)
  const [openDialog, setOpenDialog] = useState(false)
  const [openDialogWinner, setOpenDialogWinnder] = useState(false)
  const [drawRaffle, setDrawRaffle] = useState(status)

  const statusMap: Record<
    string,
    "ONLINE" | "CANCELLED" | "EXPIRED" | "SORTING" | "CONCLUDED"
  > = {
    Sortear: "SORTING",
    Online: "ONLINE",
    Cancelado: "CANCELLED",
    Expirado: "EXPIRED",
    Concluido: "CONCLUDED",
  }

  useEffect(() => {
    if (status in statusMap) {
      setDrawRaffle(statusMap[status])
    }
  }, [status])

  const handleOpenAndCloseDialog = () => {
    setOpenDialog(!openDialog)
  }
  const handleOpenAndCloseDialogWinner = () => {
    setOpenDialogWinnder(!openDialogWinner)
  }

  const handleOpenRaffle = () => {
    if (uniqueLink) {
      window.open(`/comprar-rifa/${uniqueLink}`, "_blank")
    }
  }

  return (
    <div className="flex h-fit w-full flex-col gap-2 rounded-xl bg-white/40 p-4 shadow-sm">
      <div className="flex w-full items-center justify-between">
        <div className="h-24 w-36 overflow-hidden rounded-lg">
          <img
            src={prizeImage || defaultImage}
            alt="campanha"
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
          />
        </div>

        {drawRaffle !== "SORTING" && (
          <Badge
            className={`flex min-w-20 items-center justify-center rounded-full border font-bold uppercase ${badgeClass} p-2`}
          >
            {status}
          </Badge>
        )}
      </div>

      <div>
        <p className="text-lg font-semibold">{name}</p>
        <p className="flex items-center gap-1 text-sm">
          {drawRaffle === "CONCLUDED" ? (
            <span className="text-xs font-normal italic">
              A rifa já foi sorteada! Clique em 'Ver Vencedor' para conferir os
              dados do vencedor.
            </span>
          ) : remainingDays === 0 ? (
            <span className="text-xs font-normal italic">
              O prazo acabou! Agora é só clicar em 'Sortear Rifa' e conferir o
              vencedor.
            </span>
          ) : (
            <>
              <TimerReset className="w-4" />
              Faltam {remainingDays} dia(s) para o sorteio.
            </>
          )}
        </p>
      </div>

      <div className="flex w-full gap-2">
        {drawRaffle === "SORTING" ? (
          <Button
            className="flex w-full gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-700 p-4 hover:from-green-600 hover:to-green-800"
            onClick={handleOpenAndCloseDialog}
          >
            Sortear Rifa <Clover />
          </Button>
        ) : drawRaffle === "CONCLUDED" ? (
          <Button
            className="flex w-full gap-2 rounded-xl border-2 border-raffle-main bg-transparent p-4 text-raffle-main duration-150 hover:bg-raffle-main hover:text-white"
            onClick={handleOpenAndCloseDialogWinner}
          >
            Ver Vencedor <Trophy />
          </Button>
        ) : (
          <>
            <Button
              onClick={handleOpenRaffle}
              className="flex w-full items-center gap-1 rounded-xl bg-raffle-main hover:bg-raffle-main/90"
            >
              Visualizar Rifa <Ticket />
            </Button>

            <Link to={`/editar-campanha/${id}`} className="w-full">
              <Button className="flex w-full items-center gap-1 rounded-xl bg-raffle-highlight text-raffle-main hover:bg-raffle-highlight/90">
                Gerenciar <Bolt />
              </Button>
            </Link>
          </>
        )}
        {openDialog && (
          <DialogRaffle
            id={id}
            isOpen={openDialog}
            onClose={handleOpenAndCloseDialog}
          />
        )}
        {openDialogWinner && (
          <DialogWinnerComponent
            id={id}
            isOpen={openDialogWinner}
            onClose={handleOpenAndCloseDialogWinner}
          />
        )}
      </div>
    </div>
  )
}
