"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type Option = { id: string; name: string }

export function CategoryCombobox({
  categories,
  categoryId,
  categoryName,
  onSelect,
  onTextChange,
  placeholder = "Category",
}: {
  categories: Option[]
  categoryId: string
  categoryName: string
  onSelect: (id: string, name: string) => void
  onTextChange: (name: string) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)

  const filtered = categoryName
    ? categories.filter((c) => c.name.toLowerCase().includes(categoryName.toLowerCase()))
    : categories

  return (
    <div className="relative">
      <Input
        placeholder={placeholder}
        value={categoryName}
        onChange={(e) => {
          onTextChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSelect(c.id, c.name)
                setOpen(false)
              }}
              className={cn(
                "flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent",
                c.id === categoryId && "bg-accent"
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
