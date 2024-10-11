import LogoImg from "@/assets/Rifamania-logo.png"
import { Bell, LogOut, Ticket, User2Icon, Wallet } from "lucide-react"
import { Link } from "react-router-dom"
import { Outlet } from "react-router-dom"

export default function Layout(){
    return (
        <div className="w-full min-h-svh bg-whiteCustom">
            <header className="h-fit bg-white/30 p-6">
                <div className="container mx-auto flex justify-between items-center">
                    <img src={LogoImg} alt="logo rifa mania" className="w-20" />
                    <Bell  className="text-raffle-main"/>
                </div>
            </header>
            <main className="flex container mx-auto py-6">
                <aside className="h-fit w-60 bg-raffle-main rounded-xl p-4  flex flex-col ">
                    <div className="flex items-center gap-3 ">
                        <div className="rounded-full h-12 w-12 bg-whiteCustom/50 flex justify-center items-center text-whiteCustom font-bold">Ra</div>
                        <div>
                            <p className="text-sm text-whiteCustom font-bold">Rayan Siqueira</p>
                            <p className="text-xs text-whiteCustom truncate">rayansiqueira@gmail.com</p>
                        </div>
                    </div>
                    <ul className="mt-4 text-whiteCustom flex flex-col gap-2 ">
                        <Link to="/home">
                            <li className="flex gap-1 items-center hover:bg-raffle-highlight/20 rounded p-2 cursor-pointer"><Ticket /> Campanhas</li>
                        </Link>
                        <Link to="/metodo-pagamento">
                            <li className="flex gap-1 items-center hover:bg-raffle-highlight/20 rounded p-2 cursor-pointer"><Wallet /> Configure pagamento</li>
                        </Link>
                        <li className="flex gap-1 items-center hover:bg-raffle-highlight/20 rounded p-2 cursor-pointer"><User2Icon/> Minha conta</li>
                        <li className="flex gap-1 items-center hover:bg-raffle-highlight/20 rounded p-2 cursor-pointer"><LogOut/> Sair</li>
                    </ul>

                </aside>
                <div className="flex-grow px-6 ">
                    <Outlet/>
                </div>

            </main>
            
        </div>
    )
}