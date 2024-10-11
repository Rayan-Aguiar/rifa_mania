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
import { PencilLine, Trash } from "lucide-react"

export default function MyAccount() {
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
              <DialogContent className="sm:max-w-[450px]:">
                <DialogHeader>
                  <DialogTitle>Editar dados pessoais</DialogTitle>
                  <DialogDescription className="text-sm">
                    Preencha os campos abaixo para editar seus dados pessoais
                  </DialogDescription>
                  <form>
                    <Label className="text-xs">Nome Completo</Label>
                    <Input
                      type="text"
                      className="focus-visible:ring-raffle-main"
                    />
                    <Label className="text-xs">CPF</Label>
                    <Input
                      type="text"
                      className="focus-visible:ring-raffle-main"
                    />
                    <Label className="text-xs">Email</Label>
                    <Input
                      type="email"
                      className="focus-visible:ring-raffle-main"
                    />
                    <Label className="text-xs">Telefone</Label>
                    <Input
                      type="tel"
                      className="focus-visible:ring-raffle-main"
                    />
                    <Button
                      type="submit"
                      className="mt-4 w-full bg-raffle-main hover:bg-raffle-main/90"
                    >
                      Salvar
                    </Button>
                  </form>
                </DialogHeader>
              </DialogContent>
            </DialogPortal>
          </Dialog>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div>
            <p className="text-sm">Nome</p>
            <p className="font-semibold text-raffle-main">Rayan Siqueira</p>
          </div>
          <div>
            <p className="text-sm">Email</p>
            <p className="font-semibold text-raffle-main">rayan@gmail.com</p>
          </div>
          <div>
            <p className="text-sm">CPF</p>
            <p className="font-semibold text-raffle-main">000.000.000-00</p>
          </div>
          <div>
            <p className="text-sm">Telefone</p>
            <p className="font-semibold text-raffle-main">21 99999-9999</p>
          </div>
        </div>
      </Card>
      <div>
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
                  <Button variant="destructive">Excluir</Button>
                </DialogFooter>
              </DialogContent>
            </DialogPortal>
          </Dialog>
        </Card>
      </div>
    </div>
  )
}
