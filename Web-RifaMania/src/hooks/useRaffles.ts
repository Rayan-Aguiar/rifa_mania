import { RaffleProps } from "@/@types/Raffle"
import { API } from "@/configs/api"
import { useEffect, useState } from "react"

export const useRaffles = () => {
  const [raffles, setRaffles] = useState<RaffleProps[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRaffles = async () => {
      try {
        const response = await API.get("/raffles")
        console.log(response.data)
        setRaffles(response.data)
      } catch (error) {
        setError("Erro ao buscar as rifas: " + error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRaffles()
  }, [])
  return { raffles, isLoading, error }
}
