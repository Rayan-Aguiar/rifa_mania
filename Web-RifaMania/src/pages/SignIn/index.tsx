import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { z } from "zod"
import ImgCard from "@/assets/img-card.png"
import { LoaderCircle } from "lucide-react"
import { API } from "@/configs/api"
import { setToken } from "@/configs/auth"
import { AxiosError } from "axios"


const loginSchema = z.object({
  email: z.string().email("Email inválido").nonempty("Email obrigatório"),
  password: z.string().min(6, "Senha muito curta").nonempty("Senha obrigatória"),
})

type LoginFormInputs = z.infer<typeof loginSchema>

export default function SignIn() {
    const [ showPassword, setShowPassword ] = useState(false)
    const [ isLoading, setIsLoading ] = useState(false)
    const [loginError, setLoginError] = useState<string | null>(null)
    const navigate = useNavigate()

    const {
      register, 
      handleSubmit,
      formState: { errors },
    } = useForm<LoginFormInputs>({
      resolver: zodResolver(loginSchema)
    })

    const onSubmit = async (data: LoginFormInputs) => {
      setIsLoading(true)
      try {
        const response = await API.post('/auth/login', data)
        const authToken = response.data.authentication_token
        setToken(authToken)
        navigate('/home')
      } catch (error){
        if (error instanceof AxiosError) {
          if (error.response && error.response.status === 401) {
            setLoginError("Email ou senha incorretos.")
          } else {
            setLoginError("Ocorreu um erro inesperado. Tente novamente.")
          }
        } else {
          setLoginError("Ocorreu um erro inesperado. Tente novamente.")
        }
        console.error("Ocorreu um error:" , error)
      }
      finally {
        setIsLoading(false)
      }
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

            {loginError &&(
              <p className="mt-1 text-xs text-whiteCustom bg-red-500 w-fit p-1 rounded">{loginError}</p>
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
            >{isLoading ?(
              <div className="flex cursor-not-allowed items-center justify-center">
                <LoaderCircle className="animate-spin" />
              </div>
            ) : "Entrar"}              
            </Button>
          </form>
          <div className="flex justify-start w-full mt-4">
            <Link to="/signup" className="text-raffle-highlight hover:underline underline-offset-4 font-semibold">Criar conta!</Link>
          </div>
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
  )
}
