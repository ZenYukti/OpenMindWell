import { useState, useEffect } from 'react'
import { 
  Target, Plus, Check, X, Edit2, Trash2, Calendar
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Habit, HabitLog } from '@/lib/database.types'
import toast from 'react-hot-toast'

const HABIT_EMOJIS = ['💪', '🧘', '📚', '💧', '🏃', '😴', '🥗', '💊', '🧠', '✍️', '🎯', '🌅']

export default function Habits() {
  const { profile } = useAuthStore()
  const [habits, setHabits] = useState<Habit[]>([])
  const [todayLogs, setTodayLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    loadHabits()
  }, [])

  const loadHabits = async () => {
    if (!profile?.id) return
    setLoading(true)

    const [habitsRes, logsRes] = await Promise.all([
      supabase
        .from('habits')
        .select('*')
        .eq('user_id', profile.id)
        .eq('is_active', true)
        .order('created_at'),
      supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', profile.id)
        .eq('date', today),
    ])

    if (habitsRes.data) setHabits(habitsRes.data)
    if (logsRes.data) setTodayLogs(logsRes.data)
    setLoading(false)
  }

  const toggleHabit = async (habitId: string) => {
    if (!profile?.id) return
    
    const isCompleted = todayLogs.some((l) => l.habit_id === habitId)

    if (isCompleted) {
      // Remove log
      await supabase
        .from('habit_logs')
        .delete()
        .eq('habit_id', habitId)
        .eq('date', today)
      
      setTodayLogs((prev) => prev.filter((l) => l.habit_id !== habitId))
    } else {
      // Add log
      const { data, error } = await supabase
        .from('habit_logs')
        .insert({ habit_id: habitId, user_id: profile.id, date: today })
        .select()
        .single()

      if (!error && data) {
        setTodayLogs((prev) => [...prev, data])
        toast.success('Habit completed! 🎉')
      }
    }
  }

  const deleteHabit = async (id: string) => {
    if (!confirm('Delete this habit?')) return

    await supabase.from('habits').delete().eq('id', id)
    setHabits((prev) => prev.filter((h) => h.id !== id))
    toast.success('Habit deleted')
  }

  const completedCount = todayLogs.length
  const totalHabits = habits.length
  const progress = totalHabits > 0 ? (completedCount / totalHabits) * 100 : 0

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Target className="text-green-500 w-5 h-5 md:w-6 md:h-6" /> Habit Tracker
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Build healthy routines, one day at a time</p>
        </div>
        <button
          onClick={() => {
            setEditingHabit(null)
            setShowModal(true)
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm md:text-base w-full md:w-auto"
        >
          <Plus size={18} /> Add Habit
        </button>
      </div>

      {/* Progress Card */}
      <div className="bg-accent-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div>
            <h2 className="text-sm md:text-lg font-semibold flex items-center gap-2">
              <Calendar size={18} /> Today's Progress
            </h2>
            <p className="text-green-100 text-xs md:text-base">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl md:text-3xl font-bold">{completedCount}/{totalHabits}</p>
            <p className="text-green-100 text-xs md:text-base">habits done</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {progress === 100 && totalHabits > 0 && (
          <p className="mt-3 text-center font-medium animate-pulse">
            🎉 All habits complete! Great job!
          </p>
        )}
      </div>

      {/* Habits Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : habits.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
          <Target className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">No habits yet</h3>
          <p className="text-gray-500 mt-1 mb-4">Start tracking habits to build better routines</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus size={18} /> Create First Habit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {habits.map((habit) => {
            const isCompleted = todayLogs.some((l) => l.habit_id === habit.id)
            return (
              <div
                key={habit.id}
                className={`bg-white dark:bg-gray-800 rounded-xl p-4 md:p-5 border-2 transition-all ${
                  isCompleted
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-100 dark:border-gray-700 hover:border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{habit.emoji || '✨'}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingHabit(habit)
                        setShowModal(true)
                      }}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold mb-1">{habit.name}</h3>
                {habit.description && (
                  <p className="text-sm text-gray-500 mb-3">{habit.description}</p>
                )}

                <button
                  onClick={() => toggleHabit(habit.id)}
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <Check size={18} /> Done!
                    </>
                  ) : (
                    <>
                      <Target size={18} /> Mark Complete
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <HabitModal
          habit={editingHabit}
          onClose={() => {
            setShowModal(false)
            setEditingHabit(null)
          }}
          onSaved={() => {
            setShowModal(false)
            setEditingHabit(null)
            loadHabits()
          }}
        />
      )}
    </div>
  )
}

function HabitModal({ 
  habit, 
  onClose, 
  onSaved 
}: { 
  habit: Habit | null
  onClose: () => void
  onSaved: () => void 
}) {
  const { profile } = useAuthStore()
  const [name, setName] = useState(habit?.name || '')
  const [description, setDescription] = useState(habit?.description || '')
  const [emoji, setEmoji] = useState(habit?.emoji || '💪')
  const [loading, setLoading] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !profile?.id) return

    setLoading(true)
    try {
      if (habit) {
        // Update
        await supabase
          .from('habits')
          .update({ name: name.trim(), description: description.trim() || null, emoji })
          .eq('id', habit.id)
      } else {
        // Create
        await supabase
          .from('habits')
          .insert({ 
            user_id: profile.id, 
            name: name.trim(), 
            description: description.trim() || null,
            emoji 
          })
      }
      toast.success(habit ? 'Habit updated' : 'Habit created')
      onSaved()
    } catch (error) {
      toast.error('Failed to save habit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{habit ? 'Edit Habit' : 'New Habit'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Emoji</label>
            <div className="flex flex-wrap gap-2">
              {HABIT_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`text-2xl p-2 rounded-lg transition ${
                    emoji === e
                      ? 'bg-green-100 dark:bg-green-900/30 ring-2 ring-green-500'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Habit Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Drink 8 glasses of water"
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg 
                         bg-white dark:bg-gray-900 focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why is this habit important to you?"
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg 
                         bg-white dark:bg-gray-900 focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
