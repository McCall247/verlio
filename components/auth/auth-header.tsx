export function AuthHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description?: string
}) {
  return (
    <div className="mb-8">
      <p className="text-xs font-medium tracking-[0.15em] text-muted-foreground uppercase">{eyebrow}</p>
      <h1 className="mt-2 font-serif text-3xl text-foreground">{title}</h1>
      {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
    </div>
  )
}
