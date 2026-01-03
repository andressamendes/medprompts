export type PromptCategory = 
  | "estudos"
  | "clinica"
  | "Técnicas de Estudo Ativo"
  | "Técnicas de Revisão"
  | "Integração Clínica"
  | "Memorização"
  | "Metacognição"
  | "Pré-Estudo"
  | "Estudo Colaborativo"
  | "Análise de Erros"
  | "Preparação para Provas"

export type StudyLevel = 
  | "1º-2º ano"
  | "3º-4º ano"
  | "5º-6º ano"
  | "Residência"
  | "Todos os níveis"

export type AIModel = 
  | "ChatGPT"
  | "Claude"
  | "Perplexity"
  | "NotebookLM"
  | "Gemini"
  | "Anki"

export interface AIRecommendation {
  primary: AIModel
  reason: string
  alternatives: AIModel[]
}

export interface Prompt {
  id: string
  title: string
  description: string
  content: string
  category: PromptCategory
  tags: string[]
  studyLevel?: StudyLevel | StudyLevel[]
  academicLevel?: StudyLevel | StudyLevel[]
  estimatedTime?: string | number
  prerequisites?: string[]
  tips?: string[]
  recommendedAI?: AIRecommendation
}
