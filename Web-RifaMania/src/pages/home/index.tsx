import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bolt, DollarSign, Eye, EyeOff, Ticket, TimerReset } from "lucide-react"
import { useState } from "react"

export default function Home() {
    const [ showBalace, setShowBalace ] = useState(false)

    const toggleBalaceVisibility = () => {
        setShowBalace(!showBalace)
    }


  return (
    <div className="flex flex-col gap-4 text-blackCustom">
      <h1 className="text-xl font-bold">👋 Olá, Rayan Siqueira</h1>
      <div className="flex h-32 w-full items-center rounded-xl bg-white/40 p-4 shadow-sm">
        <div className="flex">
          <div>
            <DollarSign className="h-20 w-20 text-raffle-main" />
          </div>
          <div>
            <p className="text-lg">Total arrecadado</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-raffle-main">
                {showBalace ? "R$ 1000,00" : "*********"}
              </span>
              {showBalace ? (
                    <EyeOff className="cursor-pointer" onClick={toggleBalaceVisibility}/>
              ): (
                    <Eye className="cursor-pointer" onClick={toggleBalaceVisibility}/>
              )}
            </div>
          </div>
        </div>
      </div>
      <div>
        <Button className="w-full rounded-xl bg-raffle-main hover:bg-raffle-main/90">
          Criar Campanha
        </Button>
      </div>
      <h2 className="text-xl font-bold">Suas Campanhas</h2>
        {/* TODO: transform div in component */}
      <div className="flex h-fit w-full flex-col gap-2 rounded-xl bg-white/40 p-4 shadow-sm"> 
        <div className="flex w-full items-center justify-between">
          <div className="h-24 w-36 overflow-hidden rounded-lg">
            <img
              src="https://www.mokeka.com.br/blog/wp-content/uploads/2023/07/campanha-publicitaria.jpg"
              alt="campanha"
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
            />
          </div>
          <Badge className="rounded-full border-rose-500 bg-rose-500/30 p-2 text-rose-500">
            Pendente
          </Badge>
        </div>
        <div>
          <p className="text-lg font-semibold">Nome Campanha</p>
          <p className="flex items-center gap-1 text-sm">
            <TimerReset className="w-4" /> Duração da campanha: 10 dias
          </p>
        </div>
        <div className="flex w-full gap-2">
          <Button className="flex w-full items-center gap-1 rounded-xl bg-raffle-main hover:bg-raffle-main/90">
            Publicar Rifa <Ticket />
          </Button>
          <Button className="flex w-full items-center gap-1 rounded-xl bg-raffle-highlight text-raffle-main hover:bg-raffle-highlight/90">
            Gerenciar <Bolt />
          </Button>
        </div>
      </div>
    </div>
  )
}
