/**
 * PromptCustomizationPanel - Painel de Customização de Prompts
 *
 * Interface para editar campos dinâmicos (especialidade, contexto clínico,
 * nível de detalhe) antes de exportar o prompt.
 */

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { toast } from '@/hooks/use-toast';
import {
  Settings2,
  Copy,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  AlertTriangle,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { Prompt } from '@/types/prompt';
import { usePromptCustomization } from '@/hooks/usePromptCustomization';
import {
  CUSTOMIZATION_FIELDS,
  type CustomizationPreferences,
} from '@/types/customization';

interface PromptCustomizationPanelProps {
  prompt: Prompt;
  onExport?: (content: string, isValid: boolean) => void;
  className?: string;
}

export function PromptCustomizationPanel({
  prompt,
  onExport,
  className = '',
}: PromptCustomizationPanelProps) {
  const {
    preferences,
    setPreference,
    resetPreferences,
    applyCustomization,
    hasCustomizations,
  } = usePromptCustomization();

  const [isExpanded, setIsExpanded] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  // Aplica customização ao prompt atual
  const exportedPrompt = useMemo(() => {
    return applyCustomization(prompt);
  }, [prompt, applyCustomization]);

  // Handler para copiar prompt customizado
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(exportedPrompt.content);
      setCopied(true);

      toast({
        title: 'Prompt copiado!',
        description: exportedPrompt.hasEditablePlaceholders
          ? 'Lembre-se de preencher os placeholders editáveis.'
          : 'Prompt pronto para uso.',
      });

      onExport?.(exportedPrompt.content, exportedPrompt.isValid);

      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Erro ao copiar',
        description: 'Tente novamente.',
        variant: 'destructive',
      });
    }
  }, [exportedPrompt, onExport]);

  // Renderiza campo de customização baseado no tipo
  const renderField = useCallback(
    (field: (typeof CUSTOMIZATION_FIELDS)[number]) => {
      const value =
        preferences[field.id as keyof CustomizationPreferences] ?? '';

      switch (field.type) {
        case 'select':
          return (
            <Select
              value={value as string}
              onValueChange={(val) =>
                setPreference(
                  field.id as keyof CustomizationPreferences,
                  val as never
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={field.options?.[0]?.label || 'Selecione...'} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value || '_empty_'}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );

        case 'textarea':
          return (
            <Textarea
              value={value as string}
              onChange={(e) =>
                setPreference(
                  field.id as keyof CustomizationPreferences,
                  e.target.value as never
                )
              }
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              className="min-h-[80px] resize-none"
            />
          );

        default:
          return (
            <Input
              value={value as string}
              onChange={(e) =>
                setPreference(
                  field.id as keyof CustomizationPreferences,
                  e.target.value as never
                )
              }
              placeholder={field.placeholder}
              maxLength={field.maxLength}
            />
          );
      }
    },
    [preferences, setPreference]
  );

  // Destaca placeholders no preview
  const highlightedPreview = useMemo(() => {
    const html = exportedPrompt.content
      // Escapa HTML
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Destaca [PLACEHOLDER]
      .replace(
        /\[([A-ZÀ-Ú][A-ZÀ-Ú\s\-_]+)\]/g,
        '<span class="bg-amber-200 dark:bg-amber-900 px-1 py-0.5 rounded text-amber-800 dark:text-amber-200 font-medium">[$1]</span>'
      )
      // Destaca {{placeholder}}
      .replace(
        /\{\{([a-z_]+)\}\}/g,
        '<span class="bg-blue-200 dark:bg-blue-900 px-1 py-0.5 rounded text-blue-800 dark:text-blue-200 font-medium">{{$1}}</span>'
      );

    return html;
  }, [exportedPrompt.content]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header do Painel */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              <Settings2 className="w-4 h-4" />
              Customização do Prompt
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </CollapsibleTrigger>

          {hasCustomizations && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetPreferences}
              className="h-8 text-xs text-gray-500 hover:text-gray-700"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Resetar
            </Button>
          )}
        </div>

        <CollapsibleContent className="mt-4">
          {/* Campos de Customização */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border">
            {CUSTOMIZATION_FIELDS.map((field) => (
              <div
                key={field.id}
                className={field.type === 'textarea' ? 'md:col-span-2' : ''}
              >
                <Label
                  htmlFor={field.id}
                  className="text-sm font-medium mb-1.5 block"
                >
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </Label>
                <p className="text-xs text-gray-500 mb-2">{field.description}</p>
                {renderField(field)}
                <p className="text-xs text-gray-400 mt-1">
                  Placeholder no output:{' '}
                  <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">
                    {field.outputPlaceholder}
                  </code>
                </p>
              </div>
            ))}
          </div>

          {/* Info sobre Placeholders */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 dark:text-blue-200">
                  Placeholders Editáveis
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-xs mt-1">
                  Campos vazios mantêm placeholders como{' '}
                  <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
                    {'{{ESPECIALIDADE}}'}
                  </code>{' '}
                  ou{' '}
                  <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
                    [INSIRA SEU CASO AQUI]
                  </code>{' '}
                  para você editar depois.
                </p>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Badges de Status */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={exportedPrompt.isValid ? 'default' : 'secondary'}
          className="flex items-center gap-1"
        >
          {exportedPrompt.isValid ? (
            <CheckCircle2 className="w-3 h-3" />
          ) : (
            <AlertTriangle className="w-3 h-3" />
          )}
          {exportedPrompt.isValid ? 'Pronto para exportar' : 'Verificar'}
        </Badge>

        <Badge variant="outline" className="flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          {exportedPrompt.placeholders.length} placeholders
        </Badge>

        {hasCustomizations && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Settings2 className="w-3 h-3" />
            Customizado
          </Badge>
        )}
      </div>

      {/* Alertas de Validação */}
      {exportedPrompt.validationErrors.length > 0 && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200 text-sm">
                Atenção
              </p>
              <ul className="text-xs text-amber-700 dark:text-amber-300 mt-1 space-y-1">
                {exportedPrompt.validationErrors.map((error, i) => (
                  <li key={i}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Preview Toggle */}
      <div className="border rounded-lg overflow-hidden">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <span className="text-sm font-medium flex items-center gap-2">
            {showPreview ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            {showPreview ? 'Ocultar Preview' : 'Ver Preview do Prompt'}
          </span>
          {showPreview ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showPreview && (
          <div className="p-4 max-h-[300px] overflow-y-auto border-t">
            <pre
              className="text-sm whitespace-pre-wrap font-mono leading-relaxed"
              dangerouslySetInnerHTML={{ __html: highlightedPreview }}
            />
          </div>
        )}
      </div>

      {/* Botão de Copiar */}
      <Button
        onClick={handleCopy}
        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white"
        size="lg"
      >
        {copied ? (
          <>
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Copiado!
          </>
        ) : (
          <>
            <Copy className="w-5 h-5 mr-2" />
            Copiar Prompt Customizado
          </>
        )}
      </Button>

      {/* Lista de Placeholders */}
      {exportedPrompt.placeholders.length > 0 && (
        <div className="text-xs text-gray-500">
          <p className="font-medium mb-1">
            Placeholders incluídos no output:
          </p>
          <div className="flex flex-wrap gap-1">
            {exportedPrompt.placeholders.map((p, i) => (
              <code
                key={i}
                className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded"
              >
                {p}
              </code>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PromptCustomizationPanel;
