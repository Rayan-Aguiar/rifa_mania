import { Key, LoaderCircle } from "lucide-react"
import { Card, CardTitle } from "./ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { API } from "@/configs/api"
import { useToast } from "@/hooks/use-toast"

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "A senha anterior deve ter pelo menos 6 caracteres."),
    newPassword: z
      .string()
      .min(6, "A nova senha deve ter pelo menos 6 caracteres."),
    confirmPassword: z
      .string()
      .min(6, "A confirmação da nova senha deve ter pelo menos 6 caracteres."),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "As senhas não correspondem.",
        path: ["confirmPassword"],
      })
    }
  })

interface UserPasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export const ResetPasswordCard = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [ errorMessage, setErrorMessage ] = useState<string | undefined>(undefined)
  const navigate = useNavigate()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserPasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const resetPassword = async (data: UserPasswordFormData) => {
    setIsLoading(true)
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/signin")
      return
    }
    try {
      await API.put(
        "/users/password",
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

     
      toast({
        title: "Sucesso!",
        description: "A senha foi alterada com sucesso.",
        className: "bg-whiteCustom border-none"
      });


      setIsOpen(false);
    } catch (error: any) {
        if (error.response.status === 400){
            setErrorMessage(error.response.data.message)
        }
      console.error("Erro ao resetar senha:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="flex h-fit w-full flex-col border-none bg-white/30 p-6 shadow-sm">
      
        <CardTitle className="text-lg font-semibold ">
          Alterar Senha
        </CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="group flex w-fit items-center gap-2 rounded-xl hover:bg-raffle-highlight/30"
            >
              Resetar senha
              <Key className="group-hover:text-rose-500" size={18} />
            </Button>
          </DialogTrigger>
          <DialogPortal>
            <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-all" />
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle>Alterar Senha</DialogTitle>
                <DialogDescription className="text-sm">
                  Preencha os campos abaixo para alterar sua senha
                </DialogDescription>
                <form onSubmit={handleSubmit(resetPassword)}>
                  <Label className="text-xs">Senha Anterior</Label>
                  <Input
                    type="password"
                    {...register("currentPassword")}
                    onChange={() => setErrorMessage('')}
                    className={`border ${errorMessage ? "border-red-500" : "border-gray-300"} focus-visible:ring-raffle-main`}
                  />
                  {errorMessage && (
                    <p className="text-sm text-red-600 my-2">{errorMessage}</p>
                  )}
                  {errors.currentPassword && (
                    <p className="text-sm text-red-500">
                      {errors.currentPassword.message}
                    </p>
                  )}

                  <Label className="text-xs">Nova Senha</Label>
                  <Input
                    type="password"
                    {...register("newPassword")}
                    className="focus-visible:ring-raffle-main"
                  />
                  {errors.newPassword && (
                    <p className="text-sm text-red-500">{errors.newPassword.message}</p>
                  )}

                  <Label className="text-xs">Confirmar Nova Senha</Label>
                  <Input
                    type="password"
                    {...register("confirmPassword")}
                    className="focus-visible:ring-raffle-main"
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                  
                  

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="mt-4 w-full bg-raffle-main hover:bg-raffle-main/90"
                  >
                    {isLoading ? (
                      <LoaderCircle className="animate-spin" />
                    ) : (
                      "Salvar"
                    )}
                  </Button>
                </form>
              </DialogHeader>
              <DialogClose />
            </DialogContent>
          </DialogPortal>
        </Dialog>
      
    </Card>
  )
}
