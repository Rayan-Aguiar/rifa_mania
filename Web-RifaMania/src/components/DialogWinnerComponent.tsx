import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { motion, AnimatePresence } from "framer-motion"
import { useWindowSize } from "react-use"
import Confetti from "react-confetti"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { API } from "@/configs/api"
import { LoaderCircle } from "lucide-react"

interface DialogWinnerComponentProps {
  id: string
  isOpen?: boolean
  onClose: () => void
}

interface RaffleDrawResult {
  winningNumber: string
  buyerName: string
  buyerEmail: string
  buyerPhone: string
}

export const DialogWinnerComponent = ({
  id,
  onClose,
  isOpen,
}: DialogWinnerComponentProps) => {
  const { width, height } = useWindowSize()
  const navigate = useNavigate()
  const [winnerData, setWinnerData] = useState<RaffleDrawResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchWinnerRaffleDrawResult = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/signin")
        return
      }
      setIsLoading(true)
      try {
        const result = await API.get(`/raffles/${id}/winners`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setWinnerData(result.data)
        console.log(result.data)
      } catch (error) {
        const err = error as Error
        if (err.name !== "AbortError") {
          console.error(err)
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchWinnerRaffleDrawResult()
  }, [id, navigate])

  return (
    <>
      <AnimatePresence>
        <Dialog open={isOpen} onOpenChange={onClose}>
          <Confetti width={width} height={height} />
          <DialogContent>
          <DialogHeader>
            <DialogTitle>Vencedor da Rifa!</DialogTitle>
            <DialogDescription>
              Aqui estão os dados do vencedor da rifa!
            </DialogDescription>
          </DialogHeader>
            <Confetti width={width} height={height} />

            {isLoading ? (
              <LoaderCircle className="animate-spin text-center" />
            ) : (
              <motion.div
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mt-4">
                  <h2 className="text-center">Parabéns!</h2>
                  <div className="mt-2 border-t py-2">
                    <p className="flex justify-between text-zinc-500">
                      Vencedor:{" "}
                      <span className="font-bold text-raffle-main">
                        {winnerData?.buyerName}
                      </span>
                    </p>
                    <p className="flex justify-between text-zinc-500">
                      Email:{" "}
                      <span className="font-bold text-raffle-main">
                        {winnerData?.buyerEmail}
                      </span>
                    </p>
                    <p className="flex justify-between text-zinc-500">
                      Telefone:{" "}
                      <span className="font-bold text-raffle-main">
                        {winnerData?.buyerPhone}
                      </span>
                    </p>
                    <p className="flex justify-between text-zinc-500">
                      Número Sorteado:{" "}
                      <span className="font-bold text-raffle-main">
                        {winnerData?.winningNumber}
                      </span>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </DialogContent>
        </Dialog>
      </AnimatePresence>
    </>
  )
}
