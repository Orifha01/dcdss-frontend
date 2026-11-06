import * as React from "react"
import { cn } from "cn"
import { ChevronDownIcon } from "lucide-react"

// Native <select> wrapper — fully compatible with React Hook Form's register()
// Keeps the same export names so no page code needs to change.

function Select({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <div className="relative w-full">
      <select
        data-slot="select"
        className={cn(
          "h-8 w-full appearance-none rounded-lg border border-input bg-transparent pl-2.5 pr-8 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
    </div>
  )
}

// Thin wrappers kept so existing JSX like <SelectTrigger>, <SelectContent>,
// <SelectItem>, <SelectValue> still compile. Pages that use the old
// compound-component API are expected to have been migrated to native <select>
// + <option> during the build. These are here purely as safety no-ops.

const SelectGroup = ({ children }: { children?: React.ReactNode }) => <>{children}</>
const SelectValue = ({ placeholder }: { placeholder?: string }) => <option value="">{placeholder ?? ''}</option>
const SelectTrigger = ({ children }: { children?: React.ReactNode }) => <>{children}</>
const SelectContent = ({ children }: { children?: React.ReactNode }) => <>{children}</>
const SelectLabel = ({ children }: { children?: React.ReactNode }) => <>{children}</>
const SelectItem = ({ value, children }: { value: string; children?: React.ReactNode }) => (
  <option value={value}>{children}</option>
)
const SelectSeparator = () => null
const SelectScrollUpButton = () => null
const SelectScrollDownButton = () => null

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
