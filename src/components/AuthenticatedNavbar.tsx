import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain, Menu, X, Moon, Sun, User, LogOut } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

export const AuthenticatedNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Prompts', path: '/prompts' },
    { label: 'Cronograma', path: '/study-schedule' },
    { label: 'Ferramentas', path: '/ferramentas' },
    { label: 'Guia de IAs', path: '/guia-ias' },
    { label: 'Focus Zone', path: '/focus-zone' }
  ];

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900 dark:text-white">MedPrompts</span>
              <span className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">Portal Acadêmico</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-purple-600 dark:text-purple-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Toggle Tema */}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Profile Button */}
            <Button
              variant="ghost"
              onClick={() => navigate('/profile')}
              className="gap-2"
            >
              <User className="h-4 w-4" />
              {user?.name || 'Perfil'}
            </Button>

            {/* Logout Button */}
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            {/* Toggle Tema Mobile */}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === link.path
                    ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {link.label}
              </button>
            ))}

            {/* Mobile User Actions */}
            <div className="flex flex-col gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}
                className="w-full gap-2"
              >
                <User className="h-4 w-4" />
                {user?.name || 'Perfil'}
              </Button>
              <Button
                variant="outline"
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="w-full gap-2"
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

export default AuthenticatedNavbar;
