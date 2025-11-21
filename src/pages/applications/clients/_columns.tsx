import {
  IconDotsVertical,
  IconEdit,
  IconKey,
  IconTrash,
} from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { OAuth2Client } from '@/lib/api/clients';

interface CreateColumnsOptions {
  onEdit: (client: OAuth2Client) => void;
  onRotateSecret: (client: OAuth2Client) => void;
  onRevoke: (client: OAuth2Client) => void;
}

export function createColumns({
  onEdit,
  onRotateSecret,
  onRevoke,
}: CreateColumnsOptions): ColumnDef<OAuth2Client>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const client = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{client.name}</span>
            <span className="text-muted-foreground font-mono text-xs">
              {client.clientId}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'clientType',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => {
        const type = row.getValue('clientType') as string;
        return (
          <Badge variant={type === 'confidential' ? 'default' : 'secondary'}>
            {type}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean;
        return (
          <Badge variant={isActive ? 'default' : 'destructive'}>
            {isActive ? 'Active' : 'Revoked'}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'grantTypes',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Grant Types" />
      ),
      cell: ({ row }) => {
        const grantTypes = row.getValue('grantTypes') as string[];
        return (
          <div className="flex flex-wrap gap-1">
            {grantTypes.slice(0, 2).map((type) => (
              <Badge key={type} variant="outline" className="text-xs">
                {type.replace('_', ' ')}
              </Badge>
            ))}
            {grantTypes.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{grantTypes.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt'));
        return (
          <span className="text-muted-foreground text-sm">
            {format(date, 'MMM d, yyyy')}
          </span>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const client = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <IconDotsVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(client)}>
                <IconEdit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {client.clientType === 'confidential' && client.isActive && (
                <DropdownMenuItem onClick={() => onRotateSecret(client)}>
                  <IconKey className="mr-2 h-4 w-4" />
                  Rotate Secret
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onRevoke(client)}
                disabled={!client.isActive}
                className="text-destructive"
              >
                <IconTrash className="mr-2 h-4 w-4" />
                Revoke
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
