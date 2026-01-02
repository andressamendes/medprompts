export interface Prompt {
  id: string
  title: string
  description: string
  content: string
  category: 'clinica' | 'estudos' | 'pesquisa'
  recommendedModel: string
  tips: string[]
}
