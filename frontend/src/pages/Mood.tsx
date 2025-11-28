import { useState, useEffect } from 'react'
import { 
  Plus, Calendar, TrendingUp, ChevronLeft, ChevronRight,
  Zap, Heart, Activity
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { MoodEntry } from '@/lib/database.types'
import { getMoodEmoji, getMoodLabel, getMoodColor, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const MOOD_OPTIONS = [
  { score: 1, emoji: '😢', label: 'Struggling' },
  { score: 2, emoji: '😔', label: 'Low' },
  { score: 3, emoji: '😐', label: 'Okay' },
  { score: 4, emoji: '🙂', label: 'Good' },
  { score: 5, emoji: '😊', label: 'Great' },
]

export default function Mood() {
  const { profile } = useAuthStore()
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showLogModal, setShowLogModal] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date())

  useEffect(() => {
    loadEntries()
  }, [selectedMonth])

  const loadEntries = async () => {
    if (!profile?.id) return
    setLoading(true)

    const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1)
    const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0)

    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', profile.id)
      .gte('created_at', startOfMonth.toISOString())
      .lte('created_at', endOfMonth.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading moods:', error)
    } else {
      setEntries(data || [])
    }
    setLoading(false)
  }

  const changeMonth = (delta: number) => {
    setSelectedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
  }

  const getAverageMood = () => {
    if (entries.length === 0) return 0
    const sum = entries.reduce((acc, e) => acc + e.mood_score, 0)
    return Math.round((sum / entries.length) * 10) / 10
  }

  const todayEntry = entries.find(
    (e) => new Date(e.created_at).toDateString() === new Date().toDateString()
  )

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="text-orange-500 w-5 h-5 md:w-6 md:h-6" /> Mood Tracker
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Understand your emotional patterns</p>
        </div>
        <button
          onClick={() => setShowLogModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm md:text-base w-full md:w-auto"
        >
          <Plus size={18} /> Log Mood
        </button>
      </div>

      {/* Today's Mood Card */}
      <div className="bg-orange-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
        <h2 className="font-semibold mb-2 text-sm md:text-base">How are you feeling today?</h2>
        {todayEntry ? (
          <div className="flex items-center gap-3 md:gap-4">
            <span className="text-4xl md:text-5xl">{getMoodEmoji(todayEntry.mood_score)}</span>
            <div>
              <p className="text-xl md:text-2xl font-bold">{getMoodLabel(todayEntry.mood_score)}</p>
              {todayEntry.notes && <p className="text-orange-100 mt-1 text-sm md:text-base">"{todayEntry.notes}"</p>}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 md:gap-4">
            <span className="text-4xl md:text-5xl opacity-50">❓</span>
            <div>
              <p className="text-base md:text-lg">No mood logged yet</p>
              <button
                onClick={() => setShowLogModal(true)}
                className="mt-2 px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 text-sm"
              >
                Log now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <StatCard
          icon={TrendingUp}
          label="Average Mood"
          value={getAverageMood() || '-'}
          color="orange"
        />
        <StatCard
          icon={Calendar}
          label="Entries This Month"
          value={entries.length}
          color="blue"
        />
        <StatCard
          icon={Activity}
          label="Days Tracked"
          value={new Set(entries.map((e) => new Date(e.created_at).toDateString())).size}
          color="green"
        />
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="font-semibold">
          {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          onClick={() => changeMonth(1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Entries */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
          <TrendingUp className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">No mood entries</h3>
          <p className="text-gray-500 mt-1">Start tracking to see your patterns</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 
                         flex items-center gap-4"
            >
              <span className="text-3xl">{getMoodEmoji(entry.mood_score)}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${getMoodColor(entry.mood_score)}`}>
                    {getMoodLabel(entry.mood_score)}
                  </span>
                  <span className="text-sm text-gray-500">
                    • {formatDate(entry.created_at)}
                  </span>
                </div>
                {entry.notes && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">"{entry.notes}"</p>
                )}
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Zap size={12} /> Energy: {entry.energy_level}/5
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart size={12} /> Anxiety: {entry.anxiety_level}/5
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Log Modal */}
      {showLogModal && (
        <LogMoodModal
          onClose={() => setShowLogModal(false)}
          onSaved={() => {
            setShowLogModal(false)
            loadEntries()
          }}
        />
      )}
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  color: 'orange' | 'blue' | 'green'
}) {
  const colors = {
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600',
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-100 dark:border-gray-700 text-center">
      <div className={`w-8 h-8 md:w-10 md:h-10 ${colors[color]} rounded-lg flex items-center justify-center mx-auto mb-1.5 md:mb-2`}>
        <Icon size={16} className="md:hidden" />
        <Icon size={20} className="hidden md:block" />
      </div>
      <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs md:text-sm text-gray-500">{label}</p>
    </div>
  )
}

function LogMoodModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { profile } = useAuthStore()
  const [moodScore, setMoodScore] = useState(3)
  const [energyLevel, setEnergyLevel] = useState(3)
  const [anxietyLevel, setAnxietyLevel] = useState(3)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile?.id) return

    setLoading(true)
    try {
      const { error } = await supabase.from('mood_entries').insert({
        user_id: profile.id,
        mood_score: moodScore,
        energy_level: energyLevel,
        anxiety_level: anxietyLevel,
        notes: notes.trim() || null,
      })

      if (error) throw error
      toast.success('Mood logged!')
      onSaved()
    } catch (error) {
      toast.error('Failed to log mood')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl p-5 md:p-6 w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg md:text-xl font-bold mb-4">Log Your Mood</h2>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Mood */}
          <div>
            <label className="block text-sm font-medium mb-3">How are you feeling?</label>
            <div className="flex justify-between">
              {MOOD_OPTIONS.map((opt) => (
                <button
                  key={opt.score}
                  type="button"
                  onClick={() => setMoodScore(opt.score)}
                  className={`flex flex-col items-center p-2 rounded-xl transition ${
                    moodScore === opt.score
                      ? 'bg-orange-100 dark:bg-orange-900/30 ring-2 ring-orange-500'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <span className="text-xs mt-1">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Energy */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Zap size={16} className="text-yellow-500" /> Energy Level
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
              className="w-full accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Exhausted</span>
              <span>Energized</span>
            </div>
          </div>

          {/* Anxiety */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Heart size={16} className="text-red-500" /> Anxiety Level
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={anxietyLevel}
              onChange={(e) => setAnxietyLevel(parseInt(e.target.value))}
              className="w-full accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Calm</span>
              <span>Anxious</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What's on your mind?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg 
                         bg-white dark:bg-gray-900 focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
