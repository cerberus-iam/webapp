'use client';

import { IconDots, IconMail, IconTrash } from '@tabler/icons-react';
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
import type { Invitation } from '@/lib/api/invitations';

interface ActionsProps {
  invitation: Invitation;
  onResend: (invitation: Invitation) => void;
  onRevoke: (invitation: Invitation) => void;
}

function Actions({ invitation, onResend, onRevoke }: ActionsProps) {
  const canResend = invitation.status === 'pending';
  const canRevoke = invitation.status === 'pending';

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
          disabled={!canResend}
          onClick={() => onResend(invitation)}
        >
          <IconMail className="mr-2 h-4 w-4" />
          Resend Email
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!canRevoke}
          onClick={() => onRevoke(invitation)}
          className="text-destructive"
        >
          <IconTrash className="mr-2 h-4 w-4" />
          Revoke
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getStatusVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'pending':
      return 'default';
    case 'accepted':
      return 'secondary';
    case 'expired':
    case 'revoked':
      return 'destructive';
    default:
      return 'outline';
  }
}

export const createColumns = (
  onResend: (invitation: Invitation) => void,
  onRevoke: (invitation: Invitation) => void
): ColumnDef<Invitation>[] => [
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      const email = row.getValue('email') as string;
      return <div className="font-medium">{email}</div>;
    },
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      return <div>{role}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
    },
  },
  {
    accessorKey: 'invitedBy',
    header: 'Invited By',
    cell: ({ row }) => {
      const invitedBy = row.getValue('invitedBy') as Invitation['invitedBy'];
      return <div className="text-sm">{invitedBy.name || invitedBy.email}</div>;
    },
  },
  {
    accessorKey: 'expiresAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Expires" />
    ),
    cell: ({ row }) => {
      const expiresAt = row.getValue('expiresAt') as string;
      const expiry = new Date(expiresAt);
      const isExpired = expiry < new Date();
      return (
        <span className={isExpired ? 'text-destructive text-sm' : 'text-sm'}>
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
    cell: ({ row }) => (
      <Actions
        invitation={row.original}
        onResend={onResend}
        onRevoke={onRevoke}
      />
    ),
  },
];
