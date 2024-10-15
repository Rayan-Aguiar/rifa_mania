import { getToken } from "@/configs/auth"
import React from "react"
import { Navigate, useLocation } from "react-router-dom"


interface PrivateRouteProps {
    element: React.ReactElement
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({element}) =>{
    const token = getToken()
    const location = useLocation()

    return token ? (
        element
    ) : (
        <Navigate to='/signin' state={{from: location}} replace />
    )
}