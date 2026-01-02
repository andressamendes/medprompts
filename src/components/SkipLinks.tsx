/**
 * Componente Skip Links
 * Permite navegação rápida por teclado para áreas principais da página
 * WCAG 2.4.1 (Bypass Blocks) - Level A
 */

export function SkipLinks() {
  return (
    <div className="skip-links">
      <a href="#main-content" className="skip-link">
        Pular para conteúdo principal
      </a>
      <a href="#navigation" className="skip-link">
        Pular para navegação
      </a>
      <a href="#search" className="skip-link">
        Pular para busca
      </a>
    </div>
  );
}
