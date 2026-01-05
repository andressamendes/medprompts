import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface NavbarProps {
  className?: string;
  showSearch?: boolean;
}

export const NewNavbar: React.FC<NavbarProps> = ({ 
  className,
  showSearch = true 
}) => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const notifications = [
    { id: 1, title: 'Novo desafio disponível!', time: '5m atrás', unread: true },
    { id: 2, title: 'Você ganhou uma conquista', time: '1h atrás', unread: true },
    { id: 3, title: 'Lembrete de estudo', time: '2h atrás', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
              <span className="text-lg font-bold text-white">M</span>
            </div>
            <span className="hidden text-xl font-bold sm:inline-block">
              MedPrompts
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          {showSearch && (
            <div className="hidden flex-1 max-w-md mx-4 lg:block">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar prompts..."
                  icon={<Search className="h-4 w-4" />}
                  iconPosition="left"
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Search Button - Mobile */}
            {showSearch && (
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSearchOpen(!searchOpen)}
              >
                <Search className="h-5 w-5" />
              </Button>
            )}

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge
                    variant="danger"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 top-12 w-80 rounded-lg border bg-card shadow-lg">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">Notificações</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          'p-4 hover:bg-accent/50 cursor-pointer border-b last:border-0',
                          notification.unread && 'bg-primary/5'
                        )}
                      >
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.time}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t">
                    <Button variant="ghost" size="sm" className="w-full">
                      Ver todas
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* User Menu */}
            <div className="relative hidden md:block">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="rounded-full"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
                  <User className="h-4 w-4 text-white" />
                </div>
              </Button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 top-12 w-64 rounded-lg border bg-card shadow-lg">
                  <div className="p-4 border-b">
                    <p className="font-semibold">Estudante de Medicina</p>
                    <p className="text-sm text-muted-foreground">Nível 5 - 1250 XP</p>
                  </div>
                  <div className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => navigate('/dashboard')}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Perfil
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => navigate('/dashboard')}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configurações
                    </Button>
                    <div className="my-1 border-t" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        {showSearch && searchOpen && (
          <div className="pb-4 lg:hidden">
            <Input
              type="text"
              placeholder="Buscar prompts..."
              icon={<Search className="h-4 w-4" />}
              iconPosition="left"
              className="w-full"
            />
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t py-4 md:hidden">
            <div className="space-y-2">
              <Link
                to="/dashboard"
                className="flex items-center space-x-3 rounded-lg px-3 py-2 hover:bg-accent"
              >
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">Perfil</span>
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center space-x-3 rounded-lg px-3 py-2 hover:bg-accent"
              >
                <Settings className="h-5 w-5" />
                <span className="text-sm font-medium">Configurações</span>
              </Link>
              <button
                className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm font-medium">Sair</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
