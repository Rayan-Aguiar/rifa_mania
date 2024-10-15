import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import Router from "./routes/routes.tsx"
import { Toaster } from "./components/ui/toaster.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
      <Router />
      <Toaster />
  </StrictMode>,
)
