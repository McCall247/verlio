import { Skeleton } from "@/components/ui/skeleton"
import { TableSkeleton } from "@/components/shared/loading-skeletons"

export default function OrdersLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      <Skeleton className="h-10 w-full max-w-3xl rounded-lg" />
      <TableSkeleton />
    </div>
  )
}
