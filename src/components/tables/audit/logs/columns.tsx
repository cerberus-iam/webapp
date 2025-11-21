'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import type { AuditLog } from '@/lib/api/audit-logs';

function getCategoryColor(
  category: string
): 'default' | 'secondary' | 'outline' {
  switch (category) {
    case 'auth':
      return 'default';
    case 'user':
      return 'secondary';
    case 'system':
      return 'outline';
    default:
      return 'secondary';
  }
}

function getActionColor(
  action: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (action) {
    case 'create':
      return 'default';
    case 'update':
      return 'secondary';
    case 'delete':
      return 'destructive';
    default:
      return 'outline';
  }
}

export const columns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: 'timestamp',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Timestamp" />
    ),
    cell: ({ row }) => {
      const timestamp = row.getValue('timestamp') as string;
      return (
        <div className="min-w-[140px]">
          <div className="text-sm font-medium">
            {format(new Date(timestamp), 'MMM d, yyyy')}
          </div>
          <div className="text-muted-foreground text-xs">
            {format(new Date(timestamp), 'HH:mm:ss')}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'actor',
    header: 'Actor',
    cell: ({ row }) => {
      const actor = row.getValue('actor') as AuditLog['actor'];
      return (
        <div className="min-w-[150px]">
          <div className="text-sm font-medium">{actor.name || 'Unknown'}</div>
          <div className="text-muted-foreground text-xs">{actor.email}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'eventCategory',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      const category = row.getValue('eventCategory') as string;
      return (
        <Badge variant={getCategoryColor(category)} className="capitalize">
          {category}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'action',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Action" />
    ),
    cell: ({ row }) => {
      const action = row.getValue('action') as string;
      return (
        <Badge variant={getActionColor(action)} className="capitalize">
          {action}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'resource',
    header: 'Resource',
    cell: ({ row }) => {
      const resource = row.getValue('resource') as AuditLog['resource'];
      return (
        <div className="min-w-[120px]">
          <div className="text-sm font-medium capitalize">{resource.type}</div>
          {resource.email && (
            <div className="text-muted-foreground text-xs">
              {resource.email}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'success',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const success = row.getValue('success') as boolean;
      return (
        <Badge variant={success ? 'default' : 'destructive'}>
          {success ? 'Success' : 'Failed'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'metadata',
    header: 'IP Address',
    cell: ({ row }) => {
      const metadata = row.getValue('metadata') as AuditLog['metadata'];
      return (
        <div className="text-muted-foreground font-mono text-sm">
          {metadata.ipAddress || 'N/A'}
        </div>
      );
    },
  },
];
