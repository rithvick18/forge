import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { insightsApi } from '../lib/api'
import { FMCG_CATEGORIES } from '../lib/constants'
import { ErrorCard } from '../components/ui/Loader'

function InsightBrief({ insight, category }: any) {
  const [expanded, setExpanded] = useState(false)

  const confidence = insight.confidence_score ?? 0
  const confidenceColor =
    confidence >= 0.75 ? 'text-emerald-400' :
    confidence >= 0.5  ? 'text-brand-400' : 'text-red-400'

  return (
    <motion.div
      className="card-glow"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs px-2.5 py-0.5 bg-brand-500/10 border border-brand-500/20 rounded-full text-brand-400 capitalize">{category}</span>
            <span className={`text-xs font-mono ${confidenceColor}`}>
              {(confidence * 100).toFixed(0)}% confidence
            </span>
          </div>
          <h3 className="font-display text-lg text-ink-50 leading-snug">{insight.title}</h3>
        </div>
        <Lightbulb size={20} className="text-brand-400 shrink-0 mt-1" />
      </div>

      {/* Summary */}
      <p className="text-sm text-ink-300 leading-relaxed mb-4">{insight.summary}</p>

      {/* Expand for full analysis */}
      {insight.llm_analysis && (
        <>
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition-colors mb-3"
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {expanded ? 'Hide' : 'Show'} full analysis
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div
                className="border-t border-ink-700 pt-4 mb-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <p className="text-sm text-ink-300 leading-relaxed whitespace-pre-wrap">
                  {insight.llm_analysis}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Recommended actions */}
      {insight.recommended_actions?.length > 0 && (
        <div className="border-t border-ink-700 pt-4">
          <p className="text-[10px] text-ink-500 uppercase tracking-widest mb-2.5">Recommended Actions</p>
          <ul className="space-y-1.5">
            {insight.recommended_actions.map((action: any, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink-300">
                <span className="text-brand-500 font-mono text-xs mt-0.5 shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  )
}

export default function Insights() {
  const [category, setCategory] = useState('packaged food')
  const [focus, setFocus]       = useState('')
  const [results, setResults]   = useState<any[]>([])

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => insightsApi.generate(category, focus || null),
    onSuccess: (data) => {
      setResults(prev => [{ ...data, id: Date.now() }, ...prev])
    },
  })

  return (
    <div className="space-y-6">
      {/* Generator panel */}
      <div className="card space-y-4">
        <div>
          <p className="section-title">Generate AI Insight</p>
          <p className="section-sub">Powered by Google Trends + Gemini 1.5 Pro</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-ink-400 uppercase tracking-widest mb-1.5">FMCG Category</p>
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
            <p className="text-xs text-ink-400 uppercase tracking-widest mb-1.5">Focus (optional)</p>
            <input
              value={focus}
              onChange={e => setFocus(e.target.value)}
              placeholder="e.g. rural consumers in Tamil Nadu"
              className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-2.5 text-sm text-ink-100 placeholder-ink-500 focus:outline-none focus:border-brand-500 transition-colors"
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
              Generating insight…
            </>
          ) : (
            <>
              <Lightbulb size={14} />
              Generate Insight Brief
            </>
          )}
        </button>

        {error && <ErrorCard message={error.message} />}
      </div>

      {/* Results */}
      <AnimatePresence>
        {results.map(r => (
          <InsightBrief
            key={r.id}
            insight={r.insight}
            category={r.category}
          />
        ))}
      </AnimatePresence>

      {results.length === 0 && !isPending && (
        <div className="text-center py-16 text-ink-500">
          <Lightbulb size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Select a category and generate your first AI insight brief.</p>
        </div>
      )}
    </div>
  )
}
