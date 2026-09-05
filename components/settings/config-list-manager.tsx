"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { PlusIcon } from "lucide-react"
import { addConfigItem, toggleConfigItemActive } from "@/actions/settings-lists"
import type { ConfigListTable } from "@/lib/queries/settings-lists"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

type Item = { id: string; name: string; is_active: boolean; is_default: boolean }

export function ConfigListManager({
  table,
  path,
  items,
}: {
  table: ConfigListTable
  path: string
  items: Item[]
}) {
  const [name, setName] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleAdd() {
    if (!name.trim()) return
    startTransition(async () => {
      const result = await addConfigItem(table, path, name)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      setName("")
    })
  }

  function handleToggle(id: string, isActive: boolean) {
    startTransition(async () => {
      const result = await toggleConfigItemActive(table, path, id, isActive)
      if (result?.error) toast.error(result.error)
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col divide-y rounded-lg border">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{item.name}</span>
              {item.is_default && (
                <Badge variant="outline" className="text-[10px]">
                  Default
                </Badge>
              )}
            </div>
            <Button
              type="button"
              size="sm"
              variant={item.is_active ? "outline" : "ghost"}
              disabled={isPending}
              onClick={() => handleToggle(item.id, !item.is_active)}
            >
              {item.is_active ? "Active" : "Inactive"}
            </Button>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add a new option"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleAdd()
            }
          }}
        />
        <Button type="button" onClick={handleAdd} disabled={isPending}>
          <PlusIcon className="size-4" />
          Add
        </Button>
      </div>
    </div>
  )
}
