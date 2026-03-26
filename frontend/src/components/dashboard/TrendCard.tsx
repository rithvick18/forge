import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { TREND_COLORS } from '../../lib/constants'

const STATUS_ICON: Record<string, any> = {
  rising:   <TrendingUp  size={13} />,
  falling:  <TrendingDown size={13} />,
  stable:   <Minus       size={13} />,
  emerging: <Zap         size={13} />,
}

export default function TrendCard({ trend, delay = 0 }: any) {
  const navigate = useNavigate()
  const { keyword, interest_score, status, category, regional_breakdown, related_queries } = trend

  const topRegions = Object.entries(regional_breakdown || {})
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 3)

  const topRelated = (related_queries || []).slice(0, 3)

  return (
    <motion.div
      className="card-glow hover:border-brand-500/40 transition-all duration-200 cursor-pointer active:scale-[0.98]"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      onClick={() => navigate(`/trends?q=${encodeURIComponent(keyword)}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display text-lg text-ink-50 capitalize leading-tight">{keyword}</h3>
          <p className="text-xs text-ink-400 mt-0.5 capitalize">{category}</p>
        </div>
        <span className={`badge-${status}`}>
          {STATUS_ICON[status as keyof typeof STATUS_ICON]}
          {status}
        </span>
      </div>

      {/* Score bar */}
      <div className="mb-4">
        <div className="flex items-end justify-between mb-1.5">
          <span className="text-xs text-ink-400">Interest Score</span>
          <span className="font-mono text-sm font-medium text-ink-100">{interest_score.toFixed(0)}/100</span>
        </div>
        <div className="h-2 bg-ink-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: (TREND_COLORS as any)[status] }}
            initial={{ width: 0 }}
            animate={{ width: `${interest_score}%` }}
            transition={{ delay: delay + 0.2, duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Top regions */}
      {topRegions.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] text-ink-500 uppercase tracking-wider mb-1.5">Top Regions</p>
          <div className="flex flex-wrap gap-1.5">
            {topRegions.map(([region, score]: any) => (
              <span key={region} className="text-xs px-2 py-0.5 bg-ink-700 rounded-full text-ink-300">
                {region} <span className="text-ink-500">{Number(score).toFixed(0)}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Related queries */}
      {topRelated.length > 0 && (
        <div>
          <p className="text-[10px] text-ink-500 uppercase tracking-wider mb-1.5">Related</p>
          <div className="space-y-0.5">
            {topRelated.map((q: any, i: number) => (
              <p key={i} className="text-xs text-ink-400 truncate">→ {q.query}</p>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
