import { Skeleton } from "@/components/ui/skeleton"
import { StatCardsSkeleton } from "@/components/shared/loading-skeletons"

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-7 w-56" />
          <Skeleton className="mt-2 h-4 w-40" />
        </div>
        <Skeleton className="h-9 w-64 rounded-lg" />
      </div>
      <StatCardsSkeleton />
      <StatCardsSkeleton />
      <StatCardsSkeleton />
    </div>
  )
}
