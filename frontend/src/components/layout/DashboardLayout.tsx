import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  MessageCircle, BookOpen, Target, TrendingUp, Zap,
  Menu, X, Moon, Sun, LogOut, Phone, Home
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import { supabase, signInAnonymously, generateUsername, signOut } from '../../lib/supabase'
import { getAvatarUrl } from '../../lib/utils'
import CrisisModal from '@/components/CrisisModal'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/app', icon: Home, label: 'Dashboard', end: true },
  { to: '/app/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/app/journal', icon: BookOpen, label: 'Journal' },
  { to: '/app/habits', icon: Target, label: 'Habits' },
  { to: '/app/mood', icon: TrendingUp, label: 'Mood' },
  { to: '/app/resources', icon: Zap, label: 'Resources' },
]

export default function DashboardLayout() {
  const navigate = useNavigate()
  const { user, profile, setProfile, logout } = useAuthStore()
  const { sidebarOpen, darkMode, setSidebarOpen, toggleDarkMode } = useUIStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showCrisis, setShowCrisis] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  useEffect(() => {
    const initUser = async () => {
      if (!user) {
        try {
          await signInAnonymously()
          toast.success('Welcome! You are anonymous.')
        } catch (error) {
          toast.error('Failed to connect')
          return
        }
      }

      if (user && !profile) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (existingProfile) {
          setProfile(existingProfile)
        } else {
          const newProfile = {
            id: user.id,
            username: generateUsername(),
            avatar_seed: Math.random().toString(36).substring(7),
            is_online: true,
          }
          
          const { data, error } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single()

          if (!error && data) {
            setProfile(data)
          }
        }
      }
    }

    initUser()
  }, [user, profile, setProfile])

  const handleSignOut = async () => {
    try {
      await signOut()
      logout()
      navigate('/')
      toast.success('Signed out')
    } catch {
      toast.error('Failed to sign out')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-4 h-14">
          <button 
            onClick={() => setMobileOpen(!mobileOpen)} 
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="OpenMindWell Logo" className="w-7 h-7 rounded-lg object-contain" />
            <span className="font-semibold text-sm">OpenMindWell</span>
          </div>
          <button 
            onClick={() => setShowCrisis(true)} 
            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Phone size={16} />
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className={`hidden lg:flex flex-col fixed top-0 left-0 h-full z-40
          bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
          transition-all duration-200 ${sidebarOpen ? 'w-56' : 'w-16'}`}
        >
          {/* Logo */}
          <div className="flex items-center gap-2 px-4 h-14 border-b border-slate-200 dark:border-slate-800">
            <img src="/logo.png" alt="OpenMindWell Logo" className="w-8 h-8 rounded-lg object-contain flex-shrink-0" />
            {sidebarOpen && (
              <span className="font-semibold text-slate-900 dark:text-white">OpenMindWell</span>
            )}
          </div>

          {/* Profile */}
          {profile && (
            <div className={`p-3 border-b border-slate-200 dark:border-slate-800 ${!sidebarOpen && 'flex justify-center'}`}>
              <div className={`flex items-center gap-2 ${sidebarOpen ? 'p-2 bg-slate-50 dark:bg-slate-800 rounded-lg' : ''}`}>
                <div className="relative flex-shrink-0">
                  <img
                    src={getAvatarUrl(profile.avatar_seed)}
                    alt="Avatar"
                    className="w-8 h-8 rounded-lg bg-slate-100"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                </div>
                {sidebarOpen && (
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{profile.username}</p>
                    <p className="text-xs text-slate-500">Anonymous</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Nav */}
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `
                  flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm
                  ${isActive 
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' 
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}
                  ${!sidebarOpen && 'justify-center px-2'}
                `}
              >
                <item.icon size={18} className="flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </NavLink>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="p-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
            <button
              onClick={() => setShowCrisis(true)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg w-full
                bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 
                hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm
                ${!sidebarOpen && 'justify-center px-2'}`}
            >
              <Phone size={18} />
              {sidebarOpen && <span className="font-medium">Crisis Help</span>}
            </button>

            <div className={`flex gap-1 ${!sidebarOpen && 'flex-col'}`}>
              <button
                onClick={toggleDarkMode}
                className={`flex items-center justify-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors
                  ${sidebarOpen ? 'flex-1' : 'w-full'}`}
              >
                {darkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-slate-500" />}
              </button>

              <button
                onClick={handleSignOut}
                className={`flex items-center justify-center p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors
                  ${sidebarOpen ? 'flex-1' : 'w-full'}`}
              >
                <LogOut size={18} />
              </button>
            </div>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg w-full 
                hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm text-slate-500
                ${!sidebarOpen && 'justify-center px-2'}`}
            >
              <Menu size={18} />
              {sidebarOpen && <span>Collapse</span>}
            </button>
          </div>
        </aside>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-30">
            <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
              <div className="p-4">
                {/* Mobile Logo */}
                <div className="flex items-center gap-2 mb-4">
                  <img src="/logo.png" alt="OpenMindWell Logo" className="w-8 h-8 rounded-lg object-contain" />
                  <span className="font-semibold">OpenMindWell</span>
                </div>

                {profile && (
                  <div className="flex items-center gap-2 mb-4 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="relative">
                      <img src={getAvatarUrl(profile.avatar_seed)} alt="" className="w-8 h-8 rounded-lg" />
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{profile.username}</p>
                      <p className="text-xs text-slate-500">Anonymous</p>
                    </div>
                  </div>
                )}
                
                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) => `
                        flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm
                        ${isActive 
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' 
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}
                      `}
                    >
                      <item.icon size={18} />
                      <span className="font-medium">{item.label}</span>
                    </NavLink>
                  ))}
                </nav>

                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
                  <button
                    onClick={() => { setShowCrisis(true); setMobileOpen(false); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg w-full text-sm
                      bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                  >
                    <Phone size={18} />
                    <span className="font-medium">Crisis Help</span>
                  </button>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={toggleDarkMode}
                      className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm"
                    >
                      {darkMode ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} className="text-slate-500" />}
                      <span>{darkMode ? 'Light' : 'Dark'}</span>
                    </button>
                    <button
                      onClick={() => { handleSignOut(); setMobileOpen(false); }}
                      className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 text-sm"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className={`flex-1 min-h-screen transition-all duration-200 ${sidebarOpen ? 'lg:ml-56' : 'lg:ml-16'}`}>
          <div className="p-4 md:p-6 max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <CrisisModal open={showCrisis} onClose={() => setShowCrisis(false)} />
    </div>
  )
}
