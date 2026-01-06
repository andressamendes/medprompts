import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const TooltipContext = React.createContext<TooltipContextValue>({
  open: false,
  setOpen: () => {},
})

export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>
}

export const Tooltip: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = React.useState(false)

  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </TooltipContext.Provider>
  )
}

export const TooltipTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { setOpen } = React.useContext(TooltipContext)

  return (
    <div
      ref={ref}
      className={cn("inline-block", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      {...props}
    >
      {children}
    </div>
  )
})
TooltipTrigger.displayName = "TooltipTrigger"

export const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { open } = React.useContext(TooltipContext)

  if (!open) return null

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 px-3 py-1.5 text-xs font-medium text-primary-foreground bg-primary rounded-md shadow-md",
        "bottom-full left-1/2 -translate-x-1/2 mb-2",
        "animate-in fade-in-0 zoom-in-95 duration-200",
        "whitespace-nowrap",
        className
      )}
      {...props}
    >
      {children}
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
        <div className="border-4 border-transparent border-t-primary" />
      </div>
    </div>
  )
})
TooltipContent.displayName = "TooltipContent"
