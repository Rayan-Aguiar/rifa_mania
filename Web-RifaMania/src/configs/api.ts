import axios from "axios"
import { getToken } from "./auth"

const apiUrl = 'http://localhost:3333'

export const API = axios.create({
    baseURL: apiUrl
})

API.interceptors.request.use(async (config) => {
    const token = getToken()
    if (token){
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

API.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      if (error.response && error.response.status === 401) {
        if (window.location.pathname !== "/signin") {
          window.location.href = "/"
        }
        console.error(error.response)
      }
      return Promise.reject(error)
    },
  )
  