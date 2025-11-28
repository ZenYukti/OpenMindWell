import { Link, useNavigate } from 'react-router-dom'
import {
  MessageCircle,
  BookOpen,
  Target,
  Heart,
  Shield,
  ArrowRight,
  Moon,
  Sun,
  Lock,
  TrendingUp,
  Zap
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { signInAnonymously } from '@/lib/supabase'
import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

const features = [
  {
    icon: MessageCircle,
    title: 'Peer Support',
    desc: 'Connect anonymously in topic-based chat rooms.',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&auto=format&fit=crop&q=80'
  },
  {
    icon: BookOpen,
    title: 'Private Journal',
    desc: 'Secure, encrypted personal journaling.',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80'
  },
  {
    icon: Target,
    title: 'Habit Tracking',
    desc: 'Build healthy routines with visual tracking.',
    image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&auto=format&fit=crop&q=80'
  },
  {
    icon: TrendingUp,
    title: 'Mood Insights',
    desc: 'Track patterns and emotional wellbeing.',
    image: 'https://images.unsplash.com/photo-1509909756405-be0199881695?w=800&auto=format&fit=crop&q=80'
  },
  {
    icon: Shield,
    title: 'Crisis Resources',
    desc: 'One-click access to helplines.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80'
  },
  {
    icon: Zap,
    title: 'Wellness Tips',
    desc: 'Personalized suggestions for you.',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80'
  },
]

const stats = [
  { value: '100%', label: 'Free access to tools' },
  { value: '0 trackers', label: 'Privacy-first platform' },
  { value: '24/7', label: 'Peer rooms online' },
  { value: '4 pillars', label: 'Chat | Mood | Habits | Help' },
]

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Features', href: '#features' },
  { label: 'Resources', href: '#resources' },
  { label: 'Contact', href: '#contact' },
]

const resourceHighlights = [
  {
    title: 'Crisis-first routing',
    desc: 'Tap once to surface helplines, local resources, and safety plans personalized to your region.',
    tag: 'Emergency ready'
  },
  {
    title: 'Self-guided rituals',
    desc: 'Layer mood logs, micro-journals, and habit loops into guided flows that adapt with you.',
    tag: 'Guided journeys'
  },
  {
    title: 'Transparent privacy',
    desc: 'No trackers, no ads, no inbox spam. Your anonymous identity lives only on your device.',
    tag: 'Zero data kept'
  },
]

export default function Landing() {
  const { darkMode, toggleDarkMode } = useUIStore()
  const { setUser, setLoading } = useAuthStore()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [featuresVisible, setFeaturesVisible] = useState(false)
  const featuresRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setFeaturesVisible(true)
          }
        })
      },
      { threshold: 0.1 }
    )

    if (featuresRef.current) {
      observer.observe(featuresRef.current)
    }

    return () => {
      if (featuresRef.current) {
        observer.unobserve(featuresRef.current)
      }
    }
  }, [])

  const handleGetStarted = async () => {
    setIsSigningIn(true)
    setLoading(true)
    try {
      const { user } = await signInAnonymously()
      if (!user) throw new Error('Failed to create anonymous account')
      setUser(user)
      toast.success('Welcome! Your anonymous account is ready.')
      navigate('/app')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setIsSigningIn(false)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="relative overflow-hidden hero-shell">
        <div className="hero-glow" aria-hidden="true" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6">
          <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between py-10">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="OpenMindWell Logo" className="h-10 w-10 rounded-2xl object-contain" />
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">OpenMind</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">OpenMindWell</p>
              </div>
            </div>
            <nav className="flex items-center justify-between gap-3">
              <div className="hidden md:flex items-center gap-6 bg-white/80 border border-slate-200 rounded-full px-8 py-2 text-sm text-slate-600 shadow-sm backdrop-blur dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-300">
                {navLinks.map(link => (
                  <a key={link.label} href={link.href} className="hover:text-slate-900 dark:hover:text-white transition-colors">
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:text-white dark:hover:border-slate-600"
                >
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <Link
                  to="/app"
                  className="hidden sm:inline-flex items-center gap-2 rounded-full bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 text-sm font-semibold shadow-lg shadow-primary-600/20 transition-colors"
                >
                  Open App <ArrowRight size={16} />
                </Link>
              </div>
            </nav>
          </header>

          <section id="home" className="text-center pb-20 md:pb-28">
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-4 py-2 text-xs uppercase tracking-[0.35em] text-slate-500 shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Live access | Anonymous | Free
            </div>
            <h1 className="mt-10 text-4xl md:text-6xl font-semibold leading-tight text-slate-900 dark:text-white">
              A calm headquarters for
              <br className="hidden md:block" />
              community-powered mental wellness
            </h1>
            <p className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              OpenMindWell blends moderated peer rooms, guided journaling, habit boards, and crisis tools into a single privacy-first surface so you can seek support with zero friction.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={handleGetStarted}
                disabled={isSigningIn}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent-600 hover:bg-accent-700 text-white px-8 py-3 text-base font-semibold shadow-xl shadow-accent-600/30 disabled:opacity-60 transition-colors"
              >
                {isSigningIn ? (
                  <>
                    <span className="loading-spinner" />
                    Creating safe space...
                  </>
                ) : (
                  <>
                    Get Started <ArrowRight size={16} />
                  </>
                )}
              </button>
              <a
                href="https://github.com/ZenYukti/OpenMindWell"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white/50 px-8 py-3 text-base font-medium text-slate-700 hover:text-slate-900 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:text-white"
              >
                View on GitHub
              </a>
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-800">
                <Lock size={14} /> No login or email
              </div>
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-800">
                <Heart size={14} /> 100% community-supported
              </div>
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-800">
                <Shield size={14} /> End-to-end safety guardrails
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="px-4 md:px-6 -mt-12" id="about">
        <div className="mx-auto grid max-w-5xl gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Built for students, remote teams, and communities that need instant access to mental wellness tooling without compromising anonymity.
          </p>
        </div>
      </section>

      <section id="features" className="py-24" ref={featuresRef}>
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Features</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white">Tools designed for how you actually feel</h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Structured rooms, gentle prompts, and visual trackers anchored by a privacy core. Everything works out-of-the-box so your community can simply show up.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const isLeftColumn = index % 3 === 0
              const isRightColumn = index % 3 === 2
              
              return (
                <div
                  key={feature.title}
                  className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-lg shadow-slate-900/5 transition-all duration-700 hover:-translate-y-1 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/80 min-h-[280px] ${
                    featuresVisible
                      ? 'opacity-100 translate-x-0 translate-y-0'
                      : `opacity-0 ${
                          isLeftColumn
                            ? 'translate-x-32 -translate-y-8'
                            : isRightColumn
                            ? '-translate-x-32 -translate-y-8'
                            : '-translate-y-16'
                        }`
                  }`}
                  style={{
                    transitionDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Image Background */}
                  <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-110">
                    <img 
                      src={feature.image} 
                      alt={feature.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/70 dark:bg-slate-950/80" />
                  </div>

                  {/* Content - Hidden by default, shown on hover */}
                  <div className="relative z-10 p-6 h-full flex flex-col justify-end">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-500 text-white shadow-lg">
                      <feature.icon size={22} />
                    </div>
                    
                    <div className="transform transition-all duration-300 group-hover:translate-y-0 translate-y-2">
                      <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                      <p className="mt-2 text-sm text-white/90 opacity-0 max-h-0 overflow-hidden transition-all duration-300 group-hover:opacity-100 group-hover:max-h-20">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section id="resources" className="py-24 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-white/60">Resources</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white">Reach out or go inward without friction</h2>
              <p className="mt-4 text-slate-600 dark:text-white/70">
                Crisis-ready content, guided rituals, and open data policies live side-by-side. Copy the playbook, self-host it, or point your community straight to the hosted edition.
              </p>
              <div className="mt-10 grid gap-4">
                {resourceHighlights.map(resource => (
                  <div key={resource.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-white/60">{resource.tag}</p>
                    <h3 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">{resource.title}</h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-white/70">{resource.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/5 dark:shadow-blue-900/30">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-white/60">Crisis Kit</p>
              <h3 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">Always-on crisis coverage</h3>
              <p className="mt-3 text-slate-600 dark:text-white/70">
                Tap the crisis modal anywhere inside the app to surface helplines across 190+ countries, calming exercises, and escalation guidance curated with licensed professionals.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-600 dark:text-white/75">
                <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Geo-aware hotlines</li>
                <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-sky-400" />Copy-ready safety plan template</li>
                <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-purple-400" />Night-mode breathing sequences</li>
              </ul>
              <button
                onClick={handleGetStarted}
                disabled={isSigningIn}
                className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-primary-600 hover:bg-primary-700 py-3 text-base font-semibold text-white shadow-xl shadow-primary-600/40 disabled:opacity-60 transition-colors"
              >
                {isSigningIn ? 'Preparing your space...' : 'Launch Anonymous Session'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-2xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Stay In The Loop</p>
            <h2 className="mt-4 text-3xl font-semibold">Bring OpenMindWell to your cohort</h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
              Spin up a community space in minutes or talk with us about custom integrations and on-prem deployments.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={handleGetStarted}
                disabled={isSigningIn}
                className="inline-flex items-center justify-center rounded-full bg-accent-600 hover:bg-accent-700 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-accent-600/30 disabled:opacity-60 transition-colors"
              >
                {isSigningIn ? 'Creating...' : 'Enter the App'}
              </button>
              <a
                href="mailto:hello@openmindwell.app"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 px-8 py-3 text-base font-medium text-slate-900 hover:border-slate-400 dark:border-slate-700 dark:text-white"
              >
                Contact the team
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900">
        <div className="container mx-auto px-4 md:px-6 py-16">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="OpenMindWell Logo" className="h-10 w-10 rounded-2xl object-contain" />
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">OpenMind</p>
                  <p className="text-base font-semibold text-white">OpenMindWell</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Privacy-first mental wellness platform. Anonymous, free, and built with care for communities that need safe spaces.
              </p>
              <div className="mt-4 flex gap-3">
                <a href="https://github.com/ZenYukti/OpenMindWell" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-slate-700 bg-slate-800 hover:border-slate-600 transition-colors">
                  <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                </a>
                <a href="https://twitter.com/openmindwell" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-slate-700 bg-slate-800 hover:border-slate-600 transition-colors">
                  <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Product</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#resources" className="text-slate-400 hover:text-white transition-colors">Resources</a></li>
                <li><a href="/app" className="text-slate-400 hover:text-white transition-colors">Launch App</a></li>
                <li><a href="https://github.com/ZenYukti/OpenMindWell#roadmap" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">Roadmap</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Company</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#about" className="text-slate-400 hover:text-white transition-colors">About</a></li>
                <li><a href="https://github.com/ZenYukti/OpenMindWell" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">Open Source</a></li>
                <li><a href="#contact" className="text-slate-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="mailto:hello@openmindwell.app" className="text-slate-400 hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Legal</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="https://github.com/ZenYukti/OpenMindWell/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">License</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800">
            <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
              <p className="text-sm text-slate-400 text-center md:text-left">
                © {new Date().getFullYear()} OpenMindWell. Open source and free forever. Built with <Heart className="inline h-4 w-4 text-red-500" /> for mental wellness.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Lock size={12} />
                <span>Zero tracking · Full anonymity</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
