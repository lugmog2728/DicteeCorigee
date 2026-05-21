interface Props {
  done: number
  total: number
  neutralized: boolean
}

export default function Speedometer({ done, total, neutralized }: Props) {
  const percent = total <= 0 ? 0 : Math.min(100, Math.max(0, (done / total) * 100))
  const cx = 160, cy = 160, rOuter = 120, rInner = 85

  const toXY = (r: number, angle: number) => {
    const rad = (angle * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  const arc = (r: number, start: number, end: number) => {
    const s = toXY(r, start)
    const e = toXY(r, end)
    const large = end - start <= 180 ? 0 : 1
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`
  }

  const angle = 180 + (percent / 100) * 180
  const needle = toXY(rInner, angle)
  const percentLabels = ['0%', '20%', '40%', '60%', '80%', '100%']

  const segments = [
    { a: 180, b: 216, c: '#ef4444' },
    { a: 216, b: 252, c: '#f97316' },
    { a: 252, b: 288, c: '#eab308' },
    { a: 288, b: 324, c: '#84cc16' },
    { a: 324, b: 360, c: '#22c55e' },
  ]

  return (
    <svg viewBox="0 0 340 200" className="w-full">
      {segments.map((s, i) => (
        <path key={i} d={arc(rOuter, s.a, s.b)}
          stroke={neutralized ? '#e5e7eb' : s.c}
          strokeWidth="18" fill="none" strokeLinecap="butt" />
      ))}
      {[180, 216, 252, 288, 324, 360].map((a, i) => {
        const p = toXY(rOuter + 18, a)
        return (
          <text key={i} x={p.x} y={p.y} fontSize="12" textAnchor="middle"
            fill={neutralized ? '#d1d5db' : '#333'}>
            {percentLabels[i]}
          </text>
        )
      })}
      <path d={arc(rInner, 180, 360)} stroke={neutralized ? '#f1f5f9' : '#e5e7eb'} strokeWidth="10" fill="none" />
      {total > 0 && Array.from({ length: total + 1 }).map((_, i) => {
        const p = toXY(rInner - 20, 180 + (i * 180) / total)
        return (
          <text key={i} x={p.x} y={p.y} fontSize="14"
            fill={neutralized ? '#e5e7eb' : '#111'} textAnchor="middle">
            {i}
          </text>
        )
      })}
      <line x1={cx} y1={cy} x2={needle.x} y2={needle.y}
        stroke={neutralized ? '#d1d5db' : '#111'} strokeWidth="5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="6" fill={neutralized ? '#d1d5db' : '#111'} />
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="26" fontWeight="bold"
        fill={neutralized ? '#d1d5db' : '#111'}>
        {neutralized ? '–' : `${done} / ${total}`}
      </text>
      <text x={cx} y={cy + 35} textAnchor="middle" fontSize="14" fill={neutralized ? '#d1d5db' : '#555'}>
        {neutralized ? '' : `${percent.toFixed(0)}%`}
      </text>
    </svg>
  )
}
