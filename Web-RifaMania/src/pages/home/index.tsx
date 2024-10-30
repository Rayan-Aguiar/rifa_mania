import { UserDataProps } from "@/@types/UserData"
import { CardRaffles } from "@/components/CardRaffles"
import { Button } from "@/components/ui/button"
import { API } from "@/configs/api"
import { useRaffles } from "@/hooks/useRaffles"
import { DollarSign, Eye, EyeOff, LoaderCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"

export default function Home() {
  const [showBalace, setShowBalace] = useState(false)
  const [userData, setUserData] = useState<UserDataProps | null>(null)
  const { raffles, isLoading, error } = useRaffles()
  const navigate = useNavigate()

  const toggleBalaceVisibility = () => {
    setShowBalace(!showBalace)
  }

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token")

      if (!token) {
        navigate("/signin")
        return
      }

      const cachedUserData = localStorage.getItem("userData")
      if (cachedUserData) {
        setUserData(JSON.parse(cachedUserData))
        return
      }

      try {
        const response = await API.get("/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setUserData(response.data)
        localStorage.setItem("userData", JSON.stringify(response.data))
      } catch (error) {
        console.error(error)
      }
    }
    fetchUserData()
  }, [navigate])

  return (
    <div className="flex flex-col gap-4 text-blackCustom">
      <h1 className="text-xl font-bold">👋 Olá, {userData?.name}</h1>
      <div className="flex h-32 w-full items-center rounded-xl bg-white/40 p-4 shadow-sm">
        <div className="flex">
          <div>
            <DollarSign className="h-20 w-20 text-raffle-main" />
          </div>
          <div>
            <p className="text-lg">Total arrecadado</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-raffle-main">
                {showBalace ? "R$ 1000,00" : "*********"}
              </span>
              {showBalace ? (
                <EyeOff
                  className="cursor-pointer"
                  onClick={toggleBalaceVisibility}
                />
              ) : (
                <Eye
                  className="cursor-pointer"
                  onClick={toggleBalaceVisibility}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <div>
        <Link to="/nova-campanha">
          <Button className="w-full rounded-xl bg-raffle-main hover:bg-raffle-main/90">
            Criar Campanha
          </Button>
        </Link>
      </div>
      <h2 className="text-xl font-bold">Suas Campanhas</h2>

      {isLoading ? (
        <div className="flex h-fit w-full items-center justify-center">
          <LoaderCircle className="animate-spin" />
        </div>
      ) : error ? (
        <p>Ocorreu um erro ao carregar as Rifas.</p>
      ) : (
        raffles.map((raffle) => (
          <CardRaffles
            key={raffle.id}
            id={raffle.id}
            name={raffle.name}
            drawDate={raffle.drawDate}
            img={raffle.img}
            status={raffle.status}
            uniqueLink={raffle.uniqueLink}
          />
        ))
      )}
    </div>
  )
}
