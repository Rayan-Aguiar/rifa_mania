import { BrowserRouter, Route, Routes } from "react-router-dom"

import LandingPage from "@/pages/landingPage"
import SignIn from "@/pages/SignIn"
import SignUp from "@/pages/SignUp"
import Layout from "@/common/layout"
import Home from "@/pages/home"

export default function Router() {
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />

                <Route element={<Layout />}>
                    <Route path="/home" element={<Home />} />
                
                </Route>
                
            </Routes>
        </BrowserRouter>
        
    )
}