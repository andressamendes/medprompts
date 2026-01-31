import { useEffect, useRef, useCallback, useState } from 'react';
import {
  announceToScreenReader,
  trapFocus,
  moveFocusTo,
  KeyboardKeys,
  prefersReducedMotion,
  prefersHighContrast,
} from '@/lib/accessibility';

/**
 * Hook para anúncios de screen reader
 */
export function useAnnounce() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announceToScreenReader(message, priority);
  }, []);

  return announce;
}

/**
 * Hook para trap de foco (modais, dialogs)
 * Retorna ref para colocar no elemento container
 */
export function useFocusTrap(isActive: boolean = true) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !elementRef.current) return;

    const cleanup = trapFocus(elementRef.current);

    return cleanup;
  }, [isActive]);

  return elementRef;
}

/**
 * Hook para navegação por teclado
 * Retorna handlers para eventos de teclado
 */
export function useKeyboardNavigation(callbacks: {
  onEnter?: () => void;
  onSpace?: () => void;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
}) {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case KeyboardKeys.ENTER:
          event.preventDefault();
          callbacks.onEnter?.();
          break;
        case KeyboardKeys.SPACE:
          event.preventDefault();
          callbacks.onSpace?.();
          break;
        case KeyboardKeys.ESCAPE:
          event.preventDefault();
          callbacks.onEscape?.();
          break;
        case KeyboardKeys.ARROW_UP:
          event.preventDefault();
          callbacks.onArrowUp?.();
          break;
        case KeyboardKeys.ARROW_DOWN:
          event.preventDefault();
          callbacks.onArrowDown?.();
          break;
        case KeyboardKeys.ARROW_LEFT:
          event.preventDefault();
          callbacks.onArrowLeft?.();
          break;
        case KeyboardKeys.ARROW_RIGHT:
          event.preventDefault();
          callbacks.onArrowRight?.();
          break;
        case KeyboardKeys.HOME:
          event.preventDefault();
          callbacks.onHome?.();
          break;
        case KeyboardKeys.END:
          event.preventDefault();
          callbacks.onEnd?.();
          break;
      }
    },
    [callbacks]
  );

  return { onKeyDown: handleKeyDown };
}

/**
 * Hook para detectar preferências de acessibilidade
 */
export function useAccessibilityPreferences() {
  const reducedMotion = prefersReducedMotion();
  const highContrast = prefersHighContrast();

  return {
    reducedMotion,
    highContrast,
  };
}

/**
 * Hook para focar elemento ao montar
 */
export function useAutoFocus<T extends HTMLElement>(
  shouldFocus: boolean = true,
  delay: number = 0
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (shouldFocus && ref.current) {
      moveFocusTo(ref.current, delay);
    }
  }, [shouldFocus, delay]);

  return ref;
}

/**
 * Hook para gerenciar estado de loading acessível
 */
export function useAccessibleLoading(isLoading: boolean, message: string = 'Carregando...') {
  const announce = useAnnounce();

  useEffect(() => {
    if (isLoading) {
      announce(message, 'polite');
    }
  }, [isLoading, message, announce]);

  return {
    'aria-busy': isLoading,
    'aria-live': 'polite' as const,
  };
}

/**
 * Hook para criar ID único (útil para ARIA relationships)
 */
export function useAriaId(prefix: string = 'aria') {
  const idRef = useRef(`${prefix}-${Math.random().toString(36).substr(2, 9)}`);
  return idRef.current;
}

/**
 * Hook para gerenciar estado expanded/collapsed
 */
export function useDisclosure(defaultIsOpen: boolean = false) {
  const [isOpen, setIsOpen] = useState(defaultIsOpen);
  const announce = useAnnounce();

  const open = useCallback(() => {
    setIsOpen(true);
    announce('Menu expandido', 'polite');
  }, [announce]);

  const close = useCallback(() => {
    setIsOpen(false);
    announce('Menu recolhido', 'polite');
  }, [announce]);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const newState = !prev;
      announce(newState ? 'Menu expandido' : 'Menu recolhido', 'polite');
      return newState;
    });
  }, [announce]);

  return {
    isOpen,
    open,
    close,
    toggle,
    // Props para elemento trigger
    triggerProps: {
      'aria-expanded': isOpen,
      onClick: toggle,
    },
    // Props para elemento content
    contentProps: {
      'aria-hidden': !isOpen,
      hidden: !isOpen,
    },
  };
}
