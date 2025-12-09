/* eslint-disable react-hooks/incompatible-library */
"use client";
type LabsAndImaging = {
  id: string;
  serviceType: string;
  order: string;
  date: string;
};

const columns: ColumnDef<LabsAndImaging>[] = [
  {
    accessorKey: "serviceType",
    header: "Service type",
  },
  {
    accessorKey: "order",
    header: "Order",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
];
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function MySimpleTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
export default function DemoPage() {
  const data: LabsAndImaging[] = [
    {
      id: "1",
      serviceType: "Blood test",
      order: "Complete blood count",
      date: "12/11/2025",
    },
    {
      id: "2",
      serviceType: "Imaging",
      order: "Chest X-ray",
      date: "12/11/2025",
    },
    {
      id: "3",
      serviceType: "ECG",
      order: "12-lead ECG",
      date: "12/11/2025",
    },
  ];
  return (
    <div className="container mx-auto py-10">
      <MySimpleTable columns={columns} data={data} />
    </div>
  );
}
