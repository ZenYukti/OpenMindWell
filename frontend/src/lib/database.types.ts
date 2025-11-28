export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          avatar_seed: string
          bio: string | null
          created_at: string
          is_online: boolean
          last_seen: string | null
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          avatar_seed?: string
          bio?: string | null
          created_at?: string
          is_online?: boolean
          last_seen?: string | null
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          avatar_seed?: string
          bio?: string | null
          is_online?: boolean
          last_seen?: string | null
        }
        Relationships: []
      }
      chat_rooms: {
        Row: {
          id: string
          name: string
          description: string | null
          topic: string
          icon: string
          color: string
          is_private: boolean
          is_active: boolean
          created_by: string | null
          member_count: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          topic?: string
          icon?: string
          color?: string
          is_private?: boolean
          is_active?: boolean
          created_by?: string | null
          member_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          topic?: string
          icon?: string
          color?: string
          is_private?: boolean
          is_active?: boolean
          created_by?: string | null
          member_count?: number
          created_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          room_id: string
          user_id: string
          content: string
          created_at: string
          is_flagged: boolean
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          content: string
          created_at?: string
          is_flagged?: boolean
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          content?: string
          created_at?: string
          is_flagged?: boolean
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          id: string
          user_id: string
          title: string | null
          content: string
          mood: number | null
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          content: string
          mood?: number | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          content?: string
          mood?: number | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          emoji: string
          color: string
          frequency: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          emoji?: string
          color?: string
          frequency?: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          emoji?: string
          color?: string
          frequency?: string
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      habit_logs: {
        Row: {
          id: string
          habit_id: string
          user_id: string
          date: string
          completed_at: string
        }
        Insert: {
          id?: string
          habit_id: string
          user_id: string
          date?: string
          completed_at?: string
        }
        Update: {
          id?: string
          habit_id?: string
          user_id?: string
          date?: string
          completed_at?: string
        }
        Relationships: []
      }
      mood_entries: {
        Row: {
          id: string
          user_id: string
          mood_score: number
          energy_level: number
          anxiety_level: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mood_score: number
          energy_level?: number
          anxiety_level?: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mood_score?: number
          energy_level?: number
          anxiety_level?: number
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Type exports
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ChatRoom = Database['public']['Tables']['chat_rooms']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type JournalEntry = Database['public']['Tables']['journal_entries']['Row']
export type Habit = Database['public']['Tables']['habits']['Row']
export type HabitLog = Database['public']['Tables']['habit_logs']['Row']
export type MoodEntry = Database['public']['Tables']['mood_entries']['Row']

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ChatRoomInsert = Database['public']['Tables']['chat_rooms']['Insert']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']
export type JournalEntryInsert = Database['public']['Tables']['journal_entries']['Insert']
export type HabitInsert = Database['public']['Tables']['habits']['Insert']
export type HabitLogInsert = Database['public']['Tables']['habit_logs']['Insert']
export type MoodEntryInsert = Database['public']['Tables']['mood_entries']['Insert']
