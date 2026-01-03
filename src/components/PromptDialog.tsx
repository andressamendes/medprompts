import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, CheckCircle2, Sparkles, ExternalLink } from "lucide-react"
import { DynamicPromptForm } from "@/components/DynamicPromptForm"
import { parsePromptContent } from "@/utils/prompt-parser"
import { hasVariables, detectVariables } from "@/utils/promptVariables"
import { useToast } from "@/hooks/use-toast"
import { registerPromptUse, loadProgress } from "@/lib/gamification"
import { checkNewBadges } from "@/lib/badges"
import { updateMissionProgress } from "@/lib/daily-missions"
import { usePromptHistory } from "@/contexts/PromptHistoryContext"
import type { Prompt } from "@/types/prompt"
import type { FieldValues } from "@/types/dynamic-fields"

interface PromptDialogProps {
  prompt: Prompt
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const PromptDialog = ({ prompt, open, onOpenChange }: PromptDialogProps) => {
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const { addToHistory } = usePromptHistory()

  // Adiciona ao histórico quando abre
  useEffect(() => {
    if (open) {
      addToHistory({
        id: prompt.id,
        title: prompt.title,
        category: prompt.category,
      })
    }
  }, [open, prompt.id, prompt.title, prompt.category, addToHistory])

  // Analisar o prompt para detectar campos dinâmicos
  const parsedPrompt = parsePromptContent(prompt.content)
  const hasDynamicFields = parsedPrompt.fields.length > 0

  const handlePromptUse = () => {
    // Registrar uso e ganhar XP (passando categoria)
    const { xpEarned, leveledUp } = registerPromptUse(prompt.id, prompt.title, prompt.category)
    
    // Verificar novos badges
    const userProgress = loadProgress()
    const newBadges = checkNewBadges(userProgress)
    
    // Atualizar missões diárias
    const { completedMissions, totalXP: missionXP } = updateMissionProgress(
      prompt.category,
      userProgress.streak
    )

    // Disparar evento para atualizar componentes
    window.dispatchEvent(new Event('progressUpdated'))

    // Toast com informações completas
    let toastTitle = "Prompt copiado!"
    let toastDescription = `+${xpEarned} XP ganhos`

    if (missionXP > 0) {
      toastDescription += ` • +${missionXP} XP de missões`
    }

    if (leveledUp) {
      toastTitle = "🎉 Subiu de nível!"
      toastDescription = `Parabéns! Você ganhou +${xpEarned + missionXP} XP total e subiu de nível!`
    } else if (newBadges.length > 0) {
      toastTitle = `🏆 Nova conquista desbloqueada!`
      toastDescription = `${newBadges[0].icon} ${newBadges[0].name} • +${xpEarned + missionXP + newBadges[0].xpReward} XP total`
    } else if (completedMissions.length > 0) {
      toastTitle = `✅ Missão concluída!`
      toastDescription = `${completedMissions[0].icon} ${completedMissions[0].title} • +${xpEarned + missionXP} XP total`
    }

    toast({
      title: toastTitle,
      description: toastDescription,
    })
  }

  const handleGenerate = (values: FieldValues) => {
    const finalPrompt = parsedPrompt.generatePrompt(values)
    setGeneratedPrompt(finalPrompt)

    // Processar XP, badges e missões
    handlePromptUse()

    // Copiar automaticamente após gerar
    navigator.clipboard.writeText(finalPrompt)
    setCopied(true)

    // Fechar dialog após 1 segundo
    setTimeout(() => {
      onOpenChange(false)
      // Reset states quando fechar
      setTimeout(() => {
        setGeneratedPrompt(null)
        setCopied(false)
      }, 300)
    }, 1000)
  }

  const handleCopyStatic = () => {
    navigator.clipboard.writeText(prompt.content)
    setCopied(true)

    // Processar XP, badges e missões
    handlePromptUse()

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  const openInChatGPT = () => {
    const content = generatedPrompt || prompt.content
    const url = `https://chatgpt.com/?q=${encodeURIComponent(content)}`
    window.open(url, '_blank')
  }

  const openInClaude = () => {
    const content = generatedPrompt || prompt.content
    const url = `https://claude.ai/new?q=${encodeURIComponent(content)}`
    window.open(url, '_blank')
  }

  const openInPerplexity = () => {
    const content = generatedPrompt || prompt.content
    const url = `https://www.perplexity.ai/?q=${encodeURIComponent(content)}`
    window.open(url, '_blank')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            {prompt.title}
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </DialogTitle>
          <DialogDescription>{prompt.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {hasDynamicFields ? (
            // Prompt com campos dinâmicos
            <>
              {!generatedPrompt ? (
                <>
                  <div className="bg-muted/50 rounded-lg p-4 border">
                    <p className="text-sm text-muted-foreground">
                      Este prompt precisa de informações personalizadas. Preencha os campos abaixo:
                    </p>
                  </div>

                  <DynamicPromptForm
                    fields={parsedPrompt.fields}
                    onGenerate={handleGenerate}
                    onCancel={() => onOpenChange(false)}
                  />
                </>
              ) : (
                // Preview do prompt gerado
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <p className="font-medium text-green-900 dark:text-green-100">
                        Prompt gerado com sucesso!
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Copiado automaticamente. Use os botões abaixo para abrir em uma IA.
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 border">
                    <p className="text-sm font-mono whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                      {generatedPrompt}
                    </p>
                  </div>

                  {/* Botões de integração */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">🚀 Abrir diretamente em:</p>
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" onClick={openInChatGPT} className="w-full">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        ChatGPT
                      </Button>
                      <Button variant="outline" onClick={openInClaude} className="w-full">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Claude
                      </Button>
                      <Button variant="outline" onClick={openInPerplexity} className="w-full">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Perplexity
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Prompt estático (sem campos dinâmicos)
            <>
              <div className="bg-muted/50 rounded-lg p-4 border">
                <p className="text-sm font-mono whitespace-pre-wrap max-h-[400px] overflow-y-auto">
                  {prompt.content}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleCopyStatic}
                  className="flex-1"
                  disabled={copied}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar Prompt
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Fechar
                </Button>
              </div>

              {/* Botões de integração para prompts estáticos */}
              <div className="space-y-2">
                <p className="text-sm font-medium">🚀 Abrir diretamente em:</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" onClick={openInChatGPT} className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    ChatGPT
                  </Button>
                  <Button variant="outline" onClick={openInClaude} className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Claude
                  </Button>
                  <Button variant="outline" onClick={openInPerplexity} className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Perplexity
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {prompt.tips && prompt.tips.length > 0 && !generatedPrompt && (
          <div className="border-t pt-4 space-y-2">
            <p className="text-sm font-medium">💡 Dicas de uso:</p>
            <ul className="space-y-1">
              {prompt.tips.map((tip, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
