import { cn } from "@/lib/utils"

export function BrandMark({ name, className }: { name: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 overflow-hidden", className)}>
      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-foreground text-background text-xs font-semibold">
        {name.charAt(0).toUpperCase() || "A"}
      </div>
      <span className="truncate text-sm font-semibold tracking-tight">{name}</span>
    </div>
  )
}
