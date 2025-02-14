import logorifa from "@/assets/Rifamania-logo.png"
import pixIcon from "@/assets/pix.svg"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ChevronRight, LoaderCircle } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useLocation } from "react-router-dom"
import { formatCurrency } from "@/utils/currencyFormatter"
import { API } from "@/configs/api"

const checkoutSchema = z.object({
  name: z.string().nonempty("Nome é obrigatório"),
  cpf: z.string().nonempty("CPF é obrigatório"),
  phone: z.string().nonempty("Telefone é obrigatório"),
  email: z.string().email("Email inválido"),
  cardNumber: z.string().optional(),
  cardExpiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Data de validade inválida")
    .optional(),
  cardCvc: z.string().optional(),
})

type checkoutFormData = z.infer<typeof checkoutSchema>

export default function CheckoutPayment() {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [ isLoading, setIsLoading] = useState<boolean>(false)
  const [isFormVisible, setIsFormVisible] = useState(true)
  const location = useLocation()
  const {
    raffleId,
    ticketPrice,
    selectedNumbers,
    raffleName,
    selectedTicketNumbers,
  } = location.state || {}
  const [selectedPayment, setSelectedPayment] = useState("")
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<checkoutFormData>({
    resolver: zodResolver(checkoutSchema),
  })

 

  const totalAmount = Math.floor(ticketPrice * selectedNumbers / 100);
  const totalAmountView = ticketPrice * selectedNumbers


  const onSubmit = async (data: checkoutFormData) => {
    const transactionData = {
      name: data.name,
      email: data.email,
      numbers: selectedTicketNumbers,
      phone: data.phone.replace(/\D/g, ""),
      paymentMethod: selectedPayment,
      transactionAmount: totalAmount,
      description: `Compra de bilhete para a rifa ${raffleName}`,
      identificationType: "CPF",
      identificationNumber: data.cpf.replace(/\D/g, ""),
    }
    setIsLoading(true)

    try {
      const response = await API.post(
        `/raffles/${raffleId}/tickets`,
        transactionData,
      )
      if (selectedPayment === "pix") {
        const qrCodeData =
          response.data?.payment?.point_of_interaction?.transaction_data?.qr_code_base64
        setQrCode(qrCodeData || null)
      }
      setIsFormVisible(false)
      
      console.log(response.data)
    } catch (error) {
      console.error("Erro:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-whiteCustom text-raffle-main">
      <div className="flex h-[700px] w-[1000px] gap-4 overflow-hidden rounded-3xl bg-white p-4 shadow">
        <div className="flex w-3/5 flex-col gap-8 p-6">
          

          <div
            className={`flex w-full flex-col gap-8 p-6 transition-opacity duration-500 ${isFormVisible ? "opacity-100" : "opacity-0"}`}
            style={{ display: isFormVisible ? "flex" : "none" }}
          >
            <h1 className="mb-4 text-lg font-semibold">
              Informe seus dados para realizar a compra dos bilhetes.
            </h1>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-grow flex-col space-y-4"
            >
              <div>
                <Label htmlFor="name">Seu nome</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nome completo"
                  {...register("name")}
                />
                {errors.name && (
                  <span className="text-red-500">{errors.name.message}</span>
                )}
              </div>
              <div>
                <Label htmlFor="cpf">Seu CPF</Label>
                <Input
                  id="cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  {...register("cpf")}
                />
                {errors.cpf && (
                  <span className="text-red-500">{errors.cpf.message}</span>
                )}
              </div>
              <div className="flex w-full gap-2">
                <div className="w-full">
                  <Label htmlFor="phone">Seu Telefone</Label>
                  <Input
                    id="phone"
                    type="text"
                    placeholder="(00) 00000-0000"
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <span className="text-red-500">{errors.phone.message}</span>
                  )}
                </div>
                <div className="w-full">
                  <Label htmlFor="email">Seu email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemple@exemple.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <span className="text-red-500">{errors.email.message}</span>
                  )}
                </div>
              </div>
              <div className="my-6">
                <h2 className="text-sm font-semibold">Método de pagamento</h2>
                <RadioGroup
                  className="flex items-center justify-between"
                  value={selectedPayment}
                  onValueChange={(value) => setSelectedPayment(value)}
                >
                  <Label
                    htmlFor="pix"
                    className={`flex h-10 w-40 items-center justify-center gap-2 rounded border p-2 text-slate-500 ${
                      selectedPayment === "pix"
                        ? "border-2 border-raffle-main font-bold text-raffle-main"
                        : ""
                    }`}
                  >
                    <img src={pixIcon} alt="Icone pix" className={`w-4`} /> PIX
                  </Label>
                  <RadioGroupItem value="pix" id="pix" className="hidden" />
                  
                  <RadioGroupItem value="card" id="card" className="hidden" />
                </RadioGroup>
              </div>


              <Button
                type="submit"
                className="mt-auto flex w-full items-center bg-raffle-main hover:bg-raffle-main/90"
              >
                {isLoading ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <span className="flex items-center">Fazer pagamento <ChevronRight /></span>
                )}
              </Button>
            </form>
          </div>

          {!isFormVisible && qrCode && (
            <div className="flex flex-col items-center justify-center p-6">
              <img
                src={`data:image/png;base64,${qrCode}`}
                alt="QR Code para pagamento PIX"
                className="h-48 w-48"
              />
              <p className="mt-4 text-lg font-semibold">
                Use o código PIX para concluir seu pagamento.
              </p>
            </div>
          )}
        </div>

        <div className="flex w-2/5 flex-col items-center rounded-xl bg-raffle-main px-6 py-16 text-white">
          <div>
            <p className="text-center">Total</p>
            <span className="text-3xl font-bold text-raffle-highlight">
              {formatCurrency(totalAmountView)}
            </span>
          </div>
          <div className="my-16 w-full border-t border-white/50" />
          <div className="flex w-full flex-col items-start">
            <p className="text-sm">Descrição do pedido</p>
            <div className="my-6 flex w-full flex-col gap-2">
              <div className="flex justify-between">
                <p>Você está concorrendo:</p>
                <span className="font-semibold">{raffleName}</span>
              </div>

              <div className="flex justify-between">
                <p>Quantidade de bilhetes:</p>
                <span className="font-semibold">{selectedNumbers}</span>
              </div>
              <div className="flex justify-between">
                <p>Preço unitário:</p>
                <span className="font-semibold">
                  {formatCurrency(ticketPrice)}
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-hidden mt-10">
            <img
              src={logorifa}
              alt="Logo Rifa Mania"
              className="w-20 object-cover object-center"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
