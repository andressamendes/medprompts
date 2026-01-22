export type PromptCategory = 
  | "estudos"
  | "clinica"
  | "anamnese"
  | "diagnostico"
  | "tratamento"
  | "pediatria"
  | "ginecologia"
  | "cardiologia"
  | "neurologia"
  | "ortopedia"
  | "emergencia"
  | "cirurgia"
  | "clinica-medica"
  | "estudos-caso"
  | "revisao"
  | "outros"

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

export interface AIRecommendation {
  primary: AIModel
  reason: string
  alternatives: AIModel[]
}

export interface PromptVariable {
  name: string
  description?: string
  placeholder?: string // Placeholder original (ex: "[TEMA]")
  type: 'text' | 'textarea' | 'number' | 'date' | 'select'
  options?: string[] // Para type 'select'
  required?: boolean
  defaultValue?: string
  example?: string // Exemplo de preenchimento
  maxLength?: number // Limite de caracteres
}

export interface Prompt {
  id: string
  title: string
  description: string
  content: string
  category: PromptCategory
  variables?: PromptVariable[]
  isSystemPrompt?: boolean
  isFavorite?: boolean
  timesUsed?: number
  recommendedAI?: string | AIRecommendation
  userId?: string
  createdAt?: string
  updatedAt?: string

  // Compatibilidade UI
  icon?: string
  usageCount?: number
  studyLevel?: StudyLevel | StudyLevel[]
  academicLevel?: StudyLevel | StudyLevel[]
  estimatedTime?: string | number
  tips?: string[]
}

export interface CreatePromptDTO {
  title: string
  description?: string
  content: string
  category: PromptCategory
  variables?: PromptVariable[]
  recommendedAI?: string
  academicLevel?: StudyLevel | StudyLevel[]
  estimatedTime?: string | number
}

export interface UpdatePromptDTO extends Partial<CreatePromptDTO> {
  isFavorite?: boolean
}

export interface PromptsListResponse {
  success: boolean
  prompts: Prompt[]
  count?: number
}

export interface PromptResponse {
  success: boolean
  prompt: Prompt
  message?: string
}

export interface FillPromptVariablesRequest {
  values: Record<string, string>
}

export interface FillPromptVariablesResponse {
  success: boolean
  data: {
    original: string
    filled: string
    variables: PromptVariable[]
  }
}
