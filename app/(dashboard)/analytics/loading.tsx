import { Skeleton } from "@/components/ui/skeleton"

export default function AnalyticsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="h-7 w-32" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      <Skeleton className="h-9 w-96 rounded-lg" />
      <Skeleton className="h-72 w-full rounded-lg" />
      <Skeleton className="h-60 w-full rounded-lg" />
    </div>
  )
}
