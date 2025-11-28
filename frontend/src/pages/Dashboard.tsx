import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  MessageCircle, BookOpen, Target, TrendingUp, 
  Calendar, ArrowRight, Plus, CheckCircle2, Flame
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { formatDate, getMoodEmoji, getGreeting } from '@/lib/utils'
import type { MoodEntry, Habit, HabitLog } from '@/lib/database.types'

interface DashboardStats {
  journalCount: number
  chatRooms: number
  streakDays: number
  moodAvg: number
}

export default function Dashboard() {
  const { profile } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats>({
    journalCount: 0,
    chatRooms: 0,
    streakDays: 0,
    moodAvg: 0,
  })
  const [recentMoods, setRecentMoods] = useState<MoodEntry[]>([])
  const [todayHabits, setTodayHabits] = useState<(Habit & { completed: boolean })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const userId = profile?.id
      if (!userId) return

      const today = new Date().toISOString().split('T')[0]

      const [journalsRes, moodsRes, habitsRes, logsRes] = await Promise.all([
        supabase.from('journal_entries').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('mood_entries').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(7),
        supabase.from('habits').select('*').eq('user_id', userId).eq('is_active', true),
        supabase.from('habit_logs').select('*').eq('user_id', userId).eq('date', today),
      ])

      setStats({
        journalCount: journalsRes.count || 0,
        chatRooms: 5,
        streakDays: calculateStreak(logsRes.data || []),
        moodAvg: calculateMoodAvg(moodsRes.data || []),
      })

      setRecentMoods(moodsRes.data || [])

      const habits = habitsRes.data || []
      const logs = logsRes.data || []
      setTodayHabits(
        habits.map((h) => ({
          ...h,
          completed: logs.some((l: HabitLog) => l.habit_id === h.id),
        }))
      )
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStreak = (logs: HabitLog[]): number => {
    return logs.length > 0 ? Math.min(logs.length, 7) : 0
  }

  const calculateMoodAvg = (moods: MoodEntry[]): number => {
    if (moods.length === 0) return 0
    const sum = moods.reduce((acc, m) => acc + m.mood_score, 0)
    return Math.round((sum / moods.length) * 10) / 10
  }

  const toggleHabit = async (habitId: string, completed: boolean) => {
    const userId = profile?.id
    if (!userId) return

    const today = new Date().toISOString().split('T')[0]

    if (completed) {
      await supabase.from('habit_logs').delete().eq('habit_id', habitId).eq('date', today)
    } else {
      await supabase.from('habit_logs').insert({ habit_id: habitId, user_id: userId, date: today })
    }

    setTodayHabits((prev) =>
      prev.map((h) => (h.id === habitId ? { ...h, completed: !completed } : h))
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 dark:border-slate-700 dark:border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-primary-50 to-primary-200 dark:from-primary-950 dark:to-primary-900 border border-primary-200 dark:border-primary-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">{formatDate(new Date().toISOString())}</p>
            <h1 className="text-xl font-semibold text-primary-700 dark:text-primary-300">
              {getGreeting()}, {profile?.display_name || 'there'}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">How are you feeling today?</p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/app/mood"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 dark:bg-white 
                       text-white dark:text-slate-900 rounded-lg text-sm font-medium
                       hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              <Plus size={14} /> Log Mood
            </Link>
            <Link
              to="/app/journal"
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 
                       dark:border-slate-700 rounded-lg text-sm font-medium
                       hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <BookOpen size={14} /> Journal
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={BookOpen} label="Journal Entries" value={stats.journalCount} />
        <StatCard icon={MessageCircle} label="Chat Rooms" value={stats.chatRooms} />
        <StatCard icon={Flame} label="Day Streak" value={stats.streakDays} suffix="" />
        <StatCard icon={TrendingUp} label="Avg Mood" value={stats.moodAvg || '-'} />
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Today's Habits */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
              <Target size={16} className="text-slate-400" />
              Today's Habits
            </h2>
            <Link to="/app/habits" className="text-xs text-accent-600 hover:text-accent-700 flex items-center gap-1 font-medium">
              View All <ArrowRight size={12} />
            </Link>
          </div>

          {todayHabits.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500 mb-3">No habits set up yet</p>
              <Link
                to="/app/habits"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-white 
                         text-white dark:text-slate-900 rounded-lg text-xs font-medium"
              >
                <Plus size={12} /> Create habit
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {todayHabits.slice(0, 5).map((habit) => (
                <button
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id, habit.completed)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                    habit.completed
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                    habit.completed 
                      ? 'bg-green-500 text-white' 
                      : 'border-2 border-slate-300 dark:border-slate-600'
                  }`}>
                    {habit.completed && <CheckCircle2 size={12} />}
                  </div>
                  <span className={`flex-1 text-sm font-medium ${
                    habit.completed ? 'text-green-700 dark:text-green-400' : 'text-slate-700 dark:text-slate-300'
                  }`}>{habit.name}</span>
                  <span className="text-lg">{habit.emoji || ''}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mood Trend */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
              <TrendingUp size={16} className="text-slate-400" />
              Recent Moods
            </h2>
            <Link to="/app/mood" className="text-xs text-accent-600 hover:text-accent-700 flex items-center gap-1 font-medium">
              Details <ArrowRight size={12} />
            </Link>
          </div>

          {recentMoods.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500 mb-3">No mood entries yet</p>
              <Link
                to="/app/mood"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-white 
                         text-white dark:text-slate-900 rounded-lg text-xs font-medium"
              >
                <Plus size={12} /> Log mood
              </Link>
            </div>
          ) : (
            <div className="flex items-end justify-between h-32 gap-2 pt-4">
              {recentMoods.slice(0, 7).reverse().map((mood) => (
                <div key={mood.id} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xl">{getMoodEmoji(mood.mood_score)}</span>
                  <div className="w-full">
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-500 rounded-full transition-all duration-300"
                        style={{ width: `${(mood.mood_score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(mood.created_at).toLocaleDateString('en', { weekday: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Date Footer */}
      <div className="text-center py-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 
                      rounded-full text-xs text-slate-500">
          <Calendar size={12} />
          {formatDate(new Date().toISOString())}
        </div>
      </div>
    </div>
  )
}

function StatCard({ 
  icon: Icon, 
  label, 
  value,
  suffix
}: { 
  icon: React.ElementType
  label: string
  value: string | number
  suffix?: string
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 
                   hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
      <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-3">
        <Icon size={16} className="text-slate-500" />
      </div>
      <div className="flex items-baseline gap-1">
        <p className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
        {suffix && <span className="text-sm">{suffix}</span>}
      </div>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  )
}
