import { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import Button from '../../../components/Button'
import type { Niveau } from '../../../api/dictees'

interface ModalNouvelleClasseProps {
  onClose: () => void
  onSubmit?: (data: { nom: string; niveau: Niveau }) => Promise<void>
}

export default function ModalNouvelleClasse({ onClose, onSubmit }: ModalNouvelleClasseProps) {
  const [nom, setNom] = useState('')
  const [niveau, setNiveau] = useState<Niveau | ''>('')

  const fieldClass = 'bg-[#f3f3f5] border border-transparent rounded-lg px-3 text-[14px] text-[#717182] placeholder:text-[#717182] outline-none focus:border-(--ocean-blue-500) w-full'
  const labelClass = 'text-[14px] font-medium text-[#0a0a0a] leading-[14px] mb-2 block'

  async function handleSubmit() {
    if (!nom || !niveau) return
    await onSubmit?.({ nom, niveau: niveau as Niveau })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white border border-black/10 rounded-t-[20px] sm:rounded-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] w-full sm:w-[448px] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[18px] font-semibold text-[#0a0a0a] leading-[18px]">
            Ajouter une Classe
          </h2>
          <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          {/* Nom */}
          <div>
            <label className={labelClass}>Nom de la Classe</label>
            <input
              className={`${fieldClass} h-9`}
              placeholder="Ex: CM1-A"
              value={nom}
              onChange={e => setNom(e.target.value)}
            />
          </div>

          {/* Niveau */}
          <div>
            <label className={labelClass}>Niveau</label>
            <div className="relative">
              <select
                className={`${fieldClass} h-9 appearance-none pr-8`}
                value={niveau}
                onChange={e => setNiveau(e.target.value as Niveau)}
              >
                <option value="" disabled>Sélectionner un niveau</option>
                <option>CP</option>
                <option>CE1</option>
                <option>CE2</option>
                <option>CM1</option>
                <option>CM2</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717182] pointer-events-none" />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2 mt-2">
            <Button label="Annuler" variant="outline" onClick={onClose} />
            <Button
              label="Créer la Classe"
              variant="primary"
              onClick={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
