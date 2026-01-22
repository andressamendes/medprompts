/**
 * Campo de entrada contextual inteligente
 * Interface principal para o sistema de geração contextual
 */

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Sparkles,
  Loader2,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { EntityBadges } from './EntityBadges';
import type { ExtractedEntities, ContextualIntent } from '@/types/contextual';
import type { Prompt } from '@/types/prompt';

interface ContextualInputProps {
  /** Valor atual do input */
  value: string;
  /** Callback quando valor muda */
  onChange: (value: string) => void;
  /** Entidades extraídas */
  entities: ExtractedEntities | null;
  /** Intent contextual */
  intent: ContextualIntent | null;
  /** Indica se está processando */
  isProcessing?: boolean;
  /** Callback quando um prompt alternativo é selecionado */
  onSelectAlternative?: (prompt: Prompt) => void;
  /** Placeholder customizado */
  placeholder?: string;
  /** Classe CSS adicional */
  className?: string;
}

const DEFAULT_PLACEHOLDER = `Descreva o que você quer estudar ou criar...

Exemplos:
• "Criar flashcards sobre arritmias cardíacas para residência"
• "Revisar diabetes mellitus para prova de clínica médica"
• "Simular caso clínico de emergência com dor torácica"
• "Resumo de farmacologia dos antibióticos"`;

/**
 * Campo de entrada contextual com detecção de entidades
 */
export function ContextualInput({
  value,
  onChange,
  entities,
  intent,
  isProcessing = false,
  onSelectAlternative,
  placeholder = DEFAULT_PLACEHOLDER,
  className = '',
}: ContextualInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Campo de entrada principal */}
      <div className="relative">
        <Label htmlFor="contextual-input" className="sr-only">
          Descreva o que você quer estudar
        </Label>

        <div className="relative">
          <Textarea
            id="contextual-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-[140px] text-base pr-10 resize-none bg-white dark:bg-gray-950 border-2 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
          />

          {/* Indicador de processamento */}
          {isProcessing && (
            <div className="absolute right-3 top-3">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600 dark:text-indigo-400" />
            </div>
          )}

          {/* Indicador de sucesso */}
          {!isProcessing && entities && entities.confidence > 0.5 && (
            <div className="absolute right-3 top-3">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          )}
        </div>

        {/* Dica de uso */}
        {!value && (
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Lightbulb className="w-4 h-4" />
            <span>Seja específico sobre o tema, formato e nível para melhores resultados</span>
          </div>
        )}
      </div>

      {/* Badges de entidades detectadas */}
      {entities && value.trim() && (
        <EntityBadges entities={entities} />
      )}

      {/* Prompt selecionado */}
      {intent?.primaryPrompt && value.trim() && (
        <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                {intent.primaryPrompt.title}
              </span>
              <Badge variant="outline" className="text-xs">
                {intent.matchScore}% match
              </Badge>
            </div>

            {/* Botão para ver alternativas */}
            {intent.alternativePrompts.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="text-xs gap-1"
              >
                {intent.alternativePrompts.length} alternativa{intent.alternativePrompts.length > 1 ? 's' : ''}
                {showSuggestions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </Button>
            )}
          </div>

          {/* Notas de adaptação */}
          {intent.adaptationNotes.length > 0 && (
            <div className="mt-2 text-xs text-indigo-700 dark:text-indigo-300">
              {intent.adaptationNotes.map((note, idx) => (
                <p key={idx} className="flex items-start gap-1">
                  <span>•</span>
                  <span>{note}</span>
                </p>
              ))}
            </div>
          )}

          {/* Lista de alternativas */}
          {showSuggestions && intent.alternativePrompts.length > 0 && (
            <div className="mt-3 pt-3 border-t border-indigo-200 dark:border-indigo-700 space-y-2">
              <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                Prompts alternativos:
              </p>
              {intent.alternativePrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => {
                    onSelectAlternative?.(prompt);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left p-2 rounded-md bg-white/50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-900 border border-transparent hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {prompt.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                    {prompt.description}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface PendingFieldsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingVariables: string[];
  values: Record<string, string>;
  onValueChange: (varName: string, value: string) => void;
  onConfirm: () => void;
}

/**
 * Dialog para preencher campos pendentes
 */
export function PendingFieldsDialog({
  open,
  onOpenChange,
  pendingVariables,
  values,
  onValueChange,
  onConfirm,
}: PendingFieldsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Campos Pendentes</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para completar o prompt
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {pendingVariables.map(varName => (
            <div key={varName} className="space-y-2">
              <Label htmlFor={`field-${varName}`} className="font-medium">
                [{varName}]
              </Label>
              {varName.toLowerCase().includes('texto') ||
               varName.toLowerCase().includes('conteudo') ||
               varName.toLowerCase().includes('artigo') ? (
                <Textarea
                  id={`field-${varName}`}
                  value={values[varName] || ''}
                  onChange={(e) => onValueChange(varName, e.target.value)}
                  placeholder={`Digite ${varName.toLowerCase()}...`}
                  className="min-h-[100px]"
                />
              ) : (
                <Input
                  id={`field-${varName}`}
                  value={values[varName] || ''}
                  onChange={(e) => onValueChange(varName, e.target.value)}
                  placeholder={`Digite ${varName.toLowerCase()}...`}
                />
              )}
            </div>
          ))}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={onConfirm}>
              Confirmar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
