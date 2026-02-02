import { describe, it, expect } from 'vitest'
import { cn, getAIName, extractVariables, formatCategoryName, AI_URLS } from './utils'
import type { Prompt } from '@/types/prompt'

describe('utils', () => {
  describe('cn', () => {
    it('deve combinar classes', () => {
      const result = cn('class1', 'class2')
      expect(result).toBe('class1 class2')
    })

    it('deve lidar com classes condicionais', () => {
      const result = cn('base', true && 'active', false && 'inactive')
      expect(result).toBe('base active')
    })

    it('deve mesclar classes Tailwind conflitantes', () => {
      const result = cn('p-4', 'p-2')
      expect(result).toBe('p-2')
    })

    it('deve lidar com arrays', () => {
      const result = cn(['class1', 'class2'])
      expect(result).toBe('class1 class2')
    })
  })

  describe('getAIName', () => {
    it('deve retornar string diretamente', () => {
      const prompt = { recommendedAI: 'Claude' } as Prompt
      expect(getAIName(prompt)).toBe('Claude')
    })

    it('deve retornar primary de objeto', () => {
      const prompt = {
        recommendedAI: { primary: 'ChatGPT', alternatives: ['Claude'] }
      } as Prompt
      expect(getAIName(prompt)).toBe('ChatGPT')
    })

    it('deve retornar ChatGPT como padrão', () => {
      const prompt = {} as Prompt
      expect(getAIName(prompt)).toBe('ChatGPT')
    })
  })

  describe('extractVariables', () => {
    it('deve extrair variáveis de um conteúdo', () => {
      const content = 'Olá [NOME], você tem [IDADE] anos.'
      const result = extractVariables(content)

      expect(result).toContain('NOME')
      expect(result).toContain('IDADE')
    })

    it('deve retornar variáveis únicas', () => {
      const content = '[NOME] e [NOME] e [NOME]'
      const result = extractVariables(content)

      expect(result).toHaveLength(1)
      expect(result[0]).toBe('NOME')
    })

    it('deve retornar array vazio para conteúdo sem variáveis', () => {
      const content = 'Texto sem variáveis'
      const result = extractVariables(content)

      expect(result).toHaveLength(0)
    })

    it('deve usar cache para mesma string', () => {
      const content = 'Teste [VAR1] cache [VAR2]'

      const result1 = extractVariables(content)
      const result2 = extractVariables(content)

      // Deve retornar a mesma referência (do cache)
      expect(result1).toBe(result2)
    })
  })

  describe('formatCategoryName', () => {
    it('deve formatar categorias conhecidas', () => {
      expect(formatCategoryName('estudos')).toBe('Estudos')
      expect(formatCategoryName('clinica')).toBe('Clínica')
      expect(formatCategoryName('emergencia')).toBe('Emergência')
      expect(formatCategoryName('clinica-medica')).toBe('Clínica Médica')
    })

    it('deve capitalizar categorias desconhecidas', () => {
      expect(formatCategoryName('novacategoria')).toBe('Novacategoria')
      expect(formatCategoryName('test')).toBe('Test')
    })
  })

  describe('AI_URLS', () => {
    it('deve conter URLs das principais IAs', () => {
      expect(AI_URLS.ChatGPT).toBe('https://chat.openai.com')
      expect(AI_URLS.Claude).toBe('https://claude.ai/new')
      expect(AI_URLS.Perplexity).toBe('https://www.perplexity.ai')
      expect(AI_URLS.NotebookLM).toBe('https://notebooklm.google.com')
      expect(AI_URLS.Gemini).toBe('https://gemini.google.com/app')
    })
  })
})
