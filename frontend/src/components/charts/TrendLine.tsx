import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { CHART_COLORS } from '../../lib/constants'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-ink-800 border border-ink-600 rounded-xl px-4 py-3 text-xs shadow-xl">
      <p className="text-ink-300 mb-2 font-medium">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="capitalize">
          {p.name}: <span className="font-mono font-medium">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function TrendLine({ data, keywords }: any) {
  if (!data?.length) return (
    <div className="flex items-center justify-center h-48 text-ink-500 text-sm">No data</div>
  )

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#252520" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: '#a0a08a' }}
          tickLine={false}
          axisLine={{ stroke: '#3d3d30' }}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#a0a08a' }}
          tickLine={false}
          axisLine={false}
          domain={[0, 100]}
        />
        <Tooltip content={CustomTooltip} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, color: '#a0a08a', paddingTop: 8 }}
        />
        {keywords.map((kw: string, i: number) => (
          <Line
            key={kw}
            type="monotone"
            dataKey={kw}
            stroke={CHART_COLORS[i % CHART_COLORS.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
