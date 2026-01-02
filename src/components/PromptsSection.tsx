import { PromptCard } from "./PromptCard"
import type { Prompt } from "@/types/prompt"

interface PromptsSectionProps {
  title: string
  prompts: Prompt[]
  emptyMessage?: string
}

export const PromptsSection = ({
  title,
  prompts,
  emptyMessage = "Nenhum prompt disponível",
}: PromptsSectionProps) => {
  // Proteção: garante que prompts seja sempre um array
  const safePrompts = Array.isArray(prompts) ? prompts : []

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <span className="text-sm text-muted-foreground">
          {safePrompts.length} {safePrompts.length === 1 ? "prompt" : "prompts"}
        </span>
      </div>

      {safePrompts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {safePrompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      )}
    </section>
  )
}
