/** Lluvia (barras) y temperatura media (línea) por semana: reales NASA + esperadas. */
import { Bar, CartesianGrid, Cell, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { WeekPoint } from '@/lib/agro'

export function WeeklyChart({ data }: { data: WeekPoint[] }) {
  return (
    <div className="h-56 w-full" role="img" aria-label="Lluvia y temperatura por semana">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#f3eadb" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6e5537' }} tickLine={false} axisLine={false} />
          <YAxis yAxisId="rain" tick={{ fontSize: 11, fill: '#6e5537' }} tickLine={false} axisLine={false} width={44} tickFormatter={(v: number) => `${v}mm`} />
          <YAxis yAxisId="temp" orientation="right" tick={{ fontSize: 11, fill: '#96741f' }} tickLine={false} axisLine={false} width={34} unit="°" />
          <Tooltip
            formatter={(value: number, name: string) => (name === 'rainMm' ? [`${value} mm`, 'Lluvia'] : [`${value} °C`, 'Temp. media'])}
            labelFormatter={(l, p) => `Semana del ${l}${p?.[0]?.payload?.kind === 'expected' ? ' (esperado)' : ''}`}
            contentStyle={{ borderRadius: 12, border: '1px solid #e6d5b8', fontSize: 13 }}
          />
          <Bar yAxisId="rain" dataKey="rainMm" radius={[6, 6, 0, 0]} maxBarSize={30}>
            {data.map((d) => (
              <Cell
                key={d.weekStart}
                fill={d.kind === 'observed' ? '#3d4577' : '#b3b9d9'}
                stroke={d.kind === 'observed' ? undefined : '#5d6699'}
                strokeDasharray={d.kind === 'observed' ? undefined : '3 3'}
              />
            ))}
          </Bar>
          <Line yAxisId="temp" type="monotone" dataKey="tMean" stroke="#d4af37" strokeWidth={3} dot={{ r: 3, fill: '#d4af37' }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
