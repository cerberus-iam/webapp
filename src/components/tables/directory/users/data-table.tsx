'use client';

import * as React from 'react';

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Users } from 'lucide-react';

import { DataTablePagination } from '@/components/data-table-pagination';
import {
  DataTableFacetedFilter,
  DataTableToolbar,
} from '@/components/data-table-toolbar';
import { DataTableViewOptions } from '@/components/data-table-view-options';
import { EmptyState } from '@/components/empty-state';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  facetedFilters?: DataTableFacetedFilter[];
  /**
   * Total count for server-side pagination
   */
  totalCount?: number;
  /**
   * Current page (0-indexed)
   */
  pageIndex?: number;
  /**
   * Page size
   */
  pageSize?: number;
  /**
   * Callback when pagination changes
   */
  onPaginationChange?: (pageIndex: number, pageSize: number) => void;
  /**
   * Empty state customization
   */
  emptyState?: {
    title: string;
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder,
  facetedFilters,
  totalCount,
  pageIndex = 0,
  pageSize = 50,
  onPaginationChange,
  emptyState,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const isServerPagination = totalCount !== undefined && onPaginationChange;

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      ...(isServerPagination && {
        pagination: {
          pageIndex,
          pageSize,
        },
      }),
    },
    ...(isServerPagination && {
      pageCount: Math.ceil(totalCount / pageSize),
      manualPagination: true,
      onPaginationChange: (updater) => {
        const newPagination =
          typeof updater === 'function'
            ? updater({ pageIndex, pageSize })
            : updater;
        onPaginationChange(newPagination.pageIndex, newPagination.pageSize);
      },
    }),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(!isServerPagination && {
      getPaginationRowModel: getPaginationRowModel(),
    }),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <DataTableToolbar
          table={table}
          searchKey={searchKey}
          searchPlaceholder={searchPlaceholder}
          facetedFilters={facetedFilters}
        />
        <DataTableViewOptions table={table} />
      </div>
      <div className="rounded-md border">
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
                            header.getContext()
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
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-0 p-0">
                  <div className="p-8">
                    <EmptyState
                      icon={emptyState?.action ? Users : undefined}
                      title={emptyState?.title || 'No results found'}
                      description={
                        emptyState?.description ||
                        'Try adjusting your search or filters.'
                      }
                      action={emptyState?.action}
                    />
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} totalCount={totalCount} />
    </div>
  );
}
