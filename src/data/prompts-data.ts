import { Prompt } from '@/types/prompt'

export const prompts: Prompt[] = [
  {
    id: "1",
    title: "Resumo de Artigo Científico",
    description: "Cria resumos estruturados de artigos médicos com foco em metodologia e resultados",
    content: "Analise o seguinte artigo científico e forneça um resumo estruturado contendo: 1) Objetivo do estudo, 2) Metodologia utilizada, 3) Principais resultados, 4) Conclusões, 5) Limitações do estudo. Artigo: [COLE O TEXTO AQUI]",
    category: "pesquisa",
    recommendedModel: "Claude 3.5 Sonnet",
    tips: [
      "Cole o texto completo ou os principais trechos do artigo",
      "Peça para destacar a relevância clínica dos achados",
      "Solicite comparação com guidelines atuais se necessário"
    ]
  },
  {
    id: "2",
    title: "Raciocínio Clínico",
    description: "Auxilia na construção de raciocínio clínico baseado em sintomas e sinais",
    content: "Com base nos seguintes dados clínicos, construa um raciocínio clínico estruturado: 1) Liste as hipóteses diagnósticas em ordem de probabilidade, 2) Justifique cada hipótese, 3) Sugira exames complementares necessários, 4) Proponha condutas iniciais. Dados do paciente: [DESCREVA IDADE, SINTOMAS, SINAIS, HISTÓRIA]",
    category: "clinica",
    recommendedModel: "ChatGPT-4o",
    tips: [
      "Forneça idade, sexo e comorbidades do paciente",
      "Descreva sintomas com duração e características",
      "Inclua dados de exame físico quando disponíveis"
    ]
  },
  {
    id: "3",
    title: "Flashcards para Estudo",
    description: "Gera flashcards de conceitos médicos importantes para revisão",
    content: "Crie 10 flashcards no formato pergunta/resposta sobre o tema: [TEMA]. As perguntas devem abordar: conceitos fundamentais, fisiopatologia, diagnóstico e tratamento. Utilize linguagem clara e objetiva adequada para estudante de medicina.",
    category: "estudos",
    recommendedModel: "ChatGPT-4o",
    tips: [
      "Especifique o tema com clareza",
      "Peça flashcards de diferentes níveis de dificuldade",
      "Solicite explicações detalhadas nas respostas"
    ]
  },
  {
    id: "4",
    title: "Interpretação de Exames",
    description: "Auxilia na interpretação de resultados de exames laboratoriais e de imagem",
    content: "Interprete os seguintes resultados de exames, considerando: 1) Valores de referência, 2) Significado clínico das alterações, 3) Possíveis diagnósticos associados, 4) Necessidade de exames complementares. Exames: [COLE OS RESULTADOS AQUI]",
    category: "clinica",
    recommendedModel: "Claude 3.5 Sonnet",
    tips: [
      "Inclua os valores de referência do laboratório",
      "Forneça contexto clínico do paciente",
      "Mencione medicações em uso se relevante"
    ]
  },
  {
    id: "5",
    title: "Questões de Prova Estilo Residência",
    description: "Cria questões de múltipla escolha no estilo de provas de residência médica",
    content: "Crie 5 questões de múltipla escolha sobre [TEMA] no estilo de prova de residência médica. Cada questão deve ter: 1) Caso clínico ou contexto, 2) 5 alternativas, 3) Gabarito comentado explicando por que cada alternativa está correta ou incorreta.",
    category: "estudos",
    recommendedModel: "ChatGPT-4o",
    tips: [
      "Especifique a especialidade ou área desejada",
      "Peça questões de diferentes níveis de dificuldade",
      "Solicite referências bibliográficas nas explicações"
    ]
  },
  {
    id: "6",
    title: "Plano Terapêutico",
    description: "Elabora planos terapêuticos estruturados baseados em diretrizes",
    content: "Elabore um plano terapêutico completo para: [DIAGNÓSTICO]. Inclua: 1) Medidas não farmacológicas, 2) Tratamento farmacológico (medicações, doses, via, duração), 3) Orientações ao paciente, 4) Critérios de monitoramento, 5) Sinais de alerta. Considere as diretrizes atuais.",
    category: "clinica",
    recommendedModel: "Claude 3.5 Sonnet",
    tips: [
      "Mencione comorbidades e contraindicações",
      "Especifique se há preferência por determinado guideline",
      "Indique situações especiais (gravidez, idosos, etc)"
    ]
  },
  {
    id: "7",
    title: "Revisão de Fisiopatologia",
    description: "Explica mecanismos fisiopatológicos de forma didática e visual",
    content: "Explique de forma didática a fisiopatologia de [DOENÇA/CONDIÇÃO], incluindo: 1) Mecanismos moleculares e celulares, 2) Cascata de eventos fisiopatológicos, 3) Correlação com manifestações clínicas, 4) Base racional do tratamento. Use analogias quando apropriado.",
    category: "estudos",
    recommendedModel: "ChatGPT-4o",
    tips: [
      "Peça explicações passo a passo",
      "Solicite diagramas ou fluxogramas em texto",
      "Relacione com casos clínicos quando possível"
    ]
  },
  {
    id: "8",
    title: "Metodologia de Pesquisa",
    description: "Auxilia no planejamento e estruturação de projetos de pesquisa médica",
    content: "Auxilie no planejamento de um projeto de pesquisa sobre [TEMA]. Forneça: 1) Sugestão de pergunta de pesquisa (formato PICO), 2) Tipo de estudo mais adequado, 3) Critérios de inclusão/exclusão, 4) Desfechos primários e secundários, 5) Análise estatística sugerida.",
    category: "pesquisa",
    recommendedModel: "Claude 3.5 Sonnet",
    tips: [
      "Descreva claramente seu objetivo de pesquisa",
      "Mencione recursos disponíveis (tempo, amostra, etc)",
      "Indique se há estudos similares prévios"
    ]
  }
]
