'use client';

import { IconDots, IconTrash } from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import { formatDistanceToNow } from 'date-fns';

import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ApiKey } from '@/lib/api/api-keys';

interface ActionsProps {
  apiKey: ApiKey;
  onRevoke: (apiKey: ApiKey) => void;
}

function Actions({ apiKey, onRevoke }: ActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <IconDots className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          disabled={apiKey.status === 'revoked'}
          onClick={() => onRevoke(apiKey)}
        >
          <IconTrash className="mr-2 h-4 w-4" />
          Revoke
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const createColumns = (
  onRevoke: (apiKey: ApiKey) => void
): ColumnDef<ApiKey>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const name = row.getValue('name') as string;
      return <div className="font-medium">{name}</div>;
    },
  },
  {
    accessorKey: 'prefix',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Key Prefix" />
    ),
    cell: ({ row }) => {
      const prefix = row.getValue('prefix') as string;
      return <code className="text-muted-foreground text-xs">{prefix}***</code>;
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge variant={status === 'active' ? 'default' : 'secondary'}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'lastUsedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Used" />
    ),
    cell: ({ row }) => {
      const lastUsedAt = row.getValue('lastUsedAt') as string | null;
      if (!lastUsedAt) {
        return <span className="text-muted-foreground">Never</span>;
      }
      return (
        <span className="text-sm">
          {formatDistanceToNow(new Date(lastUsedAt), { addSuffix: true })}
        </span>
      );
    },
  },
  {
    accessorKey: 'expiresAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Expires" />
    ),
    cell: ({ row }) => {
      const expiresAt = row.getValue('expiresAt') as string | null;
      if (!expiresAt) {
        return <span className="text-muted-foreground">Never</span>;
      }
      const expiry = new Date(expiresAt);
      const isExpired = expiry < new Date();
      return (
        <span className={isExpired ? 'text-destructive' : 'text-sm'}>
          {formatDistanceToNow(expiry, { addSuffix: true })}
        </span>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const createdAt = row.getValue('createdAt') as string;
      return (
        <span className="text-sm">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </span>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <Actions apiKey={row.original} onRevoke={onRevoke} />,
  },
];
