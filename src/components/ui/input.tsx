import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  showPasswordToggle?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, icon, iconPosition = 'left', showPasswordToggle = false, ...props }, ref) => {
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false)
    const [capsLockActive, setCapsLockActive] = React.useState(false)

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (type === 'password' && e.getModifierState) {
        setCapsLockActive(e.getModifierState('CapsLock'))
      }
      props.onKeyDown?.(e)
    }

    const handlePasswordToggle = () => {
      setIsPasswordVisible(!isPasswordVisible)
    }

    const inputType = showPasswordToggle && type === 'password'
      ? (isPasswordVisible ? 'text' : 'password')
      : type

    // Password field with toggle
    if (showPasswordToggle && type === 'password') {
      return (
        <div className="w-full space-y-1">
          <div className="relative w-full">
            <input
              {...props}
              type={inputType}
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
                error && "border-red-500 focus-visible:ring-red-500",
                className
              )}
              ref={ref}
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              onClick={handlePasswordToggle}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded p-0.5"
              aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
              aria-pressed={isPasswordVisible}
              tabIndex={-1}
            >
              {isPasswordVisible ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {capsLockActive && (
            <p
              className="text-xs text-amber-600 dark:text-amber-500 flex items-center gap-1.5"
              role="status"
              aria-live="polite"
            >
              <span>⚠️</span>
              <span>Caps Lock ativado</span>
            </p>
          )}
          {error && (
            <p className="text-sm text-red-500" role="alert" aria-live="polite">
              {error}
            </p>
          )}
        </div>
      )
    }

    if (icon) {
      return (
        <div className="relative w-full">
          {iconPosition === 'left' && icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
              icon && iconPosition === 'left' && "pl-10",
              icon && iconPosition === 'right' && "pr-10",
              error && "border-red-500 focus-visible:ring-red-500",
              className
            )}
            ref={ref}
            {...props}
          />
          {iconPosition === 'right' && icon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          {error && (
            <p className="mt-1 text-sm text-red-500">{error}</p>
          )}
        </div>
      )
    }
    
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
            error && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
