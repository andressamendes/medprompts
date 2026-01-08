import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Sparkles, Clock, TrendingUp } from "lucide-react"
import { useFavorites } from "@/contexts/FavoritesContext"
import type { Prompt } from "@/types/prompt"
import { cn } from "@/lib/utils"

interface PromptCardProps {
  prompt: Prompt
  onClick: () => void
}

// Mapa de estilos por IA
const AI_STYLES = {
  ChatGPT: {
    gradient: "from-green-500 to-emerald-600",
    bg: "bg-green-50 dark:bg-green-950/30",
    text: "text-green-700 dark:text-green-300",
    icon: "🤖",
    border: "border-green-200 dark:border-green-800",
  },
  Claude: {
    gradient: "from-purple-500 to-violet-600",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    text: "text-purple-700 dark:text-purple-300",
    icon: "🧠",
    border: "border-purple-200 dark:border-purple-800",
  },
  Perplexity: {
    gradient: "from-blue-500 to-cyan-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-700 dark:text-blue-300",
    icon: "🔍",
    border: "border-blue-200 dark:border-blue-800",
  },
  NotebookLM: {
    gradient: "from-orange-500 to-amber-600",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    text: "text-orange-700 dark:text-orange-300",
    icon: "📓",
    border: "border-orange-200 dark:border-orange-800",
  },
  Gemini: {
    gradient: "from-pink-500 to-rose-600",
    bg: "bg-pink-50 dark:bg-pink-950/30",
    text: "text-pink-700 dark:text-pink-300",
    icon: "✨",
    border: "border-pink-200 dark:border-pink-800",
  },
  Anki: {
    gradient: "from-red-500 to-rose-600",
    bg: "bg-red-50 dark:bg-red-950/30",
    text: "text-red-700 dark:text-red-300",
    icon: "🎴",
    border: "border-red-200 dark:border-red-800",
  },
}

export const PromptCard = ({ prompt, onClick }: PromptCardProps) => {
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorite = isFavorite(prompt.id)

  // Helper para extrair nome da IA
  const getAIName = (ai: string | { primary: string } | undefined): string => {
    if (!ai) return '';
    return typeof ai === 'string' ? ai : ai.primary;
  };

  const aiName = getAIName(prompt.recommendedAI);
  const aiStyle = aiName ? AI_STYLES[aiName as keyof typeof AI_STYLES] : null;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden cursor-pointer",
        "transition-all duration-500 ease-out",
        "hover:shadow-2xl hover:shadow-primary/20 hover:scale-[1.03] hover:-translate-y-2",
        "border-2 hover:border-primary/60",
        "bg-gradient-to-br from-background via-background to-muted/30",
        "backdrop-blur-sm"
      )}
      onClick={onClick}
    >
      {/* Gradiente decorativo superior - Barra da IA */}
      {aiStyle && (
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-1",
            "bg-gradient-to-r",
            "group-hover:h-2 transition-all duration-300",
            aiStyle.gradient
          )}
        />
      )}

      {/* Badge de IA recomendada - Posição flutuante */}
      {aiStyle && (
        <div className="absolute top-4 right-4 z-10">
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full",
              "backdrop-blur-md border-2 shadow-xl",
              "transition-all duration-300",
              "group-hover:scale-110 group-hover:shadow-2xl",
              aiStyle.bg,
              aiStyle.border
            )}
          >
            <span className="text-base">{aiStyle.icon}</span>
            <span className={cn("text-xs font-bold tracking-wide", aiStyle.text)}>
              {aiName}
            </span>
          </div>
        </div>
      )}

      {/* Botão de favorito - Glassmorphism */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          toggleFavorite(prompt.id)
        }}
        className={cn(
          "absolute top-4 left-4 z-10 p-2.5 rounded-full",
          "backdrop-blur-lg border-2 shadow-xl",
          "transition-all duration-300",
          "hover:scale-125 active:scale-95",
          favorite
            ? "bg-yellow-100/90 dark:bg-yellow-900/40 border-yellow-400"
            : "bg-white/80 dark:bg-gray-800/80 border-gray-300 dark:border-gray-600"
        )}
        aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      >
        <Star
          className={cn(
            "w-4 h-4 transition-all duration-300",
            favorite
              ? "fill-yellow-500 text-yellow-500 scale-110"
              : "text-gray-400 dark:text-gray-500 hover:text-yellow-500"
          )}
        />
      </button>

      {/* Conteúdo principal */}
      <div className="p-6 pt-16">
        {/* Título com animação */}
        <h3 className={cn(
          "text-xl font-bold mb-4 line-clamp-2",
          "transition-all duration-300",
          "group-hover:text-primary group-hover:translate-x-1"
        )}>
          {prompt.title}
        </h3>

        {/* Objetivo/Descrição - Foco principal */}
        <p className={cn(
          "text-sm text-muted-foreground mb-5 line-clamp-3 leading-relaxed",
          "transition-colors duration-300",
          "group-hover:text-foreground/80"
        )}>
          {prompt.description}
        </p>

        {/* Categoria com estilo moderno */}
        <div className="flex items-center gap-2 mb-5">
          <Badge 
            variant="secondary" 
            className={cn(
              "text-xs font-semibold px-3 py-1",
              "transition-all duration-300",
              "group-hover:scale-105 group-hover:bg-primary/10"
            )}
          >
            {prompt.category}
          </Badge>
        </div>

        {/* Divider sutil */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4" />

        {/* Footer com metadados - Grid layout */}
        <div className="grid grid-cols-2 gap-3">
          {/* Nível acadêmico */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="p-1.5 rounded-md bg-muted/50">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <span className="font-medium">
              {Array.isArray(prompt.academicLevel)
                ? prompt.academicLevel[0]
                : prompt.academicLevel || prompt.studyLevel || "Todos"}
            </span>
          </div>

          {/* Tempo estimado */}
          {prompt.estimatedTime && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="p-1.5 rounded-md bg-muted/50">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium">{prompt.estimatedTime}min</span>
            </div>
          )}
        </div>

        {/* Call-to-action hover */}
        <div className={cn(
          "mt-5 flex items-center justify-center gap-2",
          "text-sm font-semibold text-primary",
          "opacity-0 group-hover:opacity-100",
          "transition-all duration-300",
          "transform translate-y-2 group-hover:translate-y-0"
        )}>
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>Clique para ver o prompt</span>
        </div>
      </div>

      {/* Efeito de brilho no hover - Glassmorphism */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-br",
          "from-primary/0 via-primary/5 to-primary/10",
          "opacity-0 group-hover:opacity-100",
          "transition-opacity duration-500",
          "pointer-events-none"
        )}
      />

      {/* Partículas decorativas (opcional - fica sutil) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
    </Card>
  )
}
