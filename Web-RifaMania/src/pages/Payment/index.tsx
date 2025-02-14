import { Card } from "@/components/ui/card"
import LogoMercadoPago from "@/assets/mercado-pago-logo.png"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { LoaderCircle } from "lucide-react"
import { API } from "@/configs/api"
import { useToast } from "@/hooks/use-toast"
import { z } from "zod"


const accessTokenSchema = z.object({
  accessToken: z.string().min(1, "A chave de integração não pode estar vazia."),
})
export default function PaymentPage() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [accessToken, setAccessToken] = useState("")
  const [ error, setError ] = useState('')
  const { toast } = useToast()

  const toggleCardExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const token = localStorage.getItem("token")
    setError('')

    const validation = accessTokenSchema.safeParse({ accessToken })
    if (!validation.success) {
      setError(validation.error.errors[0].message) 
      setIsLoading(false)
      return
    }

    try {
      const response = await API.patch(
        "/users/accessToken",
        { accessToken },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.status === 200) {
        toast({
          title: "Sucesso!",
          description: "Conta de pagamento configurada com sucesso.",
          className: "bg-raffle-main border-none text-white",
        })
        setIsExpanded(false)
        setAccessToken("")
      }
      
    } catch (error) {
      console.error("Erro ao atualizar accessToken:", error)
      toast({
        title: "Error!",
        description: "Erro ao cadastrar conta de pagamento, tente novamente.",
        className: "bg-primary border-none text-white",
      })
    } finally {
      setIsLoading(false)
    }
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
              <form className="flex flex-col gap-4" onSubmit={onSubmit}>
                <Label htmlFor="key">Chave de Integração</Label>
                <Input
                  id="key"
                  type="text"
                  placeholder="Cole aqui a chave"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="w-full border-raffle-main/20 focus-visible:ring-raffle-main"
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center gap-2 bg-raffle-main hover:bg-raffle-main/90"
                >
                  {isLoading ? (
                    <LoaderCircle size={20} className="animate-spin" />
                  ) : (
                    "Salvar chave"
                  )}
                </Button>
              </form>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
