import { useEffect, useState } from 'react'
import { dashboardApi } from '../lib/api'

export default function Dashboard() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const metrics = await dashboardApi.metrics()
        setData(metrics)
      } catch (err) {
        console.error('Failed to fetch dashboard metrics', err)
      }
    }
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 3000) // 3 seconds for live feel
    return () => clearInterval(interval)
  }, [])

  if (!data) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center text-gray-500 text-sm font-bold animate-pulse">
        <span className="material-symbols-outlined mr-3 animate-spin">sync</span>
        CONNECTING TO ORBITAL ENGINE...
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-8 animate-in fade-in duration-500">

      {/* HERO METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Market Share */}
        <div className="glass p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-500 tracking-widest uppercase">Market Share</span>
              <div className="text-3xl font-extrabold tracking-tighter">
                {data.marketShare}<span className="text-primary text-xl">%</span>
              </div>
            </div>
            <div className="bg-primary/10 p-2 rounded-lg">
              <span className="material-symbols-outlined text-primary">pie_chart</span>
            </div>
          </div>
          <div className="flex items-center text-xs font-bold text-[#10b981]">
            <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
            {data.marketShareTrend}
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-primary/20">
            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${data.marketShare}%` }} />
          </div>
        </div>

        {/* SKU Health */}
        <div className="glass p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-500 tracking-widest uppercase">SKU Health</span>
              <div className={`text-3xl font-extrabold tracking-tighter ${data.skuHealth === 'Warning' ? 'text-[#ffb95c]' : 'text-[#10b981]'}`}>
                {data.skuHealth}
              </div>
            </div>
            <div className={`${data.skuHealth === 'Warning' ? 'bg-[#ffb95c]/10' : 'bg-emerald-500/10'} p-2 rounded-lg`}>
              <span className={`material-symbols-outlined ${data.skuHealth === 'Warning' ? 'text-[#ffb95c]' : 'text-[#10b981]'}`}>
                {data.skuHealth === 'Warning' ? 'warning' : 'verified'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 bg-white/5 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-1000 ${data.skuHealth === 'Warning' ? 'bg-[#ffb95c]' : 'bg-[#10b981]'}`} style={{ width: `${data.skuHealthPercentage}%` }} />
            </div>
            <span className="text-[10px] font-bold text-gray-400">{data.skuHealthPercentage}%</span>
          </div>
        </div>

        {/* Regional CAGR */}
        <div className="glass p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-500 tracking-widest uppercase">Regional CAGR</span>
              <div className="text-3xl font-extrabold tracking-tighter">
                {data.regionalCagr}<span className="text-tertiary text-xl">%</span>
              </div>
            </div>
            <div className="bg-tertiary/10 p-2 rounded-lg">
              <span className="material-symbols-outlined text-tertiary">language</span>
            </div>
          </div>
          <div className="flex items-center text-xs font-bold text-tertiary">
            <div className="w-2 h-2 rounded-full bg-tertiary pulse-dot mr-2" />
            Live Tracking Active
          </div>
        </div>
      </div>

      {/* PRIMARY ANALYTICS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Chart */}
        <div className="lg:col-span-2 glass p-8 rounded-3xl flex flex-col h-[450px]">
          <div className="flex justify-between items-end mb-8">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">Global Sales Performance</h2>
              <p className="text-gray-500 text-sm">Aggregated telemetry from all orbital nodes</p>
            </div>
            <div className="flex gap-4 items-center text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary" />
                <span>Forge Pulse</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-gray-600 border-t border-dashed border-gray-400" />
                <span className="text-gray-500">Competitors</span>
              </div>
            </div>
          </div>

          <div className="flex-1 relative mt-4">
            {/* Grid */}
            <div className="absolute inset-0 grid grid-cols-6 border-b border-l border-white/5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border-r border-white/5" />
              ))}
              <div />
            </div>

            {/* SVG Chart */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradient-primary" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#c47f0a" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#c47f0a" stopOpacity="0" />
                </linearGradient>
              </defs>
              {(()=>{
                  const fps = data.globalSalesPerformance.forgePulse;
                  const cps = data.globalSalesPerformance.competitors;
                  // Map 0-200 to Y 150-0
                  const mapY = (val: number) => 150 - (val / 200 * 150);
                  const xs = [0, 200, 400, 600, 800, 1000];
                  
                  // use curve approach for smoother paths matching previous Q-syntax visually (simplified as L here to ensure points hit precisely)
                  const fpPath = xs.map((x, i) => `${i===0?'M':'L'}${x},${mapY(fps[i])}`).join(' ');
                  const cpPath = xs.map((x, i) => `${i===0?'M':'L'}${x},${mapY(cps[i])}`).join(' ');
                  
                  return (
                    <>
                      <path
                        d={`${fpPath} L1000,150 L0,150 Z`}
                        fill="url(#gradient-primary)"
                        className="transition-all duration-1000"
                      />
                      <path
                        d={fpPath}
                        fill="none" stroke="#c47f0a" strokeWidth="3" strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                      <path
                        d={cpPath}
                        fill="none" stroke="#4b5563" strokeWidth="2" strokeDasharray="8,4"
                        className="transition-all duration-1000"
                      />
                    </>
                  )
              })()}
            </svg>

            {/* Tooltip */}
            <div className="absolute top-[15%] left-[78%] glass px-3 py-2 rounded-lg border border-primary/30 z-20">
              <div className="text-[10px] text-gray-400 font-bold uppercase">Peak Velocity</div>
              <div className="text-sm font-bold text-primary">{data.globalSalesPerformance.peakVelocity}</div>
            </div>
          </div>

          <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">
            {data.globalSalesPerformance.dates.map((m: string) => <span key={m}>{m}</span>)}
          </div>
        </div>

        {/* Cognitive Intel */}
        <div className="glass p-8 rounded-3xl flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-secondary/10 rounded-xl">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            </div>
            <div>
              <h2 className="text-lg font-bold">Cognitive Intel</h2>
              <p className="text-xs text-gray-500">AI Narrative Analysis</p>
            </div>
          </div>

          <div className="space-y-6 flex-1">
            <div className="relative pl-6 border-l-2 border-secondary/30 py-1">
              <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-secondary shadow-[0_0_10px_rgba(99,102,241,0.8)] animate-pulse" />
              <div className="text-xs font-bold text-secondary mb-1">STRATEGIC ANOMALY</div>
              <p className="text-sm text-on-surface leading-relaxed">
                Competitor activity in the APAC region has surged by <span className="text-[#10b981] font-bold">{data.cognitiveIntel.anomalyBold}</span>. Recommend increasing orbital ad-spend by $40k.
              </p>
            </div>
            <div className="relative pl-6 border-l-2 border-secondary/10 py-1">
              <div className="text-xs font-bold text-gray-500 mb-1">PREDICTIVE TREND</div>
              <p className="text-sm text-on-surface leading-relaxed">
                {data.cognitiveIntel.trend}
              </p>
            </div>
            <div className="bg-secondary/5 rounded-2xl p-4 border border-secondary/10">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-secondary text-sm">auto_awesome</span>
                <span className="text-[10px] font-black text-secondary tracking-widest uppercase">Forge AI Summary</span>
              </div>
              <p className="text-xs italic text-gray-400">{data.cognitiveIntel.summary}</p>
            </div>
          </div>

          <button className="mt-8 text-secondary font-bold text-sm flex items-center justify-center gap-2 hover:bg-secondary/10 py-3 rounded-xl transition-all">
            Deep Dive Research
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* LOWER BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Global Penetration Map */}
        <div className="lg:col-span-2 glass rounded-3xl overflow-hidden flex flex-col">
          <div className="p-6 flex justify-between items-center">
            <h3 className="text-sm font-bold tracking-widest uppercase text-gray-400">Global Penetration Index</h3>
            <span className="text-[10px] font-bold bg-tertiary/10 text-tertiary px-2 py-0.5 rounded">LIVE</span>
          </div>
          <div className="flex-1 relative bg-[#0e0e0d] p-4 min-h-[220px]">
            {/* World map placeholder */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <svg viewBox="0 0 800 400" className="w-full h-full" fill="#4cd7f6">
                <ellipse cx="200" cy="180" rx="80" ry="100" opacity="0.5"/>
                <ellipse cx="400" cy="160" rx="120" ry="90" opacity="0.5"/>
                <ellipse cx="580" cy="170" rx="100" ry="80" opacity="0.5"/>
                <ellipse cx="680" cy="220" rx="60" ry="70" opacity="0.5"/>
              </svg>
            </div>
            {/* Map Markers */}
            {data.penetrationMap.map((loc: any, i: number) => (
              <div key={i} className="absolute group cursor-pointer transition-all duration-1000" style={{ top: loc.top, left: loc.left }}>
                <div className="w-3 h-3 bg-tertiary rounded-full pulse-dot" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block glass px-2 py-1 rounded text-[10px] whitespace-nowrap z-30">
                  {loc.city}: {loc.percentage}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Asset Health Monitor */}
        <div className="glass p-6 rounded-3xl flex flex-col gap-6">
          <h3 className="text-sm font-bold tracking-widest uppercase text-gray-400">Asset Health</h3>
          <div className="space-y-5">
            {data.assetHealth.map(({ label, sub, color, icon }: any) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 rounded-full transition-colors duration-1000" style={{ backgroundColor: color, opacity: icon === 'history' ? 0.4 : 1 }} />
                  <div>
                    <div className="text-xs font-bold">{label}</div>
                    <div className="text-[10px] text-gray-500 transition-colors duration-1000">{sub}</div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-lg transition-colors duration-1000" style={{ color }}>{icon}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Terminal */}
        <div className="glass p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold tracking-widest uppercase text-gray-400 mb-6">System Terminal</h3>
            <div className="space-y-2 font-mono text-[10px] text-gray-500 h-20 overflow-hidden flex flex-col justify-end">
              {data.terminalLogs.map((log: any, i: number) => (
                <div key={i} className="flex gap-2 animate-in slide-in-from-bottom-2 duration-300">
                  <span className={log.type === 'success' ? 'text-[#10b981]' : (log.type === 'warning' ? 'text-[#ffb95c]' : 'text-primary')}>&gt;</span> 
                  {log.text}
                </div>
              ))}
            </div>
          </div>
          <div className="pt-6">
            <div className="text-[10px] font-bold text-gray-500 mb-2">LIVE STREAM ACTIVE</div>
            <button className="w-full bg-surface-container-highest hover:bg-surface-container-high py-3 rounded-xl text-xs font-bold transition-all border border-white/5">
              Force Re-Sync Node
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
