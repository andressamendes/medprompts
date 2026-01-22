import { useState, useEffect, useMemo, useCallback } from 'react';
import DOMPurify from 'dompurify';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import {
  Sparkles,
  Copy,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Upload,
  Link,
  X,
  Plus,
  FileType,
  Loader2,
  Globe,
} from 'lucide-react';
import {
  extractVariables,
  fillPromptVariables,
} from '@/lib/promptVariables';
import { parseFile, truncateContent, isContentParseable } from '@/lib/fileParser';
import type { Prompt } from '@/types/prompt';

// Tipos de material suportados
type MaterialType = 'pdf' | 'link' | 'image' | 'text' | 'video' | 'docx' | 'url-content' | 'unknown';

interface AttachedMaterial {
  id: string;
  type: MaterialType;
  name: string;
  url?: string;
  content?: string;
  isParsed?: boolean; // Indica se o conteúdo foi extraído com sucesso
}

// Detecta o tipo de material baseado na URL ou nome do arquivo
function detectMaterialType(input: string): MaterialType {
  const lower = input.toLowerCase();

  // URLs de vídeo
  if (lower.includes('youtube.com') || lower.includes('youtu.be') || lower.includes('vimeo.com')) {
    return 'video';
  }

  // PDFs
  if (lower.endsWith('.pdf') || lower.includes('/pdf') || lower.includes('pdf.')) {
    return 'pdf';
  }

  // DOCX
  if (lower.endsWith('.docx')) {
    return 'docx';
  }

  // Imagens
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(lower)) {
    return 'image';
  }

  // Arquivos de texto
  if (/\.(txt|md|csv)$/i.test(lower)) {
    return 'text';
  }

  // URLs genéricas
  if (lower.startsWith('http://') || lower.startsWith('https://')) {
    return 'link';
  }

  return 'unknown';
}

// Gera conteúdo injetado a partir dos materiais anexados
function generateInjectedContent(materials: AttachedMaterial[]): string {
  if (materials.length === 0) return '';

  // Separar materiais com conteúdo extraído dos que são apenas referências
  const parsedMaterials = materials.filter(m => m.isParsed && m.content);
  const referenceMaterials = materials.filter(m => !m.isParsed || !m.content);

  let injectedContent = '\n\n---\n\n';

  // Injetar conteúdo extraído diretamente
  if (parsedMaterials.length > 0) {
    injectedContent += '**CONTEÚDO DO MATERIAL ANEXADO:**\n\n';

    parsedMaterials.forEach((material, idx) => {
      const icon = getMaterialIcon(material.type);
      if (parsedMaterials.length > 1) {
        injectedContent += `### ${icon} ${material.name}\n\n`;
      }
      injectedContent += `${material.content}\n\n`;
      if (idx < parsedMaterials.length - 1) {
        injectedContent += '---\n\n';
      }
    });
  }

  // Listar materiais apenas como referência (links, imagens, etc.)
  if (referenceMaterials.length > 0) {
    if (parsedMaterials.length > 0) {
      injectedContent += '\n---\n\n';
    }
    injectedContent += '**MATERIAIS DE REFERÊNCIA:**\n\n';

    referenceMaterials.forEach((material, idx) => {
      const icon = getMaterialIcon(material.type);
      if (material.url) {
        injectedContent += `${idx + 1}. ${icon} **${material.name}** - ${material.url}\n`;
      } else {
        injectedContent += `${idx + 1}. ${icon} **${material.name}**\n`;
      }
    });

    // Instruções para materiais de referência
    const types = [...new Set(referenceMaterials.map(m => m.type))];
    injectedContent += '\n**Instruções:** ';

    if (types.includes('link') || types.includes('video')) {
      injectedContent += 'Acesse os links fornecidos para complementar a análise. ';
    }
    if (types.includes('image')) {
      injectedContent += 'Analise as imagens anexadas. ';
    }
  }

  return injectedContent;
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

// Gera ID único para materiais
function generateMaterialId(): string {
  return `material_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

interface PromptCustomizerProps {
  prompt: Prompt;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PromptCustomizer({ prompt, open, onOpenChange }: PromptCustomizerProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [attachedMaterials, setAttachedMaterials] = useState<AttachedMaterial[]>([]);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkName, setNewLinkName] = useState('');
  const [materialTab, setMaterialTab] = useState<string>('upload');
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [urlContent, setUrlContent] = useState(''); // Para colar conteúdo de URL manualmente
  const [urlContentName, setUrlContentName] = useState('');

  // Handler para upload de arquivo com parsing de conteúdo
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo - agora aceita PDF, DOCX, TXT, etc.
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

    // Validar tamanho (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo deve ter no maximo 10MB',
        variant: 'destructive',
      });
      return;
    }

    // Detectar tipo de material
    const materialType = detectMaterialType(file.name);

    // Verificar se o arquivo pode ter conteúdo extraído
    const canParse = isContentParseable(file.name);

    if (canParse) {
      setIsParsingFile(true);

      try {
        const result = await parseFile(file);

        if (result.success && result.content) {
          // Truncar conteúdo se muito grande
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
          // Fallback: adicionar como referência
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
      // Arquivos não parseáveis (imagens) - adicionar como referência
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

    // Limpar input para permitir re-upload do mesmo arquivo
    event.target.value = '';
  };

  // Handler para adicionar link como referência
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

    // Validar URL
    try {
      const parsedUrl = new URL(url);
      // Bloquear protocolos perigosos
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

    // Detectar tipo de material
    const materialType = detectMaterialType(url);

    // Extrair nome do link se não fornecido
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

  // Handler para adicionar conteúdo de URL (colado manualmente)
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

    // Truncar se muito grande
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

  // Extrair variáveis do prompt
  const variables = useMemo(() => extractVariables(prompt.content), [prompt.content]);

  // Verificar se há conteúdo injetado de arquivos/URLs
  const hasInjectedContent = useMemo(() => {
    return attachedMaterials.some(m => m.isParsed && m.content);
  }, [attachedMaterials]);

  // Prompt personalizado com injeção dinâmica de conteúdo
  const customizedPrompt = useMemo(() => {
    let basePrompt = prompt.content;

    // Se tem variáveis e valores preenchidos, substituí-las
    if (variables.length > 0 && Object.keys(values).length > 0) {
      basePrompt = fillPromptVariables(prompt.content, values);
    }

    // Se tem conteúdo injetado, remover marcadores de variáveis não preenchidos
    if (hasInjectedContent) {
      // Remover marcadores [VARIÁVEL] não preenchidos do prompt
      basePrompt = basePrompt.replace(/\[([A-Za-zÀ-ÖØ-öø-ÿ0-9_\-\s]+)\]/g, (_match, varName) => {
        // Manter apenas se tiver valor preenchido
        const value = values[varName];
        return value && value.trim() ? value : '';
      });

      // Limpar linhas que ficaram vazias após remoção
      basePrompt = basePrompt
        .split('\n')
        .filter(line => line.trim() !== '')
        .join('\n');
    }

    // Para prompts sem variáveis, adicionar contexto adicional no início se fornecido
    if (variables.length === 0) {
      const contextoAdicional = values['CONTEXTO_ADICIONAL']?.trim();
      if (contextoAdicional) {
        basePrompt = `**CONTEXTO DO USUÁRIO**\n${contextoAdicional}\n\n---\n\n${basePrompt}`;
      }
    }

    // Adicionar conteúdo injetado dos materiais
    if (attachedMaterials.length > 0) {
      const injectedContent = generateInjectedContent(attachedMaterials);
      basePrompt = basePrompt + injectedContent;
    }

    return basePrompt;
  }, [prompt.content, values, variables, attachedMaterials, hasInjectedContent]);

  // Contagem de campos - considera preenchidos automaticamente se há conteúdo injetado
  const fillStats = useMemo(() => {
    if (hasInjectedContent) {
      // Se tem conteúdo injetado, consideramos "preenchido" pelo conteúdo
      return {
        filled: variables.length,
        total: variables.length,
        percentage: 100,
      };
    }

    const filled = variables.filter(v => {
      const value = values[v.name];
      return value && value.trim().length > 0;
    }).length;

    return {
      filled,
      total: variables.length,
      percentage: variables.length > 0 ? Math.round((filled / variables.length) * 100) : 0,
    };
  }, [variables, values, hasInjectedContent]);

  // Validação - prompt é válido se tem conteúdo injetado OU todos os campos preenchidos
  const validation = useMemo(() => {
    // Se tem conteúdo injetado, o prompt está pronto para uso
    if (hasInjectedContent) {
      return { valid: true, errors: [] };
    }

    // Para prompts sem variáveis, sempre é válido
    if (variables.length === 0) {
      return { valid: true, errors: [] };
    }

    // Validar campos manualmente preenchidos
    const errors: string[] = [];
    variables.forEach(variable => {
      const value = values[variable.name];
      if (variable.required && (!value || value.trim().length === 0)) {
        errors.push(`${variable.name} e obrigatorio`);
      }
    });

    return { valid: errors.length === 0, errors };
  }, [variables, values, hasInjectedContent]);

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
    setAttachedMaterials([]);
    setNewLinkUrl('');
    setNewLinkName('');
    setUrlContent('');
    setUrlContentName('');
    const savedKey = `prompt_values_${prompt.id}`;
    localStorage.removeItem(savedKey);
    toast({ title: 'Campos e materiais resetados' });
  };

  // Formatar prompt para execução direta (remove markdown e marcadores restantes)
  const getExecutionReadyPrompt = useCallback(() => {
    let readyPrompt = customizedPrompt;

    // Remover quaisquer marcadores [VARIÁVEL] restantes
    readyPrompt = readyPrompt.replace(/\[([A-Za-zÀ-ÖØ-öø-ÿ0-9_\-\s]+)\]/g, '');

    // Limpar formatação markdown para texto puro mais limpo
    // Remove ** mas mantém o texto
    readyPrompt = readyPrompt.replace(/\*\*([^*]+)\*\*/g, '$1');

    // Remove ### headers markdown
    readyPrompt = readyPrompt.replace(/^###\s*/gm, '');

    // Remove --- separadores
    readyPrompt = readyPrompt.replace(/\n---\n/g, '\n\n');

    // Limpar linhas vazias consecutivas (mais de 2)
    readyPrompt = readyPrompt.replace(/\n{3,}/g, '\n\n');

    // Remover linhas que ficaram apenas com espaços
    readyPrompt = readyPrompt
      .split('\n')
      .map(line => line.trim())
      .filter((line, idx, arr) => {
        // Manter linhas com conteúdo
        if (line) return true;
        // Manter no máximo uma linha vazia consecutiva
        return idx > 0 && arr[idx - 1] !== '';
      })
      .join('\n');

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
      notebooklm: 'https://notebooklm.google.com',
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
    window.open(url, '_blank', 'noopener,noreferrer');
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
          {/* Seção de Materiais - Upload, Links ou Conteúdo */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileType className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                Anexar Material para Personalizar o Prompt
              </h3>
              {attachedMaterials.length > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {attachedMaterials.filter(m => m.isParsed).length} com conteudo / {attachedMaterials.length} total
                </Badge>
              )}
            </div>

            {hasInjectedContent && (
              <div className="mb-3 p-2 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-md">
                <p className="text-xs text-green-800 dark:text-green-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Conteudo extraido e pronto para injecao no prompt. Os campos manuais sao opcionais.
                </p>
              </div>
            )}

            <Tabs value={materialTab} onValueChange={setMaterialTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-3">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" aria-hidden="true" />
                  Arquivo
                </TabsTrigger>
                <TabsTrigger value="link" className="flex items-center gap-2">
                  <Link className="w-4 h-4" aria-hidden="true" />
                  Link
                </TabsTrigger>
                <TabsTrigger value="paste" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" aria-hidden="true" />
                  Colar Conteudo
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-0">
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                  <strong>PDF, DOCX, TXT:</strong> O conteudo sera extraido e injetado diretamente no prompt.
                </p>
                <div className="flex items-center gap-2">
                  <label className={`cursor-pointer flex-1 ${isParsingFile ? 'pointer-events-none opacity-50' : ''}`}>
                    <input
                      type="file"
                      accept=".txt,.md,.csv,.pdf,.docx,.jpg,.jpeg,.png,.gif,.webp"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isParsingFile}
                      aria-label="Selecionar arquivo para upload"
                    />
                    <span className="inline-flex items-center justify-center gap-2 w-full px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-md transition-colors cursor-pointer border-2 border-dashed border-blue-300 dark:border-blue-700">
                      {isParsingFile ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                          Extraindo conteudo...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" aria-hidden="true" />
                          Clique para selecionar arquivo
                        </>
                      )}
                    </span>
                  </label>
                </div>
              </TabsContent>

              <TabsContent value="link" className="mt-0">
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                  Adicione URLs como referencia. A IA tentara acessar o conteudo.
                </p>
                <div className="space-y-2">
                  <Input
                    placeholder="https://exemplo.com/artigo"
                    value={newLinkUrl}
                    onChange={e => setNewLinkUrl(e.target.value)}
                    className="bg-white dark:bg-gray-900"
                    aria-label="URL do material"
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nome (opcional)"
                      value={newLinkName}
                      onChange={e => setNewLinkName(e.target.value)}
                      className="flex-1 bg-white dark:bg-gray-900"
                      aria-label="Nome descritivo do material"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddLink}
                      className="bg-blue-600 hover:bg-blue-700"
                      aria-label="Adicionar link"
                    >
                      <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
                      Adicionar
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="paste" className="mt-0">
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                  Cole o conteudo de uma pagina web ou documento. Sera injetado diretamente no prompt.
                </p>
                <div className="space-y-2">
                  <Input
                    placeholder="Titulo ou fonte do conteudo"
                    value={urlContentName}
                    onChange={e => setUrlContentName(e.target.value)}
                    className="bg-white dark:bg-gray-900"
                    aria-label="Nome da fonte"
                  />
                  <Textarea
                    placeholder="Cole aqui o conteudo da pagina web, artigo, ou documento..."
                    value={urlContent}
                    onChange={e => setUrlContent(e.target.value)}
                    className="min-h-[120px] bg-white dark:bg-gray-900"
                    aria-label="Conteudo a ser injetado"
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
                      aria-label="Adicionar conteudo"
                    >
                      <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
                      Adicionar Conteudo
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
                        <span className="text-lg" aria-hidden="true">{getMaterialIcon(material.type)}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {material.name}
                          </p>
                          {material.isParsed && material.content && (
                            <p className="text-xs text-green-600 dark:text-green-400">
                              {material.content.split(/\s+/).length} palavras extraidas
                            </p>
                          )}
                          {!material.isParsed && material.url && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {material.url}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {material.isParsed ? (
                            <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Conteudo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs capitalize">
                              Referencia
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMaterial(material.id)}
                        className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                        aria-label={`Remover ${material.name}`}
                      >
                        <X className="w-4 h-4" aria-hidden="true" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Formulário de variáveis - Colapsável quando há conteúdo injetado */}
          {(!hasInjectedContent || variables.length > 0) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {hasInjectedContent
                    ? 'Campos adicionais (opcional):'
                    : hasVariables
                      ? 'Preencha os campos do prompt:'
                      : 'Adicione contexto personalizado:'}
                </h3>
                {hasInjectedContent && hasVariables && (
                  <Badge variant="outline" className="text-xs">
                    Opcional - conteudo ja injetado
                  </Badge>
                )}
              </div>

              {hasInjectedContent && hasVariables && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  O conteudo do arquivo/URL sera usado. Preencha os campos abaixo apenas se quiser adicionar informacoes extras.
                </p>
              )}

              {hasVariables ? (
                // Mostrar campos para cada variável
                variables.map((variable) => (
                  <div key={variable.name} className="space-y-2">
                    <Label htmlFor={variable.name} className="flex items-center gap-2">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        [{variable.name}]
                      </span>
                      {!hasInjectedContent && variable.required && (
                        <span className="text-red-500 text-xs">*obrigatorio</span>
                      )}
                      {hasInjectedContent && (
                        <span className="text-gray-500 text-xs">(opcional)</span>
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
                        placeholder={hasInjectedContent ? 'Opcional - adicione informacao extra...' : (variable.example || `Digite ${variable.name.toLowerCase()}...`)}
                        className="min-h-[100px]"
                        maxLength={variable.maxLength}
                      />
                    ) : (
                      <Input
                        id={variable.name}
                        type={variable.type}
                        value={values[variable.name] || ''}
                        onChange={e => handleValueChange(variable.name, e.target.value)}
                        placeholder={hasInjectedContent ? 'Opcional' : (variable.example || `Digite ${variable.name.toLowerCase()}...`)}
                        maxLength={variable.maxLength}
                      />
                    )}

                    {!hasInjectedContent && variable.example && (
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
                    Adicione informacoes especificas que serao incluidas no inicio do prompt.
                  </p>
                  <Textarea
                    id="CONTEXTO_ADICIONAL"
                    value={values['CONTEXTO_ADICIONAL'] || ''}
                    onChange={e => handleValueChange('CONTEXTO_ADICIONAL', e.target.value)}
                    placeholder="Ex: Tema: Insuficiencia Cardiaca Congestiva&#10;Paciente: Homem, 65 anos, diabetico..."
                    className="min-h-[120px]"
                    maxLength={2000}
                  />
                  <p className="text-xs text-gray-500 text-right">
                    {(values['CONTEXTO_ADICIONAL'] || '').length}/2000
                  </p>
                </div>
              )}
            </div>
          )}

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
                      /\[([A-Za-zÀ-ÖØ-öø-ÿ0-9_\-\s]+)\]/g,
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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenAI('NotebookLM')}
                disabled={!validation.valid}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                NotebookLM
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
