export interface RaffleData {
  id: string
  name: string
  description: string
  prizeImage: string | null
  supportPhone: string
  drawDate: string
  status: string
  drawType: string
  ticketPrice: number
  availableNumbersCount: number
  totalNumbers: number
  closed: boolean
  creatorId: string
  uniqueLink: string
  createdAt: string
  availableNumbers: number[]
  availableCount: number
  soldTicketsCount: number
  creator:{
    name: string
  }
}
