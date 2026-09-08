function ThreadDecoration() {
  return (
    <svg
      viewBox="0 0 220 120"
      fill="none"
      className="h-auto w-44 text-auth-accent/70 md:w-56"
      aria-hidden="true"
    >
      <path
        d="M4 20c30 0 30 24 60 24s30-24 60-24 30 24 60 24 30-24 60-24"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M4 50c30 0 30 20 60 20s30-20 60-20 30 20 60 20 30-20 60-20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M4 80c30 0 30 16 60 16s30-16 60-16 30 16 60 16 30-16 60-16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  )
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative flex flex-col justify-between overflow-hidden bg-auth-panel px-6 py-6 text-auth-panel-foreground sm:px-8 sm:py-8 md:px-12 md:py-12">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-md border border-auth-accent font-serif text-sm text-auth-accent">
            A
          </div>
          <span className="text-sm font-bold tracking-[0.1em] uppercase">Atelier</span>
        </div>

        <div className="hidden md:block">
          <ThreadDecoration />
        </div>

        <div className="max-w-md">
          <h2 className="font-serif text-2xl leading-snug sm:text-3xl md:text-4xl">
            Every client relationship,{" "}
            <em className="font-serif text-auth-accent italic">crafted</em> with intention.
          </h2>
          <p className="mt-4 hidden max-w-sm text-sm text-auth-panel-muted md:block">
            Customer, order, and revenue management for fashion designers who care about the details.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-auth-cream px-6 py-12 sm:px-10 md:px-16">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
