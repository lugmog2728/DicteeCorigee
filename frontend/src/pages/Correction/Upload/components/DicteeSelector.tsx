import { ChevronDown, ArrowRight, Loader2 } from 'lucide-react'
import Button from '../../../../components/Button'
import type { DicteeApi } from '../../../../api/dictees'

interface Props {
  dictees: DicteeApi[]
  selectedDicteeId: number | ''
  studentName: string
  loading: boolean
  canProceed: boolean
  onChange: (id: number | '') => void
  onStudentName: (name: string) => void
  onSubmit: () => void
}

export default function DicteeSelector({ dictees, selectedDicteeId, studentName, loading, canProceed, onChange, onStudentName, onSubmit }: Props) {
  const selectedDictee = dictees.find(d => d.id === selectedDicteeId) ?? null

  return (
    <div className="bg-white border border-[rgba(0,0,0,0.1)] rounded-[14px] p-6 flex flex-col gap-6">
      <p className="text-[16px] font-medium text-[#0a0a0a]">Détails de la Correction</p>

      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-medium text-[#0a0a0a]">Nom de l'élève</label>
        <input
          type="text"
          placeholder="Ex : Marie Dupont"
          value={studentName}
          onChange={e => onStudentName(e.target.value)}
          className="w-full h-9 bg-[#f3f3f5] rounded-lg px-3 text-[14px] text-[#0a0a0a] outline-none focus:ring-1 focus:ring-(--ocean-blue-500) placeholder:text-[#717182]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-medium text-[#0a0a0a]">Dictée</label>
        <div className="relative">
          <select
            className="w-full h-[36px] bg-[#f3f3f5] rounded-[8px] px-3 pr-8 text-[14px] text-[#717182] appearance-none outline-none focus:border focus:border-[var(--ocean-blue-500)]"
            value={selectedDicteeId}
            onChange={e => onChange(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="" disabled>Sélectionner une dictée</option>
            {dictees.map(d => (
              <option key={d.id} value={d.id}>{d.titre}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717182] pointer-events-none" />
        </div>
        {selectedDictee && (
          <div className="flex items-center gap-2 mt-1">
            {[selectedDictee.niveau, selectedDictee.periode, selectedDictee.temps].filter(Boolean).map(info => (
              <span key={info} className="text-[12px] text-[#6a7282]">• {info}</span>
            ))}
          </div>
        )}
      </div>

      <Button
        label={loading ? 'Analyse en cours...' : 'Passer à la Détection'}
        variant="primary"
        icon={loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
        disabled={!canProceed || loading}
        onClick={onSubmit}
        className="w-full justify-center"
      />
    </div>
  )
}
