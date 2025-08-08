"use client";

import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";

import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { MobileSidebar } from "./mobile-sidebar";

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

          <UserButton />
        </div>
      </div>
    </header>
  );
}
