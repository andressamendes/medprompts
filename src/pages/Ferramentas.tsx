import { Link } from "react-router-dom";
import { PublicNavbar } from "@/components/PublicNavbar";
import { SEOHead } from "@/components/SEOHead";
import { ExternalLink, DollarSign, Info, Filter, X, Search, Smartphone, Globe, Monitor } from "lucide-react";
import { useState, useMemo } from "react";

const Ferramentas = () => {
  const [ferramentaExpandida, setFerramentaExpandida] = useState<string | null>(null);

  // Estados dos filtros
  const [filtroPreco, setFiltroPreco] = useState<string>("todos");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todos");
  const [filtroPais, setFiltroPais] = useState<string>("todos");
  const [busca, setBusca] = useState<string>("");

  // Array estático de categorias - memoizado para evitar recriação a cada render
   
  const categorias = useMemo(() => [
    {
      nome: "IAs Especializadas",
      emoji: "🤖",
      cor: "purple",
      ferramentas: [
        {
          name: "ChatGPT (OpenAI)",
          description: "IA conversacional com modelos de raciocínio (o3-mini e o4-mini gratuitos). Acesso ao ChatGPT Health dedicado para medicina.",
          url: "https://chat.openai.com",
          gratuito: "Sim",
          preco: "Gratuito / US$ 20/mês (Plus)",
          plataformas: ["Web", "iOS", "Android"],
          pais: "internacional",
          detalhes: {
            pros: ["o3-mini e o4-mini gratuitos", "ChatGPT Health para medicina", "Custom GPTs", "DALL-E 3"],
            contras: ["Limite de mensagens no gratuito", "GPT-4o será descontinuado 16/02/2026"],
            ideal: "Casos clínicos, questões de residência, criação de conteúdo"
          },
          badge: "ATUALIZADO 2026",
          badgeColor: "bg-blue-100 text-blue-700"
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
          name: "NotebookLM",
          description: "EXCLUSIVO para estudantes! Trabalha com fontes carregadas sem alucinações. Gera podcasts, slides, infográficos, mapas mentais e mind maps automáticos.",
          url: "https://notebooklm.google.com",
          gratuito: "Sim",
          preco: "GRATUITO (100 notebooks)",
          detalhes: {
            pros: ["Podcasts interativos (Audio AI)", "Slides automáticos", "Infográficos visuais", "Mapas mentais", "Sem alucinações", "Múltiplos idiomas"],
            contras: ["Apenas 100 notebooks no plano grátis", "Requer upload de fontes"],
            ideal: "Revisão de material, compreensão profunda, criação de apresentações"
          },
          badge: "ATUALIZADO 2026",
          badgeColor: "bg-blue-100 text-blue-700"
        },
        {
          name: "Anki",
          description: "Flashcards com repetição espaçada para memorização de longo prazo. Padrão-ouro para revisão médica.",
          url: "https://apps.ankiweb.net",
          gratuito: "Sim",
          preco: "Gratuito (Desktop/Android) / US$ 25 (iOS)",
          detalhes: {
            pros: ["Altamente customizável", "Add-ons poderosos", "Estatísticas avançadas", "Sync entre dispositivos", "Comunidade ativa"],
            contras: ["Interface desatualizada", "Curva de aprendizado íngreme", "iOS pago (US$ 25)"],
            ideal: "Memorização de longo prazo, revisão de anatomia, farmacologia",
            alternativas: ["RemNote (moderno com IA)", "Quizlet (mais simples)"]
          },
          badge: "Padrão-Ouro",
          badgeColor: "bg-yellow-100 text-yellow-800"
        },
        {
          name: "RemNote",
          description: "Alternativa moderna ao Anki com note-taking integrado e IA. Combina flashcards com organização de notas.",
          url: "https://remnote.com",
          gratuito: "Sim",
          preco: "Gratuito / US$ 6/mês (Pro)",
          detalhes: {
            pros: ["Interface moderna", "IA integrada", "Note-taking + flashcards", "Sincronização automática", "Menos curva de aprendizado"],
            contras: ["Menos add-ons que Anki", "Comunidade menor"],
            ideal: "Estudantes que querem Anki moderno, organização + revisão integrada"
          },
          badge: "NOVO 2026",
          badgeColor: "bg-green-100 text-green-700"
        },
        {
          name: "Notion",
          description: "Plataforma all-in-one para notas, bancos de dados e organização. Integração com IAs e templates para medicina.",
          url: "https://www.notion.so",
          gratuito: "Parcial",
          preco: "Gratuito / US$ 10/mês (Plus) / US$ 8/mês (Estudante)",
          detalhes: {
            pros: ["Interface visual bonita", "Templates para medicina", "Integração com IAs", "Colaboração em tempo real", "Desconto estudantil"],
            contras: ["Pode ficar lento com muitos dados", "Curva de aprendizado moderada"],
            ideal: "Organização de notas, projetos, cronogramas de estudo",
            alternativas: ["Obsidian (local + gratuito)", "RemNote (foco em revisão)"]
          },
          badge: "Desconto Estudante",
          badgeColor: "bg-blue-100 text-blue-700"
        },
        {
          name: "Obsidian",
          description: "Segundo cérebro para organizar conhecimento com links bidirecionais. Arquivos locais em Markdown.",
          url: "https://obsidian.md",
          gratuito: "Sim",
          preco: "GRATUITO",
          detalhes: {
            pros: ["Totalmente gratuito", "Arquivos locais", "Plugins poderosos", "Links bidirecionais", "Privacidade total"],
            contras: ["Requer configuração", "Sync pago (US$ 10/mês)"],
            ideal: "Organização de conhecimento, segundo cérebro, pesquisa acadêmica"
          },
          badge: "Open Source",
          badgeColor: "bg-gray-100 text-gray-700"
        }
      ]
    },
    {
      nome: "IA Clínica Especializada",
      emoji: "🏥",
      cor: "red",
      ferramentas: [
        {
          name: "GoodNurse AI",
          description: "Tutor de IA focado especificamente em healthcare. Treinado em casos clínicos e guidelines médicos.",
          url: "https://goodnurse.ai",
          gratuito: "Parcial",
          preco: "Gratuito / US$ 15/mês (Pro)",
          detalhes: {
            pros: ["Especializado em saúde", "Casos clínicos práticos", "Feedback personalizado"],
            contras: ["Comunidade menor", "Menos recursos que ChatGPT Health"],
            ideal: "Estudantes de enfermagem e medicina, prática de casos clínicos"
          },
          badge: "Especializado",
          badgeColor: "bg-red-100 text-red-700"
        },
        {
          name: "DXplain",
          description: "Sistema de diagnóstico diferencial baseado em sintomas. Ferramenta educacional do MIT.",
          url: "https://dxplain.org",
          gratuito: "Sim",
          preco: "GRATUITO (uso educacional)",
          detalhes: {
            pros: ["Baseado em evidências", "Desenvolvido pelo MIT", "Ferramenta educacional"],
            contras: ["Interface antiga", "Apenas em inglês"],
            ideal: "Prática de diagnóstico diferencial, raciocínio clínico"
          },
          badge: "MIT",
          badgeColor: "bg-blue-100 text-blue-700"
        },
        {
          name: "Isabel Healthcare",
          description: "Gerador de diagnóstico diferencial baseado em sintomas. Usado em hospitais e escolas médicas.",
          url: "https://isabelhealthcare.com",
          gratuito: "Parcial",
          preco: "Trial gratuito / US$ 29/mês",
          detalhes: {
            pros: ["Usado em hospitais", "Base de dados extensa", "Múltiplos idiomas"],
            contras: ["Caro para estudantes", "Trial limitado"],
            ideal: "Diagnóstico diferencial complexo, casos raros"
          },
          badge: "Profissional",
          badgeColor: "bg-blue-100 text-blue-700"
        }
      ]
    },
    {
      nome: "Simuladores e Casos Clínicos",
      emoji: "🎯",
      cor: "teal",
      ferramentas: [
        {
          name: "Aquifer",
          description: "Casos clínicos virtuais interativos para estudantes de medicina. Padrão em muitas escolas médicas.",
          url: "https://aquifer.org",
          gratuito: "Não",
          preco: "Varia (institucional)",
          detalhes: {
            pros: ["Casos de alta qualidade", "Feedback detalhado", "Padrão em escolas médicas"],
            contras: ["Requer acesso institucional", "Caro individualmente"],
            ideal: "Prática de raciocínio clínico, preparação para clerkships"
          },
          badge: "Institucional",
          badgeColor: "bg-teal-100 text-teal-700"
        },
        {
          name: "NEJM Knowledge+",
          description: "Questões e revisão clínica do New England Journal of Medicine. Preparação para boards.",
          url: "https://knowledgeplus.nejm.org",
          gratuito: "Parcial",
          preco: "Trial / US$ 299/ano",
          detalhes: {
            pros: ["Questões de alta qualidade", "Explicações detalhadas", "NEJM credibilidade"],
            contras: ["Caro", "Foco em boards americanos"],
            ideal: "Preparação para USMLE, revisão clínica avançada"
          },
          badge: "NEJM",
          badgeColor: "bg-blue-100 text-blue-700"
        },
        {
          name: "Osmosis",
          description: "Plataforma de vídeos educativos, questões e revisão. Estilo visual e didático.",
          url: "https://osmosis.org",
          gratuito: "Parcial",
          preco: "Trial / US$ 59/mês",
          detalhes: {
            pros: ["Vídeos de alta qualidade", "Interface visual", "Questões integradas"],
            contras: ["Caro", "Foco em conteúdo americano"],
            ideal: "Aprendizado visual, revisão rápida, conceitos complexos"
          },
          badge: "Visual",
          badgeColor: "bg-orange-100 text-orange-700"
        },
        {
          name: "Lecturio",
          description: "Plataforma de vídeo-aulas médicas completa. Preparação para exames e revisão de conteúdo.",
          url: "https://lecturio.com",
          gratuito: "Parcial",
          preco: "Trial / US$ 39/mês",
          detalhes: {
            pros: ["Vídeo-aulas completas", "Questões integradas", "Spaced repetition"],
            contras: ["Caro", "Muito conteúdo pode ser overwhelming"],
            ideal: "Revisão completa, preparação para exames, aprendizado estruturado"
          },
          badge: "Completo",
          badgeColor: "bg-blue-100 text-blue-700"
        }
      ]
    },
    {
      nome: "Gestão de Referências",
      emoji: "📖",
      cor: "cyan",
      ferramentas: [
        {
          name: "Zotero",
          description: "Gerenciador de referências gratuito e open-source. Padrão para acadêmicos.",
          url: "https://zotero.org",
          gratuito: "Sim",
          preco: "GRATUITO",
          detalhes: {
            pros: ["Totalmente gratuito", "Open-source", "Plugins poderosos", "Integração com Word/Google Docs"],
            contras: ["Interface menos moderna", "Sync limitado (300MB grátis)"],
            ideal: "Gestão de referências, trabalhos acadêmicos, TCC"
          },
          badge: "Open Source",
          badgeColor: "bg-gray-100 text-gray-700"
        },
        {
          name: "Mendeley",
          description: "Gerenciador de referências com rede social acadêmica. Integração com Elsevier.",
          url: "https://mendeley.com",
          gratuito: "Sim",
          preco: "GRATUITO / Planos pagos",
          detalhes: {
            pros: ["Interface moderna", "Rede social acadêmica", "Integração Elsevier", "PDF annotation"],
            contras: ["Sync limitado", "Propriedade Elsevier (privacidade)"],
            ideal: "Gestão de referências, descoberta de papers, colaboração"
          },
          badge: "Gratuito",
          badgeColor: "bg-green-100 text-green-700"
        },
        {
          name: "Paperpile",
          description: "Gerenciador de referências integrado ao Google Docs. Interface moderna e limpa.",
          url: "https://paperpile.com",
          gratuito: "Não",
          preco: "Trial / US$ 2.99/mês (Estudante)",
          detalhes: {
            pros: ["Integração Google Docs perfeita", "Interface moderna", "Desconto estudantil"],
            contras: ["Pago", "Depende do Google"],
            ideal: "Quem usa Google Docs, escrita acadêmica fluida"
          },
          badge: "Desconto Estudante",
          badgeColor: "bg-blue-100 text-blue-700"
        },
        {
          name: "EndNote",
          description: "Gerenciador de referências profissional. Padrão em muitas instituições.",
          url: "https://endnote.com",
          gratuito: "Não",
          preco: "US$ 249.95 (perpétuo) ou institucional",
          detalhes: {
            pros: ["Padrão institucional", "Recursos avançados", "Suporte profissional"],
            contras: ["Muito caro", "Interface complexa", "Overkill para estudantes"],
            ideal: "Uso institucional, pesquisadores seniores"
          },
          badge: "Profissional",
          badgeColor: "bg-blue-100 text-blue-700"
        }
      ]
    },
    {
      nome: "IAs para Estudo",
      emoji: "🎓",
      cor: "emerald",
      ferramentas: [
        {
          name: "AI Blaze",
          description: "Assistente de IA pessoal que funciona em qualquer site. Crie prompts personalizados e use em qualquer lugar.",
          url: "https://blaze.today",
          gratuito: "Sim",
          preco: "GRATUITO / US$ 9/mês (Pro)",
          plataformas: ["Web", "Chrome Extension"],
          pais: "internacional",
          detalhes: {
            pros: ["Funciona em qualquer site", "Prompts personalizados", "Atalhos de teclado", "Templates salvos"],
            contras: ["Requer extensão do Chrome", "Limite no plano gratuito"],
            ideal: "Automação de prompts, uso em múltiplos sites, produtividade"
          },
          badge: "GRATUITO",
          badgeColor: "bg-green-100 text-green-700"
        },
        {
          name: "Jenni AI",
          description: "Assistente de IA focado em escrita acadêmica com citações automáticas e pesquisa integrada.",
          url: "https://jenni.ai",
          gratuito: "Parcial",
          preco: "Gratuito / US$ 20/mês",
          plataformas: ["Web"],
          pais: "internacional",
          detalhes: {
            pros: ["Citações automáticas", "Pesquisa integrada", "Escrita acadêmica", "Autocomplete inteligente"],
            contras: ["Limite de palavras no gratuito", "Foco em inglês"],
            ideal: "Trabalhos acadêmicos, TCC, artigos científicos"
          },
          badge: "Acadêmico",
          badgeColor: "bg-blue-100 text-blue-700"
        },
        {
          name: "Mindgrasp AI",
          description: "Transforma vídeos, PDFs e gravações em resumos, flashcards e quizzes automáticos.",
          url: "https://mindgrasp.ai",
          gratuito: "Parcial",
          preco: "Trial / US$ 9.99/mês",
          plataformas: ["Web"],
          pais: "internacional",
          detalhes: {
            pros: ["Resumos de vídeos", "Flashcards automáticos", "Quizzes gerados", "Múltiplos formatos"],
            contras: ["Trial limitado", "Qualidade varia com o material"],
            ideal: "Resumir palestras gravadas, criar materiais de revisão"
          },
          badge: "Automação",
          badgeColor: "bg-blue-100 text-blue-700"
        },
        {
          name: "YouLearn AI",
          description: "Upload de arquivos (PDF, vídeos, slides) e geração automática de quizzes e resumos.",
          url: "https://youlearn.ai",
          gratuito: "Sim",
          preco: "GRATUITO / US$ 7/mês (Premium)",
          plataformas: ["Web"],
          pais: "internacional",
          detalhes: {
            pros: ["Upload múltiplos formatos", "Quizzes automáticos", "Chat com documentos", "Interface simples"],
            contras: ["Limite de uploads gratuito", "Menos features que concorrentes"],
            ideal: "Estudantes que querem quizzes rápidos de material próprio"
          },
          badge: "GRATUITO",
          badgeColor: "bg-green-100 text-green-700"
        },
        {
          name: "Unriddle AI",
          description: "Organiza fontes de pesquisa e permite fazer perguntas sobre múltiplos documentos simultaneamente.",
          url: "https://unriddle.ai",
          gratuito: "Parcial",
          preco: "Gratuito / US$ 16/mês",
          plataformas: ["Web"],
          pais: "internacional",
          detalhes: {
            pros: ["Organização automática", "Busca em múltiplos docs", "Citações precisas", "Interface limpa"],
            contras: ["Limite no plano gratuito", "Curva de aprendizado"],
            ideal: "Pesquisa acadêmica, revisão de literatura, meta-análises"
          },
          badge: "Pesquisa",
          badgeColor: "bg-blue-100 text-blue-700"
        },
        {
          name: "TurboLearn AI",
          description: "Transforma qualquer arquivo em notas estruturadas instantaneamente com IA.",
          url: "https://turbolearn.ai",
          gratuito: "Parcial",
          preco: "Trial / US$ 10/mês",
          plataformas: ["Web"],
          pais: "internacional",
          detalhes: {
            pros: ["Notas instantâneas", "Estruturação automática", "Suporta vários formatos"],
            contras: ["Trial muito limitado", "Qualidade inconsistente"],
            ideal: "Criar notas rápidas de PDFs e slides"
          },
          badge: "Rápido",
          badgeColor: "bg-orange-100 text-orange-700"
        }
      ]
    },
    {
      nome: "Notas Inteligentes",
      emoji: "📝",
      cor: "violet",
      ferramentas: [
        {
          name: "Roam Research",
          description: "Sistema de notas em rede (networked note-taking) com links bidirecionais. Ideal para medicina e conhecimento conectado.",
          url: "https://roamresearch.com",
          gratuito: "Não",
          preco: "US$ 15/mês / US$ 165/ano",
          plataformas: ["Web"],
          pais: "internacional",
          detalhes: {
            pros: ["Links bidirecionais poderosos", "Graph view", "Comunidade acadêmica forte", "Plugins e extensões"],
            contras: ["Caro", "Curva de aprendizado alta", "Apenas web"],
            ideal: "Estudantes avançados, pesquisa complexa, segundo cérebro"
          },
          badge: "Avançado",
          badgeColor: "bg-blue-100 text-blue-700"
        },
        {
          name: "Logseq",
          description: "Alternativa open-source ao Roam Research. Arquivos locais em Markdown com links bidirecionais.",
          url: "https://logseq.com",
          gratuito: "Sim",
          preco: "GRATUITO (Open Source)",
          plataformas: ["Web", "Desktop", "iOS", "Android"],
          pais: "internacional",
          detalhes: {
            pros: ["Totalmente gratuito", "Open-source", "Arquivos locais", "Links bidirecionais", "Graph view"],
            contras: ["Requer configuração", "Sync não oficial", "Interface pode confundir"],
            ideal: "Quem quer Roam gratuito, privacidade, controle total"
          },
          badge: "Open Source",
          badgeColor: "bg-gray-100 text-gray-700"
        },
        {
          name: "Capacities",
          description: "Sistema de gestão de conhecimento pessoal com tipos de objetos e IA integrada.",
          url: "https://capacities.io",
          gratuito: "Sim",
          preco: "GRATUITO / US$ 10/mês (Pro)",
          plataformas: ["Web", "Desktop"],
          pais: "internacional",
          detalhes: {
            pros: ["Interface moderna", "Tipos de objetos", "IA integrada", "Multiplataforma"],
            contras: ["Ainda em desenvolvimento ativo", "Comunidade menor"],
            ideal: "Organização estruturada de conhecimento, estudantes visuais"
          },
          badge: "Moderno",
          badgeColor: "bg-blue-100 text-blue-700"
        },
        {
          name: "Heptabase",
          description: "Visual note-taking com whiteboards e conexões visuais. Ideal para mapas conceituais médicos.",
          url: "https://heptabase.com",
          gratuito: "Não",
          preco: "Trial / US$ 8.99/mês (Estudante)",
          plataformas: ["Web", "Desktop"],
          pais: "internacional",
          detalhes: {
            pros: ["Visual e intuitivo", "Whiteboards", "Desconto estudantil", "Ótimo para conceitos complexos"],
            contras: ["Pago", "Não tem mobile"],
            ideal: "Aprendizado visual, mapas conceituais, fisiopatologia"
          },
          badge: "Visual",
          badgeColor: "bg-green-100 text-green-700"
        }
      ]
    },
    {
      nome: "Ferramentas Brasileiras",
      emoji: "🇧🇷",
      cor: "yellow",
      ferramentas: [
        {
          name: "Jaleko",
          description: "Plataforma brasileira de questões para residência médica. Questões de provas reais.",
          url: "https://jaleko.com.br",
          gratuito: "Parcial",
          preco: "Gratuito / Planos pagos",
          plataformas: ["Web", "iOS", "Android"],
          pais: "brasil",
          detalhes: {
            pros: ["Questões de provas brasileiras", "Comentários em português", "Estatísticas de desempenho"],
            contras: ["Algumas features pagas", "Interface pode melhorar"],
            ideal: "Preparação para residência médica brasileira"
          },
          badge: "🇧🇷 Brasil",
          badgeColor: "bg-green-100 text-green-700"
        },
        {
          name: "Medcel",
          description: "Preparação para residência médica. Cursos, questões e materiais em português.",
          url: "https://medcel.com.br",
          gratuito: "Não",
          preco: "Planos variados",
          plataformas: ["Web"],
          pais: "brasil",
          detalhes: {
            pros: ["Conteúdo completo em PT-BR", "Questões atualizadas", "Cursos estruturados"],
            contras: ["Caro", "Requer assinatura"],
            ideal: "Preparação intensiva para residência médica"
          },
          badge: "🇧🇷 Brasil",
          badgeColor: "bg-yellow-100 text-yellow-700"
        },
        {
          name: "Estratégia MED",
          description: "Cursos e questões para residência médica. Grande banco de questões comentadas.",
          url: "https://estrategiamed.com",
          gratuito: "Parcial",
          preco: "Trial / Planos pagos",
          plataformas: ["Web", "iOS", "Android"],
          pais: "brasil",
          detalhes: {
            pros: ["Questões comentadas", "Cursos em vídeo", "Material atualizado"],
            contras: ["Caro", "Muito conteúdo pode ser overwhelming"],
            ideal: "Preparação para residência, revisão estruturada"
          },
          badge: "🇧🇷 Brasil",
          badgeColor: "bg-blue-100 text-blue-700"
        },
        {
          name: "MedRoom",
          description: "Comunidade brasileira de medicina com questões, discussões e networking.",
          url: "https://medroom.com.br",
          gratuito: "Sim",
          preco: "GRATUITO / Premium",
          plataformas: ["Web", "iOS", "Android"],
          pais: "brasil",
          detalhes: {
            pros: ["Comunidade ativa", "Questões gratuitas", "Networking com outros estudantes"],
            contras: ["Algumas features premium", "Qualidade variável do conteúdo"],
            ideal: "Networking, discussões de casos, questões gratuitas"
          },
          badge: "🇧🇷 Comunidade",
          badgeColor: "bg-green-100 text-green-700"
        }
      ]
    }
  ], []);

  const getCorBadge = (cor: string) => {
    const cores: Record<string, string> = {
      purple: "bg-blue-100 text-blue-700",
      pink: "bg-green-100 text-green-700",
      blue: "bg-blue-100 text-blue-700",
      green: "bg-green-100 text-green-700",
      orange: "bg-orange-100 text-orange-700",
      indigo: "bg-blue-100 text-blue-700",
      red: "bg-red-100 text-red-700",
      teal: "bg-teal-100 text-teal-700",
      cyan: "bg-cyan-100 text-cyan-700",
      yellow: "bg-yellow-100 text-yellow-700",
      emerald: "bg-emerald-100 text-emerald-700",
      violet: "bg-violet-100 text-violet-700"
    };
    return cores[cor] || "bg-gray-100 text-gray-700";
  };

  const getCorBorda = (cor: string) => {
    const cores: Record<string, string> = {
      purple: "border-blue-200 hover:border-blue-400",
      pink: "border-green-200 hover:border-green-400",
      blue: "border-blue-200 hover:border-blue-400",
      green: "border-green-200 hover:border-green-400",
      orange: "border-orange-200 hover:border-orange-400",
      indigo: "border-indigo-200 hover:border-indigo-400",
      red: "border-red-200 hover:border-red-400",
      teal: "border-teal-200 hover:border-teal-400",
      cyan: "border-cyan-200 hover:border-cyan-400",
      yellow: "border-yellow-200 hover:border-yellow-400",
      emerald: "border-emerald-200 hover:border-emerald-400",
      violet: "border-violet-200 hover:border-violet-400"
    };
    return cores[cor] || "border-gray-200 hover:border-gray-400";
  };

  // Função de filtragem
  const categoriasFiltradas = useMemo(() => {
    return categorias.map(categoria => ({
      ...categoria,
      ferramentas: categoria.ferramentas.filter((ferramenta: any) => {
        // Filtro de busca
        if (busca) {
          const buscaLower = busca.toLowerCase();
          const matchName = ferramenta.name.toLowerCase().includes(buscaLower);
          const matchDesc = ferramenta.description.toLowerCase().includes(buscaLower);
          if (!matchName && !matchDesc) return false;
        }

        // Filtro de preço
        if (filtroPreco !== "todos") {
          if (filtroPreco === "gratuito" && ferramenta.gratuito !== "Sim") return false;
          if (filtroPreco === "pago" && ferramenta.gratuito === "Sim") return false;
          if (filtroPreco === "freemium" && ferramenta.gratuito !== "Parcial") return false;
        }

        // Filtro de categoria
        if (filtroCategoria !== "todos" && categoria.nome !== filtroCategoria) return false;

        // Filtro de país
        if (filtroPais !== "todos") {
          if (filtroPais === "brasil" && ferramenta.pais !== "brasil") return false;
          if (filtroPais === "internacional" && ferramenta.pais !== "internacional") return false;
        }

        return true;
      })
    })).filter(cat => cat.ferramentas.length > 0);
  }, [categorias, busca, filtroPreco, filtroCategoria, filtroPais]);

  // Resetar filtros
  const resetarFiltros = () => {
    setFiltroPreco("todos");
    setFiltroCategoria("todos");
    setFiltroPais("todos");
    setBusca("");
  };

  // Verificar se há filtros ativos
  const hasFiltrosAtivos = filtroPreco !== "todos" || filtroCategoria !== "todos" || filtroPais !== "todos" || busca !== "";

  // Contar total de ferramentas filtradas
  const totalFerramentasFiltradas = categoriasFiltradas.reduce((acc, cat) => acc + cat.ferramentas.length, 0);

  return (
    <>
      <SEOHead
        title="Hub de Ferramentas para Medicina"
        description={`Curadoria de ${totalFerramentasFiltradas}+ ferramentas gratuitas e pagas para estudantes de medicina. IAs, calculadoras, referencias clinicas e mais.`}
        canonical="https://andressamendes.github.io/medprompts/ferramentas"
        breadcrumbs={[
          { name: 'Home', url: 'https://andressamendes.github.io/medprompts/' },
          { name: 'Ferramentas', url: 'https://andressamendes.github.io/medprompts/ferramentas' }
        ]}
      />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <PublicNavbar />

        {/* Skip link removido - já existe no App.tsx via SkipLinks global */}

      <main id="main-content" className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16" aria-labelledby="ferramentas-heading">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg mb-6">
            <span className="text-2xl">⚡</span>
            <span className="text-sm font-semibold">Atualizado Janeiro 2026</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 text-blue-600 dark:text-blue-400">
            Hub de Ferramentas para Medicina
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Curadoria completa de ferramentas gratuitas e pagas para potencializar seus estudos. Atualizada com os recursos mais recentes de 2026.
          </p>

          {/* Estatísticas */}
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">50+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Ferramentas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">10+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Categorias</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">20+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Gratuitas</div>
            </div>
          </div>
        </header>

        {/* Banner de novidades 2026 */}
        <div className="mb-12 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            🆕 Novidades 2026
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-bold text-sm text-blue-700 dark:text-blue-400 mb-1">NotebookLM</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Podcasts interativos, slides automáticos, infográficos e mapas mentais</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-bold text-sm text-green-700 mb-1">o3-mini e o4-mini</h3>
              <p className="text-xs text-gray-600">Modelos de raciocínio ChatGPT agora GRATUITOS</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-bold text-sm text-rose-700 mb-1">RemNote</h3>
              <p className="text-xs text-gray-600">Alternativa moderna ao Anki com IA integrada</p>
            </div>
          </div>
        </div>

        {/* Sistema de Filtros e Busca */}
        <div className="mb-12 bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Filter className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Filtrar Ferramentas</h2>
                <p className="text-sm text-gray-600">Encontre exatamente o que você precisa</p>
              </div>
            </div>
            {hasFiltrosAtivos && (
              <button
                onClick={resetarFiltros}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              >
                <X className="h-4 w-4" />
                Limpar Filtros
              </button>
            )}
          </div>

          {/* Barra de Busca - WCAG 1.3.1, 4.1.2 */}
          <div className="mb-6">
            <label htmlFor="busca-ferramentas" className="sr-only">
              Buscar ferramentas
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
              <input
                id="busca-ferramentas"
                type="search"
                placeholder="Buscar ferramentas por nome ou descrição..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[44px]"
                aria-describedby="busca-resultados"
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Filtro de Preço */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Por Preço</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFiltroPreco("todos")}
                  className={`px-4 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-all ${
                    filtroPreco === "todos"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFiltroPreco("gratuito")}
                  className={`px-4 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-all ${
                    filtroPreco === "gratuito"
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Gratuitos
                </button>
                <button
                  onClick={() => setFiltroPreco("freemium")}
                  className={`px-4 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-all ${
                    filtroPreco === "freemium"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Freemium
                </button>
                <button
                  onClick={() => setFiltroPreco("pago")}
                  className={`px-4 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-all ${
                    filtroPreco === "pago"
                      ? "bg-orange-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Pagos
                </button>
              </div>
            </div>

            {/* Filtro de Categoria */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Por Categoria</label>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm font-medium"
              >
                <option value="todos">Todas as Categorias</option>
                {categorias.map((cat, idx) => (
                  <option key={idx} value={cat.nome}>{cat.emoji} {cat.nome}</option>
                ))}
              </select>
            </div>

            {/* Filtro de País */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Por Região</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFiltroPais("todos")}
                  className={`px-4 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-all ${
                    filtroPais === "todos"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFiltroPais("brasil")}
                  className={`px-4 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-all ${
                    filtroPais === "brasil"
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  🇧🇷 Brasil
                </button>
                <button
                  onClick={() => setFiltroPais("internacional")}
                  className={`px-4 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-all ${
                    filtroPais === "internacional"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  🌎 Internacional
                </button>
              </div>
            </div>
          </div>

          {/* Contador de Resultados - Live region para leitores de tela */}
          {hasFiltrosAtivos && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p
                id="busca-resultados"
                className="text-center text-sm text-gray-600"
                role="status"
                aria-live="polite"
              >
                <strong className="text-blue-600 text-lg">{totalFerramentasFiltradas}</strong> {totalFerramentasFiltradas === 1 ? 'ferramenta encontrada' : 'ferramentas encontradas'}
              </p>
            </div>
          )}
        </div>

        {/* Mensagem se não houver resultados */}
        {totalFerramentasFiltradas === 0 && (
          <div className="mb-12 text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-300">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Nenhuma ferramenta encontrada</h3>
            <p className="text-gray-600 mb-6">Tente ajustar os filtros ou a busca</p>
            <button
              onClick={resetarFiltros}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        )}

        {/* Categorias */}
        {categoriasFiltradas.map((categoria, idx) => (
          <section key={idx} className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">{categoria.emoji}</span>
              <h2 className="text-3xl font-bold text-gray-800">{categoria.nome}</h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoria.ferramentas.map((ferramenta: any, ferrIdx: number) => {
                const isExpanded = ferramentaExpandida === `${idx}-${ferrIdx}`;
                const hasDetalhes = ferramenta.detalhes;

                return (
                  <article
                    key={ferrIdx}
                    className={`bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all border-2 ${getCorBorda(categoria.cor)} relative`}
                    aria-label={`${ferramenta.name}: ${ferramenta.description}`}
                  >
                    {/* Badge de novidade/status */}
                    {ferramenta.badge && (
                      <div className={`absolute -top-3 -right-3 px-3 py-1 rounded-full text-xs font-bold ${ferramenta.badgeColor} shadow-md`}>
                        {ferramenta.badge}
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-800 pr-2">{ferramenta.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getCorBadge(categoria.cor)} whitespace-nowrap`}>
                        {ferramenta.gratuito}
                      </span>
                    </div>

                    {/* Preço detalhado */}
                    {ferramenta.preco && (
                      <div className="flex items-center gap-2 mb-3">
                        <DollarSign size={16} className="text-green-600" />
                        <span className="text-sm font-semibold text-gray-700">{ferramenta.preco}</span>
                      </div>
                    )}

                    {/* Plataformas disponíveis */}
                    {ferramenta.plataformas && ferramenta.plataformas.length > 0 && (
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {ferramenta.plataformas.map((plat: string, i: number) => {
                          let icon = null;
                          let colorClass = "bg-gray-100 text-gray-700";

                          if (plat === "Web") {
                            icon = <Globe size={12} />;
                            colorClass = "bg-blue-100 text-blue-700";
                          } else if (plat === "iOS") {
                            icon = <Smartphone size={12} />;
                            colorClass = "bg-gray-800 text-white";
                          } else if (plat === "Android") {
                            icon = <Smartphone size={12} />;
                            colorClass = "bg-green-600 text-white";
                          } else if (plat === "Desktop") {
                            icon = <Monitor size={12} />;
                            colorClass = "bg-blue-100 text-blue-700";
                          } else if (plat === "Chrome Extension") {
                            icon = <Globe size={12} />;
                            colorClass = "bg-yellow-100 text-yellow-700";
                          }

                          return (
                            <span key={i} className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
                              {icon}
                              {plat}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {ferramenta.description}
                    </p>

                    {/* Detalhes expansíveis */}
                    {hasDetalhes && (
                      <div className="mb-4">
                        <button
                          onClick={() => setFerramentaExpandida(isExpanded ? null : `${idx}-${ferrIdx}`)}
                          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                        >
                          <Info size={14} />
                          {isExpanded ? 'Ocultar detalhes' : 'Ver detalhes'}
                        </button>

                        {isExpanded && (
                          <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            {/* Prós */}
                            {ferramenta.detalhes.pros && (
                              <div>
                                <h4 className="text-xs font-bold text-green-700 uppercase mb-2">✓ Prós</h4>
                                <ul className="space-y-1">
                                  {ferramenta.detalhes.pros.map((pro: string, i: number) => (
                                    <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                                      <span className="text-green-600 mt-0.5">•</span>
                                      <span>{pro}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Contras */}
                            {ferramenta.detalhes.contras && (
                              <div>
                                <h4 className="text-xs font-bold text-red-700 uppercase mb-2">✗ Contras</h4>
                                <ul className="space-y-1">
                                  {ferramenta.detalhes.contras.map((contra: string, i: number) => (
                                    <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                                      <span className="text-red-600 mt-0.5">•</span>
                                      <span>{contra}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Ideal para */}
                            {ferramenta.detalhes.ideal && (
                              <div>
                                <h4 className="text-xs font-bold text-blue-700 uppercase mb-2">💡 Ideal Para</h4>
                                <p className="text-xs text-gray-700">{ferramenta.detalhes.ideal}</p>
                              </div>
                            )}

                            {/* Alternativas */}
                            {ferramenta.detalhes.alternativas && (
                              <div>
                                <h4 className="text-xs font-bold text-purple-700 uppercase mb-2">🔄 Alternativas</h4>
                                <ul className="space-y-1">
                                  {ferramenta.detalhes.alternativas.map((alt: string, i: number) => (
                                    <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                                      <span className="text-blue-600 mt-0.5">→</span>
                                      <span>{alt}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <a
                      href={ferramenta.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-purple-700 transition-colors"
                      aria-label={`Acessar ${ferramenta.name}`}
                    >
                      Acessar <ExternalLink size={14} aria-hidden="true" />
                    </a>
                  </article>
                );
              })}
            </div>
          </section>
        ))}

        {/* Stack Recomendado */}
        <div className="mt-16 mb-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-6 text-center">🎯 Stacks Recomendados por Orçamento</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Stack Gratuito */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3">💚 Orçamento Zero</h3>
              <p className="text-sm text-white/80 mb-4">Stack completo sem gastar nada</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">1.</span>
                  <span><strong>NotebookLM</strong> - Revisão e podcasts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">2.</span>
                  <span><strong>o4-mini</strong> - Raciocínio gratuito</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">3.</span>
                  <span><strong>Anki</strong> - Revisão espaçada</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">4.</span>
                  <span><strong>Zotero</strong> - Gestão de referências</span>
                </li>
              </ul>
            </div>

            {/* Stack Estudante */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border-2 border-yellow-300">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-bold">🎓 Estudante (~US$ 20)</h3>
                <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full font-bold">Popular</span>
              </div>
              <p className="text-sm text-white/80 mb-4">Melhor custo-benefício para medicina</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">🏆</span>
                  <span><strong>ChatGPT Plus</strong> - Health + o4-mini</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">+</span>
                  <span>Todas as ferramentas gratuitas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">+</span>
                  <span><strong>Notion</strong> - Desconto estudante</span>
                </li>
              </ul>
            </div>

            {/* Stack Premium */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3">🚀 Premium (~US$ 40)</h3>
              <p className="text-sm text-white/80 mb-4">Stack completo profissional</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">1.</span>
                  <span><strong>ChatGPT Plus</strong> US$ 20</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">2.</span>
                  <span><strong>Claude Opus 4.5</strong> US$ 20</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">+</span>
                  <span>Todas as ferramentas gratuitas</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Workflows */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-3 text-center">💡 Workflows de Estudo</h3>
          <p className="text-purple-100 mb-6 max-w-3xl mx-auto text-center">
            Combine estas ferramentas com os prompts da nossa biblioteca para criar workflows poderosos de estudo
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
              <h4 className="font-bold mb-2">📚 Workflow de Revisão</h4>
              <p className="text-sm text-white/90">
                NotebookLM (material) → Podcast (primeira revisão) → ChatGPT (criar flashcards) → Anki (revisão espaçada)
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
              <h4 className="font-bold mb-2">🏥 Workflow Clínico</h4>
              <p className="text-sm text-white/90">
                ChatGPT Health (caso clínico) → DXplain (DDx) → UpToDate (guidelines) → Notion (anotações)
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
              <h4 className="font-bold mb-2">📖 Workflow de Pesquisa</h4>
              <p className="text-sm text-white/90">
                Perplexity (pesquisa inicial) → PubMed (artigos) → Zotero (referências) → Claude (análise profunda)
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
              <h4 className="font-bold mb-2">🎯 Workflow de Residência</h4>
              <p className="text-sm text-white/90">
                Jaleko/MedRoom (questões) → o4-mini (resolver complexas) → Anki (revisar erros) → RemNote (organizar)
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/prompts"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Ver Biblioteca de Prompts →
            </Link>
          </div>
        </div>

        {/* Footer com informações */}
        <div className="mt-12 text-center space-y-3 pb-8">
          <p className="text-sm text-gray-600">
            <strong>Última atualização:</strong> 11 de Janeiro de 2026
          </p>
          <p className="text-xs text-gray-500">
            Hub de ferramentas atualizado com as novidades mais recentes para estudantes de medicina
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500 flex-wrap">
            <span className="flex items-center gap-1">✅ NotebookLM 2026</span>
            <span className="flex items-center gap-1">✅ o3/o4-mini gratuitos</span>
            <span className="flex items-center gap-1">✅ RemNote adicionado</span>
            <span className="flex items-center gap-1">✅ 4 novas categorias</span>
            <span className="flex items-center gap-1">✅ Ferramentas brasileiras</span>
          </div>
        </div>
      </main>
    </div>
    </>
  );
};

export default Ferramentas;

