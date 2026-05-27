const ERROR_TYPES = [
  { key: 'conjugaison', label: 'Conjugaison', letter: 'C', color: '#0091ad' },
  { key: 'homophone',   label: 'Homophone',   letter: 'H', color: '#00b8ba' },
  { key: 'accord',      label: 'Accord',      letter: 'A', color: '#ff57bb' },
  { key: 'majuscule',   label: 'Majuscule',   letter: 'M', color: '#f5a962' },
  { key: 'ponctuation', label: 'Ponctuation', letter: 'P', color: '#e8c547' },
  { key: 'infinitif',   label: 'Infinitif',   letter: 'I', color: '#56bace' },
  { key: 'orthographe', label: 'Orthographe', letter: 'O', color: '#ab347b' },
  { key: 'non_present', label: 'Non présent', letter: 'N', color: '#43afb0' },
  { key: 'son',         label: 'Son',         letter: 'S', color: '#d4a958' },
]

interface ErrorTypeTogglesProps {
  selected: string[]
  onChange: (selected: string[]) => void
}

export default function ErrorTypeToggles({ selected, onChange }: ErrorTypeTogglesProps) {
  function toggle(key: string) {
    if (selected.includes(key)) {
      onChange(selected.filter((k) => k !== key))
    } else {
      onChange([...selected, key])
    }
  }

  const rows = [ERROR_TYPES.slice(0, 5), ERROR_TYPES.slice(5)]

  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((row, ri) => (
        <div key={ri} className="flex items-center gap-2.5">
          {row.map(({ key, label, letter, color }) => {
            const isSelected = selected.includes(key)
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggle(key)}
                className="flex flex-col items-center gap-1 pt-2.5 pb-0.5 px-2.5 rounded-[10px] border-2 w-[67px] transition-colors"
                style={{
                  borderColor: color,
                  background: isSelected ? `${color}18` : 'white',
                }}
              >
                <span
                  className="text-[12px] font-bold leading-4 text-[#364153]"
                >
                  {letter}
                </span>
                <span className="text-[10px] font-medium text-[#364153] text-center leading-[13px] w-full overflow-hidden text-ellipsis whitespace-nowrap">
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
