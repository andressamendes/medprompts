import { Navbar } from "@/components/Navbar";
import { ExternalLink } from "lucide-react";

const Ferramentas = () => {
  const categorias = [
    {
      nome: "IAs Especializadas",
      emoji: "🤖",
      cor: "purple",
      ferramentas: [
        {
          name: "ChatGPT (OpenAI)",
          description: "IA conversacional para resumos, explicações e auxílio no estudo",
          url: "https://chat.openai.com",
          gratuito: "Parcial"
        },
        {
          name: "Claude (Anthropic)",
          description: "IA com contexto longo, ideal para documentos e textos extensos",
          url: "https://claude.ai",
          gratuito: "Sim"
        },
        {
          name: "Gemini (Google)",
          description: "IA do Google integrada com Scholar e Gmail",
          url: "https://gemini.google.com",
          gratuito: "Sim"
        },
        {
          name: "Perplexity",
          description: "Busca com IA e citações de fontes acadêmicas",
          url: "https://perplexity.ai",
          gratuito: "Sim"
        }
      ]
    },
    {
      nome: "Pesquisa Acadêmica",
      emoji: "📚",
      cor: "pink",
      ferramentas: [
        {
          name: "PubMed",
          description: "Maior base de dados de artigos científicos em medicina",
          url: "https://pubmed.ncbi.nlm.nih.gov",
          gratuito: "Sim"
        },
        {
          name: "Google Scholar",
          description: "Busca acadêmica ampla com acesso a diversos artigos",
          url: "https://scholar.google.com",
          gratuito: "Sim"
        },
        {
          name: "Consensus",
          description: "Busca em papers usando IA para extrair insights",
          url: "https://consensus.app",
          gratuito: "Parcial"
        },
        {
          name: "Scite",
          description: "Análise de citações: verifica se papers foram confirmados ou refutados",
          url: "https://scite.ai",
          gratuito: "Parcial"
        }
      ]
    },
    {
      nome: "Referências Clínicas",
      emoji: "🩺",
      cor: "blue",
      ferramentas: [
        {
          name: "UpToDate",
          description: "Referência clínica baseada em evidências para tomada de decisão",
          url: "https://www.uptodate.com",
          gratuito: "Não"
        },
        {
          name: "Medscape",
          description: "Referência médica gratuita com artigos, drug info e calculadoras",
          url: "https://www.medscape.com",
          gratuito: "Sim"
        },
        {
          name: "BMJ Best Practice",
          description: "Guias clínicos baseados em evidências do BMJ",
          url: "https://bestpractice.bmj.com",
          gratuito: "Parcial"
        }
      ]
    },
    {
      nome: "Calculadoras Médicas",
      emoji: "🧮",
      cor: "green",
      ferramentas: [
        {
          name: "MDCalc",
          description: "Calculadoras médicas e scores clínicos validados",
          url: "https://www.mdcalc.com",
          gratuito: "Sim"
        },
        {
          name: "ClinCalc",
          description: "Calculadoras para dose de medicamentos e clearance renal",
          url: "https://clincalc.com",
          gratuito: "Sim"
        }
      ]
    },
    {
      nome: "Anatomia e Imagens",
      emoji: "📸",
      cor: "orange",
      ferramentas: [
        {
          name: "Radiopaedia",
          description: "Atlas colaborativo de radiologia com casos e artigos",
          url: "https://radiopaedia.org",
          gratuito: "Sim"
        },
        {
          name: "TeachMeAnatomy",
          description: "Atlas de anatomia com ilustrações didáticas",
          url: "https://teachmeanatomy.info",
          gratuito: "Sim"
        },
        {
          name: "Visible Body",
          description: "Anatomia 3D interativa para exploração visual",
          url: "https://www.visiblebody.com",
          gratuito: "Não"
        }
      ]
    },
    {
      nome: "Organização de Estudos",
      emoji: "📋",
      cor: "indigo",
      ferramentas: [
        {
          name: "Anki",
          description: "Flashcards com repetição espaçada para memorização de longo prazo",
          url: "https://apps.ankiweb.net",
          gratuito: "Sim"
        },
        {
          name: "Notion",
          description: "Plataforma all-in-one para notas, bancos de dados e organização",
          url: "https://www.notion.so",
          gratuito: "Parcial"
        },
        {
          name: "Obsidian",
          description: "Segundo cérebro para organizar conhecimento com links bidirecionais",
          url: "https://obsidian.md",
          gratuito: "Sim"
        }
      ]
    }
  ];

  const getCorBadge = (cor: string) => {
    const cores: Record<string, string> = {
      purple: "bg-purple-100 text-purple-700",
      pink: "bg-pink-100 text-pink-700",
      blue: "bg-blue-100 text-blue-700",
      green: "bg-green-100 text-green-700",
      orange: "bg-orange-100 text-orange-700",
      indigo: "bg-indigo-100 text-indigo-700"
    };
    return cores[cor] || "bg-gray-100 text-gray-700";
  };

  const getCorBorda = (cor: string) => {
    const cores: Record<string, string> = {
      purple: "border-purple-200 hover:border-purple-400",
      pink: "border-pink-200 hover:border-pink-400",
      blue: "border-blue-200 hover:border-blue-400",
      green: "border-green-200 hover:border-green-400",
      orange: "border-orange-200 hover:border-orange-400",
      indigo: "border-indigo-200 hover:border-indigo-400"
    };
    return cores[cor] || "border-gray-200 hover:border-gray-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm mb-6">
            <span className="text-2xl">🔧</span>
            <span className="text-sm font-medium text-purple-700">Recursos Essenciais</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">
            Ferramentas para Medicina
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Curadoria de ferramentas gratuitas e pagas para potencializar seus estudos. Use em conjunto com os prompts da biblioteca.
          </p>
        </div>

        {/* Categorias */}
        {categorias.map((categoria, idx) => (
          <section key={idx} className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">{categoria.emoji}</span>
              <h2 className="text-3xl font-bold text-gray-800">{categoria.nome}</h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoria.ferramentas.map((ferramenta, ferrIdx) => (
                <div 
                  key={ferrIdx}
                  className={`bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all border-2 ${getCorBorda(categoria.cor)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-800">{ferramenta.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getCorBadge(categoria.cor)}`}>
                      {ferramenta.gratuito}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {ferramenta.description}
                  </p>
                  <a
                    href={ferramenta.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    Acessar <ExternalLink size={14} />
                  </a>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-3">💡 Dica de Produtividade</h3>
          <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
            Combine estas ferramentas com os prompts da nossa biblioteca. Por exemplo: use ChatGPT com nossos prompts para criar resumos, depois organize no Notion e revise com Anki.
          </p>
          <a
            href="/medprompts/prompts"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-lg font-medium hover:shadow-lg transition-all"
          >
            Ver Biblioteca de Prompts →
          </a>
        </div>
      </div>
    </div>
  );
};

export default Ferramentas;

