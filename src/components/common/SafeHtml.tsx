/**
 * 🔒 SafeHtml Component - Renderização Segura de HTML
 *
 * FASE 5: Componente para renderizar HTML sanitizado
 *
 * Uso:
 * ```tsx
 * <SafeHtml content={userInput} mode="text" />
 * <SafeHtml content={richText} mode="markdown" />
 * ```
 */

import React from 'react';
import { sanitizationService } from '../../services/sanitization.service';

interface SafeHtmlProps {
  content: string;
  mode?: 'text' | 'html' | 'markdown';
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  onXssDetected?: (input: string) => void;
}

/**
 * Componente para renderizar conteúdo sanitizado
 */
export const SafeHtml: React.FC<SafeHtmlProps> = ({
  content,
  mode = 'text',
  className = '',
  as: Component = 'div',
  onXssDetected,
}) => {
  // Detecta tentativa de XSS
  if (sanitizationService.detectXssAttempt(content)) {
    if (onXssDetected) {
      onXssDetected(content);
    }
    sanitizationService.logSecurityIncident('XSS_ATTEMPT', content);
  }

  // Sanitiza baseado no modo
  let sanitized: string;
  switch (mode) {
    case 'html':
      sanitized = sanitizationService.sanitizeBasicHtml(content);
      break;
    case 'markdown':
      sanitized = sanitizationService.sanitizeMarkdown(content);
      break;
    case 'text':
    default:
      sanitized = sanitizationService.sanitizeText(content);
      break;
  }

  // Se modo text, renderiza como texto
  if (mode === 'text') {
    return <Component className={className}>{sanitized}</Component>;
  }

  // Se html/markdown, renderiza com dangerouslySetInnerHTML (já sanitizado)
  return (
    <Component
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
};

/**
 * Componente para renderizar link externo seguro
 */
interface SafeLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
}

export const SafeLink: React.FC<SafeLinkProps> = ({
  href,
  children,
  className = '',
  target = '_blank',
  rel = 'noopener noreferrer',
}) => {
  const sanitizedUrl = sanitizationService.sanitizeUrl(href);

  if (!sanitizedUrl) {
    // URL inválida - renderiza como texto
    return <span className={className}>{children}</span>;
  }

  return (
    <a
      href={sanitizedUrl}
      className={className}
      target={target}
      rel={rel}
    >
      {children}
    </a>
  );
};

/**
 * Componente para input com sanitização em tempo real
 */
interface SafeInputProps {
  value: string;
  onChange: (sanitized: string) => void;
  mode?: 'text' | 'email' | 'url';
  placeholder?: string;
  className?: string;
  maxLength?: number;
  onInvalidInput?: (error: string) => void;
}

export const SafeInput: React.FC<SafeInputProps> = ({
  value,
  onChange,
  mode = 'text',
  placeholder,
  className = '',
  maxLength,
  onInvalidInput,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Sanitiza baseado no modo
    switch (mode) {
      case 'email': {
        const validation = sanitizationService.validateEmail(input);
        if (validation.error && onInvalidInput) {
          onInvalidInput(validation.error);
        }
        onChange(validation.sanitized);
        break;
      }
      case 'url': {
        const validation = sanitizationService.validateUrl(input);
        if (validation.error && onInvalidInput) {
          onInvalidInput(validation.error);
        }
        onChange(validation.sanitized || '');
        break;
      }
      case 'text':
      default: {
        const sanitized = sanitizationService.sanitizeText(input);
        onChange(sanitized);
        break;
      }
    }
  };

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      maxLength={maxLength}
    />
  );
};

export default SafeHtml;
