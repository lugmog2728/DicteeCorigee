import { useState } from 'react'
import { Plus, Trash2, UserPlus } from 'lucide-react'
import { createEleves } from '../../../../api/eleves'

interface Row {
  prenom:     string
  initiale:   string
  dispositif: string
}

interface Props {
  classeId:  number
  classeNom: string
  onClose:   () => void
  onSuccess: () => void
}

export default function ModalAjoutEleves({ classeId, classeNom, onClose, onSuccess }: Props) {
  const [rows, setRows] = useState<Row[]>([{ prenom: '', initiale: '', dispositif: '' }])
  const [loading, setLoading] = useState(false)

  const validCount = rows.filter(r => r.prenom.trim().length > 0 && r.initiale.trim().length > 0).length

  function updateRow(i: number, field: keyof Row, value: string) {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r))
  }

  function addRow() {
    setRows(prev => [...prev, { prenom: '', initiale: '', dispositif: '' }])
  }

  function removeRow(i: number) {
    if (rows.length === 1) return
    setRows(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit() {
    const valid = rows.filter(r => r.prenom.trim() && r.initiale.trim())
    if (!valid.length) return
    setLoading(true)
    try {
      await createEleves(valid.map(r => ({
        classe_id:  classeId,
        prenom:     r.prenom.trim(),
        initiale:   r.initiale.trim().toUpperCase(),
        dispositif: r.dispositif.trim() || undefined,
      })))
      onSuccess()
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="bg-white rounded-t-[20px] sm:rounded-[14px] w-full sm:w-[672px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-[#e5e7eb] px-6 py-4 flex flex-col gap-1">
          <p className="text-[20px] font-semibold text-[#101828]">Ajouter des Élèves à {classeNom}</p>
          <p className="text-[14px] text-[#6a7282]">Conformément au RGPD, seuls les prénoms et initiales sont collectés</p>
        </div>

        {/* Rows */}
        <div className="px-6 py-4 flex flex-col gap-4 overflow-y-auto max-h-[50vh]">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="bg-[#f3f4f6] rounded-full size-8 flex items-center justify-center shrink-0">
                <span className="text-[14px] font-medium text-[#4a5565]">{i + 1}</span>
              </div>
              <input
                type="text"
                placeholder="Prénom"
                value={row.prenom}
                onChange={e => updateRow(i, 'prenom', e.target.value)}
                className="flex-1 min-w-0 border border-[#d1d5dc] rounded-[10px] px-4 py-2 text-[14px] outline-none focus:border-[#0091ad]"
              />
              <input
                type="text"
                placeholder="Initiale"
                value={row.initiale}
                onChange={e => updateRow(i, 'initiale', e.target.value.slice(0, 3))}
                className="w-20 border border-[#d1d5dc] rounded-[10px] px-3 py-2 text-[14px] text-center outline-none focus:border-[#0091ad]"
              />
              <input
                type="text"
                placeholder="Dispositif"
                value={row.dispositif}
                onChange={e => updateRow(i, 'dispositif', e.target.value)}
                className="w-28 border border-[#d1d5dc] rounded-[10px] px-3 py-2 text-[14px] text-center outline-none focus:border-[#0091ad]"
              />
              <button
                onClick={() => removeRow(i)}
                disabled={rows.length === 1}
                className="size-8 flex items-center justify-center text-[#6a7282] hover:text-red-500 disabled:opacity-30"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {/* Add row */}
          <button
            onClick={addRow}
            className="flex items-center justify-center gap-2 border-[1.6px] border-dashed border-[#d1d5dc] rounded-[10px] py-3 text-[14px] font-medium text-[#4a5565] hover:border-[#0091ad] hover:text-[#0091ad] transition-colors"
          >
            <Plus size={16} />
            Ajouter un autre élève
          </button>
        </div>

        {/* Footer */}
        <div className="bg-[#f9fafb] border-t border-[#e5e7eb] px-6 py-4 flex items-center justify-between">
          <span className="text-[14px] text-[#4a5565]">{validCount} élève(s) valide(s)</span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="border border-[rgba(0,0,0,0.1)] rounded-[8px] px-4 py-2 text-[14px] font-medium text-[#0a0a0a] bg-white hover:bg-[#f3f4f6]"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={validCount === 0 || loading}
              className="flex items-center gap-2 bg-[#0091ad] rounded-[8px] px-4 py-2 text-[14px] font-medium text-white hover:bg-[#007a93] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus size={16} />
              Ajouter {validCount} élève(s)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
