import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useTicketQuantities } from "@/hooks/useTicketQuantities"
import { cn } from "@/lib/utils"
import { formatPhone } from "@/utils/phoneFormatter"
import { CalendarIcon, ChevronLeft } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { format, startOfDay } from "date-fns"
import { pt } from "date-fns/locale"
import { useEffect, useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { EditCampaignFormData } from "@/@types/EditCampaignForm"
import { useRaffleDetails } from "@/hooks/useRaffleDetails"
import { formatCurrency } from "@/utils/currencyFormatter"
import { API } from "@/configs/api"
import { useToast } from "@/hooks/use-toast"
import { parseCurrency } from "@/utils/parseCurrency"

const today = startOfDay(new Date())

const editCampaignSchema = z.object({
  name: z.string().min(1, "Nome da campanha é obrigatório"),
  description: z.string().optional(),
  totalNumbers: z.string().min(1, "Quantidade de bilhetes é obrigatória"),
  ticketPrice: z
  .string()
  .min(1, "O valor do bilhete é obrigatório")
  .refine((value) => !isNaN(parseCurrency(value)), {
    message: "Insira um valor válido e positivo",
  })
  .refine((value) => parseCurrency(value) > 0, {
    message: "O valor do bilhete deve ser positivo",
  }),
  supportPhone: z
    .string()
    .regex(/^\(\d{2}\) \d{5}-\d{4}$/, "Número de telefone inválido"),
  drawDate: z
    .date()
    .min(today, "A data do sorteio deve ser hoje ou no futuro")
    .optional(),
})

export default function EditCampaign() {
  const { id } = useParams<{ id: string }>()

  const { isLoadingRaffleDetrails, raffleDetails } = id
    ? useRaffleDetails(id)
    : { isLoadingRaffleDetrails: true, raffleDetails: null }
  const { errorTicket, isLoadingTicket, quantitiesTicket } =
    useTicketQuantities()
  const [date, setDate] = useState<Date | undefined>(undefined)
  const navigate = useNavigate()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EditCampaignFormData>({
    resolver: zodResolver(editCampaignSchema),
  })

  useEffect(() => {
    if (raffleDetails) {
      setValue("name", raffleDetails.name || "")
      setValue("description", raffleDetails.description || "")
      setValue(
        "totalNumbers",
        raffleDetails.totalNumbers ? raffleDetails.totalNumbers.toString() : "",
      )
      setValue("ticketPrice", formatCurrency(raffleDetails.ticketPrice || 0))
      setValue(
        "supportPhone",
        raffleDetails.supportPhone
          ? formatPhone(raffleDetails.supportPhone)
          : "",
      )
      setDate(
        raffleDetails.drawDate ? new Date(raffleDetails.drawDate) : undefined,
      )
    }
  }, [raffleDetails, setValue])

  const onSubmit = async (data: EditCampaignFormData) => {
    if (!date) {
      alert("Selecione uma data de sorteio")
      return
    }

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date < tomorrow) {
      alert("A data do sorteio deve ser a partir de amanhã")
      return
    }

    const raffleData = {
      name: data.name,
      description: data.description,
      totalNumbers: Number(data.totalNumbers),
      ticketPrice: parseCurrency(data.ticketPrice.replace(/[R$.\s]/g, "")),
      drawDate: date.toISOString(),
      supportPhone: data.supportPhone,
      availableNumbersCount: Number(data.totalNumbers),
      drawType: "automatico",
    }
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/signin")
      return
    }

    try {
      await API.put(`/raffles/${id}`, raffleData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      toast({
        title: "Sucesso!",
        description: "Rifa atualizada com sucesso.",
        className: "bg-raffle-main border-none text-white",
      })
      navigate("/home")
    } catch (error) {
      console.error("Erro ao atualizar rifa: ", error)
      toast({
        title: "Erro!",
        description:
          "Ocorreu um erro ao atualizar a rifa. Tente novamente mais tarde.",
        className: "bg-red-500 border-none text-white",
      })
    }
  }

  return isLoadingRaffleDetrails ? (
    <div>Carregando</div>
  ) : (
    <div className="flex h-fit w-full flex-col gap-8 rounded-lg bg-white/40 p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Link to="/home">
          <Button
            size="icon"
            className="bg-white/50 text-raffle-main hover:bg-white/70"
          >
            <ChevronLeft />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold text-raffle-main">
          Editar Campanha: {raffleDetails?.name}
        </h1>
      </div>
      <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
        <Label htmlFor="name">Como ela vai se chamar?</Label>
        <Input type="text" id="name" {...register("name")} />
        {errors.name && (
          <span className="text-red-500">{errors.name.message}</span>
        )}

        <Label htmlFor="description">Descrição/Regulamento</Label>
        <Textarea
          id="description"
          className="resize-none"
          placeholder="Descrição/Regulamento"
          {...register("description")}
        />
        {errors.description && (
          <span className="text-red-500">{errors.description.message}</span>
        )}

        <div className="my-2 flex w-full items-center justify-between">
          <Label htmlFor="image">Seleção de imagem</Label>
          <p className="text-xs font-semibold text-raffle-main">
            Tamanho recomendado: proporção 16/12 ou 736x414 pixels
          </p>
        </div>
        <Input type="file" id="image" />

        <Label htmlFor="totalNumbers">Quantidade de bilhetes</Label>
        <Select
          value={
            raffleDetails?.totalNumbers
              ? String(raffleDetails.totalNumbers)
              : undefined
          }
          onValueChange={(value) => setValue("totalNumbers", value)}
        >
          <SelectTrigger
            id="totalNumbers"
            className="flex justify-start rounded border px-3 py-2 text-sm text-gray-500"
          >
            <SelectValue
              placeholder={isLoadingTicket ? "Carregando..." : "Selecione"}
            />
          </SelectTrigger>
          <SelectContent>
            {errorTicket ? (
              <SelectItem value="error">
                Erro ao carregar quantidades
              </SelectItem>
            ) : (
              quantitiesTicket.map((quantity) => (
                <SelectItem key={quantity} value={String(quantity)}>
                  {quantity} Bilhetes
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        {errors.totalNumbers && (
          <span className="text-red-500">{errors.totalNumbers.message}</span>
        )}

        <Label htmlFor="ticketPrice">Valor do Bilhete</Label>
        <Input
          type="text"
          id="ticketPrice"
          placeholder="R$ 10,00"
          {...register("ticketPrice")}
          onChange={(e) => {
            const rawValue = e.target.value
            const cleanedValue = rawValue
              .replace(/[R$.\s]/g, "")
              .replace(",", ".")
            if (cleanedValue === "" || !isNaN(parseFloat(cleanedValue))) {
              const formattedValue = formatCurrency(cleanedValue)
              setValue("ticketPrice", cleanedValue)
              e.target.value = formattedValue
            }
          }}
        />
        {errors.ticketPrice && (
          <span className="text-red-500">{errors.ticketPrice.message}</span>
        )}

        <div className="flex w-full items-center gap-2">
          <div className="w-full">
            <Label htmlFor="supportPhone">Telefone para suporte</Label>
            <Input
              type="tel"
              id="supportPhone"
              placeholder="(00) 00000-0000"
              maxLength={15}
              {...register("supportPhone")}
              onChange={(e) =>
                setValue("supportPhone", formatPhone(e.target.value))
              }
            />
            {errors.supportPhone && (
              <span className="text-red-500">
                {errors.supportPhone.message}
              </span>
            )}
          </div>
          <div className="w-full">
            <Label htmlFor="drawButton">Data do sorteio</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="drawButton"
                  className={cn(
                    "w-full justify-between gap-2 border bg-transparent text-left font-normal text-blackCustom shadow-sm hover:bg-transparent",
                    !date && "text-muted-foreground",
                  )}
                >
                  {date ? (
                    format(date, "dd/MM/yyyy")
                  ) : (
                    <span>Escolha a data</span>
                  )}
                  <CalendarIcon size={10} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(selectedDate) => {
                    setDate(selectedDate)
                    setValue("drawDate", selectedDate || new Date())
                  }}
                  initialFocus
                  locale={pt}
                  disabled={(day) => day <= today}
                />
              </PopoverContent>
            </Popover>
            {errors.drawDate && (
              <span className="text-red-500">{errors.drawDate.message}</span>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="mt-4 bg-raffle-main hover:bg-raffle-main/90"
        >
          Salvar Alterações
        </Button>
      </form>
    </div>
  )
}
