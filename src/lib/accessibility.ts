/**
 * Sistema de acessibilidade (a11y)
 * Utilidades para ARIA, navegação por teclado, e WCAG compliance
 */

/**
 * Gera ID único para ARIA relationships
 */
export function generateAriaId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Anuncia mensagem para leitores de tela
 * Usa ARIA live region
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  // Remove anúncios anteriores
  const existingAnnouncer = document.getElementById('screen-reader-announcer');
  if (existingAnnouncer) {
    existingAnnouncer.remove();
  }

  // Cria novo announcer
  const announcer = document.createElement('div');
  announcer.id = 'screen-reader-announcer';
  announcer.setAttribute('role', 'status');
  announcer.setAttribute('aria-live', priority);
  announcer.setAttribute('aria-atomic', 'true');
  announcer.className = 'sr-only'; // Visualmente oculto
  announcer.textContent = message;

  document.body.appendChild(announcer);

  // Remove após anúncio (3 segundos)
  setTimeout(() => {
    announcer.remove();
  }, 3000);
}

/**
 * Trap focus dentro de um elemento (útil para modais)
 */
export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  element.addEventListener('keydown', handleKeyDown);

  // Foca primeiro elemento
  firstElement?.focus();

  // Retorna função para remover listener
  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Verifica se elemento é visível na tela
 */
export function isElementVisible(element: HTMLElement): boolean {
  return !!(
    element.offsetWidth ||
    element.offsetHeight ||
    element.getClientRects().length
  );
}

/**
 * Move foco para elemento com delay (para transições)
 */
export function moveFocusTo(element: HTMLElement | null, delay: number = 0): void {
  if (!element) return;

  setTimeout(() => {
    element.focus();
    
    // Scroll suave até o elemento se necessário
    if (!isElementInViewport(element)) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, delay);
}

/**
 * Verifica se elemento está no viewport
 */
export function isElementInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Cria skip link para navegação rápida
 */
export function createSkipLink(targetId: string, text: string): HTMLAnchorElement {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.className = 'skip-link';
  skipLink.textContent = text;
  skipLink.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  return skipLink;
}

/**
 * Valida contraste de cores (WCAG AA)
 * Retorna true se contraste é adequado
 */
export function validateColorContrast(foreground: string, background: string, isLargeText: boolean = false): boolean {
  const ratio = calculateContrastRatio(foreground, background);
  const minRatio = isLargeText ? 3 : 4.5; // WCAG AA
  return ratio >= minRatio;
}

/**
 * Calcula ratio de contraste entre duas cores
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Calcula luminância relativa de uma cor
 */
function getRelativeLuminance(color: string): number {
  // Converte cor para RGB
  const rgb = hexToRgb(color);
  if (!rgb) return 0;

  // Normaliza valores RGB
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
    const normalized = val / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });

  // Fórmula WCAG
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Converte hex para RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # se presente
  hex = hex.replace('#', '');

  // Expande formato curto (ex: #abc -> #aabbcc)
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('');
  }

  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Keyboard navigation keys
 */
export const KeyboardKeys = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
} as const;

/**
 * Hook helper para detectar se usuário prefere motion reduzido
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Hook helper para detectar se usuário usa high contrast mode
 */
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * ARIA roles comuns
 */
export const AriaRoles = {
  BUTTON: 'button',
  LINK: 'link',
  NAVIGATION: 'navigation',
  MAIN: 'main',
  COMPLEMENTARY: 'complementary',
  SEARCH: 'search',
  FORM: 'form',
  DIALOG: 'dialog',
  ALERTDIALOG: 'alertdialog',
  ALERT: 'alert',
  STATUS: 'status',
  LIST: 'list',
  LISTITEM: 'listitem',
  TAB: 'tab',
  TABPANEL: 'tabpanel',
  TABLIST: 'tablist',
} as const;
