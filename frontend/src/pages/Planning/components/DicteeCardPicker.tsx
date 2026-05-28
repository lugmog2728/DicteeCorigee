import { useState } from 'react'
import { Search, FileText, Check } from 'lucide-react'
import type { DicteeApi } from '../../../api/dictees'

function wordCount(texte: string): number {
  return texte.trim().split(/\s+/).filter(Boolean).length
}

interface DicteeCardPickerProps {
  dictees:    DicteeApi[]
  selectedId: number | ''
  onSelect:   (id: number) => void
}

export default function DicteeCardPicker({ dictees, selectedId, onSelect }: DicteeCardPickerProps) {
  const [search, setSearch] = useState('')

  const filtered = dictees.filter((d) =>
    d.titre.toLowerCase().includes(search.toLowerCase()) ||
    d.niveau.toLowerCase().includes(search.toLowerCase()) ||
    (d.tag && d.tag.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une dictée..."
          className="w-full h-9 pl-9 pr-3 rounded-[8px] bg-[#f3f3f5] text-[14px] text-[#0a0a0a] placeholder:text-[#9ca3af] focus:outline-none"
        />
      </div>

      <div className="max-h-60 overflow-y-auto flex flex-col gap-2 pr-0.5">
        {filtered.length === 0 ? (
          <p className="text-[13px] text-[#9ca3af] text-center py-6">Aucune dictée trouvée</p>
        ) : (
          filtered.map((d) => {
            const isSelected = selectedId === d.id
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => onSelect(d.id)}
                className="text-left w-full p-3 rounded-[10px] border-2 transition-all"
                style={{
                  borderColor: isSelected ? 'var(--ocean-blue-500)' : '#e5e7eb',
                  background:  isSelected ? 'var(--ocean-blue-50)' : 'white',
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <span className="text-[14px] font-medium text-[#101828] truncate">{d.titre}</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] text-[11px] font-medium text-[#0091ad] bg-[#e6f7fa]">
                        {d.niveau}
                      </span>
                      {d.tag && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] text-[11px] font-medium text-[#8200db] bg-[#faf5ff]">
                          {d.tag}
                        </span>
                      )}
                      {d.temps && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] text-[11px] font-medium text-[#00748a] bg-[#e2fefe]">
                          {d.temps}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[12px] text-[#6a7282]">
                      <FileText size={11} />
                      <span>{wordCount(d.texte)} mots</span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'var(--ocean-blue-500)' }}>
                      <Check size={11} color="white" strokeWidth={3} />
                    </div>
                  )}
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
