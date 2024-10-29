import { RaffleData } from "@/@types/BuyRaffle"
import LogoImg from "@/assets/Rifamania-logo.png"
import imgDefault from "@/assets/sorteio.webp"
import TicketSelection from "@/components/TicketSelection"
import { Button } from "@/components/ui/button"
import { API } from "@/configs/api"
import { useAdjustScroll } from "@/hooks/useAdjustScroll"
import { formatCurrency } from "@/utils/currencyFormatter"
import { formatPhoneNumber } from "@/utils/formatPhoneNumber"
import { PhoneCall, Ticket } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

export default function BuyRaffle() {
  const [raffle, setRaffle] = useState<RaffleData | null>(null)
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<number[]>([])
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const phoneNumber = raffle?.supportPhone ? formatPhoneNumber(raffle.supportPhone) : ""

  useEffect(() => {
    const fetchRaffleData = async () => {
      try {
        const response = await API.get(`/raffles/slug/${slug}`)
        setRaffle(response.data)
      } catch (error) {
        console.error("Erro ao buscar dados da rifa:", error)
        navigate('/')
      }
    }
    if (slug) fetchRaffleData()
  }, [slug, navigate])

  const imageDefault = imgDefault
  const raffleImage = raffle?.prizeImage || imageDefault
  const totalAmount = raffle ? selectedTickets.length * raffle.ticketPrice : 0;

  const handleSelectionChange = (selectedTickets: number[]) => {
    setSelectedTickets(selectedTickets)
    setIsFooterVisible(selectedTickets.length > 0)
  }

  useAdjustScroll(isFooterVisible);

  if (!raffle) return <div>Loading...</div>

  return (
    <div className="min-h-svh w-full bg-whiteCustom text-raffle-main">
      <header className="h-fit bg-white/30 p-6">
        <div className="container mx-auto flex items-center justify-between">
          <img src={LogoImg} alt="logo rifa mania" className="w-20" />
        </div>
      </header>

      <main className="container mx-auto mt-8 flex flex-col items-center justify-center gap-6 p-6">
        <div className="min-h-fit max-w-[736px] overflow-hidden rounded-lg">
          <div className="max-h-[414px] max-w-[736px]">
            <img src={raffleImage} alt="" className="object-cover" />
          </div>
          <div className="min-h-32 bg-white/30 p-4">
            <h1 className="text-wrap text-xl font-bold">{raffle?.name}</h1>
            <p className="mt-2 text-wrap text-justify text-sm">{raffle?.description}</p>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold">
            Por apenas{" "}
            <span className="rounded-lg bg-raffle-main p-2 font-bold text-whiteCustom">
              {formatCurrency(raffle?.ticketPrice || 0)}
            </span>
          </h2>
        </div>
        <div className="h-fit w-[736px] rounded-lg bg-white/30 p-4">
          <h2 className="flex items-center gap-1 text-2xl font-bold">
            <Ticket size={26} /> Bilhetes
          </h2>
          <p className="text-sm">Selecione os bilhetes que deseja comprar</p>
          <div className="my-2 flex w-full items-center justify-between gap-2">
            <div className="flex h-8 w-full items-center rounded-lg bg-white/70 px-2 py-1">
              <p className="flex w-full items-center justify-around text-sm font-semibold">
                Todos: <span>{raffle?.totalNumbers}</span>
              </p>
            </div>
            <div className="flex h-8 w-full items-center rounded-lg bg-white/70 px-2 py-1">
              <p className="flex w-full items-center justify-around text-sm font-semibold">
                Disponiveis: <span>{raffle?.availableNumbersCount}</span>
              </p>
            </div>
            <div className="flex h-8 w-full items-center rounded-lg bg-raffle-main/20 px-2 py-1">
              <p className="flex w-full items-center justify-around text-sm font-semibold">
                Vendidos: <span>{raffle.totalNumbers - raffle.availableNumbersCount}</span>
              </p>
            </div>
          </div>
          <div>
            <TicketSelection
              availableNumbersCount={raffle?.availableNumbersCount}
              onSelectionChange={handleSelectionChange}
            />
          </div>
        </div>

        <div className="flex h-fit w-[736px] items-center justify-between rounded-lg bg-white/30 p-4">
          <div>
            <p className="text-xs">Organizado por</p>
            <span className="font-bold">{raffle.creator.name}</span>
          </div>
          <div>
            <a
              href={`https://api.whatsapp.com/send?phone=${phoneNumber}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="flex items-center gap-2 bg-raffle-main/70 hover:bg-raffle-main hover:text-white">
                <PhoneCall size={14} /> Suporte
              </Button>
            </a>
          </div>
        </div>
      </main>

      {selectedTickets.length > 0 && (
        <footer className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between bg-raffle-main/90 py-4 px-32">
          <div className="flex flex-col">
            <p className="text-whiteCustom">
              {selectedTickets.length} bilhetes selecionados
            </p>
            <span className="text-raffle-highlight font-bold text-2xl">
              {formatCurrency(totalAmount)}
            </span>
          </div>
          <div>
            <Button className="bg-white text-raffle-main hover:bg-raffle-highlight">
              Participar
            </Button>
          </div>
        </footer>
      )}
    </div>
  )
}
