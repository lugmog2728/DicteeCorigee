export default function DonutChart({ score }: { score: number }) {
  const radius = 54, stroke = 10
  const r = radius - stroke / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ

  return (
    <svg width={radius * 2} height={radius * 2} className="rotate-[-90deg]">
      <circle cx={radius} cy={radius} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <circle cx={radius} cy={radius} r={r} fill="none"
        stroke="var(--ocean-blue-500, #0091ad)" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${circ} ${circ}`} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
    </svg>
  )
}
