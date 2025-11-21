import * as React from 'react';

import Link from 'next/link';

import {
  IconApi,
  IconBook,
  IconDashboard,
  IconFileText,
  IconSearch,
  IconSettings,
  IconShield,
  IconShieldLock,
  IconUsers,
} from '@tabler/icons-react';

import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: IconDashboard,
    },
    {
      title: 'Directory',
      url: '#',
      icon: IconUsers,
      isActive: true,
      items: [
        {
          title: 'Users',
          url: '/directory/users',
        },
        {
          title: 'Teams',
          url: '/directory/teams',
        },
      ],
    },
    {
      title: 'Access Control',
      url: '#',
      icon: IconShield,
      items: [
        {
          title: 'Roles',
          url: '/access-control/roles',
        },
      ],
    },
    {
      title: 'Applications',
      url: '#',
      icon: IconApi,
      items: [
        {
          title: 'Clients',
          url: '/applications/clients',
        },
      ],
    },
    {
      title: 'Audit & Activity',
      url: '#',
      icon: IconFileText,
      items: [
        {
          title: 'Audit Logs',
          url: '/audit/logs',
        },
      ],
    },
    {
      title: 'Settings',
      url: '#',
      icon: IconSettings,
      items: [
        {
          title: 'Organisation',
          url: '/settings/organisation',
        },
        {
          title: 'Invitations',
          url: '/settings/invitations',
        },
        {
          title: 'API Keys',
          url: '/settings/api-keys',
        },
        {
          title: 'Webhooks',
          url: '/settings/webhooks',
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: 'Documentation',
      url: '/docs',
      icon: IconBook,
    },
    {
      title: 'Search',
      url: '#',
      icon: IconSearch,
      onClick: 'openCommandPalette',
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name: string | null;
    firstName?: string | null;
    lastName?: string | null;
    email: string;
  };
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const userData = user
    ? {
        name:
          user.name ||
          `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
          user.email,
        email: user.email,
        avatar: '/avatars/default.jpg',
      }
    : data.user;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/">
                <IconShieldLock className="size-5!" />
                <span className="text-base font-semibold">Cerberus IAM</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} inviteUserUrl="/users/invite" />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
