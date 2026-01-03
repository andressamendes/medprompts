import { useState, useMemo, useEffect } from "react"
import { prompts } from "@/data/prompts-data"

const MAX_RECENT_SEARCHES = 5

export const useSearch = () => {
  const [query, setQuery] = useState("")
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [selectedAI, setSelectedAI] = useState<string | null>(null)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Carrega histórico do localStorage na inicialização
  useEffect(() => {
    try {
      const stored = localStorage.getItem("medprompts-search-history")
      if (!stored) {
        setRecentSearches([])
        return
      }

      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        setRecentSearches(parsed)
      } else {
        setRecentSearches([])
        localStorage.removeItem("medprompts-search-history")
      }
    } catch (error) {
      console.error("Erro ao carregar histórico:", error)
      setRecentSearches([])
      localStorage.removeItem("medprompts-search-history")
    }
  }, [])

  // Filtra prompts com proteção total
  const filteredPrompts = useMemo(() => {
    if (!Array.isArray(prompts)) {
      console.error("prompts não é um array válido")
      return []
    }

    return prompts.filter((prompt) => {
      const matchesQuery =
        !query ||
        prompt.title.toLowerCase().includes(query.toLowerCase()) ||
        prompt.description.toLowerCase().includes(query.toLowerCase()) ||
        (Array.isArray(prompt.tips) &&
          prompt.tips.some((tip) =>
            tip.toLowerCase().includes(query.toLowerCase())
          ))

      const matchesSection = !selectedSection || prompt.category === selectedSection
      const matchesAI = !selectedAI || prompt.recommendedAI?.primary === selectedAI

      return matchesQuery && matchesSection && matchesAI
    })
  }, [query, selectedSection, selectedAI])

  // Gera sugestões com proteção
  const suggestions = useMemo(() => {
    if (!query || query.length < 2) return []

    if (!Array.isArray(prompts)) return []

    const uniqueTitles = new Set(
      prompts
        .filter((p) => p.title.toLowerCase().includes(query.toLowerCase()))
        .map((p) => p.title)
    )

    return Array.from(uniqueTitles).slice(0, 5)
  }, [query])

  // Adiciona termo ao histórico
  const addToHistory = (term: string) => {
    if (!term || term.trim().length === 0) return

    try {
      const currentHistory = Array.isArray(recentSearches) ? recentSearches : []

      const updated = [term, ...currentHistory.filter((t) => t !== term)].slice(
        0,
        MAX_RECENT_SEARCHES
      )

      setRecentSearches(updated)
      localStorage.setItem("medprompts-search-history", JSON.stringify(updated))
    } catch (error) {
      console.error("Erro ao salvar histórico:", error)
    }
  }

  // Limpa filtros
  const clearFilters = () => {
    setQuery("")
    setSelectedSection(null)
    setSelectedAI(null)
  }

  // Verifica filtros ativos
  const hasActiveFilters = Boolean(query || selectedSection || selectedAI)

  return {
    query,
    setQuery,
    selectedSection,
    setSelectedSection,
    selectedAI,
    setSelectedAI,
    filteredPrompts: Array.isArray(filteredPrompts) ? filteredPrompts : [],
    clearFilters,
    hasActiveFilters,
    resultCount: Array.isArray(filteredPrompts) ? filteredPrompts.length : 0,
    totalCount: Array.isArray(prompts) ? prompts.length : 0,
    recentSearches: Array.isArray(recentSearches) ? recentSearches : [],
    addToHistory,
    suggestions: Array.isArray(suggestions) ? suggestions : [],
  }
}
