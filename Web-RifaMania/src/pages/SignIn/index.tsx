import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { z } from "zod"


const loginSchema = z.object({
  email: z.string().email("Email inválido").nonempty("Email obrigatório"),
  password: z.string().min(6, "Senha muito curta").nonempty("Senha obrigatória"),
})

type LoginFormInputs = z.infer<typeof loginSchema>

export default function SignIn() {
    const [ showPassword, setShowPassword ] = useState(false)

    const {
      register, 
      handleSubmit,
      formState: { errors },
    } = useForm<LoginFormInputs>({
      resolver: zodResolver(loginSchema)
    })

    const onSubmit = (data: LoginFormInputs) => {
      console.log(data)
    }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-whiteCustom">
      <div className="flex h-[700px] w-[1000px] overflow-hidden rounded-3xl bg-raffle-main">
        {/* Div do conteúdo de login */}
        <div className="flex w-1/2 flex-col items-center justify-center p-6">
          <div className="mb-8 w-full">
            <h1 className="text-4xl font-bold text-raffle-highlight">Entre</h1>
            <p className="font-thin text-whiteCustom">
              Um novo mundo se abre pra você
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="w-full">
            <Label htmlFor="email" className="text-raffle-highlight">
              Email
            </Label>
            <Input
              type="email"
              id="email"
              placeholder="exemplo@exemplo.com"
              {...register("email")}
              className={`mb-4 w-full border-none bg-blackCustom/30 text-raffle-highlight placeholder:text-raffle-highlight/50 focus-visible:ring-raffle-highlight ${errors.email ? 'border-red-500' : 'border-none'} `}
            />
            {errors.email &&(
              <p className="my-2 text-xs text-whiteCustom bg-red-500 w-fit p-1 rounded">{errors.email.message}</p>
            )}
            <Label htmlFor="password" className="text-raffle-highlight">
              Senha
            </Label>
            <Input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="***********"
              {...register("password")}
              className={`mb-4 w-full border-none bg-blackCustom/30 text-raffle-highlight placeholder:text-raffle-highlight/50 focus-visible:ring-raffle-highlight ${errors.password ? 'border-red-500' : 'border-none'} `}
            />
            {errors.password &&(
              <p className="my-2 text-xs text-whiteCustom bg-red-500 w-fit p-1 rounded">{errors.password.message}</p>
            )}
            <div className="my-4 flex items-center gap-2">
              <Checkbox
                id="showPassword"
                onCheckedChange={(checked) => setShowPassword(!!checked)}
                className="border-raffle-highlight data-[state=checked]:border-none data-[state=checked]:bg-raffle-highlight data-[state=checked]:text-raffle-main"
              />
              <Label htmlFor="showPassword" className="text-raffle-highlight">
                Mostrar senha
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full bg-raffle-highlight text-blackCustom hover:bg-raffle-highlight/90"
            >
              Entrar
            </Button>
          </form>
          <div className="flex justify-start w-full mt-4">
            <Link to="/signup" className="text-raffle-highlight hover:underline underline-offset-4 font-semibold">Criar conta!</Link>
          </div>
        </div>

        {/* Div da imagem */}
        <div className="w-1/2">
          <img
            src="https://app.rifaup.com.br/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogin1.b9837bdb.png&w=640&q=100"
            alt=""
            className="h-[700px] rounded-3xl object-cover"
          />
        </div>
      </div>
    </div>
  )
}
