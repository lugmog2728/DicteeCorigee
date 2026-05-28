import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Search, FileText, Users, Calendar, Shield, Check } from 'lucide-react'
import { getDictees, type DicteeApi } from '../../api/dictees'
import { getClasses, type ClasseApi } from '../../api/classes'
import { createPlanification } from '../../api/planifications'
import ErrorTypeToggles from './components/ErrorTypeToggles'

// ── Helpers ──────────────────────────────────────────────────────────────────

function wordCount(texte: string): number {
  return texte.trim().split(/\s+/).filter(Boolean).length
}

function todayPlus(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function formatDateFr(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

const DATE_SHORTCUTS = [
  { label: 'Dans 3 jours',    days: 3  },
  { label: 'Dans 1 semaine',  days: 7  },
  { label: 'Dans 2 semaines', days: 14 },
]

interface RouteState { dicteeId?: number; classeId?: number }

// ── Step indicator ────────────────────────────────────────────────────────────

const STEP_LABELS = ['Dictée', 'Classe', 'Date & Options']

function StepBar({
  current,
  dicteeTitle,
  classeNom,
}: {
  current:     number
  dicteeTitle?: string
  classeNom?:  string
}) {
  const sublabels = [
    dicteeTitle ? truncate(dicteeTitle, 22) : null,
    classeNom   ? classeNom                 : null,
    null,
  ]

  return (
    <div className="flex items-start">
      {STEP_LABELS.map((label, i) => {
        const step  = i + 1
        const done  = step < current
        const active = step === current
        return (
          <div key={label} className="flex items-start flex-1">
            <div className="flex flex-col items-center gap-1.5 min-w-[64px]">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: done ? '#16a34a' : active ? 'var(--ocean-blue-500)' : '#e5e7eb',
                  color: done || active ? 'white' : '#9ca3af',
                }}
              >
                {done
                  ? <Check size={16} strokeWidth={3} />
                  : <span className="text-[14px] font-bold">{step}</span>
                }
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span
                  className="text-[12px] font-semibold whitespace-nowrap"
                  style={{ color: done ? '#16a34a' : active ? 'var(--ocean-blue-600)' : '#9ca3af' }}
                >
                  {label}
                </span>
                {sublabels[i] && (
                  <span className="text-[11px] text-[#9ca3af] max-w-[80px] truncate text-center">
                    {sublabels[i]}
                  </span>
                )}
              </div>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className="flex-1 h-0.5 mt-[18px] mx-2 transition-colors"
                style={{ background: current > step ? '#16a34a' : '#e5e7eb' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max) + '…' : s
}

// ── Dictée card ───────────────────────────────────────────────────────────────

function DicteeCard({
  dictee,
  isSelected,
  onSelect,
}: {
  dictee:     DicteeApi
  isSelected: boolean
  onSelect:   () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="relative text-left p-5 rounded-2xl border-2 flex flex-col gap-3 transition-all hover:shadow-sm"
      style={{
        borderColor: isSelected ? 'var(--ocean-blue-500)' : '#e5e7eb',
        background:  isSelected ? 'var(--ocean-blue-50)' : 'white',
        minHeight:   '148px',
      }}
    >
      {isSelected && (
        <div
          className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: 'var(--ocean-blue-500)' }}
        >
          <Check size={12} color="white" strokeWidth={3} />
        </div>
      )}
      <div className="flex items-center gap-1.5 flex-wrap pr-8">
        <span className="px-2 py-0.5 rounded-[5px] text-[11px] font-medium text-[#0091ad] bg-[#e6f7fa]">
          {dictee.niveau}
        </span>
        {dictee.tag && (
          <span className="px-2 py-0.5 rounded-[5px] text-[11px] font-medium text-[#8200db] bg-[#faf5ff]">
            {dictee.tag}
          </span>
        )}
        {dictee.temps && (
          <span className="px-2 py-0.5 rounded-[5px] text-[11px] font-medium text-[#00748a] bg-[#e2fefe]">
            {dictee.temps}
          </span>
        )}
      </div>
      <span
        className="text-[15px] font-semibold leading-snug"
        style={{ color: isSelected ? 'var(--ocean-blue-800)' : '#101828' }}
      >
        {dictee.titre}
      </span>
      <div className="flex items-center gap-1 text-[12px] text-[#9ca3af] mt-auto">
        <FileText size={11} />
        {wordCount(dictee.texte)} mots
      </div>
    </button>
  )
}

// ── Classe card ───────────────────────────────────────────────────────────────

const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  'CP':   { bg: '#ffeef8', text: '#ab347b' },
  'CE1':  { bg: '#e2fefe', text: '#005768' },
  'CE2':  { bg: '#e6f7fa', text: '#0091ad' },
  'CM1':  { bg: '#faf5ff', text: '#8200db' },
  'CM2':  { bg: '#dcfce7', text: '#016630' },
  '6ème': { bg: '#fcf6db', text: '#c9ae2e' },
  '5ème': { bg: '#ffeef8', text: '#d5469b' },
  '4ème': { bg: '#fff4e4', text: '#d5bc4c' },
  '3ème': { bg: '#f0f4ff', text: '#3b5bdb' },
}

function ClasseCard({
  classe,
  isSelected,
  onSelect,
}: {
  classe:     ClasseApi
  isSelected: boolean
  onSelect:   () => void
}) {
  const colors = LEVEL_COLORS[classe.niveau] ?? { bg: '#f3f4f6', text: '#6a7282' }
  return (
    <button
      type="button"
      onClick={onSelect}
      className="relative text-left p-5 rounded-2xl border-2 flex flex-col gap-4 transition-all hover:shadow-sm"
      style={{
        borderColor: isSelected ? 'var(--ocean-blue-500)' : '#e5e7eb',
        background:  isSelected ? 'var(--ocean-blue-50)' : 'white',
      }}
    >
      {isSelected && (
        <div
          className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: 'var(--ocean-blue-500)' }}
        >
          <Check size={12} color="white" strokeWidth={3} />
        </div>
      )}
      <span
        className="self-start px-3 py-1 rounded-lg text-[13px] font-bold"
        style={{ background: colors.bg, color: colors.text }}
      >
        {classe.niveau}
      </span>
      <div className="flex flex-col gap-0.5">
        <span
          className="text-[16px] font-bold leading-tight"
          style={{ color: isSelected ? 'var(--ocean-blue-800)' : '#101828' }}
        >
          {classe.nom}
        </span>
        <span className="text-[12px] text-[#9ca3af]">{classe.annee_scolaire}</span>
      </div>
      <div className="flex items-center gap-1.5 text-[13px] text-[#6a7282] mt-auto">
        <Users size={13} />
        {classe.nb_eleves} élève{classe.nb_eleves > 1 ? 's' : ''}
      </div>
    </button>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function NouvellePlanification() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const routeState = location.state as RouteState | null

  const [dictees,  setDictees]  = useState<DicteeApi[]>([])
  const [classes,  setClasses]  = useState<ClasseApi[]>([])
  const [loading,  setLoading]  = useState(true)

  const [currentStep,      setCurrentStep]      = useState(1)
  const [search,           setSearch]           = useState('')
  const [dicteeId,         setDicteeId]         = useState<number | ''>(routeState?.dicteeId ?? '')
  const [classeId,         setClasseId]         = useState<number | ''>(routeState?.classeId  ?? '')
  const [datePrevue,       setDatePrevue]       = useState('')
  const [typesNeutralises, setTypesNeutralises] = useState<string[]>([])
  const [submitting,       setSubmitting]       = useState(false)

  useEffect(() => {
    Promise.all([getDictees(), getClasses()])
      .then(([d, c]) => { setDictees(d); setClasses(c) })
      .finally(() => setLoading(false))
  }, [])

  const filteredDictees = dictees.filter((d) =>
    d.titre.toLowerCase().includes(search.toLowerCase()) ||
    d.niveau.toLowerCase().includes(search.toLowerCase()) ||
    (d.tag && d.tag.toLowerCase().includes(search.toLowerCase()))
  )

  const selectedDictee = dictees.find((d) => d.id === dicteeId) ?? null
  const selectedClasse = classes.find((c) => c.id === classeId) ?? null
  const canSubmit      = dicteeId !== '' && classeId !== '' && datePrevue !== ''
  const canNext        = currentStep === 1 ? dicteeId !== '' : currentStep === 2 ? classeId !== '' : false

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
    <div className="flex flex-col gap-7">

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
        <h1 className="text-[24px] font-semibold text-[#101828] leading-8">Planifier une dictée</h1>
        <p className="text-[14px] text-[#ff9ad6] mt-0.5">
          {currentStep === 1 && 'Choisissez la dictée à planifier'}
          {currentStep === 2 && 'Choisissez la classe concernée'}
          {currentStep === 3 && 'Définissez la date et les options de correction'}
        </p>
      </div>

      {/* Step bar */}
      <StepBar
        current={currentStep}
        dicteeTitle={selectedDictee?.titre}
        classeNom={selectedClasse?.nom}
      />

      {/* ── Step 1 : Dictée ── */}
      {currentStep === 1 && (
        <div className="flex flex-col gap-4">
          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c4c9d4] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une dictée..."
              className="w-full h-9 pl-8 pr-3 rounded-[8px] bg-white border border-[#e5e7eb] text-[13px] text-[#101828] placeholder:text-[#c4c9d4] focus:outline-none focus:border-[var(--ocean-blue-300)]"
            />
          </div>
          {filteredDictees.length === 0 ? (
            <p className="text-[14px] text-[#9ca3af] py-10 text-center">Aucune dictée trouvée</p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filteredDictees.map((d) => (
                <DicteeCard
                  key={d.id}
                  dictee={d}
                  isSelected={dicteeId === d.id}
                  onSelect={() => setDicteeId(d.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Step 2 : Classe ── */}
      {currentStep === 2 && (
        <div className="grid grid-cols-3 gap-4">
          {classes.map((c) => (
            <ClasseCard
              key={c.id}
              classe={c}
              isSelected={classeId === c.id}
              onSelect={() => setClasseId(c.id)}
            />
          ))}
        </div>
      )}

      {/* ── Step 3 : Date & Options ── */}
      {currentStep === 3 && (
        <div className="flex gap-8 items-start">

          {/* Date */}
          <div className="flex-1 bg-white border border-[#e5e7eb] rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#9ca3af]" />
              <span className="text-[13px] font-semibold text-[#6a7282] uppercase tracking-wider">Date</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {DATE_SHORTCUTS.map(({ label, days }) => {
                const value    = todayPlus(days)
                const isActive = datePrevue === value
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setDatePrevue(value)}
                    className="px-4 py-2 rounded-[8px] border text-[13px] font-medium transition-all"
                    style={{
                      borderColor: isActive ? 'var(--ocean-blue-500)' : '#e5e7eb',
                      background:  isActive ? 'var(--ocean-blue-50)' : 'white',
                      color:       isActive ? 'var(--ocean-blue-600)' : '#364153',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="date-prevue" className="text-[13px] font-medium text-[#6a7282]">
                Ou choisir une date précise
              </label>
              <input
                id="date-prevue"
                type="date"
                value={datePrevue}
                onChange={(e) => setDatePrevue(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="h-10 px-3 rounded-[8px] bg-[#f7f7f8] border border-[#e5e7eb] text-[14px] text-[#101828] focus:outline-none focus:border-[var(--ocean-blue-300)] w-full"
              />
            </div>
            {datePrevue && (
              <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#16a34a]">
                <Check size={14} strokeWidth={3} />
                {formatDateFr(datePrevue)}
              </div>
            )}
          </div>

          {/* Neutralisation */}
          <div className="flex-1 bg-white border border-[#e5e7eb] rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-[#9ca3af]" />
              <span className="text-[13px] font-semibold text-[#6a7282] uppercase tracking-wider">Neutralisation</span>
              <span className="ml-auto text-[11px] text-[#c4c9d4] font-medium">Optionnel</span>
            </div>
            <p className="text-[13px] text-[#9ca3af]">
              Types d'erreur à ne pas comptabiliser dans la note finale.
            </p>
            <ErrorTypeToggles selected={typesNeutralises} onChange={setTypesNeutralises} />
          </div>
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between pt-2">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={() => setCurrentStep((s) => s - 1)}
            className="flex items-center gap-1.5 text-[14px] font-medium text-[#6a7282] hover:text-[#364153] transition-colors"
          >
            <ArrowLeft size={16} />
            Retour
          </button>
        ) : (
          <span />
        )}

        {currentStep < 3 ? (
          <button
            type="button"
            onClick={() => setCurrentStep((s) => s + 1)}
            disabled={!canNext}
            className="flex items-center gap-2 h-10 px-6 rounded-[10px] text-[14px] font-semibold text-white transition-all"
            style={{
              background: canNext ? 'var(--ocean-blue-500)' : 'var(--ocean-blue-200)',
              cursor:     canNext ? 'pointer' : 'not-allowed',
            }}
          >
            Suivant
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="flex items-center gap-2 h-10 px-6 rounded-[10px] text-[14px] font-semibold text-white transition-all"
            style={{
              background: canSubmit && !submitting ? '#16a34a' : '#86efac',
              cursor:     canSubmit && !submitting ? 'pointer' : 'not-allowed',
            }}
          >
            <Check size={16} strokeWidth={3} />
            {submitting ? 'Enregistrement...' : 'Planifier'}
          </button>
        )}
      </div>

    </div>
  )
}
