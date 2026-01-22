/**
 * PromptCustomizer - Interface Simplificada de Personalização
 * Foco no prompt com edição inline de variáveis
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import {
  Copy,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  Upload,
  Link,
  X,
  Plus,
  FileType,
  Loader2,
  Globe,
  ChevronDown,
  ChevronRight,
  Wand2,
  Sparkles,
  Edit3,
} from 'lucide-react';
import { parseFile, truncateContent, isContentParseable } from '@/lib/fileParser';
import { useContextualPrompt } from '@/hooks/useContextualPrompt';
import { preparePromptForExecution } from '@/lib/contextual';
import { prompts as allPrompts } from '@/data/prompts-data';
import type { Prompt } from '@/types/prompt';

// Tipos de material suportados
type MaterialType = 'pdf' | 'link' | 'image' | 'text' | 'video' | 'docx' | 'url-content' | 'unknown';

interface AttachedMaterial {
  id: string;
  type: MaterialType;
  name: string;
  url?: string;
  content?: string;
  isParsed?: boolean;
}

// Detecta o tipo de material
function detectMaterialType(input: string): MaterialType {
  const lower = input.toLowerCase();
  if (lower.includes('youtube.com') || lower.includes('youtu.be') || lower.includes('vimeo.com')) return 'video';
  if (lower.endsWith('.pdf') || lower.includes('/pdf')) return 'pdf';
  if (lower.endsWith('.docx')) return 'docx';
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(lower)) return 'image';
  if (/\.(txt|md|csv)$/i.test(lower)) return 'text';
  if (lower.startsWith('http://') || lower.startsWith('https://')) return 'link';
  return 'unknown';
}

function generateMaterialId(): string {
  return `material_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

function getMaterialIcon(type: MaterialType): string {
  const icons: Record<MaterialType, string> = {
    pdf: '📄', docx: '📃', link: '🔗', image: '🖼️',
    video: '🎬', text: '📝', 'url-content': '🌐', unknown: '📎',
  };
  return icons[type];
}

interface PromptCustomizerProps {
  prompt: Prompt;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Extrai variáveis do conteúdo do prompt
 */
function extractVariables(content: string): string[] {
  const regex = /\[([A-Za-zÀ-ÖØ-öø-ÿ0-9_\-\s]+)\]/g;
  const variables: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }
  return variables;
}

export function PromptCustomizer({ prompt, open, onOpenChange }: PromptCustomizerProps) {
  // Estados principais
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [editingVariable, setEditingVariable] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Estados de anexos
  const [attachedMaterials, setAttachedMaterials] = useState<AttachedMaterial[]>([]);
  const [materialsOpen, setMaterialsOpen] = useState(false);
  const [smartFillOpen, setSmartFillOpen] = useState(false);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkName, setNewLinkName] = useState('');
  const [materialTab, setMaterialTab] = useState<string>('upload');
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [urlContent, setUrlContent] = useState('');
  const [urlContentName, setUrlContentName] = useState('');

  // Referências para os inputs de edição
  const editInputRef = useRef<HTMLInputElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Conteúdo combinado dos materiais
  const combinedAttachedContent = attachedMaterials
    .filter(m => m.isParsed && m.content)
    .map(m => m.content)
    .join('\n\n---\n\n');

  // Hook do sistema contextual (para smart fill)
  const {
    input: smartInput,
    setInput: setSmartInput,
    entities,
    intent,
    adaptedPrompt: smartAdaptedPrompt,
    isProcessing,
    setAttachedContent,
    reset: resetSmartFill,
  } = useContextualPrompt({
    prompts: allPrompts,
    debounceMs: 400,
  });

  // Atualizar conteúdo anexado
  useEffect(() => {
    setAttachedContent(combinedAttachedContent);
  }, [combinedAttachedContent, setAttachedContent]);

  // Reset ao abrir
  useEffect(() => {
    if (open) {
      setVariableValues({});
      setEditingVariable(null);
      setSmartFillOpen(false);
      setMaterialsOpen(false);
      resetSmartFill();
    }
  }, [open, prompt.id]);

  // Foco no input quando editar
  useEffect(() => {
    if (editingVariable && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingVariable]);

  // Extrair variáveis do prompt
  const variables = useMemo(() => extractVariables(prompt.content), [prompt.content]);

  // Aplicar valores das variáveis ao prompt
  const processedContent = useMemo(() => {
    let content = prompt.content;

    // Substituir variáveis preenchidas
    for (const [varName, value] of Object.entries(variableValues)) {
      if (value.trim()) {
        content = content.split(`[${varName}]`).join(value);
      }
    }

    // Injetar conteúdo anexado se houver
    if (combinedAttachedContent) {
      // Verificar se existe variável de texto/conteúdo
      const textVars = ['TEXTO', 'ARTIGO', 'CONTEUDO A MEMORIZAR', 'MATERIAL'];
      let injected = false;

      for (const textVar of textVars) {
        if (content.includes(`[${textVar}]`)) {
          content = content.split(`[${textVar}]`).join(combinedAttachedContent);
          injected = true;
          break;
        }
      }

      if (!injected) {
        content += `\n\n---\n\n**MATERIAL ANEXADO:**\n\n${combinedAttachedContent}`;
      }
    }

    return content;
  }, [prompt.content, variableValues, combinedAttachedContent]);

  // Variáveis pendentes (não preenchidas)
  const pendingVariables = useMemo(() => {
    return variables.filter(v => {
      // Verificar se foi preenchida manualmente
      if (variableValues[v]?.trim()) return false;
      // Verificar se foi preenchida por material anexado
      const textVars = ['TEXTO', 'ARTIGO', 'CONTEUDO A MEMORIZAR', 'MATERIAL'];
      if (textVars.includes(v) && combinedAttachedContent) return false;
      return true;
    });
  }, [variables, variableValues, combinedAttachedContent]);

  // Verificar se está pronto
  const isReady = pendingVariables.length === 0;

  // Handler para atualizar variável
  const handleVariableChange = (varName: string, value: string) => {
    setVariableValues(prev => ({ ...prev, [varName]: value }));
  };

  // Aplicar sugestões do smart fill
  const applySmartFill = () => {
    if (smartAdaptedPrompt?.filledVariables && intent?.inferredValues) {
      const newValues = { ...variableValues };
      for (const varName of smartAdaptedPrompt.filledVariables) {
        if (intent.inferredValues[varName]) {
          newValues[varName] = intent.inferredValues[varName];
        }
      }
      setVariableValues(newValues);
      toast({ title: 'Campos preenchidos automaticamente!' });
      setSmartFillOpen(false);
    }
  };

  // Handler para copiar
  const handleCopyPrompt = async () => {
    try {
      const readyPrompt = preparePromptForExecution(processedContent);
      await navigator.clipboard.writeText(readyPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
      toast({ title: 'Prompt copiado!' });
    } catch {
      toast({ title: 'Erro ao copiar', variant: 'destructive' });
    }
  };

  // Handler para abrir em IA
  const handleOpenAI = (aiName: string) => {
    if (!isReady) {
      toast({
        title: 'Preencha os campos',
        description: `Ainda há ${pendingVariables.length} campo(s) para preencher`,
        variant: 'destructive',
      });
      return;
    }

    const aiUrls: Record<string, string> = {
      chatgpt: 'https://chat.openai.com',
      claude: 'https://claude.ai/new',
      perplexity: 'https://www.perplexity.ai',
      gemini: 'https://gemini.google.com/app',
      notebooklm: 'https://notebooklm.google.com',
    };

    const readyPrompt = preparePromptForExecution(processedContent);
    navigator.clipboard.writeText(readyPrompt).then(() => {
      toast({ title: 'Prompt copiado!', description: `Cole com Ctrl+V no ${aiName}` });
    });

    const url = aiUrls[aiName.toLowerCase()] || aiUrls.chatgpt;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Handler para reset
  const handleReset = () => {
    setVariableValues({});
    setAttachedMaterials([]);
    setSmartInput('');
    resetSmartFill();
    toast({ title: 'Campos resetados' });
  };

  // Handler para upload de arquivo
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validExtensions = ['.txt', '.md', '.csv', '.pdf', '.docx'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

    if (!validExtensions.includes(fileExtension)) {
      toast({ title: 'Tipo não suportado', description: 'Use PDF, DOCX ou TXT', variant: 'destructive' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'Arquivo muito grande', description: 'Máximo 10MB', variant: 'destructive' });
      return;
    }

    const materialType = detectMaterialType(file.name);
    const canParse = isContentParseable(file.name);

    if (canParse) {
      setIsParsingFile(true);
      try {
        const result = await parseFile(file);
        if (result.success && result.content) {
          const content = truncateContent(result.content, 15000);
          setAttachedMaterials(prev => [...prev, {
            id: generateMaterialId(),
            type: materialType,
            name: file.name,
            content,
            isParsed: true,
          }]);
          toast({ title: 'Conteúdo extraído', description: `${content.split(/\s+/).length} palavras` });
        } else {
          toast({ title: 'Erro ao extrair', description: result.error, variant: 'destructive' });
        }
      } catch {
        toast({ title: 'Erro ao processar', variant: 'destructive' });
      } finally {
        setIsParsingFile(false);
      }
    }
    event.target.value = '';
  };

  // Handler para adicionar link
  const handleAddLink = () => {
    const url = newLinkUrl.trim();
    if (!url) return;

    try {
      const parsedUrl = new URL(url);
      if (['javascript:', 'data:', 'vbscript:'].includes(parsedUrl.protocol)) {
        toast({ title: 'URL não permitida', variant: 'destructive' });
        return;
      }
    } catch {
      toast({ title: 'URL inválida', variant: 'destructive' });
      return;
    }

    const name = newLinkName.trim() || new URL(url).hostname;
    setAttachedMaterials(prev => [...prev, {
      id: generateMaterialId(),
      type: detectMaterialType(url),
      name,
      url,
      isParsed: false,
    }]);
    setNewLinkUrl('');
    setNewLinkName('');
    toast({ title: 'Link adicionado' });
  };

  // Handler para colar conteúdo
  const handleAddUrlContent = () => {
    const content = urlContent.trim();
    if (!content) return;

    const name = urlContentName.trim() || 'Conteúdo colado';
    setAttachedMaterials(prev => [...prev, {
      id: generateMaterialId(),
      type: 'url-content',
      name,
      content: truncateContent(content, 15000),
      isParsed: true,
    }]);
    setUrlContent('');
    setUrlContentName('');
    toast({ title: 'Conteúdo adicionado' });
  };

  // Renderizar variável clicável
  const renderClickableVariable = (varName: string) => {
    const value = variableValues[varName];
    const isFilled = value?.trim();

    return (
      <Popover
        key={varName}
        open={editingVariable === varName}
        onOpenChange={(open: boolean) => setEditingVariable(open ? varName : null)}
      >
        <PopoverTrigger asChild>
          <button
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm font-medium transition-all ${
              isFilled
                ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                : 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-800 animate-pulse'
            }`}
          >
            {isFilled ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                {value.length > 30 ? value.substring(0, 30) + '...' : value}
              </>
            ) : (
              <>
                <Edit3 className="w-3 h-3" />
                [{varName}]
              </>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-3" align="start">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {varName}
            </label>
            {varName.toLowerCase().includes('texto') ||
             varName.toLowerCase().includes('conteudo') ||
             varName.toLowerCase().includes('artigo') ? (
              <Textarea
                ref={editTextareaRef}
                value={value || ''}
                onChange={(e) => handleVariableChange(varName, e.target.value)}
                placeholder={`Digite ${varName.toLowerCase()}...`}
                className="min-h-[80px]"
              />
            ) : (
              <Input
                ref={editInputRef}
                value={value || ''}
                onChange={(e) => handleVariableChange(varName, e.target.value)}
                placeholder={`Ex: ${getPlaceholderExample(varName)}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setEditingVariable(null);
                  }
                }}
              />
            )}
            <Button
              size="sm"
              className="w-full"
              onClick={() => setEditingVariable(null)}
            >
              Confirmar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  // Renderizar conteúdo do prompt com variáveis clicáveis
  const renderPromptContent = () => {
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    const regex = /\[([A-Za-zÀ-ÖØ-öø-ÿ0-9_\-\s]+)\]/g;
    let match;

    // Usar o conteúdo original para mostrar variáveis
    const content = prompt.content;

    while ((match = regex.exec(content)) !== null) {
      // Texto antes da variável
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }

      const varName = match[1];

      // Verificar se é uma variável de texto que foi preenchida por material
      const textVars = ['TEXTO', 'ARTIGO', 'CONTEUDO A MEMORIZAR', 'MATERIAL'];
      if (textVars.includes(varName) && combinedAttachedContent) {
        parts.push(
          <span key={`filled-${varName}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm font-medium bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200">
            <CheckCircle2 className="w-3 h-3" />
            [Material anexado]
          </span>
        );
      } else if (variableValues[varName]?.trim()) {
        // Variável preenchida manualmente
        parts.push(renderClickableVariable(varName));
      } else {
        // Variável pendente
        parts.push(renderClickableVariable(varName));
      }

      lastIndex = match.index + match[0].length;
    }

    // Texto restante
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts;
  };

  const parsedMaterialsCount = attachedMaterials.filter(m => m.isParsed).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            {prompt.title}
          </DialogTitle>
          <DialogDescription>
            Clique nos campos destacados para preencher
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isReady ? (
                <Badge className="bg-green-600">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Pronto para usar
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                  {pendingVariables.length} campo{pendingVariables.length > 1 ? 's' : ''} para preencher
                </Badge>
              )}

              {parsedMaterialsCount > 0 && (
                <Badge variant="outline" className="text-green-700 border-green-300">
                  <FileType className="w-3 h-3 mr-1" />
                  {parsedMaterialsCount} material anexado
                </Badge>
              )}
            </div>

            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Limpar
            </Button>
          </div>

          {/* Conteúdo do Prompt */}
          <div className="rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 p-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {renderPromptContent()}
              </div>
            </div>
          </div>

          {/* Preenchimento Inteligente (colapsável) */}
          <Collapsible open={smartFillOpen} onOpenChange={setSmartFillOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4" />
                  Preenchimento automático
                </span>
                {smartFillOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Descreva o que você quer estudar e preencheremos os campos automaticamente:
                </p>
                <Textarea
                  value={smartInput}
                  onChange={(e) => setSmartInput(e.target.value)}
                  placeholder="Ex: Quero criar flashcards sobre arritmias cardíacas para a prova de residência"
                  className="min-h-[80px] bg-white dark:bg-gray-900"
                />

                {isProcessing && (
                  <div className="flex items-center gap-2 text-sm text-indigo-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analisando...
                  </div>
                )}

                {entities && entities.confidence > 0.3 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Detectamos:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {entities.medicalTopic && (
                        <Badge variant="secondary" className="text-xs">
                          Tema: {entities.medicalTopic}
                        </Badge>
                      )}
                      {entities.specialty && (
                        <Badge variant="secondary" className="text-xs">
                          Área: {entities.specialty}
                        </Badge>
                      )}
                      {entities.academicLevel && (
                        <Badge variant="secondary" className="text-xs">
                          Nível: {entities.academicLevel}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  onClick={applySmartFill}
                  disabled={!smartAdaptedPrompt?.filledVariables?.length}
                  className="w-full"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Preencher campos automaticamente
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Anexar Material (colapsável) */}
          <Collapsible open={materialsOpen} onOpenChange={setMaterialsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <FileType className="w-4 h-4" />
                  Anexar material
                  {parsedMaterialsCount > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {parsedMaterialsCount}
                    </Badge>
                  )}
                </span>
                {materialsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-4">
                <Tabs value={materialTab} onValueChange={setMaterialTab}>
                  <TabsList className="grid w-full grid-cols-3 mb-3">
                    <TabsTrigger value="upload">
                      <Upload className="w-4 h-4 mr-1" />
                      Arquivo
                    </TabsTrigger>
                    <TabsTrigger value="link">
                      <Link className="w-4 h-4 mr-1" />
                      Link
                    </TabsTrigger>
                    <TabsTrigger value="paste">
                      <Globe className="w-4 h-4 mr-1" />
                      Colar
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="space-y-2">
                    <label className={`cursor-pointer ${isParsingFile ? 'pointer-events-none opacity-50' : ''}`}>
                      <input
                        type="file"
                        accept=".txt,.md,.csv,.pdf,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={isParsingFile}
                      />
                      <span className="flex items-center justify-center gap-2 w-full px-3 py-3 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-md border-2 border-dashed border-blue-300 dark:border-blue-700 cursor-pointer">
                        {isParsingFile ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Extraindo...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Clique para selecionar (PDF, DOCX, TXT)
                          </>
                        )}
                      </span>
                    </label>
                  </TabsContent>

                  <TabsContent value="link" className="space-y-2">
                    <Input
                      placeholder="https://exemplo.com/artigo"
                      value={newLinkUrl}
                      onChange={e => setNewLinkUrl(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nome (opcional)"
                        value={newLinkName}
                        onChange={e => setNewLinkName(e.target.value)}
                        className="flex-1"
                      />
                      <Button size="sm" onClick={handleAddLink}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="paste" className="space-y-2">
                    <Input
                      placeholder="Título do conteúdo"
                      value={urlContentName}
                      onChange={e => setUrlContentName(e.target.value)}
                    />
                    <Textarea
                      placeholder="Cole o conteúdo aqui..."
                      value={urlContent}
                      onChange={e => setUrlContent(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <Button size="sm" onClick={handleAddUrlContent} className="w-full">
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  </TabsContent>
                </Tabs>

                {/* Lista de materiais */}
                {attachedMaterials.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700 space-y-2">
                    {attachedMaterials.map(material => (
                      <div
                        key={material.id}
                        className={`flex items-center justify-between px-3 py-2 rounded-md ${
                          material.isParsed
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{getMaterialIcon(material.type)}</span>
                          <span className="text-sm truncate max-w-[200px]">{material.name}</span>
                          {material.isParsed && (
                            <Badge variant="secondary" className="text-xs bg-green-200 text-green-800">
                              Extraído
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAttachedMaterials(prev => prev.filter(m => m.id !== material.id))}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Ações */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button
              onClick={handleCopyPrompt}
              disabled={!isReady}
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
          </div>

          {/* Abrir em IAs */}
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ou abra diretamente em:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {['ChatGPT', 'Claude', 'Perplexity', 'Gemini', 'NotebookLM'].map(ai => (
                <Button
                  key={ai}
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenAI(ai)}
                  disabled={!isReady}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  {ai}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Retorna exemplo de placeholder baseado no nome da variável
 */
function getPlaceholderExample(varName: string): string {
  const normalized = varName.toLowerCase();

  if (normalized.includes('tema') || normalized.includes('topico')) {
    return 'Insuficiência cardíaca';
  }
  if (normalized.includes('especialidade')) {
    return 'Cardiologia';
  }
  if (normalized.includes('nivel')) {
    return 'Intermediário';
  }
  if (normalized.includes('contexto')) {
    return 'Ambulatório';
  }
  if (normalized.includes('data') || normalized.includes('prazo')) {
    return '15/02/2025';
  }
  if (normalized.includes('quantidade') || normalized.includes('numero')) {
    return '10';
  }

  return varName.toLowerCase();
}
