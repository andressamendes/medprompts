import { Link, useLocation } from "react-router-dom"
import { Moon, Sun, Heart } from "lucide-react"
import { Button } from "./ui/button"
import { useTheme } from "@/contexts/ThemeContext"
import { useFavorites } from "@/contexts/FavoritesContext"

export const Navbar = () => {
  const location = useLocation()
  const { theme, setTheme } = useTheme()
  const { count } = useFavorites()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              MedPrompts
            </span>
          </Link>

          {/* Links de navegação */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Biblioteca
            </Link>
            <Link
              to="/guia-ias"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/guia-ias") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Guia de IAs
            </Link>
            <Link
              to="/ferramentas"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/ferramentas") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Ferramentas
            </Link>
          </div>

          {/* Ações */}
          <div className="flex items-center space-x-2">
            {/* Contador de favoritos */}
            <div className="hidden sm:flex items-center space-x-1 text-sm text-muted-foreground">
              <Heart className="h-4 w-4" />
              <span>{count}</span>
            </div>

            {/* Toggle tema */}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Menu mobile */}
        <div className="md:hidden flex items-center justify-around pb-3 space-x-4">
          <Link
            to="/"
            className={`text-xs font-medium transition-colors hover:text-primary ${
              isActive("/") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Biblioteca
          </Link>
          <Link
            to="/guia-ias"
            className={`text-xs font-medium transition-colors hover:text-primary ${
              isActive("/guia-ias") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Guia de IAs
          </Link>
          <Link
            to="/ferramentas"
            className={`text-xs font-medium transition-colors hover:text-primary ${
              isActive("/ferramentas") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Ferramentas
          </Link>
        </div>
      </div>
    </nav>
  )
}
