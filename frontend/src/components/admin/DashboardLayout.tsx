// src/components/admin/DashboardLayout.tsx
import React from 'react' // QUAN TRỌNG NHẤT – phải có dòng này!
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/admin/AppSidebar'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// Sửa interface đúng cú pháp
interface DashboardLayoutProps {
  children: React.ReactNode // đúng kiểu cho React
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate()

  const handleLogout = () => {
    // Xóa token/auth data
    localStorage.removeItem('auth-token')
    // hoặc localStorage.clear()
    navigate('/login', { replace: true })
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-1" />
              <h2 className="text-xl font-semibold text-foreground">
                Admin Dashboard
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />

              <div className="flex items-center gap-3">
                {/* Avatar + Name */}
                <div className="hidden sm:flex items-center gap-2 text-sm">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">Admin Name</span>
                </div>

                {/* Logout */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
