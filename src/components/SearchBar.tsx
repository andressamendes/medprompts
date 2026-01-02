import { Search, X, History, Filter, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useState, useRef, useEffect } from "react"

interface SearchBarProps {
  query: string
  setQuery: (value: string) => void
  selectedSection: string | null
  setSelectedSection: (section: string | null) => void
  selectedAI: string | null
  setSelectedAI: (ai: string | null) => void
  recentSearches: string[]
  onHistorySelect: (term: string) => void
  suggestions: string[]
}

export const SearchBar = ({
  query,
  setQuery,
  selectedSection,
  setSelectedSection,
  selectedAI,
  setSelectedAI,
  recentSearches,
  onHistorySelect,
  suggestions,
}: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Proteção: garante arrays válidos
  const safeSuggestions = Array.isArray(suggestions) ? suggestions : []
  const safeRecentSearches = Array.isArray(recentSearches) ? recentSearches : []

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="w-full space-y-4" ref={wrapperRef}>
      {/* Input Principal */}
      <div className="relative group">
        <Search
          className={`absolute left-3 top-3.5 h-5 w-5 transition-colors ${
            isFocused ? "text-primary" : "text-muted-foreground"
          }`}
        />
        <Input
          type="text"
          placeholder="O que você quer estudar hoje? (ex: Anatomia, Fisiopatologia...)"
          className="pl-10 pr-4 h-12 text-base rounded-xl border-2 border-muted bg-card/50 backdrop-blur-sm focus:border-primary/50 transition-all shadow-sm hover:shadow-md"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
        />

        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Dropdown de Sugestões e Histórico */}
        {isFocused && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-popover rounded-xl border border-border shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Sugestões */}
            {query && safeSuggestions.length > 0 && (
              <div className="p-2">
                <p className="text-xs font-semibold text-muted-foreground px-2 py-1 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Sugestões
                </p>
                {safeSuggestions.map((sug, i) => (
                  <div
                    key={i}
                    className="cursor-pointer px-2 py-2 hover:bg-muted/50 rounded-md text-sm"
                    onClick={() => {
                      setQuery(sug)
                      setIsFocused(false)
                    }}
                  >
                    {sug}
                  </div>
                ))}
              </div>
            )}

            {/* Histórico */}
            {(!query || safeSuggestions.length === 0) &&
              safeRecentSearches.length > 0 && (
                <div className="p-2 border-t border-border/50">
                  <p className="text-xs font-semibold text-muted-foreground px-2 py-1 flex items-center gap-1">
                    <History className="h-3 w-3" /> Recentes
                  </p>
                  {safeRecentSearches.map((term, i) => (
                    <div
                      key={i}
                      className="cursor-pointer px-2 py-2 hover:bg-muted/50 rounded-md text-sm flex items-center gap-2"
                      onClick={() => {
                        onHistorySelect(term)
                        setIsFocused(false)
                      }}
                    >
                      <History className="h-3 w-3 opacity-50" />
                      {term}
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mr-2">
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filtros:</span>
        </div>

        <Badge
          variant={selectedSection === "clinica" ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary/20 transition-colors"
          onClick={() =>
            setSelectedSection(selectedSection === "clinica" ? null : "clinica")
          }
        >
          🩺 Clínica
        </Badge>

        <Badge
          variant={selectedSection === "estudos" ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary/20 transition-colors"
          onClick={() =>
            setSelectedSection(selectedSection === "estudos" ? null : "estudos")
          }
        >
          📚 Estudos
        </Badge>

        <Badge
          variant={selectedSection === "pesquisa" ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary/20 transition-colors"
          onClick={() =>
            setSelectedSection(selectedSection === "pesquisa" ? null : "pesquisa")
          }
        >
          🔬 Pesquisa
        </Badge>

        <div className="w-px h-6 bg-border mx-2 hidden sm:block" />

        <Badge
          variant={selectedAI === "Claude 3.5 Sonnet" ? "secondary" : "outline"}
          className="cursor-pointer hover:bg-secondary/80 transition-colors"
          onClick={() =>
            setSelectedAI(
              selectedAI === "Claude 3.5 Sonnet" ? null : "Claude 3.5 Sonnet"
            )
          }
        >
          🤖 Claude
        </Badge>

        <Badge
          variant={selectedAI === "ChatGPT-4o" ? "secondary" : "outline"}
          className="cursor-pointer hover:bg-secondary/80 transition-colors"
          onClick={() =>
            setSelectedAI(selectedAI === "ChatGPT-4o" ? null : "ChatGPT-4o")
          }
        >
          🤖 ChatGPT
        </Badge>
      </div>
    </div>
  )
}
