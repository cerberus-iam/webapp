import * as React from 'react'

import { IconChevronDown, IconX } from '@tabler/icons-react'
import { Table } from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

export interface DataTableFacetedFilterOption {
  label: string
  value: string
}

export interface DataTableFacetedFilter {
  columnId: string
  title: string
  options: DataTableFacetedFilterOption[]
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchKey?: string
  searchPlaceholder?: string
  facetedFilters?: DataTableFacetedFilter[]
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder = 'Search...',
  facetedFilters,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {searchKey && (
          <Input
            placeholder={searchPlaceholder}
            value={
              (table.getColumn(searchKey)?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
        )}
        {facetedFilters?.map((filter) => {
          const column = table.getColumn(filter.columnId)
          if (!column) return null

          const selectedValues = new Set(column.getFilterValue() as string[])
          const facets = column.getFacetedUniqueValues()

          return (
            <DropdownMenu key={filter.columnId}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-dashed"
                >
                  {filter.title}
                  {selectedValues?.size > 0 && (
                    <>
                      <span className="bg-border mx-2 h-4 w-px" />
                      <Badge
                        variant="secondary"
                        className="rounded-sm px-1 font-normal"
                      >
                        {selectedValues.size}
                      </Badge>
                    </>
                  )}
                  <IconChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
                <DropdownMenuLabel>{filter.title}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {filter.options.map((option) => {
                  const isSelected = selectedValues.has(option.value)
                  const count = facets?.get(option.value)

                  return (
                    <DropdownMenuCheckboxItem
                      key={option.value}
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          selectedValues.add(option.value)
                        } else {
                          selectedValues.delete(option.value)
                        }
                        const filterValues = Array.from(selectedValues)
                        column.setFilterValue(
                          filterValues.length ? filterValues : undefined
                        )
                      }}
                    >
                      {option.label}
                      {count !== undefined && (
                        <span className="text-muted-foreground ml-auto text-xs">
                          {count}
                        </span>
                      )}
                    </DropdownMenuCheckboxItem>
                  )
                })}
                {selectedValues.size > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={false}
                      onCheckedChange={() => column.setFilterValue(undefined)}
                      className="justify-center text-center"
                    >
                      Clear filters
                    </DropdownMenuCheckboxItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        })}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <IconX className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
