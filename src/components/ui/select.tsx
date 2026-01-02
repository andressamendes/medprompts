import * as React from "react"

// Componente Select raiz (contexto)
interface SelectContextValue {
  value: string
  onValueChange: (value: string) => void
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined)

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

const Select = ({ value = '', onValueChange, children }: SelectProps) => {
  return (
    <SelectContext.Provider value={{ value, onValueChange: onValueChange || (() => {}) }}>
      {children}
    </SelectContext.Provider>
  )
}

// SelectTrigger - o botão/campo visível
interface SelectTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

const SelectTrigger = React.forwardRef<HTMLDivElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

// SelectValue - mostra o valor selecionado
interface SelectValueProps {
  placeholder?: string
}

const SelectValue = ({ placeholder }: SelectValueProps) => {
  const context = React.useContext(SelectContext)
  
  if (!context) {
    return <span className="text-muted-foreground">{placeholder || 'Selecione...'}</span>
  }

  return (
    <span>
      {context.value || <span className="text-muted-foreground">{placeholder || 'Selecione...'}</span>}
    </span>
  )
}

// SelectContent - container das opções
interface SelectContentProps {
  children: React.ReactNode
  className?: string
}

const SelectContent = ({ children, className }: SelectContentProps) => {
  return (
    <div className={`absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md ${className || ''}`}>
      <div className="p-1">
        {children}
      </div>
    </div>
  )
}

// SelectItem - cada opção
interface SelectItemProps {
  value: string
  children: React.ReactNode
  className?: string
}

const SelectItem = ({ value, children, className }: SelectItemProps) => {
  const context = React.useContext(SelectContext)
  
  if (!context) return null

  return (
    <div
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${className || ''}`}
      onClick={() => context.onValueChange(value)}
    >
      {children}
    </div>
  )
}

// Versão alternativa usando <select> nativo (mais simples e funcional)
interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode
}

const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
        {...props}
      >
        {children}
      </select>
    )
  }
)
NativeSelect.displayName = "NativeSelect"

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  NativeSelect,
}
