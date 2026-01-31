/**
 * Componente Skip Links
 * Permite navegação rápida por teclado para áreas principais da página
 * WCAG 2.4.1 (Bypass Blocks) - Level A
 */

export function SkipLinks() {
  return (
    <nav aria-label="Links de navegação rápida" className="sr-only focus-within:not-sr-only">
      <ul className="flex gap-2 fixed top-2 left-2 z-[100]">
        <li>
          <a
            href="#main-content"
            className="block bg-indigo-600 text-white px-4 py-3 text-sm font-medium rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 transform -translate-y-16 focus:translate-y-0 transition-transform duration-200"
          >
            Pular para conteúdo principal
          </a>
        </li>
        <li>
          <a
            href="#main-navigation"
            className="block bg-indigo-600 text-white px-4 py-3 text-sm font-medium rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 transform -translate-y-16 focus:translate-y-0 transition-transform duration-200"
          >
            Pular para navegação
          </a>
        </li>
      </ul>
    </nav>
  );
}
