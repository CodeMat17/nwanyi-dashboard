import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Image,
  Newspaper,
  BookOpenCheck,
  Users2,
  Handshake,
  Logs,
  MicVocal,
} from "lucide-react";

const navItems = [
  { name: "Carousel", href: "/admin/carousel", icon: LayoutDashboard },
  { name: "About Us", href: "/admin/about-us", icon: Users2 },
  { name: "Interviews", href: "/admin/interviews", icon: BookOpenCheck },
  { name: "Partners", href: "/admin/partners", icon: Handshake },
  { name: "Schedule", href: "/admin/schedule", icon: Logs },
  { name: "Speakers", href: "/admin/speakers", icon: MicVocal },
  { name: "Gallery", href: "/admin/gallery", icon: Image },
  { name: "News", href: "/admin/news", icon: Newspaper },
];

export function Sidebar() {
  return (
    <div className='hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0'>
      <div className='flex flex-col flex-grow border-r border-gray-200 dark:border-gray-800 pt-5 bg-white dark:bg-gray-900 overflow-y-auto'>
        <div className='flex items-center flex-shrink-0 px-4'>
          <h1 className='text-xl font-bold text-gray-900 dark:text-white'>
            Nwanyị bụ ife
          </h1>
        </div>
        <div className='mt-5 flex-grow flex flex-col'>
          <nav className='flex-1 px-2 pb-4 space-y-1'>
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className='group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'>
                <item.icon className='mr-3 flex-shrink-0 h-5 w-5' />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        {/* <form
          action={async () => {
            "use server";
            await signOut();
          }}
          className='px-4 pb-4'> */}
          <Button
            variant='ghost'
            className='w-full justify-start text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'>
            <span>Sign out</span>
          </Button>
        {/* </form> */}
      </div>
    </div>
  );
}
