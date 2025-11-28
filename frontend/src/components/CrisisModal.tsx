import { X, Phone, Globe, ExternalLink } from 'lucide-react'

interface CrisisModalProps {
  open: boolean
  onClose: () => void
}

const crisisResources = {
  us: [
    { name: '988 Suicide & Crisis Lifeline', phone: '988', desc: 'Call or text 24/7' },
    { name: 'Crisis Text Line', phone: '741741', desc: 'Text HOME to 741741' },
    { name: 'SAMHSA Helpline', phone: '1-800-662-4357', desc: 'Mental health & substance abuse' },
  ],
  india: [
    { name: 'KIRAN Helpline', phone: '1800-599-0019', desc: 'Government free helpline 24/7' },
    { name: 'Vandrevala Foundation', phone: '1860-2662-345', desc: '24/7 multilingual support' },
    { name: 'iCall', phone: '9152987821', desc: 'Mon-Sat 8am-10pm' },
  ],
}

export default function CrisisModal({ open, onClose }: CrisisModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="absolute inset-x-3 bottom-3 top-auto sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 
                      sm:max-w-md sm:w-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800
                      max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">Crisis Resources</h2>
              <p className="text-xs text-slate-500 mt-0.5">Help is available 24/7</p>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <X size={18} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            If you are in crisis, please reach out. You matter.
          </p>

          {/* US */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Globe size={14} className="text-slate-400" />
              <h3 className="text-sm font-medium text-slate-900 dark:text-white">United States</h3>
            </div>
            <div className="space-y-2">
              {crisisResources.us.map((r) => (
                <a
                  key={r.name}
                  href={`tel:${r.phone}`}
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg 
                           hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <Phone size={14} className="text-red-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{r.name}</p>
                    <p className="text-xs text-slate-500 truncate">{r.desc}</p>
                  </div>
                  <span className="text-sm font-semibold text-green-600 flex-shrink-0">{r.phone}</span>
                </a>
              ))}
            </div>
          </div>

          {/* India */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Globe size={14} className="text-slate-400" />
              <h3 className="text-sm font-medium text-slate-900 dark:text-white">India</h3>
            </div>
            <div className="space-y-2">
              {crisisResources.india.map((r) => (
                <a
                  key={r.name}
                  href={`tel:${r.phone}`}
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg 
                           hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <Phone size={14} className="text-red-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{r.name}</p>
                    <p className="text-xs text-slate-500 truncate">{r.desc}</p>
                  </div>
                  <span className="text-sm font-semibold text-green-600 flex-shrink-0">{r.phone}</span>
                </a>
              ))}
            </div>
          </div>

          {/* International */}
          <a
            href="https://www.iasp.info/resources/Crisis_Centres/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-accent-50 dark:bg-accent-900/20 rounded-lg 
                     text-accent-600 dark:text-accent-400 text-sm hover:bg-accent-100 dark:hover:bg-accent-900/30 transition-colors"
          >
            <ExternalLink size={14} className="flex-shrink-0" />
            <span>Find crisis centers worldwide (IASP)</span>
          </a>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 text-center flex-shrink-0 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500">Reaching out is a sign of strength</p>
        </div>
      </div>
    </div>
  )
}
