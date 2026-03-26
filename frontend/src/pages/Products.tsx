import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Package, Loader2, IndianRupee, MapPin, Users, Sparkles } from 'lucide-react'
import { productsApi } from '../lib/api'
import { FMCG_CATEGORIES, INDIAN_STATES } from '../lib/constants'
import { ErrorCard } from '../components/ui/Loader'

function ProductCard({ product, index }: any) {
  const score = product.opportunity_score ?? 0
  const scoreColor =
    score >= 75 ? 'text-emerald-400' :
    score >= 50 ? 'text-brand-400' : 'text-ink-300'

  return (
    <motion.div
      className="card-glow hover:border-brand-500/40 transition-all duration-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      {/* Score badge */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1">
          <h3 className="font-display text-lg text-ink-50 leading-tight">{product.name}</h3>
          <p className="text-xs text-ink-400 mt-0.5 capitalize">{product.category || 'FMCG'}</p>
        </div>
        <div className="text-right shrink-0">
          <p className={`font-mono font-bold text-2xl ${scoreColor}`}>{score.toFixed(0)}</p>
          <p className="text-[9px] text-ink-500 uppercase tracking-wider">Opportunity</p>
        </div>
      </div>

      {/* Opportunity bar */}
      <div className="h-1.5 bg-ink-700 rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ delay: index * 0.1 + 0.3, duration: 0.7, ease: 'easeOut' }}
        />
      </div>

      {/* Description */}
      <p className="text-sm text-ink-300 leading-relaxed mb-4">{product.description}</p>

      {/* Meta chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {product.target_region && (
          <span className="flex items-center gap-1 text-xs px-2.5 py-1 bg-ink-700 rounded-full text-ink-300">
            <MapPin size={10} className="text-brand-400" />
            {product.target_region}
          </span>
        )}
        {product.target_demographic && (
          <span className="flex items-center gap-1 text-xs px-2.5 py-1 bg-ink-700 rounded-full text-ink-300">
            <Users size={10} className="text-brand-400" />
            {product.target_demographic}
          </span>
        )}
        {product.price_range && (
          <span className="flex items-center gap-1 text-xs px-2.5 py-1 bg-ink-700 rounded-full text-ink-300">
            <IndianRupee size={10} className="text-brand-400" />
            {product.price_range}
          </span>
        )}
      </div>

      {/* Rationale */}
      {product.llm_rationale && (
        <div className="border-t border-ink-700 pt-3">
          <p className="text-[10px] text-ink-500 uppercase tracking-widest mb-1.5">AI Rationale</p>
          <p className="text-xs text-ink-400 leading-relaxed">{product.llm_rationale}</p>
        </div>
      )}

      {/* Trend basis */}
      {product.trend_basis?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {product.trend_basis.map((t: string) => (
            <span key={t} className="text-[10px] px-2 py-0.5 bg-brand-500/10 border border-brand-500/15 rounded-full text-brand-400 capitalize">
              {t}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default function Products() {
  const [category, setCategory] = useState('packaged food')
  const [region, setRegion]     = useState('')
  const [topN, setTopN]         = useState(5)
  const [results, setResults]   = useState<any>(null)

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => productsApi.recommend(category, region || null, topN),
    onSuccess: (data) => setResults(data),
  })

  return (
    <div className="space-y-6">
      {/* Config panel */}
      <div className="card space-y-4">
        <div>
          <p className="section-title">Product Innovation Engine</p>
          <p className="section-sub">AI-generated product concepts for Indian FMCG market</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-ink-400 uppercase tracking-widest mb-1.5">Category</p>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-2.5 text-sm text-ink-200 focus:outline-none focus:border-brand-500"
            >
              {FMCG_CATEGORIES.map(c => (
                <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-xs text-ink-400 uppercase tracking-widest mb-1.5">Target Region</p>
            <select
              value={region}
              onChange={e => setRegion(e.target.value)}
              className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-2.5 text-sm text-ink-200 focus:outline-none focus:border-brand-500"
            >
              <option value="">Pan India</option>
              {INDIAN_STATES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-xs text-ink-400 uppercase tracking-widest mb-1.5">
              Number of Ideas: <span className="text-brand-400 font-mono">{topN}</span>
            </p>
            <input
              type="range" min={1} max={10} value={topN}
              onChange={e => setTopN(Number(e.target.value))}
              className="w-full accent-brand-500 mt-3"
            />
          </div>
        </div>

        <button
          onClick={() => mutate()}
          disabled={isPending}
          className="btn-primary flex items-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Generating {topN} product ideas…
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Generate Product Ideas
            </>
          )}
        </button>

        {error && <ErrorCard message={error.message} />}
      </div>

      {/* Results */}
      {results && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="section-title capitalize">{results.category} · {results.region}</p>
              <p className="section-sub">{results.recommendations?.length} product concepts generated</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {(results.recommendations || []).map((p: any, i: number) => (
              <ProductCard key={i} product={{ ...p, category: results.category }} index={i} />
            ))}
          </div>
        </motion.div>
      )}

      {!results && !isPending && (
        <div className="text-center py-16 text-ink-500">
          <Package size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Configure options above and generate product innovation ideas.</p>
        </div>
      )}
    </div>
  )
}
