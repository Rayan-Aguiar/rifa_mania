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
import { motion, AnimatePresence } from "framer-motion"
import { useWindowSize } from "react-use"
import Confetti from "react-confetti"

interface DialogRaffleProps {
  isOpen?: boolean
  onClose: () => void
  id: string
}

interface RaffleDrawResult {
  message: string
  result: {
    winningNumber: string
    buyerName: string
    buyerEmail: string
    buyerPhone: string
  }
}

export const DialogRaffle = ({ isOpen, onClose, id }: DialogRaffleProps) => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState<RaffleProps | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isWinnerLoading, setIsWinnerLoading] = useState(false)
  const [step, setStep] = useState(1)
  const { width, height } = useWindowSize()

  const [winnerData, setWinnerData] = useState<RaffleDrawResult | null>(null)

  useEffect(() => {
    const fetchRaffle = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/signin")
        return
      }

      setIsLoading(true)
      const controller = new AbortController()

      try {
        const result = await API.get(`/raffles/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        })
        setUserData(result.data)
      } catch (error) {
        const err = error as Error
        if (err.name !== "AbortError") {
          console.error(err)
        }
      } finally {
        setIsLoading(false)
      }

      return () => controller.abort()
    }
    fetchRaffle()
  }, [id, navigate])

  const handleDraw = async () => {
    setIsWinnerLoading(true)
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/signin")
      return
    }

    try {
      const result = await API.post(
        `/raffles/${id}/draw`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setWinnerData(result.data)
      setTimeout(() => {
        setStep(2)
      }, 500)
    } catch (error) {
      console.error(error)
      return
    } finally {
      setIsWinnerLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        {step === 2 && <Confetti width={width} height={height} />}
      <DialogContent className="overflow-hidden">
        {step === 2 && <Confetti width={width} height={height} />}
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Detalhes da Rifa" : "Vencedor da Rifa"}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Veja os detalhes da rifa e depois descubra o vencedor!"
              : "Aqui estão os dados do vencedor da rifa!"}
          </DialogDescription>
        </DialogHeader>

        {isLoading || isWinnerLoading ? (
          <div
            className="flex w-full items-center justify-center"
            aria-live="polite"
          >
            <LoaderCircle className="animate-spin text-raffle-main" size={32} />
          </div>
        ) : (
          <AnimatePresence>
            {step === 1 ? (
              // Step 1: Detalhes da Rifa
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.4 }}
              >
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
                <Button
                  onClick={handleDraw}
                  className="mt-4 w-full bg-gradient-to-r from-green-500 to-green-700 p-4 hover:from-green-600 hover:to-green-800"
                >
                  Descubra o vencedor!
                </Button>
              </motion.div>
            ) : (
              // Step 2: Exibir Dados do Vencedor
              <motion.div
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.5 }}
              >
                {winnerData && (
                  <div className="mt-4">
                    <h2 className="text-center">
                      Parabéns! Você acaba de sortear{" "}
                      <span className="font-bold text-raffle-main">
                        {userData?.name}
                      </span>
                    </h2>
                    <div className="mt-2 border-t py-2">
                      <p className="flex justify-between text-zinc-500">
                        Vencedor:{" "}
                        <span className="font-bold text-raffle-main">
                          {winnerData?.result.buyerName}
                        </span>
                      </p>
                      <p className="flex justify-between text-zinc-500">
                        Email:{" "}
                        <span className="font-bold text-raffle-main">
                          {winnerData.result.buyerEmail}
                        </span>
                      </p>
                      <p className="flex justify-between text-zinc-500">
                        Telefone:{" "}
                        <span className="font-bold text-raffle-main">
                          {winnerData.result.buyerPhone}
                        </span>
                      </p>
                      <p className="flex justify-between text-zinc-500">
                        Número Sorteado:{" "}
                        <span className="font-bold text-raffle-main">
                          {winnerData.result.winningNumber}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </DialogContent>
    </Dialog>
  )
}
