import { SearchBar } from "@/components/SearchBar"
import { PromptsSection } from "@/components/PromptsSection"
import { Navbar } from "@/components/Navbar"
import { useSearch } from "@/hooks/use-search"

const Index = () => {
  const {
    query,
    setQuery,
    selectedSection,
    setSelectedSection,
    selectedAI,
    setSelectedAI,
    filteredPrompts,
    recentSearches,
    addToHistory,
    suggestions,
  } = useSearch()

  const handleSearch = (term: string) => {
    setQuery(term)
    if (term.trim()) {
      addToHistory(term)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero */}
          <div className="text-center space-y-4 py-8">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              MedPrompts
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Biblioteca de prompts para estudantes de medicina
            </p>
          </div>

          {/* Barra de busca */}
          <SearchBar
            query={query}
            setQuery={handleSearch}
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
            selectedAI={selectedAI}
            setSelectedAI={setSelectedAI}
            recentSearches={recentSearches || []}
            onHistorySelect={handleSearch}
            suggestions={suggestions || []}
          />

          {/* Resultados */}
          <PromptsSection
            title="Prompts"
            prompts={filteredPrompts || []}
            emptyMessage="Nenhum prompt encontrado"
          />
        </div>
      </main>
    </div>
  )
}

export default Index
