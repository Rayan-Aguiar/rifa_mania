import { API } from "@/configs/api";
import { useEffect, useState } from "react";


export function useTicketQuantities(){
    const [ quantitiesTicket, setQuantitiesTicket ] = useState<number[]>([])
    const [ errorTicket, setErrorTicket ] = useState<string | null>(null)
    const [ isLoadingTicket, setIsLoadingTicket ] = useState<boolean>(true)

    useEffect(() =>{
        const fetchQuantities = async () => {
            try {
                const response = await API.get('/raffles/ticket-quantities')
                setQuantitiesTicket(response.data)
            } catch (errorTicket){
                setErrorTicket("Erro ao buscar quantidades: " + errorTicket)
            } finally {
                setIsLoadingTicket(false)
            }
        }
        fetchQuantities()
    }, [])

    return { quantitiesTicket, isLoadingTicket, errorTicket }
}