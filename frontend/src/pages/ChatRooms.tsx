import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  MessageCircle, Users, Lock, Globe, Plus, Search, 
  Clock, ArrowRight, Sparkles, Heart
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { ChatRoom } from '@/lib/database.types'
import { formatRelativeTime } from '@/lib/utils'

const ROOM_CATEGORIES = [
  { id: 'all', label: 'All Rooms', icon: Globe, color: 'bg-gray-600' },
  { id: 'anxiety', label: 'Anxiety', icon: Heart, color: 'bg-calm-600' },
  { id: 'depression', label: 'Depression', icon: MessageCircle, color: 'bg-primary-600' },
  { id: 'stress', label: 'Stress', icon: Sparkles, color: 'bg-orange-600' },
  { id: 'relationships', label: 'Relationships', icon: Users, color: 'bg-pink-600' },
  { id: 'general', label: 'General', icon: MessageCircle, color: 'bg-accent-600' },
]

export default function ChatRooms() {
  useAuthStore()
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    loadRooms()
  }, [])

  const loadRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRooms(data || [])
    } catch (error) {
      console.error('Error loading rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.name.toLowerCase().includes(search.toLowerCase()) ||
                          room.description?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === 'all' || room.topic === category
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-3 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden bg-primary-600 rounded-xl sm:rounded-2xl p-3 sm:p-6 text-white shadow-xl">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-8 -right-8 w-20 sm:w-32 h-20 sm:h-32 bg-white/10 rounded-full blur-2xl animate-pulse-slow" />
          <div className="absolute -bottom-8 -left-8 w-16 sm:w-28 h-16 sm:h-28 bg-white/10 rounded-full blur-2xl animate-float" />
        </div>
        
        <div className="relative z-10 flex items-center justify-between gap-2 sm:gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h1 className="text-lg sm:text-2xl font-bold truncate">Chat Rooms</h1>
            </div>
            <p className="text-blue-100 text-xs sm:text-sm line-clamp-2">
              Connect anonymously with peers who understand.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 bg-white text-indigo-600 rounded-lg sm:rounded-xl 
                     hover:bg-indigo-50 active:bg-indigo-100 transition-all duration-300 shadow-lg 
                     font-semibold text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
          >
            <Plus size={16} /> <span className="hidden xs:inline">Create</span>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search rooms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg 
                       bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       transition-all duration-300 text-sm"
          />
        </div>
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
          {ROOM_CATEGORIES.map((cat) => {
            const shortLabel = cat.id === 'all' ? 'All' : cat.id === 'relationships' ? 'Relate' : cat.label.slice(0, 5)
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg whitespace-nowrap transition-all duration-200 text-xs sm:text-sm font-medium flex-shrink-0 ${
                  category === cat.id
                    ? `${cat.color.replace('from-', 'bg-').replace(/to-\S+/, '')} text-white shadow-md`
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <cat.icon size={12} className="sm:w-4 sm:h-4" />
                <span className="sm:hidden">{shortLabel}</span>
                <span className="hidden sm:inline">{cat.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Rooms Grid */}
      {loading ? (
        <div className="flex justify-center py-10 sm:py-16">
          <div className="relative">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-primary-200 border-t-primary-600"></div>
            <MessageCircle className="absolute inset-0 m-auto h-4 w-4 sm:h-5 sm:w-5 text-primary-600 animate-pulse" />
          </div>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center py-8 sm:py-12 glass rounded-xl sm:rounded-2xl px-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-xl sm:rounded-2xl flex items-center justify-center">
            <MessageCircle className="text-gray-400 w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">No rooms found</h3>
          <p className="text-gray-500 mb-4 text-sm max-w-xs mx-auto">
            Try adjusting your search or create a new room!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg 
                     hover:bg-primary-700 active:bg-primary-800 transition-all duration-300 font-medium text-sm"
          >
            <Plus size={16} /> Create Room
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
          {filteredRooms.map((room, index) => (
            <RoomCard key={room.id} room={room} index={index} />
          ))}
        </div>
      )}

      {/* Create Room Modal */}
      {showCreateModal && (
        <CreateRoomModal 
          onClose={() => setShowCreateModal(false)} 
          onCreated={() => {
            setShowCreateModal(false)
            loadRooms()
          }}
        />
      )}
    </div>
  )
}

function RoomCard({ room, index }: { room: ChatRoom; index: number }) {
  const category = ROOM_CATEGORIES.find(c => c.id === room.topic) || ROOM_CATEGORIES[5]
  const CategoryIcon = category.icon
  
  return (
    <Link
      to={`/app/chat/${room.id}`}
      className="group block glass rounded-lg sm:rounded-xl p-3 sm:p-5 hover:shadow-lg active:bg-gray-50 dark:active:bg-gray-700 transition-all duration-300 
                 animate-fade-in"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 ${category.color} rounded-lg sm:rounded-xl flex items-center justify-center 
                         shadow-md group-hover:scale-105 transition-transform duration-300`}>
            <CategoryIcon className="text-white w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          </div>
          <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-700 rounded-full capitalize font-medium">
            {room.topic || 'general'}
          </span>
        </div>
        <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 
                      group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors duration-300">
          <ArrowRight className="text-gray-400 group-hover:text-primary-600 transition-colors duration-300 w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
      </div>

      {/* Content */}
      <h3 className="font-bold text-sm sm:text-base mb-1 text-gray-900 dark:text-white group-hover:text-primary-600 
                   dark:group-hover:text-primary-400 transition-colors duration-300 line-clamp-1">
        {room.name}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm line-clamp-2 mb-2 sm:mb-3">
        {room.description || 'A safe space for peer support and connection.'}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs sm:text-sm pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-700">
        <span className="flex items-center gap-1.5 sm:gap-2 text-gray-500">
          <div className="flex -space-x-1.5 sm:-space-x-2">
            {[...Array(Math.min(3, room.member_count || 0))].map((_, i) => (
              <div key={i} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary-600 
                                    border-2 border-white dark:border-gray-800 flex items-center justify-center text-[8px] sm:text-[10px] text-white">
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <span className="font-medium">{room.member_count || 0}</span>
        </span>
        <span className="flex items-center gap-1 text-gray-400">
          <Clock size={12} className="sm:w-[14px] sm:h-[14px]" /> {formatRelativeTime(room.created_at)}
        </span>
      </div>
    </Link>
  )
}

function CreateRoomModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { profile } = useAuthStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [topic, setTopic] = useState('general')
  const [isPrivate, setIsPrivate] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !profile?.id) return

    setLoading(true)
    try {
      const { error } = await supabase.from('chat_rooms').insert({
        name: name.trim(),
        description: description.trim(),
        topic,
        is_private: isPrivate,
        created_by: profile.id,
      })

      if (error) throw error
      onCreated()
    } catch (error) {
      console.error('Error creating room:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-x-2 bottom-2 top-auto sm:inset-4 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2
                    sm:max-w-md sm:w-full bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-2xl 
                    max-h-[85vh] overflow-y-auto overscroll-contain">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-accent-600 rounded-lg sm:rounded-xl 
                        flex items-center justify-center shadow-lg flex-shrink-0">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Create Chat Room</h2>
            <p className="text-xs text-gray-500 truncate">Start a new conversation space</p>
          </div>
        </div>
        
        <form onSubmit={handleCreate} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Room Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Anxiety Support Circle"
              className="w-full px-3 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg 
                       bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       transition-all duration-300 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this room about?"
              rows={2}
              className="w-full px-3 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg 
                       bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       transition-all duration-300 resize-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Topic
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg 
                       bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       transition-all duration-300 cursor-pointer text-sm"
            >
              <option value="general">General Support</option>
              <option value="anxiety">Anxiety</option>
              <option value="depression">Depression</option>
              <option value="stress">Stress Management</option>
              <option value="relationships">Relationships</option>
            </select>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <input
              type="checkbox"
              id="private"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 flex-shrink-0"
            />
            <label htmlFor="private" className="flex-1 min-w-0">
              <span className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1.5 text-sm">
                <Lock size={14} className="text-orange-500" /> Private Room
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Only invited members can join
              </span>
            </label>
          </div>

          <div className="flex gap-2 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 sm:py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg 
                       hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 transition-all duration-300 font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 px-4 py-2 sm:py-2.5 bg-accent-600 text-white rounded-lg 
                       hover:bg-accent-700 active:bg-accent-800 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-300 font-medium shadow-md text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </span>
              ) : (
                'Create Room'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
