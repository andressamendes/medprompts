import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, BookOpen, Calculator, FileText, Search } from "lucide-react"

const Ferramentas = () => {
  const ferramentas = [
    {
      name: "PubMed",
      description: "Maior base de dados de artigos científicos em medicina",
      url: "https://pubmed.ncbi.nlm.nih.gov",
      icon: BookOpen,
      category: "Pesquisa"
    },
    {
      name: "UpToDate",
      description: "Referência clínica baseada em evidências para tomada de decisão",
      url: "https://www.uptodate.com",
      icon: FileText,
      category: "Referência"
    },
    {
      name: "MDCalc",
      description: "Calculadoras médicas e scores clínicos validados",
      url: "https://www.mdcalc.com",
      icon: Calculator,
      category: "Calculadoras"
    },
    {
      name: "Google Scholar",
      description: "Pesquisa acadêmica ampla com acesso a diversos artigos",
      url: "https://scholar.google.com",
      icon: Search,
      category: "Pesquisa"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Ferramentas Úteis</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Recursos essenciais para complementar seus estudos em medicina
            </p>
          </div>

          {/* Cards de Ferramentas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ferramentas.map((ferramenta) => {
              const Icon = ferramenta.icon
              return (
                <Card key={ferramenta.name} className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle>{ferramenta.name}</CardTitle>
                        <span className="text-xs text-muted-foreground">{ferramenta.category}</span>
                      </div>
                    </div>
                    <CardDescription className="pt-2">{ferramenta.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(ferramenta.url, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Acessar
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Nota */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">
                📌 Estas ferramentas são complementares aos prompts da biblioteca. Use-as em conjunto para maximizar seu aprendizado.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default Ferramentas
