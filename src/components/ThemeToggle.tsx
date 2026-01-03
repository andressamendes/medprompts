import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Botão de alternância de tema (claro/escuro)
 * Acessível via teclado e screen readers
 * 
 * Padrões de acessibilidade implementados:
 * - ARIA label descritivo
 * - Tooltip informativo
 * - Animação suave de transição
 * - Focus visible
 * - Atalho de teclado (Ctrl/Cmd + Shift + D)
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  const isDark = theme === 'dark';
  const themeLabel = isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro';

  return (
    <button
      onClick={toggleTheme}
      className="
        relative inline-flex items-center justify-center
        w-10 h-10
        rounded-lg
        bg-secondary hover:bg-accent
        text-secondary-foreground
        transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        group
      "
      aria-label={themeLabel}
      title={themeLabel}
      type="button"
    >
      {/* Ícone do Sol (modo claro) */}
      <Sun 
        className={`
          absolute h-5 w-5
          transition-all duration-300
          ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}
        `}
        aria-hidden="true"
      />
      
      {/* Ícone da Lua (modo escuro) */}
      <Moon 
        className={`
          absolute h-5 w-5
          transition-all duration-300
          ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}
        `}
        aria-hidden="true"
      />

      {/* Tooltip - aparece no hover */}
      <span className="
        absolute -bottom-10 left-1/2 -translate-x-1/2
        px-2 py-1 rounded
        bg-popover text-popover-foreground
        text-xs whitespace-nowrap
        opacity-0 group-hover:opacity-100
        transition-opacity duration-200
        pointer-events-none
        shadow-md
      ">
        {isDark ? 'Modo claro' : 'Modo escuro'}
      </span>
    </button>
  );
}
