export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-md bg-foreground text-background text-sm font-semibold">
          A
        </div>
        <span className="text-lg font-semibold tracking-tight">Atelier CRM</span>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
