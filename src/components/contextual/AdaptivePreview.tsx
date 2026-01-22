/**
 * Preview adaptivo do prompt com destaque para adaptações
 */

import { useState, useMemo } from 'react';
import DOMPurify from 'dompurify';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  AlertCircle,
  Copy,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Edit3,
} from 'lucide-react';
import type { AdaptedPrompt, PromptAdaptation } from '@/types/contextual';

interface AdaptivePreviewProps {
  adapted: AdaptedPrompt;
  onCopy?: () => void;
  onEditVariable?: (varName: string) => void;
  className?: string;
}

/**
 * Preview do prompt adaptado com destaque para mudanças
 */
export function AdaptivePreview({
  adapted,
  onCopy,
  onEditVariable,
  className = '',
}: AdaptivePreviewProps) {
  const [showAdaptations, setShowAdaptations] = useState(false);
  const [copied, setCopied] = useState(false);

  /**
   * Copia o prompt para a área de transferência
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(adapted.adapted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.();
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  /**
   * Renderiza o conteúdo com destaques
   */
  const highlightedContent = useMemo(() => {
    let content = adapted.adapted;

    // Destacar variáveis pendentes
    content = content.replace(
      /\[([A-Za-zÀ-ÖØ-öø-ÿ0-9_\-\s]+)\]/g,
      '<span class="inline-flex items-center gap-1 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-1.5 py-0.5 rounded font-medium text-sm cursor-pointer hover:bg-amber-300 dark:hover:bg-amber-700 transition-colors" data-variable="$1">[$1]</span>'
    );

    // Sanitizar HTML
    return DOMPurify.sanitize(content);
  }, [adapted.adapted]);

  return (
    <div className={`rounded-xl border-2 transition-all duration-300 ${
      adapted.ready
        ? 'border-green-300 dark:border-green-700 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20'
        : 'border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20'
    } ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Badge
            variant={adapted.ready ? 'default' : 'secondary'}
            className={adapted.ready
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-amber-600 hover:bg-amber-700 text-white'
            }
          >
            {adapted.ready ? (
              <>
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Pronto
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 mr-1" />
                {adapted.pendingVariables.length} pendente{adapted.pendingVariables.length > 1 ? 's' : ''}
              </>
            )}
          </Badge>

          <span className="text-xs text-gray-500 dark:text-gray-400">
            {adapted.filledVariables.length > 0 && (
              <span className="text-green-600 dark:text-green-400">
                {adapted.filledVariables.length} preenchido{adapted.filledVariables.length > 1 ? 's' : ''} automaticamente
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão de adaptações */}
          {adapted.adaptations.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdaptations(!showAdaptations)}
              className="text-xs gap-1"
            >
              <Sparkles className="w-3 h-3" />
              {adapted.adaptations.length} adaptação{adapted.adaptations.length > 1 ? 'ões' : ''}
              {showAdaptations ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>
          )}

          {/* Botão de copiar */}
          <Button
            variant={adapted.ready ? 'default' : 'outline'}
            size="sm"
            onClick={handleCopy}
            disabled={!adapted.ready}
            className="gap-1"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Lista de adaptações (colapsável) */}
      {showAdaptations && adapted.adaptations.length > 0 && (
        <div className="px-4 py-2 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-gray-200 dark:border-gray-700">
          <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300 mb-2">
            Adaptações aplicadas:
          </p>
          <ul className="space-y-1">
            {adapted.adaptations.map((adaptation, idx) => (
              <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                <AdaptationIcon type={adaptation.type} />
                <span>
                  <strong className="text-gray-800 dark:text-gray-200">{adaptation.target}:</strong>{' '}
                  {adaptation.reason}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Variáveis pendentes */}
      {adapted.pendingVariables.length > 0 && (
        <div className="px-4 py-2 bg-amber-50/50 dark:bg-amber-950/20 border-b border-gray-200 dark:border-gray-700">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-2">
            Campos pendentes (clique para preencher):
          </p>
          <div className="flex flex-wrap gap-2">
            {adapted.pendingVariables.map(varName => (
              <button
                key={varName}
                onClick={() => onEditVariable?.(varName)}
                className="inline-flex items-center gap-1 text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 px-2 py-1 rounded hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors"
              >
                <Edit3 className="w-3 h-3" />
                [{varName}]
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Conteúdo do prompt */}
      <div
        className="p-4 max-h-[400px] overflow-y-auto prose prose-sm dark:prose-invert max-w-none"
        onClick={(e) => {
          const target = e.target as HTMLElement;
          const variable = target.dataset.variable;
          if (variable) {
            onEditVariable?.(variable);
          }
        }}
      >
        <div
          className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed"
          dangerouslySetInnerHTML={{ __html: highlightedContent }}
        />
      </div>

      {/* Footer */}
      {adapted.ready && (
        <div className="px-4 py-2 bg-green-100/50 dark:bg-green-900/20 border-t border-green-200 dark:border-green-800 rounded-b-xl">
          <p className="text-xs text-green-700 dark:text-green-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Prompt adaptado e pronto para uso! Clique em "Copiar" ou escolha uma IA.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Ícone para tipo de adaptação
 */
function AdaptationIcon({ type }: { type: PromptAdaptation['type'] }) {
  const icons = {
    fill: '✓',
    remove: '✗',
    transform: '↔',
    append: '+',
    context: '◉',
  };

  return (
    <span className="w-4 h-4 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
      {icons[type] || '•'}
    </span>
  );
}
