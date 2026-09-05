"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { UserRoundIcon, UploadIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

export function AvatarUpload({
  businessId,
  value,
  onChange,
}: {
  businessId: string
  value?: string | null
  onChange: (url: string | null) => void
}) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split(".").pop() ?? "jpg"
      const path = `${businessId}/${crypto.randomUUID()}.${ext}`
      const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from("avatars").getPublicUrl(path)
      onChange(data.publicUrl)
    } catch {
      onChange(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
        {value ? (
          <Image src={value} alt="Avatar" width={64} height={64} className="size-16 object-cover" />
        ) : (
          <UserRoundIcon className="size-6 text-muted-foreground" />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleFile(file)
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <UploadIcon className="size-3.5" />
          {uploading ? "Uploading…" : "Upload photo"}
        </Button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-muted-foreground underline underline-offset-4"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  )
}
