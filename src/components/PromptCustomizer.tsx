/**
 * PromptCustomizer - Sistema de Geração Contextual Inteligente
 * Interface unificada para personalização de prompts médicos
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import {
  Sparkles,
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
} from 'lucide-react';
import { parseFile, truncateContent, isContentParseable } from '@/lib/fileParser';
import { useContextualPrompt } from '@/hooks/useContextualPrompt';
import { ContextualInput, PendingFieldsDialog } from '@/components/contextual';
import { AdaptivePreview } from '@/components/contextual/AdaptivePreview';
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

// Detecta o tipo de material baseado na URL ou nome do arquivo
function detectMaterialType(input: string): MaterialType {
  const lower = input.toLowerCase();

  if (lower.includes('youtube.com') || lower.includes('youtu.be') || lower.includes('vimeo.com')) {
    return 'video';
  }
  if (lower.endsWith('.pdf') || lower.includes('/pdf') || lower.includes('pdf.')) {
    return 'pdf';
  }
  if (lower.endsWith('.docx')) {
    return 'docx';
  }
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(lower)) {
    return 'image';
  }
  if (/\.(txt|md|csv)$/i.test(lower)) {
    return 'text';
  }
  if (lower.startsWith('http://') || lower.startsWith('https://')) {
    return 'link';
  }
  return 'unknown';
}

// Gera ID único para materiais
function generateMaterialId(): string {
  return `material_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

// Retorna emoji para o tipo de material
function getMaterialIcon(type: MaterialType): string {
  const icons: Record<MaterialType, string> = {
    pdf: '📄',
    docx: '📃',
    link: '🔗',
    image: '🖼️',
    video: '🎬',
    text: '📝',
    'url-content': '🌐',
    unknown: '📎',
  };
  return icons[type];
}

interface PromptCustomizerProps {
  prompt: Prompt;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PromptCustomizer({ prompt, open, onOpenChange }: PromptCustomizerProps) {
  // Estado para materiais anexados
  const [attachedMaterials, setAttachedMaterials] = useState<AttachedMaterial[]>([]);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkName, setNewLinkName] = useState('');
  const [materialTab, setMaterialTab] = useState<string>('upload');
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [urlContent, setUrlContent] = useState('');
  const [urlContentName, setUrlContentName] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [pendingDialogOpen, setPendingDialogOpen] = useState(false);

  // Combina conteúdo de todos os materiais anexados
  const combinedAttachedContent = attachedMaterials
    .filter(m => m.isParsed && m.content)
    .map(m => m.content)
    .join('\n\n---\n\n');

  // Hook do sistema contextual
  const {
    input,
    setInput,
    entities,
    intent,
    adaptedPrompt,
    isReady,
    isProcessing,
    setAttachedContent,
    fillVariable,
    manualValues,
    selectAlternativePrompt,
    reset,
  } = useContextualPrompt({
    prompts: allPrompts,
    debounceMs: 300,
    onPromptReady: () => {
      // Callback opcional quando prompt fica pronto
    },
  });

  // Atualizar conteúdo anexado quando materiais mudam
  useEffect(() => {
    setAttachedContent(combinedAttachedContent);
  }, [combinedAttachedContent, setAttachedContent]);

  // Pré-preencher input com informações do prompt selecionado
  useEffect(() => {
    if (open && prompt) {
      // Sugerir input baseado no título do prompt
      const suggestion = `${prompt.title.toLowerCase().replace('gerador de ', '').replace('otimizados para anki', '')}`;
      if (!input) {
        setInput(suggestion);
      }
    }
  }, [open, prompt]);

  // Handler para upload de arquivo
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validExtensions = ['.txt', '.md', '.csv', '.pdf', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

    if (!validExtensions.includes(fileExtension)) {
      toast({
        title: 'Tipo de arquivo nao suportado',
        description: 'Use arquivos .pdf, .docx, .txt, .md, .csv ou imagens',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo deve ter no maximo 10MB',
        variant: 'destructive',
      });
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

          const newMaterial: AttachedMaterial = {
            id: generateMaterialId(),
            type: materialType,
            name: file.name,
            content,
            isParsed: true,
          };

          setAttachedMaterials(prev => [...prev, newMaterial]);

          const wordCount = result.metadata?.wordCount || content.split(/\s+/).length;
          toast({
            title: 'Conteudo extraido com sucesso',
            description: `${file.name}: ${wordCount} palavras extraidas`,
          });
        } else {
          const newMaterial: AttachedMaterial = {
            id: generateMaterialId(),
            type: materialType,
            name: file.name,
            isParsed: false,
          };

          setAttachedMaterials(prev => [...prev, newMaterial]);

          toast({
            title: 'Arquivo anexado como referencia',
            description: result.error || 'Nao foi possivel extrair o conteudo',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Erro ao processar arquivo:', error);
        toast({
          title: 'Erro ao processar arquivo',
          description: 'Tente novamente ou use outro formato',
          variant: 'destructive',
        });
      } finally {
        setIsParsingFile(false);
      }
    } else {
      const newMaterial: AttachedMaterial = {
        id: generateMaterialId(),
        type: materialType,
        name: file.name,
        isParsed: false,
      };

      setAttachedMaterials(prev => [...prev, newMaterial]);

      toast({
        title: 'Arquivo anexado',
        description: `"${file.name}" adicionado como referencia`,
      });
    }

    event.target.value = '';
  };

  // Handler para adicionar link
  const handleAddLink = () => {
    const url = newLinkUrl.trim();
    if (!url) {
      toast({
        title: 'URL invalida',
        description: 'Digite uma URL valida',
        variant: 'destructive',
      });
      return;
    }

    try {
      const parsedUrl = new URL(url);
      const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
      if (dangerousProtocols.some(proto => parsedUrl.protocol === proto)) {
        toast({
          title: 'URL nao permitida',
          description: 'Use apenas URLs http:// ou https://',
          variant: 'destructive',
        });
        return;
      }
    } catch {
      toast({
        title: 'URL invalida',
        description: 'Digite uma URL valida comecando com http:// ou https://',
        variant: 'destructive',
      });
      return;
    }

    const materialType = detectMaterialType(url);

    let name = newLinkName.trim();
    if (!name) {
      try {
        const urlObj = new URL(url);
        name = urlObj.hostname + (urlObj.pathname !== '/' ? urlObj.pathname.split('/').pop() : '');
      } catch {
        name = url.substring(0, 50);
      }
    }

    const newMaterial: AttachedMaterial = {
      id: generateMaterialId(),
      type: materialType,
      name,
      url,
      isParsed: false,
    };

    setAttachedMaterials(prev => [...prev, newMaterial]);
    setNewLinkUrl('');
    setNewLinkName('');

    toast({
      title: 'Link adicionado',
      description: `"${name}" sera incluido no prompt`,
    });
  };

  // Handler para adicionar conteúdo de URL
  const handleAddUrlContent = () => {
    const content = urlContent.trim();
    const name = urlContentName.trim() || 'Conteudo da Web';

    if (!content) {
      toast({
        title: 'Conteudo vazio',
        description: 'Cole o conteudo da pagina web',
        variant: 'destructive',
      });
      return;
    }

    const truncatedContent = truncateContent(content, 15000);

    const newMaterial: AttachedMaterial = {
      id: generateMaterialId(),
      type: 'url-content',
      name,
      content: truncatedContent,
      isParsed: true,
    };

    setAttachedMaterials(prev => [...prev, newMaterial]);
    setUrlContent('');
    setUrlContentName('');

    const wordCount = truncatedContent.split(/\s+/).length;
    toast({
      title: 'Conteudo adicionado',
      description: `${wordCount} palavras do conteudo web`,
    });
  };

  // Handler para remover material
  const handleRemoveMaterial = (id: string) => {
    setAttachedMaterials(prev => prev.filter(m => m.id !== id));
  };

  // Handler para reset
  const handleReset = () => {
    reset();
    setAttachedMaterials([]);
    setNewLinkUrl('');
    setNewLinkName('');
    setUrlContent('');
    setUrlContentName('');
    toast({ title: 'Campos e materiais resetados' });
  };

  // Handler para copiar prompt
  const handleCopyPrompt = async () => {
    if (!adaptedPrompt) return;

    try {
      const readyPrompt = preparePromptForExecution(adaptedPrompt.adapted);
      await navigator.clipboard.writeText(readyPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
      toast({ title: 'Prompt copiado e pronto para execucao!' });
    } catch (error) {
      toast({
        title: 'Erro ao copiar',
        description: 'Nao foi possivel copiar o prompt',
        variant: 'destructive',
      });
    }
  };

  // Handler para abrir em IA
  const handleOpenAI = (aiName: string) => {
    if (!adaptedPrompt || !isReady) {
      if (adaptedPrompt && adaptedPrompt.pendingVariables.length > 0) {
        setPendingDialogOpen(true);
        return;
      }
      toast({
        title: 'Prompt incompleto',
        description: 'Descreva o que voce quer estudar primeiro',
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

    const readyPrompt = preparePromptForExecution(adaptedPrompt.adapted);

    navigator.clipboard.writeText(readyPrompt).then(() => {
      toast({
        title: 'Prompt copiado!',
        description: `Cole com Ctrl+V no ${aiName}`,
      });
    }).catch(() => {
      toast({
        title: 'Erro ao copiar',
        description: 'Copie o prompt manualmente',
        variant: 'destructive',
      });
    });

    const url = aiUrls[aiName.toLowerCase()] || aiUrls.chatgpt;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Contagem de materiais com conteúdo
  const parsedMaterialsCount = attachedMaterials.filter(m => m.isParsed).length;

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

            {/* Status Badge */}
            <Badge
              variant={isReady ? 'default' : 'secondary'}
              className={`text-sm px-3 py-1 ${isReady ? 'bg-green-600' : ''}`}
            >
              {isReady ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Pronto
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-1" />
                  Descreva seu objetivo
                </>
              )}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Input Contextual Inteligente */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">
                Descreva o que voce quer estudar
              </h3>
            </div>

            <ContextualInput
              value={input}
              onChange={setInput}
              entities={entities}
              intent={intent}
              isProcessing={isProcessing}
              onSelectAlternative={selectAlternativePrompt}
            />
          </div>

          {/* Seção de Materiais - Upload, Links ou Conteúdo */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileType className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                Anexar Material (Opcional)
              </h3>
              {attachedMaterials.length > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {parsedMaterialsCount} com conteudo / {attachedMaterials.length} total
                </Badge>
              )}
            </div>

            {parsedMaterialsCount > 0 && (
              <div className="mb-3 p-2 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-md">
                <p className="text-xs text-green-800 dark:text-green-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Conteudo extraido e pronto para injecao no prompt.
                </p>
              </div>
            )}

            <Tabs value={materialTab} onValueChange={setMaterialTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-3">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Arquivo
                </TabsTrigger>
                <TabsTrigger value="link" className="flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Link
                </TabsTrigger>
                <TabsTrigger value="paste" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Colar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-0">
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                  <strong>PDF, DOCX, TXT:</strong> O conteudo sera extraido e injetado diretamente.
                </p>
                <div className="flex items-center gap-2">
                  <label className={`cursor-pointer flex-1 ${isParsingFile ? 'pointer-events-none opacity-50' : ''}`}>
                    <input
                      type="file"
                      accept=".txt,.md,.csv,.pdf,.docx,.jpg,.jpeg,.png,.gif,.webp"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isParsingFile}
                    />
                    <span className="inline-flex items-center justify-center gap-2 w-full px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-md transition-colors cursor-pointer border-2 border-dashed border-blue-300 dark:border-blue-700">
                      {isParsingFile ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Extraindo conteudo...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Clique para selecionar arquivo
                        </>
                      )}
                    </span>
                  </label>
                </div>
              </TabsContent>

              <TabsContent value="link" className="mt-0">
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                  Adicione URLs como referencia para a IA.
                </p>
                <div className="space-y-2">
                  <Input
                    placeholder="https://exemplo.com/artigo"
                    value={newLinkUrl}
                    onChange={e => setNewLinkUrl(e.target.value)}
                    className="bg-white dark:bg-gray-900"
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nome (opcional)"
                      value={newLinkName}
                      onChange={e => setNewLinkName(e.target.value)}
                      className="flex-1 bg-white dark:bg-gray-900"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddLink}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="paste" className="mt-0">
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                  Cole o conteudo de uma pagina web ou documento.
                </p>
                <div className="space-y-2">
                  <Input
                    placeholder="Titulo ou fonte do conteudo"
                    value={urlContentName}
                    onChange={e => setUrlContentName(e.target.value)}
                    className="bg-white dark:bg-gray-900"
                  />
                  <Textarea
                    placeholder="Cole aqui o conteudo..."
                    value={urlContent}
                    onChange={e => setUrlContent(e.target.value)}
                    className="min-h-[100px] bg-white dark:bg-gray-900"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {urlContent.length > 0 ? `${urlContent.split(/\s+/).filter(Boolean).length} palavras` : ''}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddUrlContent}
                      disabled={!urlContent.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Lista de materiais anexados */}
            {attachedMaterials.length > 0 && (
              <div className="mt-4 pt-3 border-t border-blue-200 dark:border-blue-800">
                <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Materiais anexados:
                </p>
                <ul className="space-y-2">
                  {attachedMaterials.map(material => (
                    <li
                      key={material.id}
                      className={`flex items-center justify-between gap-2 px-3 py-2 rounded-md border ${
                        material.isParsed
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                          : 'bg-white dark:bg-gray-900 border-blue-100 dark:border-blue-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg">{getMaterialIcon(material.type)}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {material.name}
                          </p>
                          {material.isParsed && material.content && (
                            <p className="text-xs text-green-600 dark:text-green-400">
                              {material.content.split(/\s+/).length} palavras
                            </p>
                          )}
                        </div>
                        {material.isParsed ? (
                          <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Conteudo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Referencia
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMaterial(material.id)}
                        className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Preview do Prompt Adaptado */}
          {adaptedPrompt && (
            <AdaptivePreview
              adapted={adaptedPrompt}
              onCopy={handleCopyPrompt}
              onEditVariable={() => {
                setPendingDialogOpen(true);
              }}
            />
          )}

          {/* Ações */}
          <div className="flex flex-wrap gap-2 border-t pt-4">
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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {['ChatGPT', 'Claude', 'Perplexity', 'Gemini', 'NotebookLM'].map(ai => (
                <Button
                  key={ai}
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenAI(ai)}
                  disabled={!isReady && !adaptedPrompt?.pendingVariables.length}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {ai}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Dialog para campos pendentes */}
        <PendingFieldsDialog
          open={pendingDialogOpen}
          onOpenChange={setPendingDialogOpen}
          pendingVariables={adaptedPrompt?.pendingVariables || []}
          values={manualValues}
          onValueChange={fillVariable}
          onConfirm={() => setPendingDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
