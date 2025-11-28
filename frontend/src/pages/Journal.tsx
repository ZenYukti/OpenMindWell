import { useState, useEffect } from 'react'
import { 
  BookOpen, Plus, Search, Calendar, Lock, Trash2, 
  Edit2, X, Save, Sparkles, PenLine, Heart
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { JournalEntry } from '@/lib/database.types'
import { formatDate, containsCrisisKeywords } from '@/lib/utils'
import toast from 'react-hot-toast'
import CrisisModal from '@/components/CrisisModal'

const PROMPTS = [
  "What's one thing you're grateful for today?",
  "How are you really feeling right now?",
  "What's weighing on your mind?",
  "Describe a moment that made you smile recently.",
  "What do you need to let go of?",
  "Write a letter to your future self.",
  "What would you tell your younger self?",
  "What are you proud of accomplishing lately?",
]

export default function Journal() {
  const { profile } = useAuthStore()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isWriting, setIsWriting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [showCrisisModal, setShowCrisisModal] = useState(false)
  const [todayPrompt] = useState(() => PROMPTS[new Date().getDay() % PROMPTS.length])

  useEffect(() => {
    loadEntries()
  }, [profile?.id])

  const loadEntries = async () => {
    if (!profile?.id) return
    setLoading(true)

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading entries:', error)
    } else {
      setEntries(data || [])
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!content.trim() || !profile?.id) return

    // Check for crisis keywords
    if (containsCrisisKeywords(content)) {
      setShowCrisisModal(true)
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('journal_entries')
          .update({ title: title.trim() || null, content: content.trim() })
          .eq('id', editingId)

        if (error) throw error
        toast.success('Entry updated')
      } else {
        const { error } = await supabase
          .from('journal_entries')
          .insert({ 
            user_id: profile.id, 
            title: title.trim() || null, 
            content: content.trim() 
          })

        if (error) throw error
        toast.success('Entry saved')
      }

      setIsWriting(false)
      setEditingId(null)
      setTitle('')
      setContent('')
      loadEntries()
    } catch (error) {
      toast.error('Failed to save entry')
      console.error(error)
    }
  }

  const handleEdit = (entry: JournalEntry) => {
    setEditingId(entry.id)
    setTitle(entry.title || '')
    setContent(entry.content)
    setIsWriting(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Entry deleted')
      loadEntries()
    } catch (error) {
      toast.error('Failed to delete')
      console.error(error)
    }
  }

  const handleCancel = () => {
    setIsWriting(false)
    setEditingId(null)
    setTitle('')
    setContent('')
  }

  const filteredEntries = entries.filter((e) =>
    e.title?.toLowerCase().includes(search.toLowerCase()) ||
    e.content.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden bg-calm-600 rounded-2xl p-4 md:p-6 text-white shadow-xl">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-pulse-slow" />
          <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-white/10 rounded-full blur-2xl animate-float" />
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold">My Journal</h1>
            </div>
            <p className="text-purple-100 text-sm flex items-center gap-1.5">
              <Lock size={14} /> Private & encrypted
            </p>
          </div>
          {!isWriting && (
            <button
              onClick={() => setIsWriting(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white text-purple-600 rounded-lg 
                       hover:bg-purple-50 transition-all duration-300 shadow-md hover:shadow-lg 
                       hover:scale-105 font-medium text-sm w-full sm:w-auto"
            >
              <PenLine size={16} /> New Entry
            </button>
          )}
        </div>
      </div>

      {/* Writing Area */}
      {isWriting && (
        <div className="glass rounded-xl md:rounded-2xl p-4 md:p-6 space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <PenLine className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingId ? 'Edit Entry' : 'New Entry'}
              </h2>
            </div>
            <button 
              onClick={handleCancel} 
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-300"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          {/* Today's Prompt */}
          {!editingId && (
            <div className="relative overflow-hidden bg-calm-50 
                          dark:bg-calm-900/30 
                          rounded-lg p-3 md:p-4 border border-calm-100 dark:border-calm-800">
              <div className="absolute top-0 right-0 w-16 h-16 bg-purple-200/30 rounded-full blur-2xl" />
              <div className="relative z-10">
                <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mb-1 flex items-center gap-1.5">
                  <Sparkles size={14} /> Today's Prompt
                </p>
                <p className="text-gray-700 dark:text-gray-300 italic text-sm md:text-base leading-relaxed">"{todayPrompt}"</p>
                <button
                  onClick={() => setContent(todayPrompt + '\n\n')}
                  className="mt-2 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 font-medium 
                           flex items-center gap-1 transition-colors duration-300"
                >
                  <Heart size={12} /> Use this prompt
                </button>
              </div>
            </div>
          )}

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
            className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-200 dark:border-gray-700 rounded-lg 
                     bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500
                     transition-all duration-300 text-base font-medium placeholder:font-normal"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your thoughts here..."
            rows={8}
            className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-200 dark:border-gray-700 rounded-lg 
                     bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500
                     transition-all duration-300 text-sm md:text-base leading-relaxed resize-none"
            autoFocus
          />

          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex-1 px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg 
                       hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!content.trim()}
              className="flex-1 px-3 py-2.5 bg-calm-600 text-white rounded-lg 
                       hover:bg-calm-700 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-300 font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 text-sm"
            >
              <Save size={16} /> {editingId ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      {!isWriting && entries.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 md:py-3 border border-gray-200 dark:border-gray-700 rounded-lg 
                     bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500
                     transition-all duration-300 text-sm"
          />
        </div>
      )}

      {/* Entries List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="relative">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-200 border-t-purple-600"></div>
            <BookOpen className="absolute inset-0 m-auto h-4 w-4 text-purple-600 animate-pulse" />
          </div>
        </div>
      ) : filteredEntries.length === 0 && !isWriting ? (
        <div className="text-center py-10 md:py-14 glass rounded-xl">
          <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
            <BookOpen className="text-purple-500 w-10 h-10" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {search ? 'No matching entries' : 'Start Your Journey'}
          </h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            {search ? 'Try a different search term' : 'Your journal is a safe space to reflect, process, and grow. Start writing today.'}
          </p>
          {!search && (
            <button
              onClick={() => setIsWriting(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl 
                       hover:bg-purple-700 transition-all duration-300 font-medium"
            >
              <Plus size={18} /> Write Your First Entry
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry, index) => (
            <EntryCard 
              key={entry.id} 
              entry={entry} 
              index={index}
              onEdit={() => handleEdit(entry)}
              onDelete={() => handleDelete(entry.id)}
            />
          ))}
        </div>
      )}

      {/* Crisis Modal */}
      <CrisisModal open={showCrisisModal} onClose={() => setShowCrisisModal(false)} />
    </div>
  )
}

function EntryCard({ 
  entry, 
  index,
  onEdit, 
  onDelete 
}: { 
  entry: JournalEntry
  index: number
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div 
      className="glass rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-calm-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <BookOpen size={18} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
                {entry.title || 'Untitled Entry'}
              </h3>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar size={12} /> {formatDate(entry.created_at)}
              </p>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed mt-3">
            {entry.content}
          </p>
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors duration-300"
          >
            <Edit2 size={16} className="text-purple-600 dark:text-purple-400" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-300"
          >
            <Trash2 size={16} className="text-red-500" />
          </button>
        </div>
      </div>
    </div>
  )
}
