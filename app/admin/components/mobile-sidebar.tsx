"use client";

import { SheetContent } from "@/components/ui/sheet";
import Link from "next/link";
import {
  LayoutDashboard,
  Image,
  Newspaper,
  BookOpenCheck,
  Users2,
  Handshake,
  Logs,
  MicVocal,
  User,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";


const navItems = [
  { name: "Carousel", href: "/admin/carousel", icon: LayoutDashboard },
  { name: "About Us", href: "/admin/about-us", icon: Users2 },
  { name: "Interviews", href: "/admin/interviews", icon: BookOpenCheck },
  { name: "Partners", href: "/admin/partners", icon: Handshake },
  { name: "Schedule", href: "/admin/schedule", icon: Logs },
  { name: "Speakers", href: "/admin/speakers", icon: MicVocal },
  { name: "Gallery", href: "/admin/gallery", icon: Image },
  { name: "News", href: "/admin/news", icon: Newspaper },
  { name: "Nominations", href: "/admin/nominations", icon: User },
];

type Props = {
  onOpenChange?: (open: boolean) => void;
}

export function MobileSidebar({onOpenChange}: Props) {
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (onOpenChange) {
      onOpenChange(false); // Close the sheet
    }
 
  };

  return (
 
      <SheetContent side='left' className='w-[280px] px-0'>
        <div className='space-y-4 py-4'>
          <div className='px-3 py-2'>
            <h2 className='mb-2 px-4 text-lg font-semibold tracking-tight'>
              Nwanyị bụ ife
            </h2>
            <div className='space-y-1'>
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "mx-2 flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  )}>
                  <item.icon className='mr-3 h-4 w-4' />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
  
  );
}
