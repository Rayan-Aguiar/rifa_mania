import { UserDataProps } from "@/@types/UserData"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { API } from "@/configs/api"
import { LoaderCircle, PencilLine, Trash } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { ResetPasswordCard } from "@/components/CardResetPassword"

const userSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido")
    .optional(),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
})

interface UserFormData {
  name: string
  cpf?: string
  email: string
  phone?: string
}

export default function MyAccount() {
  const navigate = useNavigate()
  const [userData, setUserData] = useState<UserDataProps | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: userData?.name || "",
      email: userData?.email || "",
      cpf: userData?.cpf || "",
      phone: userData?.phone || "",
    },
  })

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token")

      if (!token) {
        navigate("/signin")
        return
      }

      try {
        setIsLoading(true)
        const response = await API.get("/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setUserData(response.data)
        reset(response.data)
        localStorage.setItem("userData", JSON.stringify(response.data))
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUserData()
  }, [navigate, reset])

  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, "")

    if (cleaned.length <= 3) return cleaned
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`
    if (cleaned.length <= 9)
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`
  }

  const onSubmit = async (data: UserFormData) => {
    setIsLoading(true)
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/signin")
      return
    }

    try {
      const { cpf, ...userDataToUpdate } = data
      const updatedData = userData?.cpf ? userDataToUpdate : data

      await API.put("/users", updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setUserData(updatedData)
      localStorage.setItem("userData", JSON.stringify(updatedData))
      reset(updatedData)

      window.location.reload()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/signin")
      return
    }

    try {
      await API.delete("/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      localStorage.removeItem("token")
      localStorage.removeItem("userData")
      navigate("/signin")
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex h-48 w-full flex-col border-none bg-white/30 p-6 shadow-sm">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-lg font-semibold text-raffle-main">
            Dados Pessoais
          </h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="icon"
                className="rounded-xl bg-raffle-main hover:bg-raffle-main/90"
              >
                <PencilLine size={18} />
              </Button>
            </DialogTrigger>
            <DialogPortal>
              <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-all" />
              <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                  <DialogTitle>Editar dados pessoais</DialogTitle>
                  <DialogDescription className="text-sm">
                    Preencha os campos abaixo para editar seus dados pessoais
                  </DialogDescription>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <Label className="text-xs">Nome Completo</Label>
                    <Input
                      type="text"
                      {...register("name")}
                      className="focus-visible:ring-raffle-main"
                    />
                    {errors.name && (
                      <p className="text-red-500">{errors.name.message}</p>
                    )}
                    <Label className="text-xs">CPF</Label>
                    <Input
                      type="text"
                      {...register("cpf")}
                      className="focus-visible:ring-raffle-main"
                      disabled={!!userData?.cpf}
                      onChange={(e) => {
                        const formattedValue = formatCPF(e.target.value)
                        setValue("cpf", formattedValue)
                      }}
                    />
                    {errors.cpf && (
                      <p className="text-red-500">{errors.cpf.message}</p>
                    )}
                    <Label className="text-xs">Email</Label>
                    <Input
                      type="email"
                      disabled={!!userData?.email}
                      {...register("email")}
                      className="focus-visible:ring-raffle-main"
                    />
                    {errors.email && (
                      <p className="text-red-500">{errors.email.message}</p>
                    )}
                    <Label className="text-xs">Telefone</Label>
                    <Input
                      type="tel"
                      {...register("phone")}
                      className="focus-visible:ring-raffle-main"
                    />
                    {errors.phone && (
                      <p className="text-red-500">{errors.phone.message}</p>
                    )}
                    <Button
                      type="submit"
                      className="mt-4 w-full bg-raffle-main hover:bg-raffle-main/90"
                      disabled={isLoading}
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
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div>
            <p className="text-sm">Nome</p>
            <p className="font-semibold text-raffle-main">{userData?.name}</p>
          </div>
          <div>
            <p className="text-sm">Email</p>
            <p className="font-semibold text-raffle-main">{userData?.email}</p>
          </div>
          <div>
            <p className="text-sm">CPF</p>
            <p className="font-semibold text-raffle-main">{userData?.cpf || "Não informado"}</p>
          </div>
          <div>
            <p className="text-sm">Telefone</p>
            <p className="font-semibold text-raffle-main">{userData?.phone || "Não informado"}</p>
          </div>
        </div>
      </Card>

      <div>
        <ResetPasswordCard />
      </div>

      <Card className="flex h-fit w-full flex-col gap-2 border-none bg-white/30 p-6 shadow-sm">
        <CardTitle>Excluir minha conta</CardTitle>
        <CardDescription>
          Lembre-se de que esta ação é irreversível e removerá permanentemente
          todas as suas informações e dados pessoais de nossa plataforma, você
          não pode ter rifas em andamento.
        </CardDescription>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="group flex w-fit items-center gap-2 rounded-xl hover:bg-raffle-highlight/30"
            >
              Excluir conta{" "}
              <Trash className="group-hover:text-rose-500" size={18} />
            </Button>
          </DialogTrigger>
          <DialogPortal>
            <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-all" />
            <DialogContent>
              <DialogTitle>Excluir conta</DialogTitle>
              <DialogDescription className="text-sm">
                Tem certeza de que deseja excluir permanentemente sua conta?
                Esta ação é irreversível e seu email não poderá ser utilizado
                novamente
              </DialogDescription>
              <DialogFooter>
                <DialogClose>
                  <Button variant="ghost">Cancelar</Button>
                </DialogClose>
                <Button variant="destructive" onClick={handleDeleteUser}>
                  Excluir
                </Button>
              </DialogFooter>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      </Card>
    </div>
  )
}
