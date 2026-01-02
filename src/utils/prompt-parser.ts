import { DynamicField, ParsedPrompt, FieldType, FieldOption } from '@/types/dynamic-fields'

// Especialidades médicas comuns
const ESPECIALIDADES: FieldOption[] = [
  { value: 'cardiologia', label: 'Cardiologia' },
  { value: 'pneumologia', label: 'Pneumologia' },
  { value: 'gastroenterologia', label: 'Gastroenterologia' },
  { value: 'nefrologia', label: 'Nefrologia' },
  { value: 'endocrinologia', label: 'Endocrinologia' },
  { value: 'neurologia', label: 'Neurologia' },
  { value: 'hematologia', label: 'Hematologia' },
  { value: 'reumatologia', label: 'Reumatologia' },
  { value: 'infectologia', label: 'Infectologia' },
  { value: 'pediatria', label: 'Pediatria' },
  { value: 'ginecologia', label: 'Ginecologia e Obstetrícia' },
  { value: 'psiquiatria', label: 'Psiquiatria' },
  { value: 'dermatologia', label: 'Dermatologia' },
  { value: 'oftalmologia', label: 'Oftalmologia' },
  { value: 'otorrino', label: 'Otorrinolaringologia' },
  { value: 'ortopedia', label: 'Ortopedia' },
  { value: 'cirurgia', label: 'Cirurgia Geral' },
  { value: 'emergencia', label: 'Medicina de Emergência' },
  { value: 'clinica-medica', label: 'Clínica Médica Geral' }
]

// Níveis acadêmicos
const NIVEIS: FieldOption[] = [
  { value: 'iniciante', label: 'Iniciante (1º-2º ano)' },
  { value: 'intermediario', label: 'Intermediário (3º-4º ano)' },
  { value: 'avancado', label: 'Avançado (Internato/Residência)' }
]

// Regex para identificar placeholders: [TEXTO]
const PLACEHOLDER_REGEX = /\[([A-ZÀÁÃÂÇÉÊÍÓÔÕÚ\s\/\-]+)\]/g

/**
 * Identifica o tipo de campo baseado no nome do placeholder
 */
function inferFieldType(placeholderName: string): FieldType {
  const name = placeholderName.toLowerCase()
  
  // Campos que devem ser textarea (texto longo)
  if (
    name.includes('queixa') ||
    name.includes('descrição') ||
    name.includes('contexto') ||
    name.includes('história') ||
    name.includes('caso')
  ) {
    return 'textarea'
  }
  
  // Campos que devem ser select (dropdown)
  if (
    name.includes('especialidade') ||
    name.includes('área')
  ) {
    return 'select'
  }
  
  // Campos que devem ser radio (botões)
  if (
    name.includes('nível') ||
    name.includes('nivel')
  ) {
    return 'radio'
  }
  
  // Campos numéricos
  if (
    name.includes('idade') ||
    name.includes('número') ||
    name.includes('numero') ||
    name.includes('quantidade')
  ) {
    return 'number'
  }
  
  // Campos de data
  if (
    name.includes('data') ||
    name.includes('prazo')
  ) {
    return 'date'
  }
  
  // Default: texto simples
  return 'text'
}

/**
 * Retorna as opções apropriadas para um campo
 */
function getFieldOptions(placeholderName: string, fieldType: FieldType): FieldOption[] | undefined {
  const name = placeholderName.toLowerCase()
  
  if (fieldType === 'select' && (name.includes('especialidade') || name.includes('área'))) {
    return ESPECIALIDADES
  }
  
  if (fieldType === 'radio' && (name.includes('nível') || name.includes('nivel'))) {
    return NIVEIS
  }
  
  return undefined
}

/**
 * Gera um placeholder de exemplo baseado no tipo
 */
function getPlaceholder(placeholderName: string): string {
  const name = placeholderName.toLowerCase()
  
  if (name.includes('tema')) return 'Ex: Insuficiência Cardíaca'
  if (name.includes('assunto')) return 'Ex: Diabetes Mellitus Tipo 2'
  if (name.includes('conceito')) return 'Ex: Choque Séptico'
  if (name.includes('queixa')) return 'Ex: Dor torácica há 2 horas, em aperto, irradiando para braço esquerdo'
  if (name.includes('sintoma')) return 'Ex: Dispneia aos esforços'
  if (name.includes('achado')) return 'Ex: Sopro sistólico em foco mitral'
  if (name.includes('idade')) return 'Ex: 45'
  
  return `Informe ${placeholderName.toLowerCase()}`
}

/**
 * Gera uma descrição de ajuda para o campo
 */
function getFieldDescription(placeholderName: string): string | undefined {
  const name = placeholderName.toLowerCase()
  
  if (name.includes('especialidade')) {
    return 'Escolha a especialidade médica relacionada ao caso ou tema de estudo'
  }
  
  if (name.includes('nível') || name.includes('nivel')) {
    return 'Selecione seu nível atual de formação médica'
  }
  
  if (name.includes('tema') || name.includes('assunto')) {
    return 'Seja específico para obter um resultado mais direcionado'
  }
  
  if (name.includes('queixa')) {
    return 'Descreva a queixa principal como o paciente relataria'
  }
  
  return undefined
}

/**
 * Converte um placeholder em um DynamicField
 */
function createDynamicField(placeholderName: string): DynamicField {
  const fieldType = inferFieldType(placeholderName)
  const fieldId = placeholderName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  
  return {
    id: fieldId,
    label: placeholderName
      .split('/')
      .map(part => part.trim())
      .map(part => part.charAt(0) + part.slice(1).toLowerCase())
      .join(' / '),
    type: fieldType,
    placeholder: getPlaceholder(placeholderName),
    options: getFieldOptions(placeholderName, fieldType),
    required: true,
    description: getFieldDescription(placeholderName)
  }
}

/**
 * Analisa o conteúdo do prompt e extrai campos dinâmicos
 */
export function parsePromptContent(content: string): ParsedPrompt {
  // Encontrar todos os placeholders únicos
  const placeholders = new Set<string>()
  let match: RegExpExecArray | null
  
  while ((match = PLACEHOLDER_REGEX.exec(content)) !== null) {
    placeholders.add(match[1])
  }
  
  // Converter placeholders em campos dinâmicos
  const fields = Array.from(placeholders).map((placeholder) => 
    createDynamicField(placeholder)
  )
  
  // Função que gera o prompt final substituindo os valores
  const generatePrompt = (values: Record<string, string>): string => {
    let result = content
    
    fields.forEach(field => {
      const value = values[field.id] || ''
      const placeholder = field.label.toUpperCase()
      const regex = new RegExp(`\\[${placeholder}\\]`, 'g')
      
      result = result.replace(regex, value)
    })
    
    return result
  }
  
  return {
    originalContent: content,
    fields,
    generatePrompt
  }
}

/**
 * Valida se todos os campos obrigatórios foram preenchidos
 */
export function validateFieldValues(
  fields: DynamicField[], 
  values: Record<string, string>
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}
  
  fields.forEach(field => {
    const value = values[field.id]
    
    // Verifica obrigatoriedade
    if (field.required && (!value || value.trim() === '')) {
      errors[field.id] = 'Este campo é obrigatório'
      return
    }
    
    // Validação de tamanho mínimo
    if (field.validation?.min && value.length < field.validation.min) {
      errors[field.id] = `Mínimo de ${field.validation.min} caracteres`
    }
    
    // Validação de tamanho máximo
    if (field.validation?.max && value.length > field.validation.max) {
      errors[field.id] = `Máximo de ${field.validation.max} caracteres`
    }
  })
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}
