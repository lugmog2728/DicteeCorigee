import { Users, Check } from 'lucide-react'
import type { ClasseApi } from '../../../api/classes'

const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  'CP':    { bg: '#ffeef8', text: '#ab347b' },
  'CE1':   { bg: '#e2fefe', text: '#005768' },
  'CE2':   { bg: '#e6f7fa', text: '#0091ad' },
  'CM1':   { bg: '#faf5ff', text: '#8200db' },
  'CM2':   { bg: '#dcfce7', text: '#016630' },
  '6ème':  { bg: '#fcf6db', text: '#c9ae2e' },
  '5ème':  { bg: '#ffeef8', text: '#d5469b' },
  '4ème':  { bg: '#fff4e4', text: '#d5bc4c' },
  '3ème':  { bg: '#f0f4ff', text: '#3b5bdb' },
}

function levelColors(niveau: string) {
  return LEVEL_COLORS[niveau] ?? { bg: '#f3f4f6', text: '#6a7282' }
}

interface ClasseCardPickerProps {
  classes:    ClasseApi[]
  selectedId: number | ''
  onSelect:   (id: number) => void
}

export default function ClasseCardPicker({ classes, selectedId, onSelect }: ClasseCardPickerProps) {
  if (classes.length === 0) {
    return <p className="text-[13px] text-[#9ca3af] text-center py-6">Aucune classe disponible</p>
  }

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {classes.map((c) => {
        const isSelected = selectedId === c.id
        const colors = levelColors(c.niveau)
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            className="text-left p-3 rounded-[10px] border-2 flex flex-col gap-2 transition-all"
            style={{
              borderColor: isSelected ? 'var(--ocean-blue-500)' : '#e5e7eb',
              background:  isSelected ? 'var(--ocean-blue-50)' : 'white',
            }}
          >
            <div className="flex items-start justify-between gap-1">
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[14px] font-semibold text-[#101828] truncate">{c.nom}</span>
                <span
                  className="self-start px-1.5 py-0.5 rounded-[5px] text-[11px] font-medium"
                  style={{ background: colors.bg, color: colors.text }}
                >
                  {c.niveau}
                </span>
              </div>
              {isSelected && (
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--ocean-blue-500)' }}>
                  <Check size={11} color="white" strokeWidth={3} />
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-[12px] text-[#6a7282]">
              <Users size={11} />
              <span>{c.nb_eleves} élève{c.nb_eleves > 1 ? 's' : ''}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
