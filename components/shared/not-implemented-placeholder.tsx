import { ConstructionIcon, type LucideIcon } from "lucide-react"

export function NotImplementedPlaceholder({
  title,
  description,
  icon: Icon = ConstructionIcon,
}: {
  title: string
  description: string
  icon?: LucideIcon
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-24 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Icon className="size-6 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      <span className="mt-2 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
        Not implemented yet
      </span>
    </div>
  )
}
