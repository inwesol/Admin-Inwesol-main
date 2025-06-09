'use client'
import { useUser } from '@clerk/nextjs'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'

function SidebarSkeleton() {
  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-4">
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
      </div>
      <div className="flex-1 space-y-2 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-full animate-pulse rounded bg-muted"
          />
        ))}
      </div>
    </div>
  )
}

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useUser()
  
  // If user is not loaded yet or not signed in, render children without sidebar layout
  if (!isLoaded || !isSignedIn) {
    return <>{children}</>
  }
  
  // If user is signed in, wrap with SidebarProvider and show sidebar
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <div className="border-r border-gray-200 shadow-sm">
          <AppSidebar />
        </div>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}