import { Sidebar } from "@/app/admin/components/sidebar";
import { Nav } from "@/app/admin/components/nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex min-h-screen'>
      <Sidebar />
      <div className='flex-1 flex flex-col'>
        <Nav />
        <main className='flex-1 overflow-y-auto overflow-x-auto md:pl-64 transition-all'>
         
          {/* Added pt-16 to account for Nav height */}
          <div className='w-full bg-gray-300 dark:bg-gray-800 p-2.5'>
            <div className='bg-gray-50 dark:bg-gray-900 rounded-lg p-6'>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
