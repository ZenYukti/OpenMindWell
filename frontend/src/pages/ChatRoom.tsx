import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  Send, ArrowLeft, Users, Info,
  Smile, MoreVertical, Shield
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { ChatRoom as ChatRoomType, Message, Profile } from '@/lib/database.types'
import { formatRelativeTime, getAvatarUrl, containsCrisisKeywords } from '@/lib/utils'
import toast from 'react-hot-toast'
import CrisisModal from '@/components/CrisisModal'

type MessageWithProfile = Message & { profiles?: Profile | null }

export default function ChatRoom() {
  const { roomId } = useParams<{ roomId: string }>()
  const { profile } = useAuthStore()
  const [room, setRoom] = useState<ChatRoomType | null>(null)
  const [messages, setMessages] = useState<MessageWithProfile[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showCrisisModal, setShowCrisisModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (roomId) {
      loadRoom()
      loadMessages()
      subscribeToMessages()
    }

    return () => {
      supabase.channel(`room:${roomId}`).unsubscribe()
    }
  }, [roomId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadRoom = async () => {
    if (!roomId) return
    const { data } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', roomId)
      .single()
    
    if (data) setRoom(data)
  }

  const loadMessages = async () => {
    if (!roomId) return
    setLoading(true)
    
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(100)

    if (error) {
      console.error('Error loading messages:', error)
    } else {
      // Fetch profiles separately for each unique user
      const userIds = [...new Set((data || []).map(m => m.user_id))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds)
      
      const profileMap = new Map((profiles || []).map(p => [p.id, p]))
      const messagesWithProfiles = (data || []).map(msg => ({
        ...msg,
        profiles: profileMap.get(msg.user_id) || null
      }))
      setMessages(messagesWithProfiles)
    }
    setLoading(false)
  }

  const subscribeToMessages = () => {
    if (!roomId) return

    supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` },
        async (payload) => {
          const newMsgData = payload.new as Message
          // Fetch profile for the new message
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', newMsgData.user_id)
            .single()

          const newMsg: MessageWithProfile = {
            ...newMsgData,
            profiles: profileData || null
          }
          setMessages((prev) => [...prev, newMsg])
        }
      )
      .subscribe()
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !profile?.id || !roomId) return

    // Check for crisis keywords
    if (containsCrisisKeywords(newMessage)) {
      setShowCrisisModal(true)
    }

    setSending(true)
    try {
      const { error } = await supabase.from('messages').insert({
        room_id: roomId,
        user_id: profile.id,
        content: newMessage.trim(),
      })

      if (error) throw error
      setNewMessage('')
    } catch (error) {
      toast.error('Failed to send message')
      console.error(error)
    } finally {
      setSending(false)
    }
  }

  if (loading && !room) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-xl">
        <div className="flex items-center gap-2 md:gap-3">
          <Link to="/app/chat" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-semibold text-sm md:text-base truncate max-w-[180px] md:max-w-none">{room?.name || 'Chat Room'}</h1>
            <p className="text-xs md:text-sm text-gray-500 flex items-center gap-1">
              <Users size={12} /> {room?.member_count || 0} members
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <button className="p-1.5 md:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <Info size={18} />
          </button>
          <button className="p-1.5 md:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Guidelines Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 px-3 md:px-4 py-1.5 md:py-2 flex items-center gap-2 text-xs md:text-sm text-blue-700 dark:text-blue-300">
        <Shield size={14} className="flex-shrink-0" />
        <span>Be kind, supportive, and respect everyone's privacy.</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.length === 0 && !loading && (
          <div className="text-center py-8 md:py-12 text-gray-500">
            <Smile size={40} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm md:text-base">No messages yet. Start the conversation!</p>
          </div>
        )}

        {messages.map((msg) => {
          const isOwn = msg.user_id === profile?.id
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end gap-1.5 md:gap-2 max-w-[85%] md:max-w-[75%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                {!isOwn && (
                  <img
                    src={getAvatarUrl(msg.profiles?.display_name || msg.user_id)}
                    alt=""
                    className="w-7 h-7 md:w-8 md:h-8 rounded-full"
                  />
                )}
                <div>
                  {!isOwn && (
                    <p className="text-xs text-gray-500 mb-1 ml-1">
                      {msg.profiles?.display_name || 'Anonymous'}
                    </p>
                  )}
                  <div
                    className={`px-3 md:px-4 py-2 rounded-2xl text-sm md:text-base ${
                      isOwn
                        ? 'bg-primary-600 text-white rounded-br-md'
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-bl-md'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                  <p className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right mr-1' : 'ml-1'}`}>
                    {formatRelativeTime(msg.created_at)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 md:p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a supportive message..."
            className="flex-1 px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 dark:border-gray-700 rounded-full 
                       bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       text-sm md:text-base"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-2.5 md:p-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 
                       disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Send size={16} className="md:hidden" />
            <Send size={18} className="hidden md:block" />
          </button>
        </div>
      </form>

      {/* Crisis Modal */}
      <CrisisModal open={showCrisisModal} onClose={() => setShowCrisisModal(false)} />
    </div>
  )
}
