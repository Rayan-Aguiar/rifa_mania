import logorifa from "@/assets/Rifamania-logo.png"
import pixIcon from "@/assets/pix.svg"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ChevronRight, CreditCard } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { formatCardNumber } from "@/utils/formatCardNumber"
import { formatCardExpiry } from "@/utils/formatCardExpiry"

const checkoutSchema = z.object({
  name: z.string().nonempty("Nome é obrigatório"),
  cpf: z.string().nonempty("CPF é obrigatório"),
  phone: z.string().nonempty("Telefone é obrigatório"),
  email: z.string().email("Email inválido"),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Data de validade inválida").optional(),
  cardCvc: z.string().optional(),
})

type checkoutFormData = z.infer<typeof checkoutSchema>

export default function CheckoutPayment() {
  const [selectedPayment, setSelectedPayment] = useState("")
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<checkoutFormData>({
    resolver: zodResolver(checkoutSchema),
  })

  const onSubmit = (data: checkoutFormData) => {
    console.log(data)
  }

  const handleCardNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatCardNumber(inputValue);
    setValue("cardNumber", formatted, { shouldValidate: true }); 
  };

  const handleCardExpiry = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatCardExpiry(inputValue);

    if (formatted === 'Mês inválido, por favor verifique') {
      setValue("cardExpiry", '', { shouldValidate: false });
      alert(formatted); 
    } else {
      setValue("cardExpiry", formatted, { shouldValidate: true });
    }
  };
  
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-whiteCustom text-raffle-main">
      <div className="flex h-[700px] w-[1000px] gap-4 overflow-hidden rounded-3xl bg-white p-4 shadow">
        <div className="flex w-3/5 flex-col gap-8 p-6">
          <div>
            <img src={logorifa} alt="Logo Rifa mania" className="w-20" />
          </div>
          <div className="flex flex-grow flex-col justify-between">
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
                    className={`flex h-10 w-full items-center justify-center gap-2 rounded border p-2 text-slate-500 ${
                      selectedPayment === "pix"
                        ? "border-2 border-raffle-main font-bold text-raffle-main"
                        : ""
                    }`}
                  >
                    <img src={pixIcon} alt="Icone pix" className={`w-4`} /> PIX
                  </Label>
                  <RadioGroupItem value="pix" id="pix" className="hidden" />
                  <Label
                    htmlFor="card"
                    className={`flex h-10 w-full items-center justify-center gap-2 rounded border p-2 text-slate-500 ${
                      selectedPayment === "card"
                        ? "border-2 border-raffle-main font-bold text-raffle-main"
                        : ""
                    }`}
                  >
                    <CreditCard /> Cartão de Crédito
                  </Label>
                  <RadioGroupItem value="card" id="card" className="hidden" />
                </RadioGroup>
              </div>

              {selectedPayment === "card" && (
                <div className="flex flex-col space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Número do Cartão</Label>
                    <Input
                      id="cardNumber"
                      type="text"
                      maxLength={19}
                      placeholder="0000 0000 0000 0000"
                      {...register("cardNumber", {
                        onChange: handleCardNumber 
                      })}
                    />
                  </div>
                  <div className="flex w-full gap-2">
                    <div className="w-1/2">
                      <Label htmlFor="cardExpiry">Validade</Label>
                      <Input
                        id="cardExpiry"
                        type="text"
                        maxLength={5}
                        placeholder="MM/AA"
                        {...register("cardExpiry", { onChange: handleCardExpiry })}
                      />
                    </div>
                    <div className="w-1/2">
                      <Label htmlFor="cardCvc">CVC</Label>
                      <Input
                        id="cardCvc"
                        type="text"
                        maxLength={4}
                        placeholder="CVC"
                        {...register("cardCvc")}
                      />
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="mt-auto flex w-full items-center bg-raffle-main hover:bg-raffle-main/90"
              >
                Fazer pagamento <ChevronRight />
              </Button>
            </form>
          </div>
        </div>

        <div className="w-2/5 rounded-xl bg-raffle-main flex flex-col items-center text-white px-6 py-16">
            <div>
              <p className="text-center">Total</p>
              <span className="font-bold  text-3xl text-raffle-highlight ">R$ 100,00</span>
            </div>
              <div className="border-t border-white/50 my-16 w-full"/>
              <div className="w-full flex flex-col items-start">
                <p className="text-sm">Descrição do pedido</p>
                <div className="flex w-full flex-col my-6">
                    <div className="flex justify-between">
                        <p>Quantidade de bilhetes:</p>
                        <span className="font-semibold">10</span>
                    </div>
                    <div className="flex justify-between">
                        <p>Preço unitário:</p>

                        <span className="font-semibold">R$ 10,00</span>
                    </div>
                    
                </div>
              </div>

        </div>
      </div>
    </div>
  )
}
