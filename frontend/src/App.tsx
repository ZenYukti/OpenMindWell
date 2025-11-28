import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { useUIStore } from './store/uiStore'
import { supabase } from './lib/supabase'

// Pages
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import ChatRooms from './pages/ChatRooms'
import ChatRoom from './pages/ChatRoom'
import Journal from './pages/Journal'
import Habits from './pages/Habits'
import Mood from './pages/Mood'
import Resources from './pages/Resources'

// Layout
import DashboardLayout from './components/layout/DashboardLayout'

function App() {
  const { setUser, setLoading } = useAuthStore()
  const { darkMode } = useUIStore()

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [setUser, setLoading])

  useEffect(() => {
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        
        {/* Dashboard */}
        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="chat" element={<ChatRooms />} />
          <Route path="chat/:roomId" element={<ChatRoom />} />
          <Route path="journal" element={<Journal />} />
          <Route path="habits" element={<Habits />} />
          <Route path="mood" element={<Mood />} />
          <Route path="resources" element={<Resources />} />
        </Route>
      </Routes>
      
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#f9fafb',
          },
        }}
      />
    </>
  )
}

export default App
