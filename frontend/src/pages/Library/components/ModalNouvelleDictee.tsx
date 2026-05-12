import { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import Button from '../../../components/Button'
import type { DicteeCreate } from '../../../api/dictees'

interface ErrorCounts {
  conjugaison: number
  homophone: number
  accord: number
  majuscule: number
  ponctuation: number
  infinitif: number
  orthographe: number
  nonPresent: number
  son: number
}

interface ModalNouvelleDicteeProps {
  onClose: () => void
  onSubmit?: (data: DicteeCreate) => Promise<void>
}

const errorCategories: { key: keyof ErrorCounts; letter: string; label: string; border: string }[] = [
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

export default function ModalNouvelleDictee({ onClose, onSubmit }: ModalNouvelleDicteeProps) {
  const [titre, setTitre] = useState('')
  const [niveau, setNiveau] = useState<DicteeCreate['niveau'] | ''>('')
  const [periode, setPeriode] = useState<DicteeCreate['periode'] | ''>('')
  const [tag, setTag] = useState('')
  const [duree, setDuree] = useState('')
  const [description, setDescription] = useState('')
  const [texte, setTexte] = useState('')
  const [errors, setErrors] = useState<ErrorCounts>({
    conjugaison: 0, homophone: 0, accord: 0,
    majuscule: 0,   ponctuation: 0, infinitif: 0,
    orthographe: 0, nonPresent: 0,  son: 0,
  })

  const fieldClass = 'bg-[#f3f3f5] border border-[rgba(0,0,0,0)] rounded-[8px] px-3 text-[14px] text-[#717182] placeholder:text-[#717182] outline-none focus:border-[var(--ocean-blue-500)] w-full'
  const labelClass = 'text-[14px] font-medium text-[#0a0a0a] leading-[14px] mb-2 block'

  async function handleSubmit() {
    if (!niveau || !periode) return
    await onSubmit?.({
      titre,
      niveau: niveau as DicteeCreate['niveau'],
      periode: periode as DicteeCreate['periode'],
      tag: tag || undefined,
      duree: Number(duree) || 15,
      description: description || undefined,
      texte,
      errors: {
        conjugaison:  errors.conjugaison,
        homophone:    errors.homophone,
        accord:       errors.accord,
        majuscule:    errors.majuscule,
        ponctuation:  errors.ponctuation,
        infinitif:    errors.infinitif,
        orthographe:  errors.orthographe,
        nonPresent:   errors.nonPresent,
        son:          errors.son,
      },
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] w-[583px] max-h-[90vh] overflow-y-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[18px] font-semibold text-[#0a0a0a] leading-[18px]">
            Créer une Nouvelle Dictée
          </h2>
          <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4 pt-4">
          {/* Titre */}
          <div>
            <label className={labelClass}>Titre</label>
            <input
              className={`${fieldClass} h-[36px]`}
              placeholder="ex : Le printemps"
              value={titre}
              onChange={e => setTitre(e.target.value)}
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
                  onChange={e => setNiveau(e.target.value as DicteeCreate['niveau'])}
                >
                  <option value="" disabled>Sélectionner</option>
                  <option>CP</option>
                  <option>CE1</option>
                  <option>CE2</option>
                  <option>CM1</option>
                  <option>CM2</option>
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
                  onChange={e => setPeriode(e.target.value as DicteeCreate['periode'])}
                >
                  <option value="" disabled>Sélectionner</option>
                  <option>Présent</option>
                  <option>Passé</option>
                  <option>Futur</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717182] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Tag */}
          <div>
            <label className={labelClass}>Tag</label>
            <input
              className={`${fieldClass} h-[36px]`}
              placeholder="ex : Nature, Histoire..."
              value={tag}
              onChange={e => setTag(e.target.value)}
            />
          </div>

          {/* Durée */}
          <div>
            <label className={labelClass}>Durée estimée (minutes)</label>
            <input
              type="number"
              className={`${fieldClass} h-[36px]`}
              placeholder="15"
              value={duree}
              onChange={e => setDuree(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description (optionnel)</label>
            <textarea
              className={`${fieldClass} py-2 h-[100px] resize-none`}
              placeholder="Description pédagogique, points d'attention..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Texte de la dictée */}
          <div>
            <label className={labelClass}>Texte de la Dictée</label>
            <textarea
              className={`${fieldClass} py-2 h-[200px] resize-none`}
              placeholder="Entrez le texte complet de la dictée..."
              value={texte}
              onChange={e => setTexte(e.target.value)}
            />
          </div>

          {/* Grille des erreurs */}
          <div>
            <label className={labelClass}>Enregistrez le nombre d'erreur de cette dictée</label>
            <div className="bg-[#f9fafb] border border-[#d1d5dc] rounded-[8px] p-4 grid grid-cols-3 gap-2.5">
              {errorCategories.map(cat => (
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
                    className="border border-[#d1d5dc] rounded-[8px] w-[62px] h-[33px] px-2 text-[16px] text-[rgba(10,10,10,0.5)] text-center outline-none focus:border-[var(--ocean-blue-500)]"
                    value={errors[cat.key]}
                    onChange={e => setErrors(prev => ({ ...prev, [cat.key]: Number(e.target.value) }))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-4">
            <Button label="Annuler" variant="outline" onClick={onClose} />
            <Button label="Créer la Dictée" variant="primary" onClick={handleSubmit} />
          </div>
        </div>
      </div>
    </div>
  )
}
