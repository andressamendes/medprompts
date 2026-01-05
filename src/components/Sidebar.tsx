import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Sparkles,
  Wrench,
  FocusIcon as Focus,
  Calendar,
  Trophy,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: BookOpen, label: 'Biblioteca', path: '/prompts' },
    { icon: Sparkles, label: 'Guia de IAs', path: '/guia-ias' },
    { icon: Wrench, label: 'Ferramentas', path: '/ferramentas' },
    { icon: Focus, label: 'Focus Zone', path: '/focus-zone' },
    { icon: Calendar, label: 'Cronograma', path: '/dashboard' },
    { icon: Trophy, label: 'Conquistas', path: '/dashboard' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">MedPrompts</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-8 w-8', collapsed && 'mx-auto')}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center space-x-3 rounded-lg px-3 py-2 transition-all duration-200',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                collapsed && 'justify-center'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-2 my-4 border-t" />

      {/* Settings */}
      <div className="space-y-1 p-2">
        <Link
          to="/dashboard"
          className={cn(
            'flex items-center space-x-3 rounded-lg px-3 py-2 text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Configurações' : undefined}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Configurações</span>}
        </Link>
      </div>

      {/* User Section */}
      <div className="absolute bottom-0 left-0 right-0 border-t p-4">
        <div
          className={cn(
            'flex items-center space-x-3',
            collapsed && 'justify-center'
          )}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
            <User className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">Estudante</p>
              <p className="truncate text-xs text-muted-foreground">
                Nível 5
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
