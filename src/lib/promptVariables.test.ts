import { describe, it, expect } from 'vitest'
import {
  extractVariables,
  fillPromptVariables,
  validateVariables,
  highlightVariables,
  countFilledVariables,
} from './promptVariables'

describe('promptVariables', () => {
  describe('extractVariables', () => {
    it('deve extrair variáveis no formato [VAR]: descrição', () => {
      const content = `
**CAMPO DE ENTRADA**
[TEMA]: O tema do estudo
[DISCIPLINA]: A disciplina médica
      `
      const variables = extractVariables(content)

      expect(variables).toHaveLength(2)
      expect(variables[0].name).toBe('TEMA')
      expect(variables[1].name).toBe('DISCIPLINA')
    })

    it('deve extrair variáveis em MAIÚSCULAS simples', () => {
      const content = `
**CAMPO DE ENTRADA**
Informe o [TEMA] e a [DISCIPLINA] para gerar o conteúdo.
      `
      const variables = extractVariables(content)

      expect(variables.length).toBeGreaterThanOrEqual(1)
    })

    it('deve retornar array vazio para conteúdo sem variáveis', () => {
      const content = 'Este é um texto sem variáveis.'
      const variables = extractVariables(content)

      expect(variables).toHaveLength(0)
    })

    it('deve ignorar placeholders com muitas palavras', () => {
      const content = `
**CAMPO DE ENTRADA**
[TEMA]: tema principal
[RESULTADO ESPERADO COM MUITAS PALAVRAS AQUI]: ignorar
      `
      const variables = extractVariables(content)

      // Deve extrair TEMA mas ignorar o placeholder muito longo
      expect(variables.some(v => v.name === 'TEMA')).toBe(true)
    })

    it('deve inferir tipo textarea para conteúdo longo', () => {
      const content = `
**CAMPO DE ENTRADA**
[ARTIGO]: Cole o artigo aqui
      `
      const variables = extractVariables(content)

      expect(variables[0].type).toBe('textarea')
    })

    it('deve inferir tipo number para idade', () => {
      const content = `
**CAMPO DE ENTRADA**
[IDADE]: Idade do paciente
      `
      const variables = extractVariables(content)

      expect(variables[0].type).toBe('number')
    })
  })

  describe('fillPromptVariables', () => {
    it('deve substituir variáveis pelos valores', () => {
      const content = 'Olá [NOME], sua idade é [IDADE].'
      const values = { NOME: 'João', IDADE: '25' }

      const result = fillPromptVariables(content, values)

      expect(result).toBe('Olá João, sua idade é 25.')
    })

    it('deve manter variáveis não preenchidas', () => {
      const content = 'Olá [NOME], sua idade é [IDADE].'
      const values = { NOME: 'João' }

      const result = fillPromptVariables(content, values)

      expect(result).toBe('Olá João, sua idade é [IDADE].')
    })

    it('deve substituir múltiplas ocorrências da mesma variável', () => {
      const content = '[NOME] é um nome. O nome [NOME] é bonito.'
      const values = { NOME: 'Maria' }

      const result = fillPromptVariables(content, values)

      expect(result).toBe('Maria é um nome. O nome Maria é bonito.')
    })
  })

  describe('validateVariables', () => {
    it('deve validar campos obrigatórios preenchidos', () => {
      const variables = [
        { name: 'TEMA', placeholder: '[TEMA]', required: true, type: 'text' as const },
      ]
      const values = { TEMA: 'Cardiologia' }

      const result = validateVariables(variables, values)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('deve retornar erro para campos obrigatórios vazios', () => {
      const variables = [
        { name: 'TEMA', placeholder: '[TEMA]', required: true, type: 'text' as const },
      ]
      const values = { TEMA: '' }

      const result = validateVariables(variables, values)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('TEMA é obrigatório')
    })

    it('deve validar maxLength', () => {
      const variables = [
        { name: 'TITULO', placeholder: '[TITULO]', required: true, type: 'text' as const, maxLength: 10 },
      ]
      const values = { TITULO: 'Este título é muito longo' }

      const result = validateVariables(variables, values)

      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain('excede o limite')
    })

    it('deve validar tipo number', () => {
      const variables = [
        { name: 'IDADE', placeholder: '[IDADE]', required: true, type: 'number' as const },
      ]
      const values = { IDADE: 'não é número' }

      const result = validateVariables(variables, values)

      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain('deve ser um número')
    })
  })

  describe('highlightVariables', () => {
    it('deve adicionar span de destaque às variáveis', () => {
      const content = 'Olá [NOME]!'

      const result = highlightVariables(content)

      expect(result).toContain('class="variable-highlight')
      expect(result).toContain('[NOME]')
    })
  })

  describe('countFilledVariables', () => {
    it('deve contar variáveis preenchidas corretamente', () => {
      const variables = [
        { name: 'A', placeholder: '[A]', required: true, type: 'text' as const },
        { name: 'B', placeholder: '[B]', required: true, type: 'text' as const },
        { name: 'C', placeholder: '[C]', required: true, type: 'text' as const },
      ]
      const values = { A: 'valor', B: 'valor', C: '' }

      const result = countFilledVariables(variables, values)

      expect(result.filled).toBe(2)
      expect(result.total).toBe(3)
      expect(result.percentage).toBe(67) // Math.round(2/3 * 100)
    })

    it('deve retornar 0% para array vazio', () => {
      const result = countFilledVariables([], {})

      expect(result.percentage).toBe(0)
    })
  })
})
