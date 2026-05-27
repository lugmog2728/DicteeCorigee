import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { ArrowLeft, BookOpen, Users, FileText, Calendar } from 'lucide-react'
import { getDictees, type DicteeApi } from '../../api/dictees'
import { getClasses, type ClasseApi } from '../../api/classes'
import { createPlanification } from '../../api/planifications'
import StepCard from './components/StepCard'
import ErrorTypeToggles from './components/ErrorTypeToggles'

function wordCount(texte: string): number {
  return texte.trim().split(/\s+/).filter(Boolean).length
}

interface RouteState {
  dicteeId?: number
  classeId?:  number
}

export default function NouvellePlanification() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const routeState = location.state as RouteState | null

  const [dictees,  setDictees]  = useState<DicteeApi[]>([])
  const [classes,  setClasses]  = useState<ClasseApi[]>([])
  const [loading,  setLoading]  = useState(true)

  const [dicteeId,          setDicteeId]          = useState<number | ''>(routeState?.dicteeId ?? '')
  const [classeId,          setClasseId]           = useState<number | ''>(routeState?.classeId  ?? '')
  const [datePrevue,        setDatePrevue]         = useState('')
  const [typesNeutralises,  setTypesNeutralises]   = useState<string[]>([])
  const [showFullText,      setShowFullText]        = useState(false)
  const [submitting,        setSubmitting]          = useState(false)

  useEffect(() => {
    Promise.all([getDictees(), getClasses()])
      .then(([d, c]) => { setDictees(d); setClasses(c) })
      .finally(() => setLoading(false))
  }, [])

  const selectedDictee = dictees.find((d) => d.id === dicteeId) ?? null
  const selectedClasse = classes.find((c) => c.id === classeId) ?? null
  const canSubmit = dicteeId !== '' && classeId !== '' && datePrevue !== ''

  async function handleSubmit() {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    try {
      await createPlanification({
        dictee_id:         dicteeId as number,
        classe_id:         classeId as number,
        date_prevue:       datePrevue,
        types_neutralises: typesNeutralises,
      })
      navigate('/planification')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-[#6a7282]">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb */}
      <Link
        to="/planification"
        className="inline-flex items-center gap-1.5 text-[14px] text-[#6a7282] hover:text-[#364153] transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        Retour à la Planification
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-[24px] font-semibold text-[#101828] leading-8">Planifier une Dictée</h1>
        <p className="text-[14px] text-[#ff9ad6] mt-0.5">
          Sélectionnez une dictée de la bibliothèque et une classe
        </p>
      </div>

      {/* Body: left form + right recap */}
      <div className="flex items-start gap-4">

        {/* Left column — steps */}
        <div className="flex flex-col gap-4 flex-1 min-w-0">

          {/* Step 1: Choisir une Dictée */}
          <StepCard step={1} title="Choisir une Dictée">
            <div className="flex flex-col gap-1.5">
              <label className="text-[14px] font-medium text-[#0a0a0a]">
                Dictée de la bibliothèque
              </label>
              <div className="relative">
                <select
                  value={dicteeId}
                  onChange={(e) => { setDicteeId(e.target.value ? Number(e.target.value) : ''); setShowFullText(false) }}
                  className="appearance-none w-full h-9 pl-3 pr-8 rounded-[8px] bg-[#f3f3f5] text-[14px] font-medium text-[#0a0a0a] focus:outline-none cursor-pointer"
                >
                  <option value="">Sélectionner une dictée...</option>
                  {dictees.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.titre} ({d.niveau} {d.tag ? `- ${d.tag}` : ''})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6a7282]">▾</div>
              </div>
              <p className="text-[12px] text-[#6a7282]">
                Vous pouvez aussi{' '}
                <Link to="/bibliotheque" className="text-[#0091ad] hover:underline">
                  parcourir la bibliothèque
                </Link>
              </p>
            </div>

            {/* Preview dictée sélectionnée */}
            {selectedDictee && (
              <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-[10px] p-4 flex flex-col gap-3">
                {/* Title + badges */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-[18px] font-medium text-[#101828]">{selectedDictee.titre}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-[8px] border text-[12px] font-medium text-[#0091ad] bg-[#e6f7fa] border-[rgba(0,145,173,0.3)]">
                      {selectedDictee.niveau}
                    </span>
                    {selectedDictee.temps && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-[8px] border text-[12px] font-medium text-[#0091ad] bg-[#e2fefe] border-[#56bace]">
                        {selectedDictee.temps}
                      </span>
                    )}
                    {selectedDictee.tag && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-[8px] border text-[12px] font-medium text-[#8200db] bg-[#faf5ff] border-[#e9d4ff]">
                        {selectedDictee.tag}
                      </span>
                    )}
                  </div>
                </div>

                {/* Meta: mots */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-[12px] text-[#4a5565]">
                    <FileText size={12} />
                    <span>{wordCount(selectedDictee.texte)} mots</span>
                  </div>
                </div>

                {/* Texte complet toggle */}
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFullText((v) => !v)}
                    className="text-[14px] text-[#0091ad] hover:underline text-left"
                  >
                    {showFullText ? 'Masquer le texte' : 'Voir le texte complet'}
                  </button>
                  {showFullText && (
                    <div className="bg-white border border-[#e5e7eb] rounded-[4px] p-3">
                      <p className="text-[14px] text-[#364153] leading-[22px]">
                        {selectedDictee.texte}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </StepCard>

          {/* Step 2: Choisir une Classe */}
          <StepCard step={2} title="Choisir une Classe">
            <div className="flex flex-col gap-1.5">
              <label className="text-[14px] font-medium text-[#0a0a0a]">Classe</label>
              <div className="relative">
                <select
                  value={classeId}
                  onChange={(e) => setClasseId(e.target.value ? Number(e.target.value) : '')}
                  className="appearance-none w-full h-9 pl-3 pr-8 rounded-[8px] bg-[#f3f3f5] text-[14px] font-medium text-[#0a0a0a] focus:outline-none cursor-pointer"
                >
                  <option value="">Sélectionner une classe...</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom} ({c.nb_eleves} élèves - {c.niveau})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6a7282]">▾</div>
              </div>
            </div>

            {/* Preview classe sélectionnée */}
            {selectedClasse && (
              <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-[10px] p-4 flex flex-col gap-2">
                <h3 className="text-[18px] font-medium text-[#101828]">{selectedClasse.nom}</h3>
                <div className="flex items-center gap-1.5 text-[14px] text-[#4a5565]">
                  <Users size={16} />
                  <span>{selectedClasse.nb_eleves} élèves</span>
                </div>
              </div>
            )}
          </StepCard>

          {/* Step 3: Date */}
          <StepCard step={3} title="Date de la Dictée">
            <div className="flex flex-col gap-1.5">
              <label className="text-[14px] font-medium text-[#0a0a0a]">Date prévue</label>
              <input
                type="date"
                value={datePrevue}
                onChange={(e) => setDatePrevue(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="h-9 px-3 rounded-[8px] bg-[#f3f3f5] text-[14px] text-[#0a0a0a] focus:outline-none cursor-pointer w-full"
              />
              <p className="text-[12px] text-[#6a7282]">
                Sélectionnez la date à laquelle vous prévoyez de faire cette dictée
              </p>
            </div>
          </StepCard>

          {/* Step 4: Neutraliser */}
          <StepCard step={4} title="Neutraliser">
            <p className="text-[12px] text-[#4a5565]">
              Sélectionnez les types d'erreur à neutraliser dans la correction
            </p>
            <ErrorTypeToggles
              selected={typesNeutralises}
              onChange={setTypesNeutralises}
            />
          </StepCard>
        </div>

        {/* Right column — Récapitulatif */}
        <div className="w-[266px] shrink-0 sticky top-6">
          <div className="bg-white border border-black/10 rounded-[14px] flex flex-col gap-6 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 px-6 pt-6">
              <BookOpen size={20} className="text-[#0a0a0a]" />
              <span className="text-[16px] font-medium text-[#0a0a0a]">Récapitulatif</span>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 flex flex-col gap-4">
              {/* Dictée */}
              <div className="border-b border-[#e5e7eb] pb-4 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-[14px] text-[#6a7282]">
                  <FileText size={16} />
                  <span>Dictée</span>
                </div>
                {selectedDictee ? (
                  <>
                    <p className="text-[16px] font-medium text-[#101828]">{selectedDictee.titre}</p>
                    <p className="text-[14px] text-[#4a5565]">
                      {selectedDictee.niveau}{selectedDictee.tag ? ` • ${selectedDictee.tag}` : ''}
                    </p>
                  </>
                ) : (
                  <p className="text-[14px] text-[#6a7282] italic">Non sélectionnée</p>
                )}
              </div>

              {/* Classe */}
              <div className="border-b border-[#e5e7eb] pb-4 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-[14px] text-[#6a7282]">
                  <Users size={16} />
                  <span>Classe</span>
                </div>
                {selectedClasse ? (
                  <>
                    <p className="text-[16px] font-medium text-[#101828]">{selectedClasse.nom}</p>
                    <p className="text-[14px] text-[#4a5565]">{selectedClasse.nb_eleves} élèves</p>
                  </>
                ) : (
                  <p className="text-[14px] text-[#6a7282] italic">Non sélectionnée</p>
                )}
              </div>

              {/* Date */}
              {datePrevue && (
                <div className="border-b border-[#e5e7eb] pb-4 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-[14px] text-[#6a7282]">
                    <Calendar size={16} />
                    <span>Date prévue</span>
                  </div>
                  <p className="text-[16px] font-medium text-[#101828]">
                    {new Date(datePrevue + 'T00:00:00').toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                </div>
              )}

              {/* Neutralisés */}
              {typesNeutralises.length > 0 && (
                <div className="border-b border-[#e5e7eb] pb-4 flex flex-col gap-1">
                  <p className="text-[14px] text-[#6a7282]">Types neutralisés</p>
                  <p className="text-[14px] font-medium text-[#101828]">
                    {typesNeutralises.length} type{typesNeutralises.length > 1 ? 's' : ''}
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitting}
                  className={`w-full h-9 rounded-[8px] text-[14px] font-medium text-white transition-opacity ${
                    canSubmit && !submitting ? 'bg-[#0091ad] hover:bg-[#007a93]' : 'bg-[#0091ad] opacity-50 cursor-not-allowed'
                  }`}
                >
                  {submitting ? 'Enregistrement...' : 'Planifier la Dictée'}
                </button>
                <button
                  onClick={() => navigate('/planification')}
                  className="w-full h-9 rounded-[8px] border border-black/10 text-[14px] font-medium text-[#0a0a0a] hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
