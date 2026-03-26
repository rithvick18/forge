import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, X } from 'lucide-react'
import { trendsApi } from '../lib/api'
import { FMCG_CATEGORIES, TIMEFRAMES, INDIAN_STATES } from '../lib/constants'
import TrendLine from '../components/charts/TrendLine'
import ForecastChart from '../components/charts/ForecastChart'
import TrendCard from '../components/dashboard/TrendCard'
import { Loader, ErrorCard } from '../components/ui/Loader'

export default function Trends() {
  const [keywords, setKeywords]     = useState(['face wash', 'shampoo'])
  const [input, setInput]           = useState('')
  const [category, setCategory]     = useState('personal care')
  const [geo, setGeo]               = useState('IN')
  const [timeframe, setTimeframe]   = useState('today 3-m')
  const [showForecast, setShowForecast] = useState(false)
  const [activeKw, setActiveKw]     = useState<string | null>(null)

  // Fetch trends
  const { data: trends, isLoading, error, refetch } = useQuery({
    queryKey: ['trends-explorer', keywords, category, geo, timeframe],
    queryFn:  () => trendsApi.fetch(keywords, category, geo, timeframe),
    enabled:  keywords.length > 0,
  })

  // Fetch forecast for active keyword
  const { data: forecast, isLoading: fcastLoading } = useQuery({
    queryKey: ['forecast', activeKw, geo],
    queryFn:  () => trendsApi.forecast([activeKw as string], category, 12),
    enabled:  !!activeKw && showForecast,
  })

  const addKeyword = () => {
    const kw = input.trim().toLowerCase()
    if (!kw || keywords.includes(kw) || keywords.length >= 5) return
    setKeywords(prev => [...prev, kw])
    setInput('')
  }

  const removeKeyword = (kw: string) => setKeywords(prev => prev.filter(k => k !== kw))

  // Build chart data
  const chartData = (() => {
    if (!(trends as unknown as any[])?.length) return []
    const dates = (trends as unknown as any[])[0]?.raw_data?.timeseries?.map((p: any) => p.date) || []
    return dates.map((date: string) => {
      const point: any = { date: date.slice(5) }
      ;(trends as unknown as any[]).forEach((t: any) => {
        const match = t.raw_data?.timeseries?.find((p: any) => p.date === date)
        point[t.keyword] = match?.value ?? 0
      })
      return point
    })
  })()

  const activeTrend = (trends as unknown as any[])?.find((t: any) => t.keyword === activeKw)
  const forecastData = (forecast as unknown as any[])?.[0]

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="card space-y-4">
        {/* Keyword input */}
        <div>
          <p className="text-xs text-ink-400 uppercase tracking-widest mb-2">Keywords (max 5)</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addKeyword()}
                placeholder="e.g. instant noodles, baby lotion…"
                className="w-full bg-ink-700 border border-ink-600 rounded-xl pl-9 pr-4 py-2.5 text-sm text-ink-100 placeholder-ink-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
            <button onClick={addKeyword} className="btn-primary flex items-center gap-1.5">
              <Plus size={14} /> Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2.5">
            {keywords.map(kw => (
              <span key={kw}
                className="flex items-center gap-1.5 text-sm px-3 py-1 bg-brand-500/15 border border-brand-500/25 rounded-full text-brand-300 capitalize"
              >
                {kw}
                <button onClick={() => removeKeyword(kw)} className="hover:text-brand-100">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Filters row */}
        <div className="flex gap-3 flex-wrap">
          <div>
            <p className="text-[10px] text-ink-500 uppercase tracking-wider mb-1">Category</p>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="bg-ink-700 border border-ink-600 rounded-lg px-3 py-1.5 text-sm text-ink-200 focus:outline-none focus:border-brand-500"
            >
              {FMCG_CATEGORIES.map(c => (
                <option key={c} value={c} className="capitalize">{c}</option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-[10px] text-ink-500 uppercase tracking-wider mb-1">Timeframe</p>
            <select
              value={timeframe}
              onChange={e => setTimeframe(e.target.value)}
              className="bg-ink-700 border border-ink-600 rounded-lg px-3 py-1.5 text-sm text-ink-200 focus:outline-none focus:border-brand-500"
            >
              {TIMEFRAMES.map(tf => (
                <option key={tf.value} value={tf.value}>{tf.label}</option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-[10px] text-ink-500 uppercase tracking-wider mb-1">Region</p>
            <select
              value={geo}
              onChange={e => setGeo(e.target.value)}
              className="bg-ink-700 border border-ink-600 rounded-lg px-3 py-1.5 text-sm text-ink-200 focus:outline-none focus:border-brand-500"
            >
              <option value="IN">🇮🇳 All India</option>
              {INDIAN_STATES.map(s => (
                <option key={s} value={`IN-${s.slice(0,2).toUpperCase()}`}>{s}</option>
              ))}
            </select>
          </div>

          <div className="ml-auto flex items-end">
            <button onClick={() => refetch()} className="btn-primary text-sm">
              Fetch Trends
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      {isLoading ? <Loader message="Querying Google Trends for India…" /> :
       error     ? <ErrorCard message={error.message} /> :
       (trends as unknown as any[])?.length > 0 && (
        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="section-title">Interest Over Time</p>
              <p className="section-sub capitalize">{geo === 'IN' ? 'All India' : geo} · {timeframe}</p>
            </div>
          </div>
          <TrendLine data={chartData} keywords={keywords} />
        </motion.div>
      )}

      {/* Trend cards + forecast toggle */}
      {(trends as unknown as any[])?.length > 0 && (
        <>
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
            {(trends as unknown as any[]).map((t: any, i: number) => (
              <div key={t.keyword} className="relative">
                <TrendCard trend={t} delay={i * 0.08} />
                <button
                  onClick={() => {
                    setActiveKw(t.keyword)
                    setShowForecast(true)
                  }}
                  className="absolute bottom-4 right-4 text-[10px] px-2.5 py-1 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 hover:bg-brand-500/20 transition-colors"
                >
                  Forecast →
                </button>
              </div>
            ))}
          </div>

          {/* Forecast panel */}
          <AnimatePresence>
            {showForecast && activeKw && (
              <motion.div
                className="card"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="section-title capitalize">12-Week Forecast — {activeKw}</p>
                    <p className="section-sub">Prophet model · 80% confidence interval</p>
                  </div>
                  <button onClick={() => setShowForecast(false)} className="text-ink-400 hover:text-ink-200">
                    <X size={16} />
                  </button>
                </div>
                {fcastLoading ? <Loader message="Running Prophet forecast…" /> :
                  <ForecastChart
                    historical={activeTrend?.raw_data?.timeseries || []}
                    forecast={forecastData?.forecast || []}
                    keyword={activeKw}
                  />
                }
                {forecastData?.mae != null && (
                  <p className="text-xs text-ink-400 mt-3">
                    Mean Absolute Error: <span className="font-mono text-ink-200">{forecastData.mae}</span>
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}
