import { BrowserRouter, Route, Routes } from "react-router-dom"

import LandingPage from "@/pages/landingPage"
import SignIn from "@/pages/SignIn"

export default function Router() {
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/signin" element={<SignIn />} />
            </Routes>
        </BrowserRouter>
        
    )
}