import { NavLink, useNavigate } from 'react-router-dom'
import { useConfigStore } from '../../store/configStore'
import { Sparkles } from 'lucide-react'

const headerTabs = [
  { to: '/dashboard', label: 'Global Trends' },
  { to: '/trends',    label: 'Live Telemetry' },
  { to: '/insights',  label: 'Sector Heatmap' },
]

export default function Header() {
  const navigate = useNavigate()
  const { selectedModel, setSelectedModel } = useConfigStore()

  return (
    <header className="flex justify-between items-center px-8 w-full sticky top-0 z-40 bg-[#111110]/80 backdrop-blur-xl h-16 border-b border-white/5 shadow-[0px_20px_40px_rgba(0,0,0,0.6)]">
      {/* Left: Search + Nav */}
      <div className="flex items-center gap-8">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">search</span>
          <input
            className="bg-surface-container-highest border-none rounded-full pl-10 pr-4 py-1.5 text-sm w-64 focus:ring-1 focus:ring-primary/40 placeholder:text-gray-500 transition-all outline-none"
            placeholder="Search markets..."
            type="text"
          />
        </div>

        <nav className="hidden md:flex items-center gap-6 font-headline font-semibold text-sm">
          {headerTabs.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive
                  ? 'text-[#c47f0a] border-b-2 border-[#c47f0a] pb-1 transition-colors'
                  : 'text-gray-400 hover:text-white transition-colors pb-1 border-b-2 border-transparent'
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Model Switcher */}
        <div className="flex bg-surface-container-high p-1 rounded-xl border border-white/10 mr-2">
          <button
            onClick={() => setSelectedModel('mistral')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedModel === 'mistral' 
                ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Mistral Large
          </button>
          <button
            onClick={() => setSelectedModel('gemini')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedModel === 'gemini' 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles size={12} />
            Gemini Flash
          </button>
        </div>

        <button
          onClick={() => navigate('/trends')}
          className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all active:translate-y-px"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New Analysis
        </button>
        <button 
          onClick={() => alert('Notifications coming soon!')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <div 
          onClick={() => navigate('/profile')}
          className="h-8 w-8 rounded-full overflow-hidden border border-white/10 bg-surface-container-high flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          <span className="material-symbols-outlined text-sm text-gray-400">person</span>
        </div>
      </div>
    </header>
  )
}
