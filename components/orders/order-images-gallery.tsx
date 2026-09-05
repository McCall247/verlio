"use client"

import { useRef, useState, useTransition } from "react"
import Image from "next/image"
import { toast } from "sonner"
import { ImagePlusIcon, TrashIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { addOrderImage, deleteOrderImage } from "@/actions/orders"

type OrderImage = { id: string; storage_path: string; url: string | null; caption: string | null }

export function OrderImagesGallery({
  orderId,
  businessId,
  images,
}: {
  orderId: string
  businessId: string
  images: OrderImage[]
}) {
  const [uploading, setUploading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList) {
    setUploading(true)
    try {
      const supabase = createClient()
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() ?? "jpg"
        const path = `${businessId}/${orderId}/${crypto.randomUUID()}.${ext}`
        const { error } = await supabase.storage.from("order-images").upload(path, file)
        if (error) {
          toast.error(error.message)
          continue
        }
        const result = await addOrderImage(orderId, path)
        if (result?.error) toast.error(result.error)
      }
    } finally {
      setUploading(false)
    }
  }

  function handleDelete(imageId: string, storagePath: string) {
    startTransition(async () => {
      const result = await deleteOrderImage(orderId, imageId, storagePath)
      if (result?.error) toast.error(result.error)
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((img) => (
          <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
            {img.url && <Image src={img.url} alt={img.caption ?? ""} fill className="object-cover" />}
            <button
              type="button"
              onClick={() => handleDelete(img.id, img.storage_path)}
              disabled={isPending}
              className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-background/90 opacity-0 shadow transition-opacity group-hover:opacity-100"
            >
              <TrashIcon className="size-3.5" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed text-muted-foreground hover:bg-muted/50"
        >
          <ImagePlusIcon className="size-5" />
          <span className="text-xs">{uploading ? "Uploading…" : "Add photo"}</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) void handleFiles(e.target.files)
          e.target.value = ""
        }}
      />
    </div>
  )
}
