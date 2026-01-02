import { useState } from "react"
import { Heart, Copy, ExternalLink, Sparkles } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PromptDialog } from "@/components/PromptDialog"
import { useFavorites } from "@/contexts/FavoritesContext"
import type { Prompt } from "@/types/prompt"

interface PromptCardProps {
  prompt: Prompt
}

export const PromptCard = ({ prompt }: PromptCardProps) => {
  const { isFavorite, toggleFavorite } = useFavorites()
  const [dialogOpen, setDialogOpen] = useState(false)

  // Proteção: verifica se prompt existe
  if (!prompt) return null

  const handleOpenAI = () => {
    const urls: Record<string, string> = {
      "Claude 3.5 Sonnet": "https://claude.ai/new",
      "ChatGPT-4o": "https://chat.openai.com",
      "Gemini 2.0 Flash": "https://gemini.google.com",
    }

    const url = urls[prompt.recommendedModel] || "https://claude.ai/new"
    window.open(url, "_blank")
  }

  const categoryColors: Record<string, string> = {
    clinica: "bg-red-500/10 text-red-500 border-red-500/20",
    estudos: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    pesquisa: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    produtividade: "bg-green-500/10 text-green-500 border-green-500/20",
  }

  const categoryColor =
    categoryColors[prompt.category] || "bg-gray-500/10 text-gray-500"

  // Proteção: garante que tips seja um array
  const safeTips = Array.isArray(prompt.tips) ? prompt.tips : []

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 hover:border-primary/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={categoryColor}>
                  {prompt.category}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {prompt.recommendedModel}
                </Badge>
              </div>
              <CardTitle className="text-xl group-hover:text-primary transition-colors">
                {prompt.title}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => toggleFavorite(prompt.id)}
            >
              <Heart
                className={`h-5 w-5 transition-colors ${
                  isFavorite(prompt.id)
                    ? "fill-red-500 text-red-500"
                    : "text-muted-foreground hover:text-red-500"
                }`}
              />
            </Button>
          </div>
          <CardDescription className="line-clamp-2">
            {prompt.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {safeTips.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span>Dicas de uso:</span>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {safeTips.slice(0, 2).map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="line-clamp-2">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              variant="default" 
              className="flex-1" 
              onClick={() => setDialogOpen(true)}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleOpenAI}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir IA
            </Button>
          </div>
        </CardContent>
      </Card>

      <PromptDialog
        prompt={prompt}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}
