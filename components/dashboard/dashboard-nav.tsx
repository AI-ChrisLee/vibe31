'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/auth-provider'
import { useCredits } from '@/lib/hooks/use-credits'
import { 
  Home, 
  CreditCard, 
  MessageSquare, 
  FileText, 
  BarChart3, 
  Settings,
  LogOut,
  Loader2
} from 'lucide-react'

export default function DashboardNav() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { credits, loading: creditsLoading } = useCredits()

  const navItems = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/dashboard/assistant', label: 'AI Assistant', icon: MessageSquare },
    { href: '/dashboard/funnels', label: 'Funnels', icon: FileText },
    { href: '/dashboard/crm', label: 'CRM', icon: BarChart3 },
    { href: '/dashboard/credits', label: 'Credits', icon: CreditCard },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-black text-black">
              Vibe31
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                      isActive ? 'text-black' : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <CreditCard className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-black">
                {creditsLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  credits?.available_credits || 0
                )}
              </span>
              <span className="text-gray-600">credits</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {user?.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-gray-600 hover:text-black"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}