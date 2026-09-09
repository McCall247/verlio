"use client"

import { Autocomplete } from "@base-ui/react/autocomplete"
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
  const names = categories.map((c) => c.name)

  return (
    <Autocomplete.Root
      items={names}
      value={categoryName}
      openOnInputClick
      onValueChange={(value, details) => {
        if (details.reason === "item-press") {
          const match = categories.find((c) => c.name === value)
          onSelect(match?.id ?? "", value)
        } else {
          onTextChange(value)
        }
      }}
    >
      <Autocomplete.Input
        placeholder={placeholder}
        className="h-9 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
      />
      <Autocomplete.Portal>
        <Autocomplete.Positioner className="outline-hidden" sideOffset={4}>
          <Autocomplete.Popup className="w-(--anchor-width) max-w-(--available-width) origin-(--transform-origin) rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10">
            <Autocomplete.Empty className="px-2 py-1.5 text-sm text-muted-foreground">
              No matching categories
            </Autocomplete.Empty>
            <Autocomplete.List className="max-h-60 overflow-y-auto outline-none">
              {(name: string) => (
                <Autocomplete.Item
                  key={name}
                  value={name}
                  className={cn(
                    "flex w-full cursor-default items-center rounded-md px-2 py-1.5 text-left text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground",
                    name === categoryName && categoryId && "bg-accent"
                  )}
                >
                  {name}
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  )
}
