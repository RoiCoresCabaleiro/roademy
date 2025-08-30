import { Outlet } from "react-router-dom"
import HeaderNav from "../components/HeaderNav"
import FooterNav from "../components/FooterNav"
import { useEffect } from "react"
import { useLocation } from "react-router-dom"

export default function Layout() {
  const location = useLocation()
  useEffect(() => {
    if (!location.pathname.includes("/roadmap")) {
      const mainElement = document.querySelector("main")
      if (mainElement) {
        mainElement.scrollTo({
          top: 0,
          behavior: "instant",
        })
      }
    }
  }, [location.pathname])

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header - Solo visible en desktop, sticky arriba */}
      <div className="hidden md:block">
        <HeaderNav />
      </div>

      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto bg-primary-50">
        <Outlet />
      </main>

      {/* Footer - Solo visible en móvil, sticky abajo */}
      <div className="md:hidden">
        <FooterNav />
      </div>
    </div>
  )
}
