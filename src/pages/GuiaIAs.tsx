import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

const GuiaIAs = () => {
  const ias = [
    {
      name: "Claude 3.5 Sonnet",
      description: "Excelente para raciocínio clínico, análise de artigos científicos e criação de conteúdo médico estruturado",
      url: "https://claude.ai",
      color: "from-orange-500 to-red-500",
      pros: ["Raciocínio profundo", "Análise de textos longos", "Respostas estruturadas"],
      ideal: "Casos clínicos complexos, revisão de literatura, fisiopatologia"
    },
    {
      name: "ChatGPT-4o",
      description: "Versátil e rápido, ótimo para flashcards, questões de prova e explicações didáticas",
      url: "https://chat.openai.com",
      color: "from-green-500 to-emerald-500",
      pros: ["Velocidade", "Interface intuitiva", "Plugins disponíveis"],
      ideal: "Flashcards, questões estilo residência, revisão rápida"
    },
    {
      name: "Gemini 2.0 Flash",
      description: "Integrado ao Google, bom para pesquisa rápida e resumos de múltiplas fontes",
      url: "https://gemini.google.com",
      color: "from-blue-500 to-purple-500",
      pros: ["Integração Google", "Pesquisa em tempo real", "Multimodal"],
      ideal: "Pesquisa bibliográfica, atualização de guidelines"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Guia de IAs para Medicina</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Conheça as melhores ferramentas de IA e como utilizá-las nos seus estudos
            </p>
          </div>

          {/* Cards de IAs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ias.map((ia) => (
              <Card key={ia.name} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className={`h-2 w-full rounded-t-lg bg-gradient-to-r ${ia.color}`} />
                  <CardTitle className="pt-4">{ia.name}</CardTitle>
                  <CardDescription>{ia.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Pontos Fortes:</h4>
                    <ul className="space-y-1">
                      {ia.pros.map((pro, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Ideal Para:</h4>
                    <p className="text-sm text-muted-foreground">{ia.ideal}</p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(ia.url, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Acessar {ia.name.split(" ")[0]}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Dicas */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>💡 Dicas de Uso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>✅ Seja específico nos seus prompts - quanto mais contexto, melhores as respostas</p>
              <p>✅ Sempre verifique informações médicas com fontes confiáveis</p>
              <p>✅ Use as IAs como complemento, não substituto, do estudo tradicional</p>
              <p>✅ Experimente diferentes IAs para o mesmo prompt e compare resultados</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default GuiaIAs
