import type { Icon } from '@tabler/icons-react';
import {
  IconDashboard,
  IconUsers,
  IconShield,
  IconUserCircle,
  IconKey,
  IconWebhook,
  IconMail,
  IconFileText,
  IconSettings,
  IconHelp,
} from '@tabler/icons-react';

export type NavigationItem = {
  title: string;
  href: string;
  icon: Icon;
  exact?: boolean;
};

export type NavigationConfig = {
  main: NavigationItem[];
  secondary: NavigationItem[];
};

export const navigation: NavigationConfig = {
  main: [
    {
      title: 'Dashboard',
      href: '/',
      icon: IconDashboard,
      exact: true,
    },
    {
      title: 'Users',
      href: '/iam/users',
      icon: IconUsers,
    },
    {
      title: 'Roles',
      href: '/iam/roles',
      icon: IconShield,
    },
    {
      title: 'Teams',
      href: '/iam/teams',
      icon: IconUsers,
    },
    {
      title: 'OAuth Clients',
      href: '/iam/clients',
      icon: IconKey,
    },
    {
      title: 'API Keys',
      href: '/iam/api-keys',
      icon: IconKey,
    },
    {
      title: 'Webhooks',
      href: '/iam/webhooks',
      icon: IconWebhook,
    },
    {
      title: 'Invitations',
      href: '/iam/invitations',
      icon: IconMail,
    },
    {
      title: 'Audit Logs',
      href: '/audit/logs',
      icon: IconFileText,
    },
  ],
  secondary: [
    {
      title: 'Profile',
      href: '/profile',
      icon: IconUserCircle,
    },
    {
      title: 'Organisation',
      href: '/settings/organisation',
      icon: IconSettings,
    },
    {
      title: 'Help & Support',
      href: '/help',
      icon: IconHelp,
    },
  ],
};
