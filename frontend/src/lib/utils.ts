import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const d = new Date(date)
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return formatDate(date)
}

export function getMoodEmoji(mood: number): string {
  if (mood >= 8) return '😊'
  if (mood >= 6) return '🙂'
  if (mood >= 4) return '😐'
  if (mood >= 2) return '😔'
  return '😢'
}

export function getMoodLabel(mood: number): string {
  if (mood >= 8) return 'Great'
  if (mood >= 6) return 'Good'
  if (mood >= 4) return 'Okay'
  if (mood >= 2) return 'Low'
  return 'Struggling'
}

export function getMoodColor(mood: number): string {
  if (mood >= 8) return 'text-green-500'
  if (mood >= 6) return 'text-lime-500'
  if (mood >= 4) return 'text-yellow-500'
  if (mood >= 2) return 'text-orange-500'
  return 'text-red-500'
}

export function getAvatarUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${seed}`
}

export function getStreakCount(dates: Date[]): number {
  if (dates.length === 0) return 0
  
  const sorted = dates
    .map(d => new Date(d).toDateString())
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  
  const unique = [...new Set(sorted)]
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()
  
  if (unique[0] !== today && unique[0] !== yesterday) return 0
  
  let streak = 0
  for (let i = 0; i < unique.length; i++) {
    const expected = new Date(Date.now() - i * 86400000).toDateString()
    if (unique[i] === expected) streak++
    else break
  }
  
  return streak
}

// Crisis keywords for detection
export const CRISIS_KEYWORDS = [
  'suicide', 'suicidal', 'kill myself', 'end my life', 'want to die',
  'self harm', 'self-harm', 'hurt myself', 'no reason to live',
  'better off dead', 'can\'t go on', 'end it all'
]

export function containsCrisisKeywords(text: string): boolean {
  const lower = text.toLowerCase()
  return CRISIS_KEYWORDS.some(keyword => lower.includes(keyword))
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}
