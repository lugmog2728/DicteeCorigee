import { ChevronDown, ArrowRight, Loader2 } from 'lucide-react'
import Button from '../../../../components/Button'
import type { DicteeApi } from '../../../../api/dictees'
import type { EleveApi } from '../../../../api/eleves'

interface Props {
  dictees:          DicteeApi[]
  selectedDicteeId: number | ''
  studentName:      string
  loading:          boolean
  canProceed:       boolean
  onChange:         (id: number | '') => void
  onStudentName:    (name: string) => void
  onSubmit:         () => void
  // mode planification
  planifMode?:        boolean
  eleves?:            EleveApi[]
  allElevesCount?:    number
  selectedEleveId?:   number | ''
  onEleveChange?:     (id: number | '') => void
}

export default function DicteeSelector({
  dictees, selectedDicteeId, studentName, loading, canProceed,
  onChange, onStudentName, onSubmit,
  planifMode = false, eleves = [], allElevesCount = 0, selectedEleveId = '', onEleveChange,
}: Props) {
  const selectedDictee = dictees.find(d => d.id === selectedDicteeId) ?? null

  return (
    <div className="bg-white border border-[rgba(0,0,0,0.1)] rounded-[14px] p-6 flex flex-col gap-6">
      <p className="text-[16px] font-medium text-[#0a0a0a]">Détails de la Correction</p>

      {/* Élève */}
      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-medium text-[#0a0a0a]">
          {planifMode ? 'Élève' : "Nom de l'élève"}
        </label>

        {planifMode ? (
          <div className="relative">
            <select
              value={selectedEleveId}
              onChange={e => {
                const id = e.target.value ? Number(e.target.value) : ''
                onEleveChange?.(id)
                if (id) {
                  const eleve = eleves.find(el => el.id === id)
                  if (eleve) onStudentName(`${eleve.prenom} ${eleve.initiale}.`)
                } else {
                  onStudentName('')
                }
              }}
              className="w-full h-9 bg-[#f3f3f5] rounded-lg px-3 pr-8 text-[14px] text-[#0a0a0a] appearance-none outline-none focus:ring-1 focus:ring-[var(--ocean-blue-500)]"
            >
              <option value="">Sélectionner un élève...</option>
              {eleves.map(el => (
                <option key={el.id} value={el.id}>
                  {el.prenom} {el.initiale}.{el.dispositif ? ` — ${el.dispositif}` : ''}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717182] pointer-events-none" />
            {eleves.length === 0 && allElevesCount === 0 && (
              <p className="text-[12px] text-[#e17100] mt-1">
                Aucun élève dans cette classe. Ajoutez-en depuis la page Classes.
              </p>
            )}
            {eleves.length === 0 && allElevesCount > 0 && (
              <p className="text-[12px] text-[#00a63e] mt-1">
                Tous les élèves ont déjà été corrigés pour cette planification.
              </p>
            )}
          </div>
        ) : (
          <input
            type="text"
            placeholder="Ex : Marie Dupont"
            value={studentName}
            onChange={e => onStudentName(e.target.value)}
            className="w-full h-9 bg-[#f3f3f5] rounded-lg px-3 text-[14px] text-[#0a0a0a] outline-none focus:ring-1 focus:ring-[var(--ocean-blue-500)] placeholder:text-[#717182]"
          />
        )}
      </div>

      {/* Dictée */}
      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-medium text-[#0a0a0a]">Dictée</label>

        {planifMode && selectedDictee ? (
          <div className="w-full h-9 bg-[#f3f3f5] rounded-lg px-3 flex items-center text-[14px] text-[#0a0a0a]">
            {selectedDictee.titre}
            <span className="ml-2 text-[12px] text-[#6a7282]">
              ({selectedDictee.niveau}{selectedDictee.tag ? ` - ${selectedDictee.tag}` : ''})
            </span>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>

      <Button
        label={loading ? 'Chargement...' : 'Suivant'}
        variant="primary"
        icon={loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
        disabled={!canProceed || loading}
        onClick={onSubmit}
        className="w-full justify-center"
      />
    </div>
  )
}
