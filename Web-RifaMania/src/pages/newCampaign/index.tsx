import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem } from "@/components/ui/select";
import { API } from "@/configs/api";
import { SelectTrigger, SelectValue } from "@radix-ui/react-select";
import { ArrowRight, CalendarIcon, ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatPhone } from "@/utils/phoneFormatter";
import { parseCurrency } from "@/utils/parseCurrency";
import { formatCurrency } from "@/utils/currencyFormatter";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, startOfDay } from "date-fns";
import { pt } from 'date-fns/locale';
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { useTicketQuantities } from "@/hooks/useTicketQuantities";



const today = startOfDay(new Date());

const newCampaignSchema = z.object({
  name: z.string().min(1, "Nome da campanha é obrigatório"),
  totalNumbers: z.string().min(1, "Quantidade de bilhetes é obrigatória"),
  ticketPrice: z
    .string()
    .min(1, "O valor do bilhete é obrigatório")
    .refine((value) => !isNaN(parseCurrency(value)), {
      message: "Insira um valor válido e positivo",
    }),
    supportPhone: z
    .string()
    .regex(/^\(\d{2}\) \d{5}-\d{4}$/, "Número de telefone inválido"),
    drawDate: z.date({
      required_error: "Data do sorteio é obrigatória",
    }).refine((date) => date >= today, {
      message: "A data do sorteio deve ser hoje ou no futuro",
    }),
});

type NewCampaignFormData = z.infer<typeof newCampaignSchema>;

export default function NewCampaign() {
  const { errorTicket, isLoadingTicket, quantitiesTicket} = useTicketQuantities()
  const [estimatedRevenue, setEstimatedRevenue] = useState<number>(0);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const navigate = useNavigate();
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NewCampaignFormData>({
    resolver: zodResolver(newCampaignSchema),
  });

  const totalNumbers = watch("totalNumbers");
  const ticketPrice = watch("ticketPrice");

  useEffect(() => {
    const totalNumbersValue = Number(totalNumbers) || 0;
    const ticketPriceValue = parseCurrency(ticketPrice || "0");

    setEstimatedRevenue(totalNumbersValue * ticketPriceValue);
  }, [totalNumbers, ticketPrice]);





  const onSubmit = async (data: NewCampaignFormData) => {

    if(!date){
      alert("Selecione uma data de sorteio");
      return;
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    if(date < tomorrow){
      alert("A data do sorteio deve ser a partir de amanhã.");
      return;
    }

    const raffleData = {
      name: data.name,
      totalNumbers: Number(data.totalNumbers),
      ticketPrice: parseCurrency(data.ticketPrice),
      drawDate: date.toISOString(),
      supportPhone: data.supportPhone,
    };

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }

    try {
      await API.post('raffles', raffleData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast({
        title: "Sucesso!",
        description: "Rifa Criada com sucesso.",
        className: "bg-raffle-main border-none text-white"
      });

      navigate("/home");
    } catch (error) {
      const errorMessage = error;
      console.error("Erro ao cadastrar rifa: ", errorMessage);
    }
  };

  return (
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
          Nova Campanha
        </h1>
      </div>
      <div>
        <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
          <Label htmlFor="name">Nome da Campanha</Label>
          <Input
            type="text"
            id="name"
            placeholder="Nome da sua campanha"
            {...register("name")}
          />
          {errors.name && (
            <span className="text-red-500">{errors.name.message}</span>
          )}

          <Label htmlFor="totalNumbers">Quantidade de bilhetes</Label>
          <Select onValueChange={(value) => setValue("totalNumbers", value)}>
            <SelectTrigger
              id="totalNumbers"
              className="flex justify-start rounded border px-3 py-2 text-sm text-gray-500"
            >
              <SelectValue placeholder={isLoadingTicket ? "Carregando..." : "Selecione"} />
            </SelectTrigger>
            <SelectContent>
              {errorTicket ? (
                <SelectItem value="error">Erro ao carregar quantidades</SelectItem>
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

          <div className="flex items-center gap-2 w-full ">
            <div className="w-full">
              <Label htmlFor="ticketPrice">Valor do Bilhete</Label>
              <Input
                type="text"
                id="ticketPrice"
                placeholder="R$ 10,00"
                {...register("ticketPrice")}
                onChange={(e) => {
                  const rawValue = e.target.value;
                  const cleanedValue = rawValue.replace(/[R$.\s]/g, '').replace(',', '.');
                  if (cleanedValue === "" || !isNaN(parseFloat(cleanedValue))) {
                    const formattedValue = formatCurrency(cleanedValue);
                    setValue("ticketPrice", cleanedValue);
                    e.target.value = formattedValue;
                  }
                }}
              />
              {errors.ticketPrice && (
                <span className="text-red-500">{errors.ticketPrice.message}</span>
              )}
            </div>
            <div className="w-full">
              <Label htmlFor="drawButton">Data do sorteio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    id="drawButton"
                    className={cn("w-full justify-between text-left gap-2 bg-transparent shadow-sm border hover:bg-transparent text-blackCustom font-normal", !date && "text-muted-foreground")}
                  >
                    {date ? format(date, 'dd/MM/yyyy') : <span>Escolha a data</span>}
                    <CalendarIcon size={10} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar 
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => {
                      setDate(selectedDate);
                      setValue("drawDate", selectedDate || new Date()); 
                    }}
                    initialFocus
                    locale={pt}
                    disabled={(day) => day <= today}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Label htmlFor="supportPhone">Telefone para suporte</Label>
          <Input
            type="tel"
            id="supportPhone"
            placeholder="(00) 00000-0000"
            maxLength={15}
            {...register("supportPhone")}
            onChange={(e) => {
              const formattedPhone = formatPhone(e.target.value);
              setValue("supportPhone", formattedPhone);
            }}
          />

          <div className="my-3 flex h-fit w-full flex-col gap-4 divide-y divide-blackCustom/10 rounded-lg bg-blackCustom/10 p-4">
            <h3 className="text-lg font-semibold">Valores:</h3>
            <div className="flex w-full items-center justify-between">
              <span className="text-sm">Arrecadação estimada</span>
              <span className="text-lg font-bold text-raffle-main">
                + {formatCurrency(estimatedRevenue)} 
              </span>
            </div>
          </div>

          <Button
            type="submit"
            className="flex items-center gap-2 bg-raffle-main hover:bg-raffle-main/90"
          >
            Prosseguir <ArrowRight size={16} />
          </Button>
        </form>
      </div>
    </div>
  );
}
