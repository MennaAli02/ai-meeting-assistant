'use client'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { LayoutDashboard, PlusCircle, LogOut, Mic, Moon, Sun, Menu, X, CalendarDays } from 'lucide-react'

export default function TopNav({ userEmail, onSignOut, theme, toggleTheme }) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Calendar', icon: CalendarDays, href: '/calendar' },
    { label: 'New Meeting', icon: PlusCircle, href: '/meetings/new' },
  ]

  const goTo = (href) => {
    router.push(href)
    setOpen(false)
  }

  return (
    <header
      style={{
        background: 'var(--navbar-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-color)',
      }}
      className="fixed top-0 left-0 right-0 z-50 select-none"
    >
      <div className="h-16 flex items-center px-4 sm:px-6">

        <div className="flex items-center gap-2.5 mr-4 sm:mr-8">
          <div
            style={{
              background: 'linear-gradient(135deg, #6378FF 0%, #A78BFA 100%)',
              boxShadow: '0 4px 14px rgba(99,120,255,0.35)',
              borderRadius: '10px',
            }}
            className="w-8 h-8 flex items-center justify-center flex-shrink-0"
          >
            <Mic size={14} className="text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight" style={{ color: 'var(--navbar-text)' }}>
            MeetingAI
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <button
                key={item.href}
                onClick={() => goTo(item.href)}
                style={{
                  background: isActive ? 'var(--navbar-active-bg)' : 'transparent',
                  color: isActive ? 'var(--navbar-active-text)' : 'var(--text-secondary)',
                }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 hover:opacity-80"
              >
                <Icon size={15} strokeWidth={isActive ? 2.5 : 1.8} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="hidden md:flex flex-1" />

        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {userEmail && (
            <span
              style={{
                background: 'var(--bg-soft-purple)',
                color: 'var(--text-secondary)',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '11px',
              }}
              className="hidden lg:block truncate max-w-[180px]"
            >
              {userEmail}
            </span>
          )}

          <button
            onClick={toggleTheme}
            style={{ background: 'var(--bg-soft-purple)', color: 'var(--navbar-active-text)', borderRadius: '10px' }}
            className="p-2.5 hover:opacity-80 transition-all"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <button
            onClick={onSignOut}
            style={{ color: 'var(--text-secondary)', borderRadius: '10px' }}
            className="hidden sm:flex items-center gap-1.5 hover:text-red-500 px-3 py-2 text-sm transition-all"
          >
            <LogOut size={14} strokeWidth={1.8} />
            <span>Sign out</span>
          </button>

          <button
            onClick={() => setOpen(!open)}
            style={{ color: 'var(--text-secondary)', borderRadius: '10px' }}
            className="md:hidden p-2 hover:opacity-80 transition-all"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div style={{ borderTop: '1px solid var(--border-color)' }} className="md:hidden px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <button
                key={item.href}
                onClick={() => goTo(item.href)}
                style={{
                  background: isActive ? 'var(--navbar-active-bg)' : 'transparent',
                  color: isActive ? 'var(--navbar-active-text)' : 'var(--text-secondary)',
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium"
              >
                <Icon size={16} />
                {item.label}
              </button>
            )
          })}
          {userEmail && <p className="text-xs px-3 pt-2" style={{ color: 'var(--text-secondary)' }}>{userEmail}</p>}
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium"
            style={{ color: '#ef4444' }}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      )}
    </header>
  )
}