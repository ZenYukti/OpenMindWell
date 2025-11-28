import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Generate anonymous username
export const generateUsername = (): string => {
  const adjectives = [
    'Calm', 'Gentle', 'Kind', 'Peaceful', 'Brave', 'Hopeful', 'Serene',
    'Radiant', 'Mindful', 'Resilient', 'Graceful', 'Warm', 'Bright'
  ]
  const nouns = [
    'Soul', 'Spirit', 'Heart', 'Mind', 'Light', 'Star', 'Moon',
    'Ocean', 'River', 'Mountain', 'Cloud', 'Phoenix', 'Lotus'
  ]
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const num = Math.floor(Math.random() * 999)
  return `${adj}${noun}${num}`
}

// Anonymous sign in
export const signInAnonymously = async () => {
  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) throw error
  return data
}

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
