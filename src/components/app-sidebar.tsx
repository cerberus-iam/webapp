import * as React from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import {
  IconApi,
  IconBook,
  IconDashboard,
  IconFileText,
  IconSearch,
  IconSettings,
  IconShield,
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

const navItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: IconDashboard,
  },
  {
    title: 'Directory',
    url: '#',
    icon: IconUsers,
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
];

const navSecondary = [
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
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name: string | null;
    firstName?: string | null;
    lastName?: string | null;
    email: string;
  };
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const router = useRouter();

  const getInitials = (name: string, email: string): string => {
    if (name && name.trim()) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  };

  const userData = user
    ? {
        name:
          user.name ||
          `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
          user.email,
        email: user.email,
        avatar: '/avatars/default.jpg',
        initials: getInitials(
          user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          user.email
        ),
      }
    : {
        name: 'Guest User',
        email: 'guest@example.com',
        avatar: '/avatars/default.jpg',
        initials: 'GU',
      };

  // Determine which section is active based on current route
  const navItemsWithActive = navItems.map((item) => {
    if (item.items) {
      const isActive = item.items.some((subItem) =>
        router.pathname.startsWith(subItem.url)
      );
      return { ...item, isActive };
    }
    return {
      ...item,
      isActive: router.pathname === item.url,
    };
  });

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="hover:bg-sidebar-accent/50 data-[slot=sidebar-menu-button]:p-2!"
            >
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
                  <Image
                    src="/logo.svg"
                    alt="Cerberus IAM"
                    width={20}
                    height={20}
                    className="size-5"
                  />
                </div>
                <span className="text-base font-semibold tracking-tight">
                  Cerberus IAM
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItemsWithActive} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
