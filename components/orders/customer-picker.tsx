"use client"

import { useMemo, useState } from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type CustomerOption = { id: string; full_name: string }

export function CustomerPicker({
  customers,
  value,
  onChange,
  disabled,
}: {
  customers: CustomerOption[]
  value?: string
  onChange: (id: string) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const filtered = useMemo(
    () => customers.filter((c) => c.full_name.toLowerCase().includes(query.toLowerCase())),
    [customers, query]
  )

  const selected = customers.find((c) => c.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button type="button" variant="outline" disabled={disabled} className="w-full justify-between font-normal">
            <span className={cn(!selected && "text-muted-foreground")}>
              {selected ? selected.full_name : "Select a customer"}
            </span>
            <ChevronsUpDownIcon className="size-4 text-muted-foreground" />
          </Button>
        }
      />
      <PopoverContent className="w-(--anchor-width) p-0" align="start">
        <div className="p-2">
          <Input
            autoFocus
            placeholder="Search customers…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="max-h-64 overflow-y-auto p-1 pt-0">
          {filtered.length === 0 && (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">No customers found.</p>
          )}
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onChange(c.id)
                setOpen(false)
                setQuery("")
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent",
                c.id === value && "bg-accent"
              )}
            >
              <CheckIcon className={cn("size-4", c.id === value ? "opacity-100" : "opacity-0")} />
              {c.full_name}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
