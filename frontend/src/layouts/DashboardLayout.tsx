import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import BrandLogo from '../components/BrandLogo'
import ThemeToggle from '../components/ThemeToggle'

interface DashboardLayoutProps {
  children: ReactNode
}

const navigationGroups = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    items: [{ name: 'Dashboard', href: '/dashboard' }],
  },
  {
    id: 'master-data',
    label: 'Master Data',
    items: [
      { name: 'Items', href: '/items' },
      { name: 'Customers', href: '/customers' },
      { name: 'Suppliers', href: '/suppliers' },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    items: [
      { name: 'Sales Orders', href: '/sales-orders' },
      { name: 'Purchase Orders', href: '/purchase-orders' },
      { name: 'Inventory', href: '/inventory' },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    items: [
      { name: 'Sales Invoices', href: '/sales-invoices' },
      { name: 'Purchase Invoices', href: '/purchase-invoices' },
      { name: 'Payments', href: '/payments' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    items: [{ name: 'Reports', href: '/reports' }],
  },
  {
    id: 'settings',
    label: 'Settings',
    items: [{ name: 'Settings', href: '/settings' }],
  },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    navigationGroups.reduce<Record<string, boolean>>((acc, group) => {
      acc[group.id] = true
      return acc
    }, {})
  )
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      logout()
    }
  }

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-black shadow-lg border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-800">
            <Link to="/dashboard" onClick={() => setSidebarOpen(false)}>
              <BrandLogo showText={false} size="lg" variant="auto" />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
            {navigationGroups.map((group) => {
              const isOpen = openGroups[group.id]

              const renderGroupIcon = () => {
                switch (group.id) {
                  case 'dashboard':
                    return (
                      <svg
                        className="h-4 w-4 text-gray-500 dark:text-gray-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 11L12 3l9 8" />
                        <path d="M5 10v10h14V10" />
                      </svg>
                    )
                  case 'master-data':
                    return (
                      <svg
                        className="h-4 w-4 text-gray-500 dark:text-gray-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="4" y="4" width="7" height="7" rx="1" />
                        <rect x="13" y="4" width="7" height="7" rx="1" />
                        <rect x="4" y="13" width="7" height="7" rx="1" />
                        <rect x="13" y="13" width="7" height="7" rx="1" />
                      </svg>
                    )
                  case 'operations':
                    return (
                      <svg
                        className="h-4 w-4 text-gray-500 dark:text-gray-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 7h14M5 12h14M5 17h10" />
                      </svg>
                    )
                  case 'finance':
                    return (
                      <svg
                        className="h-4 w-4 text-gray-500 dark:text-gray-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M7 10.5A3.5 3.5 0 0 1 10.5 7H14a3.5 3.5 0 0 1 0 7h-4a3.5 3.5 0 0 0 0 7h3.5A3.5 3.5 0 0 0 17 17.5" />
                      </svg>
                    )
                  case 'reports':
                    return (
                      <svg
                        className="h-4 w-4 text-gray-500 dark:text-gray-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 19h16M5 18V9m4 9V5m4 13v-7m4 7v-9" />
                      </svg>
                    )
                  case 'settings':
                    return (
                      <svg
                        className="h-4 w-4 text-gray-500 dark:text-gray-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 9.5A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5" />
                        <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.8 1.8 0 0 0 15 19.4a1.8 1.8 0 0 0-1 .33 1.8 1.8 0 0 0-.8 1.51V21.5a2 2 0 1 1-4 0v-.26A1.8 1.8 0 0 0 8.4 19.4a1.8 1.8 0 0 0-1.98.36l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.8 1.8 0 0 0 4.6 15a1.8 1.8 0 0 0-1.33-1 1.8 1.8 0 0 0-1.51-.8H1.5a2 2 0 1 1 0-4h.26A1.8 1.8 0 0 0 4.6 8.4a1.8 1.8 0 0 0-.36-1.98l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.8 1.8 0 0 0 9 4.6a1.8 1.8 0 0 0 1-.33 1.8 1.8 0 0 0 .8-1.51V2.5a2 2 0 1 1 4 0v.26A1.8 1.8 0 0 0 15.6 4.6a1.8 1.8 0 0 0 1.98-.36l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.8 1.8 0 0 0 19.4 9a1.8 1.8 0 0 0 1.33 1 1.8 1.8 0 0 0 1.51.8h.26a2 2 0 1 1 0 4h-.26a1.8 1.8 0 0 0-1.51.8A1.8 1.8 0 0 0 19.4 15Z" />
                      </svg>
                    )
                  default:
                    return null
                }
              }

              return (
                <div key={group.id}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    className="flex w-full items-center justify-between px-2 py-1 text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
                  >
                    <span className="flex items-center space-x-2">
                      {renderGroupIcon()}
                      <span>{group.label}</span>
                    </span>
                    <svg
                      className={`h-3 w-3 text-gray-400 dark:text-gray-500 transform transition-transform ${
                        isOpen ? 'rotate-90' : ''
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="mt-1 space-y-1">
                      {group.items.map((item) => {
                        const isActive = location.pathname === item.href
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                              isActive
                                ? 'bg-gray-100 dark:bg-gray-900 text-black dark:text-white'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'
                            }`}
                          >
                            {item.name}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* User section */}
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-white dark:bg-black shadow-sm border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ☰
            </button>
            <div className="flex-1" />
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <span className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 bg-white dark:bg-black">{children}</main>
      </div>
    </div>
  )
}

