interface ProgressionBarProps {
  nbCorriges: number
  nbEleves:   number
}

export default function ProgressionBar({ nbCorriges, nbEleves }: ProgressionBarProps) {
  const pct = nbEleves > 0 ? Math.round((nbCorriges / nbEleves) * 100) : 0
  const width = `${pct}%`

  return (
    <div className="flex flex-col gap-1 w-[84px]">
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[#4a5565]">{nbCorriges} / {nbEleves}</span>
        <span className="text-[12px] text-[#4a5565]">{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-[#e5e7eb] overflow-hidden">
        <div
          className="h-2 rounded-full bg-[#0091ad] transition-all"
          style={{ width }}
        />
      </div>
    </div>
  )
}
