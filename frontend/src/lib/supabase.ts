import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const supabase: SupabaseClient =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : (null as unknown as SupabaseClient);

// Helper to get current session
export async function getSession() {
  if (!supabase) return null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch {
    return null;
  }
}

// Helper to get current user
export async function getCurrentUser() {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Helper to sign in anonymously
export async function signInAnonymously() {
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env' } as any };
  }
  const { data, error } = await supabase.auth.signInAnonymously();
  return { data, error };
}

// Helper to sign out
export async function signOut() {
  if (!supabase) return { error: null };
  const { error } = await supabase.auth.signOut();
  return { error };
}

// Helper to create user profile
export async function createProfile(userId: string, nickname: string, avatar: string) {
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } as any };
  }
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      user_id: userId,
      nickname,
      avatar,
    })
    .select()
    .single();

  return { data, error };
}

// Helper to get user profile
export async function getProfile(userId: string) {
  if (!supabase) return { data: null, error: { message: 'Supabase not configured' } as any };
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  return { data, error };
}
