import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { useNavigate } from "react-router-dom"
import { API } from "@/configs/api"
import { RaffleProps } from "@/@types/Raffle"
import { LoaderCircle } from "lucide-react"

interface DialogRaffleProps {
  isOpen?: boolean
  onClose: () => void
  id: string
}

export const DialogRaffle = ({ isOpen, onClose, id }: DialogRaffleProps) => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState<RaffleProps | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchRaffle = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/signin")
        return
      }
      setIsLoading(true)
      try {
        const result = await API.get(`/raffles/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setUserData(result.data)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRaffle()
  }, [navigate])

  const handleDraw = () => {
    console.log("clicou")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sortear Rifa</DialogTitle>
          <DialogDescription>
            Faça o sorteio e descubra quem foi o vencedor!
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="w-full items-center justify-center">
            <LoaderCircle className="animate-spin" />
          </div>
        ) : (
          <>
            <div>
              <div className="flex w-full items-center justify-between gap-2">
                <div className="flex w-full flex-col rounded-lg bg-zinc-200/50 p-2">
                  <p className="text-center text-sm">Total de tickets:</p>
                  <span className="text-center text-xl font-bold text-raffle-main">
                    {userData?.totalNumbers}
                  </span>
                </div>
                <div className="flex w-full flex-col rounded-lg bg-raffle-main p-2">
                  <p className="text-center text-sm text-white">
                    Total de tickets vendidos:
                  </p>
                  <span className="text-center text-xl font-bold text-raffle-highlight">
                    {userData?.soldTicketsCount}
                  </span>
                </div>
              </div>
            </div>
            <Button
              onClick={handleDraw}
              className="bg-gradient-to-r from-green-500 to-green-700 p-4 hover:from-green-600 hover:to-green-800"
            >
              Descubra o vencedor!
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
