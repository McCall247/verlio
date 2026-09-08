export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="text-xs font-semibold tracking-widest whitespace-nowrap text-[var(--brand-accent)] uppercase">
        {children}
      </h2>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}
