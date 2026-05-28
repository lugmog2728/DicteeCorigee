import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Typography from '../../components/Typography'
import CardDictee from './components/CardDictee'
import LibraryFilters from './components/LibraryFilters'
import ModalNouvelleDictee from './components/ModalNouvelleDictee'
import ModalVoirDictee from './components/ModalVoirDictee'
import ModalEditerDictee from './components/ModalEditerDictee'
import Button from '../../components/Button'
import { Plus } from 'lucide-react'
import { getDictees, createDictee, updateDictee } from '../../api/dictees'
import type { DicteeApi, DicteeCreate } from '../../api/dictees'
import type { BadgeVariant } from '../../components/Badge'

function getDicteeBadges(dictee: DicteeApi): { label: string; variant: BadgeVariant }[] {
  const badges: { label: string; variant: BadgeVariant }[] = []
  badges.push({ label: dictee.niveau, variant: 'ocean' })
  badges.push({ label: dictee.periode, variant: 'sand' })
  if (dictee.temps) badges.push({ label: dictee.temps, variant: 'aqua' })
  if (dictee.tag)   badges.push({ label: dictee.tag,   variant: 'purple' })
  return badges
}

function countWords(texte: string): number {
  return texte.trim().split(/\s+/).filter(Boolean).length
}

export default function Library() {
  const navigate = useNavigate()
  const [dictees, setDictees] = useState<DicteeApi[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('Tous niveaux')
  const [period, setPeriod] = useState('Toutes périodes')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDictee, setSelectedDictee] = useState<DicteeApi | null>(null)
  const [dicteeToEdit, setDicteeToEdit] = useState<DicteeApi | null>(null)

  async function fetchDictees() {
    try {
      const data = await getDictees({
        niveau:  level  !== 'Tous niveaux'    ? level  : undefined,
        periode: period !== 'Toutes périodes' ? period : undefined,
      })
      setDictees(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDictees() }, [level, period])

  async function handleCreate(data: DicteeCreate) {
    await createDictee(data)
    await fetchDictees()
  }

  async function handleUpdate(data: DicteeCreate) {
    if (!dicteeToEdit) return
    await updateDictee(dicteeToEdit.id, data)
    await fetchDictees()
  }

  const filtered = dictees.filter(d =>
    d.titre.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Typography variant="h1">Bibliothèque</Typography>
          <Typography variant="subtitle">Gérez vos textes de dictées et planifiez-les pour vos classes</Typography>
        </div>
        <Button
          label="Nouvelle dictée"
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => setIsModalOpen(true)}
        />
      </div>

      {isModalOpen && (
        <ModalNouvelleDictee
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreate}
        />
      )}

      {selectedDictee && (
        <ModalVoirDictee
          title={selectedDictee.titre}
          texte={selectedDictee.texte}
          wordCount={countWords(selectedDictee.texte)}
          badges={getDicteeBadges(selectedDictee)}
          errors={selectedDictee.errors}
          onClose={() => setSelectedDictee(null)}
          onPlan={() => navigate('/planification/nouvelle', { state: { dicteeId: selectedDictee.id } })}
          onEdit={() => { setDicteeToEdit(selectedDictee); setSelectedDictee(null) }}
        />
      )}

      {dicteeToEdit && (
        <ModalEditerDictee
          dictee={dicteeToEdit}
          onClose={() => setDicteeToEdit(null)}
          onSave={handleUpdate}
        />
      )}

      <LibraryFilters
        search={search}
        onSearchChange={setSearch}
        level={level}
        onLevelChange={setLevel}
        period={period}
        onPeriodChange={setPeriod}
      />

      {loading ? (
        <p className="text-sm text-(--text)">Chargement...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((dictee) => (
            <CardDictee
              key={dictee.id}
              title={dictee.titre}
              badges={getDicteeBadges(dictee)}
              wordCount={countWords(dictee.texte)}
              onPlan={() => navigate('/planification/nouvelle', { state: { dicteeId: dictee.id } })}
              onView={() => setSelectedDictee(dictee)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
