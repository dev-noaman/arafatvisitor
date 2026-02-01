import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Option {
  value: string
  label: string
  selectedLabel?: string
  icon?: React.ReactNode
}

interface SearchableSelectProps {
  options: Option[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  triggerClassName?: string
  disabled?: boolean
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className,
  triggerClassName,
  disabled
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
    if (!isOpen) {
      setQuery("")
    }
  }, [isOpen])

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(query.toLowerCase()) ||
    option.value.toLowerCase().includes(query.toLowerCase())
  )

  const selectedOption = options.find(o => o.value === value)

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <div
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer touch-manipulation",
          disabled && "pointer-events-none opacity-50",
          triggerClassName
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {selectedOption ? (
            <>
              {selectedOption.icon && <span className="flex-shrink-0">{selectedOption.icon}</span>}
              <span className="truncate">{selectedOption.selectedLabel || selectedOption.label}</span>
            </>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
        <ChevronsUpDown className="h-4 w-4 opacity-50 flex-shrink-0" />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="sticky top-0 z-10 bg-popover p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                ref={inputRef}
                className="w-full rounded-md border border-input bg-background py-2 pl-8 pr-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">No results found.</div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer",
                    option.value === value && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                >
                  <div className="mr-2 flex h-4 w-4 items-center justify-center">
                    {option.value === value && <Check className="h-4 w-4" />}
                  </div>
                  {option.icon && <span className="mr-2 flex-shrink-0">{option.icon}</span>}
                  <span>{option.label}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
