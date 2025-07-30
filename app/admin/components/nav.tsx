"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Moon, Sun, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { MobileSidebar } from "./mobile-sidebar";
import { useState } from "react";

export function Nav() {
  const { setTheme, theme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <header className='sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='flex h-16 items-center justify-between px-4'>
        <div className='flex items-center gap-4'>
          {/* Mobile sidebar toggle - only visible on small screens */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className='md:hidden'>
              <Button variant='outline' size='icon'>
                <Menu className='h-5 w-5' />
              </Button>
            </SheetTrigger>
            <MobileSidebar onOpenChange={setOpen} />
          </Sheet>

          <h1 className='text-lg font-semibold'>Dashboard</h1>
        </div>

        <div className='flex items-center gap-4'>
          {/* Theme toggle */}
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            <Sun className='h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
            <Moon className='absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
            <span className='sr-only'>Toggle theme</span>
          </Button>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
                <Avatar className='h-8 w-8'>
                  <AvatarImage
                    // src={session?.user?.image || ""}
                    // alt={session?.user?.name || "User"}
                  />
                  <AvatarFallback>
                    {/* {session?.user?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")} */}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56' align='end' forceMount>
              <DropdownMenuLabel className='font-normal'>
                <div className='flex flex-col space-y-1'>
                  <p className='text-sm font-medium leading-none'>
                user name
                  </p>
                  <p className='text-xs leading-none text-muted-foreground'>
                 user email
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href='/admin/settings'>Settings</a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href='/api/auth/signout'>Log out</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
