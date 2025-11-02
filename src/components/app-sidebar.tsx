'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Film, MountainSnow, Users, UserPlus, Shirt, Library } from 'lucide-react';
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from './ui/separator';

const mainLinks = [
  { href: '/character-creation', label: 'Create Character', icon: UserPlus },
  { href: '/outfit-creation', label: 'Create Outfit', icon: Shirt },
  { href: '/scene-creation', label: 'Create Scene', icon: MountainSnow },
];

const libraryLinks = [
  { href: '/character-library', label: 'Character Library', icon: Users },
  { href: '/outfit-library', label: 'Outfit Library', icon: Library },
  { href: '/scene-library', label: 'Scene Library', icon: Film },
];

const SidebarLogo = () => (
  <div className="flex items-center gap-2.5 px-2">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 text-primary">
          <path d="M5.22877 4.5H18.7712C19.5635 4.5 20.214 5.15051 20.214 5.9428V19.4853C20.214 20.2776 19.5635 20.9281 18.7712 20.9281H5.22877C4.43647 20.9281 3.78596 20.2776 3.78596 19.4853V5.9428C3.78596 5.15051 4.43647 4.5 5.22877 4.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8.35712 4.5V20.9281" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12.9286 9.07141H15.6428" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12.9286 13.6428H15.6428" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <h1 className="font-headline text-lg font-bold text-foreground">Story Forge</h1>
  </div>
);

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="flex items-center justify-between p-0">
          <SidebarLogo />
          <div className="pr-2 group-data-[collapsible=icon]:hidden">
            <SidebarTrigger />
          </div>
      </SidebarHeader>
      <Separator className="my-3"/>
      <SidebarContent>
        <SidebarMenu>
          {mainLinks.map((link) => (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === link.href}
                tooltip={{ children: link.label }}
              >
                <Link href={link.href}>
                  <link.icon />
                  <span>{link.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <Separator className="my-3"/>
        <SidebarMenu>
          {libraryLinks.map((link) => (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(link.href)}
                tooltip={{ children: link.label }}
              >
                <Link href={link.href}>
                  <link.icon />
                  <span>{link.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
