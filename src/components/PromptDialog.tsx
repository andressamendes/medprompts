import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, CheckCircle2 } from "lucide-react"
import { DynamicPromptForm } from "@/components/DynamicPromptForm"
import { parsePromptContent } from "@/utils/prompt-parser"
import { useToast } from "@/hooks/use-toast"
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

  // Analisar o prompt para detectar campos dinâmicos
  const parsedPrompt = parsePromptContent(prompt.content)
  const hasDynamicFields = parsedPrompt.fields.length > 0

  const handleGenerate = (values: FieldValues) => {
    const finalPrompt = parsedPrompt.generatePrompt(values)
    setGeneratedPrompt(finalPrompt)

    // Copiar automaticamente após gerar
    navigator.clipboard.writeText(finalPrompt)
    setCopied(true)

    toast({
      title: "Prompt gerado!",
      description: "Copiado para a área de transferência",
    })

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

    toast({
      title: "Copiado!",
      description: "Prompt copiado para a área de transferência",
    })

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{prompt.title}</DialogTitle>
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
                        Copiado automaticamente. Você pode fechar esta janela.
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 border">
                    <p className="text-sm font-mono whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                      {generatedPrompt}
                    </p>
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
