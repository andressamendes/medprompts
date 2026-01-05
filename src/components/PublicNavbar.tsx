import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Moon, Sun, BookOpen, Menu, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";

/**
 * Navbar pública - exibida para usuários NÃO autenticados
 * Contém:  Logo, Links públicos, Toggle de tema, Botões de Login/Registrar
 * Totalmente responsiva para desktop e mobile
 */
export const PublicNavbar = () => {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(! mobileMenuOpen);
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              MedPrompts
            </span>
          </Link>

          {/* Links de navegação - Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Início
            </Link>
            <Link
              to="/guia-ias"
              className="text-sm font-medium text-muted-foreground hover: text-primary transition-colors"
            >
              Guia de IAs
            </Link>
            <Link
              to="/ferramentas"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Ferramentas
            </Link>
            <Link
              to="/focus-zone"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Focus Zone
            </Link>
          </div>

          {/* Ações - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Toggle tema */}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Botão Login */}
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>

            {/* Botão Registrar */}
            <Link to="/register">
              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700">
                Criar Conta
              </Button>
            </Link>
          </div>

          {/* Menu Mobile - Botão Hamburger */}
          <div className="flex md:hidden items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Menu Mobile - Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-colors"
            >
              Início
            </Link>
            <Link
              to="/guia-ias"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-colors"
            >
              Guia de IAs
            </Link>
            <Link
              to="/ferramentas"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-colors"
            >
              Ferramentas
            </Link>
            <Link
              to="/focus-zone"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-colors"
            >
              Focus Zone
            </Link>

            {/* Botões de autenticação - Mobile */}
            <div className="px-4 pt-3 space-y-2 border-t">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  Entrar
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700">
                  Criar Conta 
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};