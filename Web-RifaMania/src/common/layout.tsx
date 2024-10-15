import { UserDataProps } from "@/@types/UserData"
import LogoImg from "@/assets/Rifamania-logo.png"
import { API } from "@/configs/api"
import { removeToken } from "@/configs/auth"
import { Bell, LogOut, Ticket, User2Icon, Wallet } from "lucide-react"
import { useEffect, useState } from "react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"

export default function Layout() {

  const [ userData, setUserData ] = useState<UserDataProps | null>(null)

  const navigate = useNavigate()


  const handleLogout = (e: React.MouseEvent<HTMLLIElement>) =>{
    e.preventDefault()
    removeToken()
    localStorage.removeItem('userData')
    navigate("/")
  }

  useEffect(() =>{
    const fetchUserData = async () =>{
      const token = localStorage.getItem('token')
      if(!token){
        navigate('/signin')
        return
      }

      try {
        const response = await API.get('/users',{
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setUserData(response.data)
      } catch (error) {
        console.error(error)
      }
    }
    fetchUserData()
  },[navigate])

  const getInitialsName = (name?: string) =>{
    if(!name) return ''
    const [ firstLetter, secondLetter ] = name.trim().slice(0, 2).split('')
    return `${firstLetter?.toUpperCase()}${secondLetter?.toLowerCase()}`
  }

  return (
    <div className="w-full min-h-svh bg-whiteCustom">
      <header className="h-fit bg-white/30 p-6">
        <div className="container mx-auto flex justify-between items-center">
          <img src={LogoImg} alt="logo rifa mania" className="w-20" />
          <Bell className="text-raffle-main" />
        </div>
      </header>
      <main className="flex container mx-auto py-6">
        <aside className="h-fit w-60 bg-raffle-main rounded-xl p-4 flex flex-col">
          <div className="flex items-center gap-3">
            <div className="rounded-full h-12 w-12 bg-whiteCustom/50 flex justify-center items-center text-whiteCustom font-bold">{getInitialsName(userData?.name)}</div>
            <div>
              <p className="text-sm text-whiteCustom font-bold">{userData?.name || 'Usuário'}</p>
              <p className="text-xs text-whiteCustom truncate">{userData?.email}</p>
            </div>
          </div>
          <ul className="mt-4 text-whiteCustom flex flex-col gap-2">
            <NavLink 
              to="/home" 
              className={({ isActive }) => 
                isActive ? "flex gap-1 items-center bg-raffle-highlight/20 rounded p-2 cursor-pointer" : "flex gap-1 items-center hover:bg-raffle-highlight/20 rounded p-2 cursor-pointer"
              }>
              <Ticket /> Campanhas
            </NavLink>
            <NavLink 
              to="/metodo-pagamento" 
              className={({ isActive }) => 
                isActive ? "flex gap-1 items-center bg-raffle-highlight/20 rounded p-2 cursor-pointer" : "flex gap-1 items-center hover:bg-raffle-highlight/20 rounded p-2 cursor-pointer"
              }>
              <Wallet /> Configure pagamento
            </NavLink>
            <NavLink 
              to="/perfil" 
              className={({ isActive }) => 
                isActive ? "flex gap-1 items-center bg-raffle-highlight/20 rounded p-2 cursor-pointer" : "flex gap-1 items-center hover:bg-raffle-highlight/20 rounded p-2 cursor-pointer"
              }>
              <User2Icon /> Minha conta
            </NavLink>
            <li onClick={handleLogout} className="flex gap-1 items-center p-2 cursor-pointer text-raffle-highlight">
              <LogOut /> Sair
            </li>
          </ul>
        </aside>
        <div className="flex-grow px-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
