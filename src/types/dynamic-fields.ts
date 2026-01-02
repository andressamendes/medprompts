// Tipos para campos dinâmicos nos prompts médicos

export type FieldType = 
  | 'text'           // Input de texto livre
  | 'textarea'       // Texto longo (ex: queixa do paciente)
  | 'select'         // Dropdown (ex: especialidade)
  | 'radio'          // Botões de opção (ex: nível)
  | 'number'         // Números (ex: idade)
  | 'date'           // Data (ex: data da prova)

export interface FieldOption {
  value: string
  label: string
}

export interface DynamicField {
  id: string                    // Identificador único (ex: 'especialidade')
  label: string                 // Texto exibido ao usuário (ex: 'Especialidade Médica')
  type: FieldType               // Tipo do campo
  placeholder?: string          // Texto de exemplo
  options?: FieldOption[]       // Opções para select/radio
  required: boolean             // Campo obrigatório?
  defaultValue?: string         // Valor padrão
  description?: string          // Texto de ajuda
  validation?: {
    min?: number                // Tamanho mínimo
    max?: number                // Tamanho máximo
    pattern?: string            // Regex de validação
  }
}

export interface ParsedPrompt {
  originalContent: string       // Prompt original com placeholders
  fields: DynamicField[]        // Campos identificados
  generatePrompt: (values: Record<string, string>) => string  // Função que gera prompt final
}

export interface FieldValues {
  [fieldId: string]: string
}
