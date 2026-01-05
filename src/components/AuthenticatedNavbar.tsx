import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Moon, Sun, BookOpen, Menu, X, LogOut, User, LayoutDashboard, Sparkles, Calendar } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

/**
 * Navbar autenticada - exibida para usuários LOGADOS
 * Contém:  Logo, Links protegidos, Nome do usuário, Logout, Toggle de tema
 * Totalmente responsiva para desktop e mobile
 */
export const AuthenticatedNavbar = () => {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/app" className="flex items-center space-x-2">
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
              to="/app"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Biblioteca
            </Link>
            <Link
              to="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              to="/prompts"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Meus Prompts
            </Link>
            <Link
              to="/study"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Sessões de Estudo
            </Link>
          </div>

          {/* Ações - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Nome do usuário */}
            <div className="flex items-center gap-2 px-3 py-1. 5 bg-secondary/50 rounded-lg">
              <User className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{user?.name || 'Usuário'}</span>
            </div>

            {/* Toggle tema */}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Botão Logout */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
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
            {/* Nome do usuário - Mobile */}
            <div className="px-4 pb-3 border-b">
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4 text-primary" />
                <span>{user?.name || 'Usuário'}</span>
              </div>
              {user?. email && (
                <p className="text-xs text-muted-foreground mt-1 ml-6">{user.email}</p>
              )}
            </div>

            <Link
              to="/app"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              Biblioteca
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              to="/prompts"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              Meus Prompts
            </Link>
            <Link
              to="/study"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-colors"
            >
              <Calendar className="h-4 w-4" />
              Sessões de Estudo
            </Link>

            {/* Botão Logout - Mobile */}
            <div className="px-4 pt-3 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};