import { useState, useEffect, useMemo, useCallback } from 'react';
import DOMPurify from 'dompurify';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  Sparkles,
  Copy,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Upload,
  FileText,
} from 'lucide-react';
import {
  extractVariables,
  fillPromptVariables,
  validateVariables,
  countFilledVariables,
} from '@/lib/promptVariables';
import type { Prompt } from '@/types/prompt';

interface PromptCustomizerProps {
  prompt: Prompt;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PromptCustomizer({ prompt, open, onOpenChange }: PromptCustomizerProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Handler para upload de arquivo
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const validTypes = ['text/plain', 'text/markdown', 'application/pdf'];
    const validExtensions = ['.txt', '.md', '.csv'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      toast({
        title: '❌ Tipo de arquivo não suportado',
        description: 'Use arquivos .txt, .md ou .csv',
        variant: 'destructive',
      });
      return;
    }

    // Validar tamanho (máx 1MB)
    if (file.size > 1024 * 1024) {
      toast({
        title: '❌ Arquivo muito grande',
        description: 'O arquivo deve ter no máximo 1MB',
        variant: 'destructive',
      });
      return;
    }

    try {
      const content = await file.text();
      setUploadedFileName(file.name);

      // Tentar identificar e preencher variáveis automaticamente
      const lines = content.split('\n');
      const newValues: Record<string, string> = { ...values };

      // Procurar por padrões como "VARIAVEL: valor" ou "VARIAVEL = valor"
      for (const line of lines) {
        const match = line.match(/^([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ\s]+)\s*[:=]\s*(.+)$/i);
        if (match) {
          const varName = match[1].trim().toUpperCase();
          const varValue = match[2].trim();
          // Verificar se a variável existe no prompt
          const variable = variables.find(v => v.name === varName);
          if (variable) {
            newValues[varName] = varValue;
          }
        }
      }

      // Se não encontrou padrões, usar todo o conteúdo para a primeira variável de texto longo
      if (Object.keys(newValues).length === Object.keys(values).length) {
        const textareaVar = variables.find(v => v.type === 'textarea');
        if (textareaVar) {
          newValues[textareaVar.name] = content;
        } else if (variables.length > 0) {
          // Usar a primeira variável
          newValues[variables[0].name] = content;
        }
      }

      setValues(newValues);
      toast({
        title: '✅ Arquivo carregado',
        description: `Conteúdo de "${file.name}" importado`,
      });
    } catch (error) {
      toast({
        title: '❌ Erro ao ler arquivo',
        description: 'Não foi possível processar o arquivo',
        variant: 'destructive',
      });
    }

    // Limpar input para permitir re-upload do mesmo arquivo
    event.target.value = '';
  };

  // Extrair variáveis do prompt
  const variables = useMemo(() => extractVariables(prompt.content), [prompt.content]);

  // Prompt personalizado
  const customizedPrompt = useMemo(() => {
    if (variables.length === 0) {
      // Para prompts sem variáveis, adicionar contexto adicional no início se fornecido
      const contextoAdicional = values['CONTEXTO_ADICIONAL']?.trim();
      if (contextoAdicional) {
        return `**CONTEXTO DO USUÁRIO**\n${contextoAdicional}\n\n---\n\n${prompt.content}`;
      }
      return prompt.content;
    }
    return fillPromptVariables(prompt.content, values);
  }, [prompt.content, values, variables]);

  // Estatísticas de preenchimento
  const fillStats = useMemo(() => {
    return countFilledVariables(variables, values);
  }, [variables, values]);

  // Validação
  const validation = useMemo(() => {
    // Para prompts sem variáveis, sempre é válido (contexto adicional é opcional)
    if (variables.length === 0) {
      return { valid: true, errors: [] };
    }
    return validateVariables(variables, values);
  }, [variables, values]);

  // Carregar valores salvos do localStorage
  useEffect(() => {
    if (open) {
      const savedKey = `prompt_values_${prompt.id}`;
      const saved = localStorage.getItem(savedKey);
      if (saved) {
        try {
          setValues(JSON.parse(saved));
        } catch (e) {
          console.warn('Erro ao carregar valores salvos:', e);
        }
      }
    }
  }, [open, prompt.id]);

  // Auto-save no localStorage
  useEffect(() => {
    if (Object.keys(values).length > 0) {
      const savedKey = `prompt_values_${prompt.id}`;
      localStorage.setItem(savedKey, JSON.stringify(values));
    }
  }, [values, prompt.id]);

  const handleValueChange = (varName: string, value: string) => {
    setValues(prev => ({ ...prev, [varName]: value }));
  };

  const handleReset = () => {
    setValues({});
    const savedKey = `prompt_values_${prompt.id}`;
    localStorage.removeItem(savedKey);
    toast({ title: '🔄 Campos resetados' });
  };

  // Formatar prompt para execução direta (remove markdown desnecessário para texto puro)
  const getExecutionReadyPrompt = useCallback(() => {
    let readyPrompt = customizedPrompt;

    // Limpar formatação markdown para texto puro mais limpo
    // Remove ** mas mantém o texto
    readyPrompt = readyPrompt.replace(/\*\*([^*]+)\*\*/g, '$1');

    // Remove --- separadores
    readyPrompt = readyPrompt.replace(/\n---\n/g, '\n\n');

    // Limpar múltiplas quebras de linha
    readyPrompt = readyPrompt.replace(/\n{3,}/g, '\n\n');

    // Trim final
    return readyPrompt.trim();
  }, [customizedPrompt]);

  const handleCopyCustomized = async () => {
    const { valid, errors } = validation;

    if (!valid) {
      toast({
        title: '❌ Campos obrigatórios',
        description: errors[0],
        variant: 'destructive',
      });
      return;
    }

    try {
      const readyPrompt = getExecutionReadyPrompt();
      await navigator.clipboard.writeText(readyPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
      toast({ title: '✅ Prompt copiado e pronto para execução!' });
    } catch (error) {
      toast({
        title: '❌ Erro ao copiar',
        description: 'Não foi possível copiar o prompt',
        variant: 'destructive',
      });
    }
  };

  const handleOpenAI = (aiName: string) => {
    const { valid } = validation;

    if (!valid) {
      toast({
        title: '❌ Preencha todos os campos',
        description: 'Alguns campos obrigatórios estão vazios',
        variant: 'destructive',
      });
      return;
    }

    // URLs das IAs (sem query params - não funcionam de forma confiável)
    const aiUrls: Record<string, string> = {
      chatgpt: 'https://chat.openai.com',
      claude: 'https://claude.ai/new',
      perplexity: 'https://www.perplexity.ai',
      gemini: 'https://gemini.google.com/app',
    };

    const readyPrompt = getExecutionReadyPrompt();

    // Copiar prompt para clipboard
    navigator.clipboard.writeText(readyPrompt).then(() => {
      toast({
        title: '📋 Prompt copiado!',
        description: `Cole com Ctrl+V no ${aiName}`,
      });
    }).catch(() => {
      toast({
        title: '⚠️ Erro ao copiar',
        description: 'Copie o prompt manualmente',
        variant: 'destructive',
      });
    });

    const url = aiUrls[aiName.toLowerCase()] || aiUrls.chatgpt;
    window.open(url, '_blank');
  };

  // Se não tem variáveis, mostrar interface simplificada com campo de contexto adicional
  const hasVariables = variables.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-indigo-600" />
                Personalizar Prompt
              </DialogTitle>
              <DialogDescription className="text-base">
                {prompt.title}
              </DialogDescription>
            </div>

            {/* Progress Badge */}
            {hasVariables ? (
              <Badge
                variant={fillStats.percentage === 100 ? 'default' : 'secondary'}
                className="text-sm px-3 py-1"
              >
                {fillStats.percentage === 100 ? (
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                ) : (
                  <AlertCircle className="w-4 h-4 mr-1" />
                )}
                {fillStats.filled}/{fillStats.total} campos
              </Badge>
            ) : (
              <Badge variant="default" className="text-sm px-3 py-1">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Pronto para usar
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Upload de arquivo */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Importar de arquivo
                </h3>
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                  Faça upload de um arquivo .txt, .md ou .csv para preencher automaticamente os campos.
                </p>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".txt,.md,.csv,text/plain,text/markdown"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-md transition-colors cursor-pointer">
                      <FileText className="w-4 h-4" />
                      Escolher arquivo
                    </span>
                  </label>
                  {uploadedFileName && (
                    <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {uploadedFileName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Formulário de variáveis */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {hasVariables ? 'Ou preencha os campos manualmente:' : 'Adicione contexto personalizado:'}
            </h3>

            {hasVariables ? (
              // Mostrar campos para cada variável
              variables.map((variable) => (
                <div key={variable.name} className="space-y-2">
                  <Label htmlFor={variable.name} className="flex items-center gap-2">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      [{variable.name}]
                    </span>
                    {variable.required && (
                      <span className="text-red-500 text-xs">*obrigatório</span>
                    )}
                  </Label>

                  {variable.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {variable.description}
                    </p>
                  )}

                  {variable.type === 'textarea' ? (
                    <Textarea
                      id={variable.name}
                      value={values[variable.name] || ''}
                      onChange={e => handleValueChange(variable.name, e.target.value)}
                      placeholder={variable.example || `Digite ${variable.name.toLowerCase()}...`}
                      className="min-h-[100px]"
                      maxLength={variable.maxLength}
                    />
                  ) : (
                    <Input
                      id={variable.name}
                      type={variable.type}
                      value={values[variable.name] || ''}
                      onChange={e => handleValueChange(variable.name, e.target.value)}
                      placeholder={variable.example || `Digite ${variable.name.toLowerCase()}...`}
                      maxLength={variable.maxLength}
                    />
                  )}

                  {variable.example && (
                    <p className="text-xs text-gray-500 italic">
                      Exemplo: {variable.example}
                    </p>
                  )}

                  {variable.maxLength && (
                    <p className="text-xs text-gray-500 text-right">
                      {(values[variable.name] || '').length}/{variable.maxLength}
                    </p>
                  )}
                </div>
              ))
            ) : (
              // Mostrar campo genérico de contexto para prompts sem variáveis
              <div className="space-y-2">
                <Label htmlFor="CONTEXTO_ADICIONAL" className="flex items-center gap-2">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    Contexto Adicional
                  </span>
                  <span className="text-gray-500 text-xs">(opcional)</span>
                </Label>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Adicione informações específicas que serão incluídas no início do prompt, como: tema, caso clínico, dados do paciente, etc.
                </p>
                <Textarea
                  id="CONTEXTO_ADICIONAL"
                  value={values['CONTEXTO_ADICIONAL'] || ''}
                  onChange={e => handleValueChange('CONTEXTO_ADICIONAL', e.target.value)}
                  placeholder="Ex: Tema: Insuficiência Cardíaca Congestiva&#10;Paciente: Homem, 65 anos, diabético..."
                  className="min-h-[120px]"
                  maxLength={2000}
                />
                <p className="text-xs text-gray-500 text-right">
                  {(values['CONTEXTO_ADICIONAL'] || '').length}/2000
                </p>
              </div>
            )}
          </div>

          {/* Preview do Prompt Final */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Prompt Final - Pronto para Execução
              </h3>
              {validation.valid && (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Pronto para usar
                </Badge>
              )}
            </div>

            {/* Indicador de variáveis pendentes */}
            {!validation.valid && (
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs">
                <AlertCircle className="w-4 h-4" />
                <span>Preencha todos os campos para ver o prompt final completo</span>
              </div>
            )}

            <div className={`relative rounded-xl border-2 transition-all duration-300 ${
              validation.valid
                ? 'border-green-300 dark:border-green-700 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20'
                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
            }`}>
              {/* Header com título e ações */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {validation.valid ? 'Cole este prompt diretamente na IA' : 'Preview'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyCustomized}
                  disabled={!validation.valid}
                  className="h-7 text-xs gap-1"
                >
                  {copiedPrompt ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>

              {/* Conteúdo do prompt */}
              <div className="p-4 max-h-[350px] overflow-y-auto">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {customizedPrompt.split('\n\n').map((paragraph, idx) => {
                    // Renderizar títulos em negrito
                    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                      return (
                        <h4 key={idx} className="font-bold text-gray-900 dark:text-white mt-4 mb-2 text-sm">
                          {paragraph.replace(/\*\*/g, '')}
                        </h4>
                      );
                    }
                    // Renderizar parágrafos normais com destaque para variáveis não preenchidas
                    const highlightedText = paragraph.replace(
                      /\[([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ\s]+)\]/g,
                      '<span class="bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-1 rounded font-semibold">[$1]</span>'
                    ).replace(
                      /\*\*([^*]+)\*\*/g,
                      '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>'
                    );
                    // Sanitizar HTML para prevenir XSS
                    const sanitizedHtml = DOMPurify.sanitize(highlightedText);
                    return (
                      <p
                        key={idx}
                        className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Footer com dica */}
              {validation.valid && (
                <div className="px-4 py-2 bg-green-100/50 dark:bg-green-900/20 border-t border-green-200 dark:border-green-800 rounded-b-xl">
                  <p className="text-xs text-green-700 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Prompt pronto! Clique em "Copiar" ou escolha uma IA abaixo para executar.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-wrap gap-2 border-t pt-4">
            <Button
              onClick={handleCopyCustomized}
              disabled={!validation.valid}
              className="flex-1"
            >
              {copiedPrompt ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Prompt
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Resetar
            </Button>
          </div>

          {/* Abrir em IAs */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Abrir diretamente em:
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenAI('ChatGPT')}
                disabled={!validation.valid}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                ChatGPT
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenAI('Claude')}
                disabled={!validation.valid}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Claude
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenAI('Perplexity')}
                disabled={!validation.valid}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Perplexity
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenAI('Gemini')}
                disabled={!validation.valid}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Gemini
              </Button>
            </div>
          </div>

          {/* Validation Errors */}
          {!validation.valid && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-800 dark:text-red-200 font-semibold mb-1">
                Campos pendentes:
              </p>
              <ul className="text-xs text-red-700 dark:text-red-300 list-disc list-inside">
                {validation.errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
