export interface Prompt {
  id: string
  title: string
  description: string
  content: string
  category: 'clinica' | 'estudos' | 'pesquisa' | 'produtividade'
  recommendedModel: string
  tips: string[]
}
