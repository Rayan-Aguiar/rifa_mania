import { CardLanding } from "@/components/CardLanding"
import { Button } from "@/components/ui/button"
import { Bolt, Gift, Rocket, SwatchBook, Ticket } from "lucide-react"
import { Link } from "react-router-dom"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-whiteCustom">
      <header className="h-1/5 bg-white/30 p-6">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold uppercase text-raffle-main">
              Rifa Mania
            </p>
          </div>
          <div className="flex gap-2">
                <Button className="border-2 border-raffle-main bg-transparent text-raffle-main hover:bg-raffle-main hover:text-whiteCustom">
                Criar conta
                </Button>
            <Link to="/signin">
            <Button className="bg-raffle-main text-whiteCustom hover:bg-raffle-main/80">
              Acessar conta
            </Button>
            </Link>
          </div>
        </div>
      </header>
      <div className="container mx-auto flex flex-grow flex-col">
        <main className="flex w-full flex-grow flex-col p-6">
          <section className="flex w-full items-center justify-around">
            <div className="flex flex-col gap-6">
              <h1 className="text-5xl font-bold text-raffle-main">
                Crie a sua campanha <br /> online em minutos
              </h1>
              <p className="text-xl text-blackCustom">
                A plataforma mais completa para você criar e gerenciar a <br />
                sua campanha na internet
              </p>
              <div>
                <Button className="flex w-48 items-center gap-2 bg-raffle-main">
                  Criar Campanha <Rocket className="w-4" />
                </Button>
              </div>
            </div>
            <div>
              <img
                src="https://rifaup.com.br/_next/static/media/header.d1886ab7.webp"
                alt=""
                className="w-96"
              />
            </div>
          </section>
          <section className="mt-20 flex w-full justify-center gap-10">
            <CardLanding
              title="Bilhetes premidados"
              description="Adicione quantos bilhetes premiados desejar! "
              icon={Gift}
            />
            <CardLanding
              title="Até 10 mil números"
              description="Grandes Rifas? Até 10k de números disponíveis para sua criação."
              icon={Ticket}
            />
            <CardLanding
              title="Personalize"
              description="Crie com Estilo! Personalize sua campanha com cores, imagens e muito mais."
              icon={SwatchBook}
            />
            <CardLanding
              title="Controle seus Bilhetes"
              description="Saiba quantos bilhetes foram vendidos e quantos ainda faltam vender."
              icon={Bolt}
            />
          </section>
        </main>
      </div>

      <footer className="w-full bg-white/30 p-4 shadow-2xl">
        <div className="container mx-auto flex justify-center">
          <p className="text-xs">
            Copyright © 2020. site desenvolvido por{" "}
            <a href="#" className="font-semibold">
              Rifa Mania
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
