import { SidebarNav } from "@/components/dashboard/sidebar-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 mx-auto px-4 py-6 md:py-8">
      {/* Mobile Nav Top Scrollable */}
      <div className="md:hidden w-full overflow-x-auto pb-4 mb-4 border-b">
        <SidebarNav />
      </div>
      
      {/* Desktop Sidebar */}
      <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block overflow-y-auto">
        <div className="py-6 pr-6 lg:py-8 h-full">
          <SidebarNav />
        </div>
      </aside>
      <main className="flex w-full flex-col overflow-hidden pt-0 lg:py-8">
        {children}
      </main>
    </div>
  )
}
