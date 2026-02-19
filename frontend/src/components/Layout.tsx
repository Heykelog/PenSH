import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  FileText, 
  Plus, 
  Shield, 
  Home, 
  Settings,
  Download,
  Search,
  Users
} from 'lucide-react'
import { cn } from '../lib/utils'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()

  const navigation = [
    { name: 'Ana Sayfa', href: '/', icon: Home },
    { name: 'Raporlarım', href: '/reports', icon: FileText },
    { name: 'Yeni Rapor', href: '/create-report', icon: Plus },
    { name: 'Müşteri Yönetimi', href: '/customer-management', icon: Users },
    { name: 'Bilgi Bankası', href: '/knowledge-base', icon: Shield },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-card border-r border-border">
          <div className="flex items-center flex-shrink-0 px-4">
            <Shield className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold text-foreground">
              PenTest Pro
            </span>
          </div>
          
          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon
                      className="mr-3 flex-shrink-0 h-5 w-5"
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
            
            {/* Footer */}
            <div className="px-4 py-4 border-t border-border">
              <div className="text-xs text-muted-foreground">
                <p>© 2024 PenTest Pro</p>
                <p>OWASP Top 10 - 2021</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <header className="bg-card border-b border-border shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                {/* Mobile menu button */}
                <div className="md:hidden">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h1 className="ml-4 text-xl font-semibold text-foreground">
                  Penetrasyon Testi Rapor Yönetimi
                </h1>
              </div>
              
              <div className="flex items-center space-x-4" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
