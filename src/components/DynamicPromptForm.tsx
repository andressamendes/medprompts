import { useState } from 'react'
import { DynamicField, FieldValues } from '@/types/dynamic-fields'
import { validateFieldValues } from '@/utils/prompt-parser'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { NativeSelect } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

interface DynamicPromptFormProps {
  fields: DynamicField[]
  onGenerate: (values: FieldValues) => void
  onCancel?: () => void
}

export function DynamicPromptForm({ fields, onGenerate, onCancel }: DynamicPromptFormProps) {
  const [values, setValues] = useState<FieldValues>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleValueChange = (fieldId: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }))

    // limpar erro do campo quando o usuário começa a digitar
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fieldId]
        return newErrors
      })
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const validation = validateFieldValues(fields, values)

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    onGenerate(values)
  }

  const renderField = (field: DynamicField) => {
    const hasError = !!errors[field.id]
    const fieldValue = values[field.id] || field.defaultValue || ''

    // textarea
    if (field.type === 'textarea') {
      return (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={field.id} className="text-sm font-medium">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {field.description && (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          )}
          <Textarea
            id={field.id}
            placeholder={field.placeholder}
            value={fieldValue}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleValueChange(field.id, e.target.value)}
            className={hasError ? 'border-destructive' : ''}
            rows={4}
          />
          {hasError && (
            <p className="text-xs text-destructive">
              {errors[field.id]}
            </p>
          )}
        </div>
      )
    }

    // select (nativo)
    if (field.type === 'select') {
      return (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={field.id} className="text-sm font-medium">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {field.description && (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          )}
          <NativeSelect
            id={field.id}
            value={fieldValue}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleValueChange(field.id, e.target.value)}
            className={hasError ? 'border-destructive' : ''}
          >
            <option value="" disabled>
              {field.placeholder || 'Selecione...'}
            </option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.label}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
          {hasError && (
            <p className="text-xs text-destructive">
              {errors[field.id]}
            </p>
          )}
        </div>
      )
    }

    // number
    if (field.type === 'number') {
      return (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={field.id} className="text-sm font-medium">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {field.description && (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          )}
          <Input
            id={field.id}
            type="number"
            placeholder={field.placeholder}
            value={fieldValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleValueChange(field.id, e.target.value)}
            className={hasError ? 'border-destructive' : ''}
            min={field.validation?.min}
            max={field.validation?.max}
          />
          {hasError && (
            <p className="text-xs text-destructive">
              {errors[field.id]}
            </p>
          )}
        </div>
      )
    }

    // date
    if (field.type === 'date') {
      return (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={field.id} className="text-sm font-medium">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {field.description && (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          )}
          <Input
            id={field.id}
            type="date"
            value={fieldValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleValueChange(field.id, e.target.value)}
            className={hasError ? 'border-destructive' : ''}
          />
          {hasError && (
            <p className="text-xs text-destructive">
              {errors[field.id]}
            </p>
          )}
        </div>
      )
    }

    // default: text
    return (
      <div key={field.id} className="space-y-2">
        <Label htmlFor={field.id} className="text-sm font-medium">
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {field.description && (
          <p className="text-xs text-muted-foreground">{field.description}</p>
        )}
        <Input
          id={field.id}
          type="text"
          placeholder={field.placeholder}
          value={fieldValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleValueChange(field.id, e.target.value)}
          className={hasError ? 'border-destructive' : ''}
        />
        {hasError && (
          <p className="text-xs text-destructive">
            {errors[field.id]}
          </p>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {fields.map(renderField)}
      </div>

      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          className="flex-1"
        >
          Gerar Prompt
        </Button>
      </div>
    </form>
  )
}
