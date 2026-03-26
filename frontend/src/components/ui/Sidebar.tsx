import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard',   icon: 'insights',     label: 'Market Overview' },
  { to: '/trends',      icon: 'monitoring',   label: 'Competitor Intel' },
  { to: '/insights',    icon: 'psychology',   label: 'AI Insights' },
  { to: '/products',    icon: 'inventory_2',  label: 'Product Metrics' },
]

export default function Sidebar() {
  return (
    <aside className="flex flex-col h-screen fixed left-0 top-0 overflow-y-auto bg-[#1c1c1a] w-64 border-r border-white/5 z-50">
      {/* Logo */}
      <div className="p-8">
        <div className="text-2xl font-black text-[#c47f0a] tracking-tighter">Forge</div>
        <div className="font-headline tracking-[-0.02em] font-bold text-xs text-gray-500 mt-1 uppercase">
          Orbital Engine V2.0
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center rounded-lg px-4 py-3 font-headline tracking-[-0.02em] font-bold text-sm transition-all duration-300 ${
                isActive
                  ? 'text-[#c47f0a] bg-[#2a2a29] scale-95'
                  : 'text-gray-500 hover:text-white hover:bg-[#2a2a29]'
              }`
            }
          >
            <span className="material-symbols-outlined mr-3">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>


      {/* Footer links */}
      <div className="border-t border-white/5 p-4 space-y-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center rounded-lg px-4 py-2 text-sm transition-all duration-300 ${
              isActive
                ? 'text-[#c47f0a] bg-[#2a2a29]'
                : 'text-gray-500 hover:text-white hover:bg-[#2a2a29]'
            }`
          }
        >
          <span className="material-symbols-outlined mr-3 text-lg">settings</span>
          Settings
        </NavLink>
        <a className="flex items-center text-gray-500 hover:text-white hover:bg-[#2a2a29] rounded-lg px-4 py-2 text-sm transition-all" href="#">
          <span className="material-symbols-outlined mr-3 text-lg">help</span>
          Support
        </a>
      </div>
    </aside>
  )
}
