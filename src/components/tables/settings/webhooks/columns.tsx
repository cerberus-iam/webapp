'use client';

import {
  IconDots,
  IconEdit,
  IconPlaystationCircle,
  IconTrash,
} from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import { formatDistanceToNow } from 'date-fns';

import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Webhook } from '@/lib/api/webhooks';

interface ActionsProps {
  webhook: Webhook;
  onEdit: (webhook: Webhook) => void;
  onTest: (webhook: Webhook) => void;
  onDelete: (webhook: Webhook) => void;
}

function Actions({ webhook, onEdit, onTest, onDelete }: ActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <IconDots className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(webhook)}>
          <IconEdit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onTest(webhook)}>
          <IconPlaystationCircle className="mr-2 h-4 w-4" />
          Test Webhook
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(webhook)}
          className="text-destructive"
        >
          <IconTrash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const createColumns = (
  onEdit: (webhook: Webhook) => void,
  onTest: (webhook: Webhook) => void,
  onDelete: (webhook: Webhook) => void
): ColumnDef<Webhook>[] => [
  {
    accessorKey: 'url',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="URL" />
    ),
    cell: ({ row }) => {
      const url = row.getValue('url') as string;
      return (
        <div className="max-w-[400px] truncate font-mono text-sm" title={url}>
          {url}
        </div>
      );
    },
  },
  {
    accessorKey: 'events',
    header: 'Events',
    cell: ({ row }) => {
      const events = row.getValue('events') as string[];
      const displayCount = 2;
      const hasMore = events.length > displayCount;

      return (
        <div className="flex flex-wrap gap-1">
          {events.slice(0, displayCount).map((event) => (
            <Badge key={event} variant="secondary" className="text-xs">
              {event}
            </Badge>
          ))}
          {hasMore && (
            <Badge variant="outline" className="text-xs">
              +{events.length - displayCount} more
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'active',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const active = row.getValue('active') as boolean;
      return (
        <Badge variant={active ? 'default' : 'secondary'}>
          {active ? 'Active' : 'Inactive'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'lastTriggeredAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Triggered" />
    ),
    cell: ({ row }) => {
      const lastTriggeredAt = row.getValue('lastTriggeredAt') as string | null;
      if (!lastTriggeredAt) {
        return <span className="text-muted-foreground">Never</span>;
      }
      return (
        <span className="text-sm">
          {formatDistanceToNow(new Date(lastTriggeredAt), { addSuffix: true })}
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
    cell: ({ row }) => (
      <Actions
        webhook={row.original}
        onEdit={onEdit}
        onTest={onTest}
        onDelete={onDelete}
      />
    ),
  },
];
