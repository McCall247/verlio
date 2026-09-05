import type { Metadata } from "next"
import Link from "next/link"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CustomerFilters } from "@/components/customers/customer-filters"
import { CustomerTable } from "@/components/customers/customer-table"
import { DataPagination } from "@/components/shared/data-pagination"
import { listCustomers, getAcquisitionSources, type CustomerListParams } from "@/lib/queries/customers"

export const metadata: Metadata = { title: "Customers — Atelier CRM" }

const PAGE_SIZE = 20

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const page = params.page ? parseInt(params.page, 10) || 1 : 1

  const [{ customers, total }, sources] = await Promise.all([
    listCustomers({
      search: params.search,
      lifecycle: params.lifecycle,
      sourceId: params.sourceId,
      sort: params.sort as CustomerListParams["sort"],
      page,
      pageSize: PAGE_SIZE,
    }),
    getAcquisitionSources(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">{total} total customer{total === 1 ? "" : "s"}</p>
        </div>
        <Button
          nativeButton={false}
          render={
            <Link href="/customers/new">
              <PlusIcon className="size-4" />
              Add customer
            </Link>
          }
        />
      </div>

      <CustomerFilters sources={sources} />

      <CustomerTable customers={customers} />

      <DataPagination
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        basePath="/customers"
        searchParams={params}
      />
    </div>
  )
}
