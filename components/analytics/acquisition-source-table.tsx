import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatMoney } from "@/lib/format"
import type { AcquisitionSourceStat } from "@/lib/queries/analytics"

export function AcquisitionSourceTable({
  data,
  currencySymbol,
}: {
  data: AcquisitionSourceStat[]
  currencySymbol: string
}) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Source</TableHead>
            <TableHead className="text-right">Customers</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.source_id}>
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell className="text-right">{row.customer_count}</TableCell>
              <TableCell className="text-right">{formatMoney(row.revenue, currencySymbol)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
