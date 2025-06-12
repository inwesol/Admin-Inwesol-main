'use client'

import React from 'react'
import { useUser } from '@clerk/nextjs'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

interface LayoutProps {
  children: React.ReactNode
}

function SidebarSkeleton(): JSX.Element {
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

function SidebarLayout({ children }: LayoutProps): JSX.Element {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}

export function ConditionalLayout({ children }: LayoutProps): JSX.Element {
  const { isSignedIn, isLoaded } = useUser()
  
  // Show loading skeleton while checking auth
  if (!isLoaded) {
    return (
      <div className="flex h-screen">
        <SidebarSkeleton />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }
  
  // If user is not signed in, render children without sidebar layout
  if (!isSignedIn) {
    return <>{children}</>
  }
  
  // If user is signed in, use the sidebar layout
  return <SidebarLayout>{children}</SidebarLayout>
}