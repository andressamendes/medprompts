import React from 'react';
import { Card } from '@/components/ui/card';

interface AccessibleCardProps {
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel: string;
  className?: string;
  style?: React.CSSProperties;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

/**
 * Card acessível para navegação via teclado
 * Implementa role="button", tabindex e handlers de teclado
 */
export const AccessibleCard: React.FC<AccessibleCardProps> = ({
  children,
  onClick,
  ariaLabel,
  className = '',
  style,
  onKeyDown,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
    onKeyDown?.(e);
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      className={className}
      style={style}
    >
      {children}
    </Card>
  );
};
