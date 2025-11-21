'use client';

import {
  IconDots,
  IconMail,
  IconMailCheck,
  IconShieldCheck,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User } from '@/types/iam';

interface ColumnContext {
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export const createColumns = (context: ColumnContext): ColumnDef<User>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{user.email}</span>
          {user.emailVerifiedAt ? (
            <IconMailCheck className="size-4 text-green-600" />
          ) : (
            <IconMail className="text-muted-foreground size-4" />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      const displayName =
        user.name ||
        (user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.firstName || user.lastName || '-');
      return <div>{displayName}</div>;
    },
  },
  {
    id: 'roles',
    accessorFn: (row) => row.roles.map((r) => r.name).join(', '),
    header: 'Roles',
    cell: ({ row }) => {
      const roles = row.original.roles;
      if (roles.length === 0)
        return <span className="text-muted-foreground">No roles</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {roles.slice(0, 2).map((role) => (
            <Badge key={role.id} variant="secondary">
              {role.name}
            </Badge>
          ))}
          {roles.length > 2 && (
            <Badge variant="outline">+{roles.length - 2}</Badge>
          )}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: 'status',
    accessorFn: (row) => (row.blockedAt ? 'blocked' : 'active'),
    header: 'Status',
    cell: ({ row }) => {
      const user = row.original;
      const isBlocked = !!user.blockedAt;
      return (
        <Badge
          variant={isBlocked ? 'destructive' : 'outline'}
          className={
            isBlocked
              ? ''
              : 'border-green-600 text-green-700 dark:text-green-400'
          }
        >
          {isBlocked ? 'Blocked' : 'Active'}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: 'mfa',
    accessorKey: 'mfaEnabled',
    header: 'MFA',
    cell: ({ row }) => {
      const mfaEnabled = row.original.mfaEnabled;
      return mfaEnabled ? (
        <Badge variant="outline" className="gap-1">
          <IconShieldCheck className="size-3" />
          Enabled
        </Badge>
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-sm">
          {format(new Date(row.original.createdAt), 'MMM d, yyyy')}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <IconDots className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.id)}
            >
              Copy user ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => context.onEdit(user)}>
              Edit user
            </DropdownMenuItem>
            <DropdownMenuItem>Manage roles</DropdownMenuItem>
            <DropdownMenuSeparator />
            {user.blockedAt ? (
              <DropdownMenuItem>Unblock user</DropdownMenuItem>
            ) : (
              <DropdownMenuItem className="text-destructive">
                Block user
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => context.onDelete(user)}
            >
              Delete user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
