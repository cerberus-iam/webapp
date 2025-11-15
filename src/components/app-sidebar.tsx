import * as React from 'react';

import {
  IconBuildingCommunity,
  IconDashboard,
  IconHelp,
  IconInnerShadowTop,
  IconSearch,
  IconSettings,
  IconShield,
  IconUsers,
  IconUsersGroup,
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
      title: 'Users',
      url: '/users',
      icon: IconUsers,
    },
    {
      title: 'Roles',
      url: '/roles',
      icon: IconUsersGroup,
    },
    {
      title: 'Policies',
      url: '/policies',
      icon: IconShield,
    },
    {
      title: 'Teams',
      url: '/teams',
      icon: IconUsersGroup,
    },
  ],
  navSecondary: [
    {
      title: 'Organisation Profile',
      url: '/organisation',
      icon: IconBuildingCommunity,
    },
    {
      title: 'Settings',
      url: '/settings',
      icon: IconSettings,
    },
    {
      title: 'Get Help',
      url: '/help',
      icon: IconHelp,
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
              <a href="#">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">Cerberus IAM</span>
              </a>
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
