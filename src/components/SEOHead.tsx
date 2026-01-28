import { useEffect } from 'react';

interface SEOHeadProps {
  /** Titulo da pagina (sera concatenado com " | MedPrompts") */
  title: string;
  /** Descricao meta (150-160 caracteres recomendados) */
  description: string;
  /** URL canonica (opcional) */
  canonical?: string;
  /** Tipo de pagina para Open Graph (default: website) */
  type?: 'website' | 'article';
  /** Imagem para Open Graph (opcional) */
  image?: string;
}

/**
 * Componente SEOHead - Gerencia meta tags dinamicas por pagina
 *
 * Atualiza:
 * - document.title
 * - meta description
 * - meta canonical
 * - Open Graph tags (og:title, og:description, og:type, og:url, og:image)
 * - Twitter Card tags
 *
 * @example
 * <SEOHead
 *   title="Prompts Medicos"
 *   description="Explore 100+ prompts otimizados para ChatGPT, Claude e Perplexity"
 *   canonical="https://andressamendes.github.io/medprompts/prompts"
 * />
 */
export function SEOHead({
  title,
  description,
  canonical,
  type = 'website',
  image = 'https://andressamendes.github.io/medprompts/og-image.png'
}: SEOHeadProps) {
  useEffect(() => {
    // Titulo
    const fullTitle = `${title} | MedPrompts`;
    document.title = fullTitle;

    // Helper para criar ou atualizar meta tags
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const selector = isProperty
        ? `meta[property="${name}"]`
        : `meta[name="${name}"]`;
      let meta = document.querySelector(selector);

      if (!meta) {
        meta = document.createElement('meta');
        if (isProperty) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Helper para criar ou atualizar link tags
    const setLinkTag = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    // Meta Description
    setMetaTag('description', description);

    // Canonical URL
    if (canonical) {
      setLinkTag('canonical', canonical);
    }

    // Open Graph
    setMetaTag('og:title', fullTitle, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:type', type, true);
    if (canonical) {
      setMetaTag('og:url', canonical, true);
    }
    if (image) {
      setMetaTag('og:image', image, true);
    }
    setMetaTag('og:site_name', 'MedPrompts', true);
    setMetaTag('og:locale', 'pt_BR', true);

    // Twitter Card
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', fullTitle);
    setMetaTag('twitter:description', description);
    if (image) {
      setMetaTag('twitter:image', image);
    }

    // Cleanup: restaurar titulo padrao ao desmontar (opcional)
    return () => {
      // Nao limpar - manter ultima configuracao
    };
  }, [title, description, canonical, type, image]);

  // Componente nao renderiza nada visualmente
  return null;
}

export default SEOHead;
