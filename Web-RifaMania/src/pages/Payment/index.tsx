import { Card } from "@/components/ui/card"
import LogoMercadoPago from "@/assets/mercado-pago-logo.png"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { ArrowRight } from "lucide-react"

export default function PaymentPage() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeSwitch, setActiveSwitch] = useState(false)

  const toggleCardExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const toggleSwitch = (checked: boolean) => {
    setActiveSwitch(checked)
  }

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl font-bold text-blackCustom">
        Integrações de pagamento
      </h1>
      <div>
        <Card
          className={`group flex h-fit w-full flex-col justify-between overflow-hidden border-none bg-white/40 p-3 shadow-sm`}
        >
          <div className="flex w-full items-center justify-between">
            <img
              src={LogoMercadoPago}
              alt="Logo Mercado Pago"
              className={`h-12 transition duration-300 ${
                isExpanded ? "grayscale-0" : "grayscale group-hover:grayscale-0"
              }`}
            />
            <Button
              className="rounded-full bg-raffle-main hover:bg-raffle-main/90"
              onClick={toggleCardExpanded}
            >
              {isExpanded ? "Fechar" : "Configurar"}
            </Button>
          </div>
          {isExpanded && (
            <div className="mt-4">
              <h2 className="my-2 text-lg font-semibold">
                Configuração da conta
              </h2>
              <form className="flex flex-col gap-4">
                <div className="flex items-center gap-1">
                  <Switch
                    id="active"
                    className="data-[state=checked]:bg-raffle-main data-[state=unchecked]:bg-raffle-highlight"
                    checked={activeSwitch}
                    onCheckedChange={toggleSwitch}
                  />
                  <Label htmlFor="active">
                    {activeSwitch ? "Ativo" : "Inativo"}
                  </Label>
                </div>
                <Label htmlFor="key">Chave de Integração</Label>
                <Input
                  id="key"
                  type="text"
                  placeholder="Cole aqui a chave"
                  className="w-full border-raffle-main/20 focus-visible:ring-raffle-main"
                />
                <Button className="flex w-full items-center gap-2 bg-raffle-main hover:bg-raffle-main/90">
                  Salvar chave <ArrowRight className="w-4" />
                </Button>
              </form>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
