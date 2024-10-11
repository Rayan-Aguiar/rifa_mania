import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ImgCard from "@/assets/img-card.png"


const signupSchema = z.object({
  name: z.string().nonempty("Nome obrigatório"),
  email: z.string().email("Email inválido").nonempty("Email obrigatório"),
  phone: z.string().nonempty("Telefone obrigatório"), 
  password: z.string().min(6, "Senha muito curta").nonempty("Senha obrigatória"),
  confirmPassword: z.string().min(6, "Senha muito curta").nonempty("Confirmação de senha obrigatória"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type SignUpFormInputs = z.infer<typeof signupSchema>;

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormInputs>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = (data: SignUpFormInputs) => {
    console.log(data);
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-whiteCustom">
      <div className="flex h-[700px] w-[1000px] overflow-hidden rounded-3xl bg-raffle-main">
        {/* Div do conteúdo de registro */}
        <div className="flex w-1/2 flex-col items-center justify-center p-6">
          <div className="flex justify-start w-full mb-4">
            <Link to="/signin" className="flex items-center gap-2 text-whiteCustom hover:underline underline-offset-4">
              <ArrowLeft className="w-4" /> Voltar para login
            </Link>
          </div>
          <div className="mb-4 w-full">
            <h1 className="text-4xl font-bold text-raffle-highlight">Registre-se</h1>
            <p className="font-thin text-whiteCustom">Para um novo mundo de possibilidades...</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="w-full">
            <Label htmlFor="name" className="text-raffle-highlight">Seu nome</Label>
            <Input 
              type="text" 
              id="name" 
              placeholder="Ex: John Doe"
              {...register("name")}
              className={`mb-4 w-full border-none bg-blackCustom/30 text-raffle-highlight placeholder:text-raffle-highlight/50 focus-visible:ring-raffle-highlight ${errors.name ? 'border-red-500' : 'border-none'}`}
            />
            {errors.name && <p className="my-2 text-xs text-whiteCustom bg-red-500 w-fit p-1 rounded">{errors.name.message}</p>}

            <Label htmlFor="email" className="text-raffle-highlight">Seu email</Label>
            <Input 
              type="email" 
              id="email" 
              placeholder="exemplo@exemplo.com"
              {...register("email")}
              className={`mb-4 w-full border-none bg-blackCustom/30 text-raffle-highlight placeholder:text-raffle-highlight/50 focus-visible:ring-raffle-highlight ${errors.email ? 'border-red-500' : 'border-none'}`}
            />
            {errors.email && <p className="my-2 text-xs text-whiteCustom bg-red-500 w-fit p-1 rounded">{errors.email.message}</p>}

            <Label htmlFor="phone" className="text-raffle-highlight">Seu telefone</Label>
            <Input 
              type="tel"  
              id="phone" 
              placeholder="(00) 00000-0000"
              {...register("phone")}
              className={`mb-4 w-full border-none bg-blackCustom/30 text-raffle-highlight placeholder:text-raffle-highlight/50 focus-visible:ring-raffle-highlight ${errors.phone ? 'border-red-500' : 'border-none'}`}
            />
            {errors.phone && <p className="my-2 text-xs text-whiteCustom bg-red-500 w-fit p-1 rounded">{errors.phone.message}</p>}

            <Label htmlFor="password" className="text-raffle-highlight">Senha</Label>
            <Input 
              type={showPassword ? "text" : "password"} 
              id="password"  
              placeholder="*********"
              {...register("password")}
              className={`mb-4 w-full border-none bg-blackCustom/30 text-raffle-highlight placeholder:text-raffle-highlight/50 focus-visible:ring-raffle-highlight ${errors.password ? 'border-red-500' : 'border-none'}`}
            />
            {errors.password && <p className="my-2 text-xs text-whiteCustom bg-red-500 w-fit p-1 rounded">{errors.password.message}</p>}

            <Label htmlFor="confirmPassword" className="text-raffle-highlight">Confirmar senha</Label>
            <Input 
              type={showPassword ? "text" : "password"} 
              id="confirmPassword"  
              placeholder="*********"
              {...register("confirmPassword")}
              className={`mb-4 w-full border-none bg-blackCustom/30 text-raffle-highlight placeholder:text-raffle-highlight/50 focus-visible:ring-raffle-highlight ${errors.confirmPassword ? 'border-red-500' : 'border-none'}`}
            />
            {errors.confirmPassword && <p className="my-2 text-xs text-whiteCustom bg-red-500 w-fit p-1 rounded">{errors.confirmPassword.message}</p>}
            <div className="flex items-center my-4 gap-2">
                <Checkbox
                id="showPassword"
                onCheckedChange={(checked) => setShowPassword(!!checked)}
                className="border-raffle-highlight data-[state=checked]:border-none data-[state=checked]:bg-raffle-highlight data-[state=checked]:text-raffle-main"
                />
                <Label htmlFor="showPassword" className="text-raffle-highlight">Mostrar senha</Label>

            </div>

            <Button
              type="submit"
              className="w-full bg-raffle-highlight text-blackCustom hover:bg-raffle-highlight/90"
            >
              Continuar
            </Button>
          </form>
        </div>

        {/* Div da imagem */}
        <div className="w-1/2">
          <img
            src={ImgCard}
            alt=""
            className="h-[700px] rounded-3xl object-cover"
          />
        </div>
      </div>
    </div>
  );
}
