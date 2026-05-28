import { X, Plus, MousePointerClick } from 'lucide-react'
import { CATEGORIES, CAT_BY_KEY } from '../../constants'
import type { CategoryKey, ErrorItem } from '../../constants'

interface Props {
  manualErrors:            ErrorItem[]
  activePlacementCategory: CategoryKey | null
  onStartPlacement:        (category: CategoryKey) => void
  onCancelPlacement:       () => void
  onRemove:                (id: number) => void
}

export default function ManualErrorAdder({
  manualErrors, activePlacementCategory,
  onStartPlacement, onCancelPlacement, onRemove,
}: Props) {
  return (
    <div className="bg-white border border-[rgba(0,0,0,0.1)] rounded-[14px] p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Plus size={14} className="text-[#6a7282]" />
        <p className="text-[14px] font-medium text-[#0a0a0a]">Erreurs non détectées</p>
      </div>

      {/* Bannière de placement actif */}
      {activePlacementCategory ? (
        <div
          className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[12px] font-medium text-white"
          style={{ backgroundColor: CAT_BY_KEY[activePlacementCategory].color }}
        >
          <span className="flex items-center gap-1.5">
            <MousePointerClick size={13} />
            Cliquez sur la photo pour placer
          </span>
          <button
            type="button"
            onClick={onCancelPlacement}
            className="opacity-80 hover:opacity-100 transition-opacity flex items-center gap-0.5"
          >
            <X size={12} /> Annuler
          </button>
        </div>
      ) : (
        <p className="text-[12px] text-[#6a7282] -mt-1">
          Sélectionnez une catégorie puis cliquez sur la photo.
        </p>
      )}

      {/* Grille des 9 catégories */}
      <div className="grid grid-cols-3 gap-1.5">
        {CATEGORIES.map(cat => {
          const isActive = activePlacementCategory === cat.key
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => isActive ? onCancelPlacement() : onStartPlacement(cat.key)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border transition-colors text-left"
              style={{
                color:           cat.color,
                borderColor:     isActive ? cat.color : '#e5e7eb',
                backgroundColor: isActive ? `${cat.color}18` : undefined,
                opacity:         activePlacementCategory && !isActive ? 0.45 : 1,
              }}
            >
              <span
                className="size-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                style={{ backgroundColor: cat.color }}
              >
                {cat.letter}
              </span>
              <span className="text-[11px] font-medium text-[#364153] truncate">{cat.label}</span>
            </button>
          )
        })}
      </div>

      {/* Chips des erreurs ajoutées */}
      {manualErrors.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[#f3f4f6]">
          {manualErrors.map(err => {
            const cat = CAT_BY_KEY[err.category]
            return (
              <span
                key={err.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-white"
                style={{ backgroundColor: cat.color }}
              >
                {cat.letter} — {cat.label}
                <button
                  type="button"
                  aria-label="Supprimer"
                  onClick={() => onRemove(err.id)}
                  className="ml-0.5 opacity-70 hover:opacity-100 transition-opacity"
                >
                  <X size={10} />
                </button>
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
