import { useState } from 'react'
import { 
  Heart, Phone, ExternalLink, BookOpen, Video, Headphones,
  Globe, Users, Shield, Sparkles, Search
} from 'lucide-react'
import CrisisModal from '@/components/CrisisModal'

interface Resource {
  title: string
  description: string
  url: string
  type: 'article' | 'video' | 'tool' | 'community' | 'app'
  category: string
}

const resources: Resource[] = [
  // Self-Help Articles
  {
    title: 'Managing Anxiety: A Practical Guide',
    description: 'Learn evidence-based techniques to manage anxiety in daily life.',
    url: 'https://www.mind.org.uk/information-support/types-of-mental-health-problems/anxiety-and-panic-attacks/',
    type: 'article',
    category: 'anxiety',
  },
  {
    title: 'Understanding Depression',
    description: 'Comprehensive information about depression symptoms and coping strategies.',
    url: 'https://www.nimh.nih.gov/health/topics/depression',
    type: 'article',
    category: 'depression',
  },
  {
    title: 'Mindfulness for Beginners',
    description: 'Start your mindfulness journey with simple, daily practices.',
    url: 'https://www.mindful.org/meditation/mindfulness-getting-started/',
    type: 'article',
    category: 'mindfulness',
  },
  // Videos
  {
    title: 'How to Practice Self-Care',
    description: 'TED talk on building sustainable self-care routines.',
    url: 'https://www.ted.com/topics/mental+health',
    type: 'video',
    category: 'self-care',
  },
  {
    title: 'Breathing Exercises for Stress',
    description: 'Guided breathing exercises for immediate stress relief.',
    url: 'https://www.youtube.com/results?search_query=breathing+exercises+for+stress',
    type: 'video',
    category: 'stress',
  },
  // Tools
  {
    title: 'Headspace - Meditation App',
    description: 'Guided meditations and sleep sounds for beginners.',
    url: 'https://www.headspace.com/',
    type: 'app',
    category: 'mindfulness',
  },
  {
    title: 'Calm - Sleep & Meditation',
    description: 'Sleep stories, meditations, and relaxation exercises.',
    url: 'https://www.calm.com/',
    type: 'app',
    category: 'sleep',
  },
  {
    title: 'Woebot - AI Mental Health',
    description: 'Free AI chatbot for emotional support and CBT techniques.',
    url: 'https://woebothealth.com/',
    type: 'tool',
    category: 'support',
  },
  // Communities
  {
    title: '7 Cups - Free Emotional Support',
    description: 'Free online chat with trained listeners.',
    url: 'https://www.7cups.com/',
    type: 'community',
    category: 'support',
  },
  {
    title: 'Reddit r/mentalhealth',
    description: 'Online community for mental health discussions.',
    url: 'https://www.reddit.com/r/mentalhealth/',
    type: 'community',
    category: 'community',
  },
]

const CATEGORIES = [
  { id: 'all', label: 'All Resources', icon: Sparkles },
  { id: 'anxiety', label: 'Anxiety', icon: Heart },
  { id: 'depression', label: 'Depression', icon: Heart },
  { id: 'stress', label: 'Stress', icon: Heart },
  { id: 'mindfulness', label: 'Mindfulness', icon: BookOpen },
  { id: 'support', label: 'Support', icon: Users },
]

const TYPE_ICONS = {
  article: BookOpen,
  video: Video,
  tool: Shield,
  community: Users,
  app: Headphones,
}

export default function Resources() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [showCrisisModal, setShowCrisisModal] = useState(false)

  const filteredResources = resources.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
                          r.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === 'all' || r.category === category
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <Sparkles className="text-teal-500 w-5 h-5 md:w-6 md:h-6" /> Resources
        </h1>
        <p className="text-gray-500 mt-1 text-sm md:text-base">Curated mental health resources and tools</p>
      </div>

      {/* Crisis Banner */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg sm:rounded-xl p-2.5 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Phone className="text-red-500 flex-shrink-0" size={18} />
            <div className="min-w-0">
              <h3 className="font-semibold text-red-700 dark:text-red-400 text-xs sm:text-base">
                Need immediate help?
              </h3>
              <p className="text-[10px] sm:text-sm text-red-600 dark:text-red-300 truncate">
                Crisis helplines available 24/7
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCrisisModal(true)}
            className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
          >
            Get Help
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg 
                       bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 text-sm"
          />
        </div>
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const shortLabel = cat.id === 'all' ? 'All' : cat.id === 'mindfulness' ? 'Mind' : cat.label.slice(0, 4)
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg whitespace-nowrap transition text-xs sm:text-sm flex-shrink-0 ${
                  category === cat.id
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
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

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <div className="text-center py-8 sm:py-12 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl">
          <Sparkles className="mx-auto text-gray-400 mb-3 sm:mb-4" size={40} />
          <h3 className="text-base sm:text-lg font-semibold text-gray-600 dark:text-gray-400">
            No resources found
          </h3>
          <p className="text-gray-500 mt-1 text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
          {filteredResources.map((resource, index) => {
            const Icon = TYPE_ICONS[resource.type]
            return (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-5 border border-gray-100 dark:border-gray-700 
                           hover:shadow-md active:bg-gray-50 dark:active:bg-gray-700 transition group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-50 dark:bg-teal-900/20 rounded-lg flex items-center justify-center text-teal-600 flex-shrink-0">
                    <Icon size={16} className="sm:w-5 sm:h-5" />
                  </div>
                  <ExternalLink className="text-gray-400 group-hover:text-teal-600 transition flex-shrink-0" size={14} />
                </div>
                <h3 className="font-semibold mb-1 group-hover:text-teal-600 transition text-xs sm:text-base line-clamp-1">
                  {resource.title}
                </h3>
                <p className="text-gray-500 text-[11px] sm:text-sm line-clamp-2">{resource.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1 sm:gap-2">
                  <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full capitalize">
                    {resource.type}
                  </span>
                  <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-full capitalize">
                    {resource.category}
                  </span>
                </div>
              </a>
            )
          })}
        </div>
      )}

      {/* Additional Help Section */}
      <div className="bg-primary-50 dark:bg-primary-900/20 
                      rounded-lg sm:rounded-2xl p-3 sm:p-6 border border-primary-100 dark:border-primary-800">
        <h2 className="text-sm sm:text-lg font-semibold mb-2 flex items-center gap-2">
          <Globe className="text-teal-600 flex-shrink-0" size={16} /> Find Local Support
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-2 sm:mb-4 text-xs sm:text-base">
          Professional help is available in your area. Consider reaching out to:
        </p>
        <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-teal-500 rounded-full flex-shrink-0"></span>
            <span>Local mental health centers and clinics</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-teal-500 rounded-full flex-shrink-0"></span>
            <span>Licensed therapists and counselors</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-teal-500 rounded-full flex-shrink-0"></span>
            <span>Support groups in your community</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-teal-500 rounded-full flex-shrink-0"></span>
            <span>Your primary care physician</span>
          </li>
        </ul>
      </div>

      {/* Crisis Modal */}
      <CrisisModal open={showCrisisModal} onClose={() => setShowCrisisModal(false)} />
    </div>
  )
}
