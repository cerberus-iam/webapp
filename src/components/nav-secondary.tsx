'use client';

import * as React from 'react';

import Link from 'next/link';

import { type Icon } from '@tabler/icons-react';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string;
    url: string;
    icon: Icon;
    onClick?: string;
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const handleClick = (item: {
    title: string;
    url: string;
    onClick?: string;
  }) => {
    if (item.onClick === 'openCommandPalette') {
      // TODO: Implement command palette opening
      console.log('Open command palette');
      return;
    }
  };

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.onClick ? (
                <SidebarMenuButton
                  onClick={(e) => {
                    e.preventDefault();
                    handleClick(item);
                  }}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton asChild>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
