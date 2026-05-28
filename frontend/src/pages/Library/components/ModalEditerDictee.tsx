import { useState, useEffect } from 'react'
import { X, ChevronDown, AlertTriangle } from 'lucide-react'
import Button from '../../../components/Button'
import { getPlanifications } from '../../../api/planifications'
import type { DicteeApi, DicteeCreate } from '../../../api/dictees'

const ERROR_CATEGORIES: { key: keyof DicteeCreate['errors']; letter: string; label: string; border: string }[] = [
  { key: 'conjugaison', letter: 'C', label: 'Conjugaison',  border: 'var(--ocean-blue-500)' },
  { key: 'homophone',   letter: 'H', label: 'Homophone',    border: 'var(--ocean-blue-200)' },
  { key: 'accord',      letter: 'A', label: 'Accord',       border: 'var(--electric-pink-500)' },
  { key: 'majuscule',   letter: 'M', label: 'Majuscule',    border: 'var(--soft-blush-800)' },
  { key: 'ponctuation', letter: 'P', label: 'Ponctuation',  border: 'var(--sunlight-sand-700)' },
  { key: 'infinitif',   letter: 'I', label: 'Infinitif',    border: 'var(--ocean-blue-500)' },
  { key: 'orthographe', letter: 'O', label: 'Orthographe',  border: 'var(--electric-pink-700)' },
  { key: 'nonPresent',  letter: 'N', label: 'Non présent',  border: 'var(--aqua-mist-600)' },
  { key: 'son',         letter: 'S', label: 'Son',          border: 'var(--soft-blush-900)' },
]

const TEMPS_NORMALIZE: Record<string, DicteeCreate['temps']> = {
  'présent': 'Présent', 'present': 'Présent',
  'imparfait': 'Imparfait',
  'passé': 'Passé', 'passe': 'Passé', 'passée': 'Passé', 'passee': 'Passé',
  'futur': 'Futur',
}

function normalizeTemps(val: string): DicteeCreate['temps'] {
  return TEMPS_NORMALIZE[val.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')]
    ?? TEMPS_NORMALIZE[val.toLowerCase()]
    ?? val as DicteeCreate['temps']
}

interface ModalEditerDicteeProps {
  dictee:   DicteeApi
  onClose:  () => void
  onSave:   (data: DicteeCreate) => Promise<void>
}

export default function ModalEditerDictee({ dictee, onClose, onSave }: ModalEditerDicteeProps) {
  const [titre,   setTitre]   = useState(dictee.titre)
  const [niveau,  setNiveau]  = useState(dictee.niveau)
  const [periode, setPeriode] = useState(dictee.periode)
  const [temps,   setTemps]   = useState<DicteeCreate['temps'] | ''>(dictee.temps ?? '')
  const [tag,     setTag]     = useState(dictee.tag ?? '')
  const [texte,   setTexte]   = useState(dictee.texte)
  const [errors,  setErrors]  = useState({ ...dictee.errors })

  const [termineesCount, setTermineesCount] = useState(0)
  const [showWarning,    setShowWarning]    = useState(false)
  const [saving,         setSaving]         = useState(false)

  useEffect(() => {
    getPlanifications()
      .then((planifs) => {
        const count = planifs.filter(
          (p) => p.dictee_id === dictee.id && p.statut === 'terminee'
        ).length
        setTermineesCount(count)
      })
      .catch(() => {})
  }, [dictee.id])

  async function handleSaveClick() {
    if (termineesCount > 0 && !showWarning) {
      setShowWarning(true)
      return
    }
    await confirmSave()
  }

  async function confirmSave() {
    if (saving) return
    setSaving(true)
    try {
      await onSave({
        titre,
        niveau,
        periode,
        temps: normalizeTemps(temps),
        tag: tag || undefined,
        texte,
        errors,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const fieldClass = 'bg-[#f3f3f5] border border-transparent rounded-[8px] px-3 text-[14px] text-[#717182] placeholder:text-[#717182] outline-none focus:border-[var(--ocean-blue-500)] w-full'
  const labelClass = 'text-[14px] font-medium text-[#0a0a0a] leading-[14px] mb-2 block'

  return (
    <>
    {showWarning && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={() => setShowWarning(false)} />
        <div className="relative bg-white rounded-[14px] shadow-xl w-full max-w-[400px] mx-4 p-6 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-full bg-[#fff7ed] flex items-center justify-center shrink-0">
              <AlertTriangle size={20} className="text-[#ea580c]" />
            </div>
            <div className="flex flex-col gap-1 pt-1">
              <p className="text-[15px] font-semibold text-[#0a0a0a]">
                {termineesCount} correction{termineesCount > 1 ? 's' : ''} déjà effectuée{termineesCount > 1 ? 's' : ''}
              </p>
              <p className="text-[13px] text-[#6a7282] leading-relaxed">
                Cette dictée a déjà été corrigée. Modifier son texte ou ses erreurs peut rendre
                les résultats existants des élèves incohérents avec la nouvelle version.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowWarning(false)}
              className="px-4 py-2 rounded-[8px] text-[13px] font-medium text-[#364153] border border-[rgba(0,0,0,0.1)] hover:bg-[#f3f4f6] transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={confirmSave}
              disabled={saving}
              className="px-4 py-2 rounded-[8px] text-[13px] font-semibold text-white bg-[#ea580c] hover:bg-[#c2410c] transition-colors disabled:opacity-60"
            >
              {saving ? 'Enregistrement...' : 'Modifier quand même'}
            </button>
          </div>
        </div>
      </div>
    )}
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white border border-[rgba(0,0,0,0.1)] rounded-t-[20px] sm:rounded-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)] w-full sm:w-[583px] max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto p-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-[18px] font-semibold text-[#0a0a0a] leading-[18px]">Éditer la dictée</h2>
            <p className="text-[13px] text-[#9ca3af] mt-1">{dictee.titre}</p>
          </div>
          <button type="button" onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity">
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-4 pt-4">

          {/* Titre */}
          <div>
            <label className={labelClass}>Titre</label>
            <input
              className={`${fieldClass} h-[36px]`}
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
            />
          </div>

          {/* Niveau + Période */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Niveau</label>
              <div className="relative">
                <select
                  className={`${fieldClass} h-[36px] appearance-none pr-8`}
                  value={niveau}
                  onChange={(e) => setNiveau(e.target.value as DicteeCreate['niveau'])}
                >
                  {['CP','CE1','CE2','CM1','CM2'].map(n => <option key={n}>{n}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717182] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Période</label>
              <div className="relative">
                <select
                  className={`${fieldClass} h-[36px] appearance-none pr-8`}
                  value={periode}
                  onChange={(e) => setPeriode(e.target.value as DicteeCreate['periode'])}
                >
                  {['P1','P2','P3','P4','P5'].map(p => <option key={p}>{p}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717182] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Temps + Tag */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Temps</label>
              <div className="relative">
                <select
                  className={`${fieldClass} h-[36px] appearance-none pr-8`}
                  value={temps}
                  onChange={(e) => setTemps(e.target.value as DicteeCreate['temps'])}
                >
                  <option value="" disabled>Sélectionner</option>
                  {['Présent','Imparfait','Passé','Futur'].map(t => <option key={t}>{t}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717182] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Tag</label>
              <input
                className={`${fieldClass} h-[36px]`}
                placeholder="ex : Nature, Histoire..."
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              />
            </div>
          </div>

          {/* Texte */}
          <div>
            <label className={labelClass}>Texte de la dictée</label>
            <textarea
              className={`${fieldClass} py-2 h-[200px] resize-none`}
              value={texte}
              onChange={(e) => setTexte(e.target.value)}
            />
          </div>

          {/* Erreurs */}
          <div>
            <label className={labelClass}>Nombre d'erreurs</label>
            <div className="bg-[#f9fafb] border border-[#d1d5dc] rounded-[8px] p-4 grid grid-cols-3 gap-2.5">
              {ERROR_CATEGORIES.map((cat) => (
                <div
                  key={cat.key}
                  className="bg-white rounded-[10px] flex items-center justify-between p-[13.6px] h-[71px]"
                  style={{ border: `1.6px solid ${cat.border}` }}
                >
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[18px] font-bold text-[#364153] leading-[28px]">{cat.letter}</span>
                    <span className="text-[12px] text-[#4a5565] leading-[16px]">{cat.label}</span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    className="border border-[#d1d5dc] rounded-[8px] w-[62px] h-[33px] px-2 text-[16px] text-[rgba(10,10,10,0.5)] text-center outline-none focus:border-(--ocean-blue-500)"
                    value={errors[cat.key]}
                    onChange={(e) => setErrors((prev) => ({ ...prev, [cat.key]: Number(e.target.value) }))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-2 border-t border-[rgba(0,0,0,0.08)]">
            <Button label="Annuler" variant="outline" onClick={onClose} />
            <Button
              label={saving ? 'Enregistrement...' : 'Sauvegarder'}
              variant="primary"
              onClick={handleSaveClick}
              disabled={saving}
            />
          </div>

        </div>
      </div>
    </div>
    </>
  )
}
