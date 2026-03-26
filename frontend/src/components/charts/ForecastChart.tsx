import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const yhat = payload.find((p: any) => p.dataKey === 'yhat')
  return (
    <div className="bg-ink-800 border border-ink-600 rounded-xl px-4 py-3 text-xs shadow-xl">
      <p className="text-ink-300 mb-1.5">{label}</p>
      {yhat && <p className="text-brand-400 font-mono font-medium">Forecast: {yhat.value?.toFixed(1)}</p>}
    </div>
  )
}

export default function ForecastChart({ historical = [], forecast = [] }: any) {
  // Merge historical + forecast
  const histData = historical.map((p: any) => ({ date: p.date, actual: p.value }))
  const fcastData = forecast.map((p: any) => ({
    date: p.date,
    yhat: p.yhat,
    band: [p.yhat_lower, p.yhat_upper],
  }))

  const splitDate = histData.at(-1)?.date

  const combined = [
    ...histData,
    ...fcastData,
  ]

  return (
    <div>
      <div className="flex items-center gap-4 mb-4 text-xs text-ink-400">
        <span className="flex items-center gap-1.5">
          <span className="w-6 h-0.5 bg-ink-300 inline-block" /> Historical
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-6 h-0.5 bg-brand-500 inline-block" /> Forecast
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-6 h-2 bg-brand-500/15 inline-block rounded" /> 80% CI
        </span>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={combined} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#252520" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#a0a08a' }} tickLine={false} axisLine={{ stroke: '#3d3d30' }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10, fill: '#a0a08a' }} tickLine={false} axisLine={false} domain={[0, 100]} />
          <Tooltip content={CustomTooltip} />

          {splitDate && (
            <ReferenceLine x={splitDate} stroke="#3d3d30" strokeDasharray="4 4"
              label={{ value: 'Now', fill: '#a0a08a', fontSize: 10 }} />
          )}

          {/* Confidence band */}
          <Area dataKey="band" fill="#c47f0a" fillOpacity={0.12} stroke="none" />

          {/* Historical */}
          <Line type="monotone" dataKey="actual" stroke="#c8c8b8" strokeWidth={1.5} dot={false} />

          {/* Forecast */}
          <Line type="monotone" dataKey="yhat" stroke="#c47f0a" strokeWidth={2}
            strokeDasharray="6 3" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
