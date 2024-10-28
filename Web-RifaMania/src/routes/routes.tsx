import { BrowserRouter, Route, Routes } from "react-router-dom"

import LandingPage from "@/pages/landingPage"
import SignIn from "@/pages/SignIn"
import SignUp from "@/pages/SignUp"
import Layout from "@/common/layout"
import Home from "@/pages/home"
import PaymentPage from "@/pages/Payment"
import MyAccount from "@/pages/myAccount"
import { PrivateRoute } from "./privaderouter"
import NewCampaign from "@/pages/newCampaign"
import EditCampaign from "@/pages/editCampaign"

export default function Router() {
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />

                <Route element={<Layout />}>
                    <Route path="/home" element={<PrivateRoute element={<Home />}/>}/>
                    <Route path="/metodo-pagamento" element={<PrivateRoute element={<PaymentPage />} />} />
                    <Route path="/perfil" element={<PrivateRoute element={<MyAccount />}/>} />
                    <Route path="/nova-campanha" element={<PrivateRoute element={<NewCampaign />}/>} />                
                    <Route path="/editar-campanha/:id" element={<PrivateRoute element={<EditCampaign />}/>} />                
                </Route>
                
            </Routes>
        </BrowserRouter>
        
    )
}