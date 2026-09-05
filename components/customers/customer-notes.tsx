"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { addCustomerNote } from "@/actions/customers"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatRelative } from "@/lib/format"
import type { CustomerNoteWithAuthor } from "@/lib/queries/customers"

export function CustomerNotes({
  customerId,
  notes,
}: {
  customerId: string
  notes: CustomerNoteWithAuthor[]
}) {
  const [value, setValue] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleAdd() {
    if (!value.trim()) return
    startTransition(async () => {
      const result = await addCustomerNote(customerId, value)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      setValue("")
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Add a note about this customer…"
          rows={2}
        />
        <Button size="sm" className="self-end" onClick={handleAdd} disabled={isPending || !value.trim()}>
          {isPending ? "Adding…" : "Add note"}
        </Button>
      </div>

      {notes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notes yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {notes.map((note) => (
            <li key={note.id} className="rounded-lg border p-3">
              <p className="text-sm whitespace-pre-wrap">{note.note}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {note.profiles?.full_name ?? "Someone"} · {formatRelative(note.created_at)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
