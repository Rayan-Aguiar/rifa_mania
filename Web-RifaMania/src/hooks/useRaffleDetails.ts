import { EditCampaignFormData } from "@/@types/EditCampaignForm"
import { API } from "@/configs/api"
import { useEffect, useState } from "react"

export function useRaffleDetails(id: string) {
  const [raffleDetails, setRaffleDetrails] =
    useState<EditCampaignFormData | null>(null)
  const [isLoadingRaffleDetrails, setIsLoadingRaffleDetrails] =
    useState<boolean>(true)
  const [errorRaffleDetrails, setErrorRaffleDetrails] = useState<string | null>(
    null,
  )

  useEffect(() => {
    const fetchRaffleDetails = async () => {
      try {
        const response = await API.get<EditCampaignFormData>(`/raffles/${id}`)
        setRaffleDetrails(response.data)
        console.log(response.data)
      } catch (error) {
        setErrorRaffleDetrails("Erro ao buscar os detalhes da rifa: " + error)
      } finally {
        setIsLoadingRaffleDetrails(false)
      }
    }
    fetchRaffleDetails()
  }, [id])

  return { raffleDetails, isLoadingRaffleDetrails, errorRaffleDetrails }
}
