import { useState, useEffect } from 'react'
import Typography from '../../components/Typography'
import StatCard from '../../components/StatCard'
import CardDictee from './components/CardDictee'
import LibraryFilters from './components/LibraryFilters'
import ModalNouvelleDictee from './components/ModalNouvelleDictee'
import ModalVoirDictee from './components/ModalVoirDictee'
import Button from '../../components/Button'
import { BookOpen, CheckCircle, Clock, Plus, Users } from 'lucide-react'
import { getDictees, createDictee } from '../../api/dictees'
import type { DicteeApi, DicteeCreate } from '../../api/dictees'
import type { BadgeVariant } from '../../components/Badge'

function getDicteeBadges(dictee: DicteeApi): { label: string; variant: BadgeVariant }[] {
  const badges: { label: string; variant: BadgeVariant }[] = []
  badges.push({ label: dictee.niveau, variant: 'ocean' })
  badges.push({ label: dictee.periode, variant: dictee.periode === 'Passé' ? 'sand' : 'aqua' })
  if (dictee.tag) badges.push({ label: dictee.tag, variant: 'purple' })
  return badges
}

function countWords(texte: string): number {
  return texte.trim().split(/\s+/).filter(Boolean).length
}

export default function Library() {
  const [dictees, setDictees] = useState<DicteeApi[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('Tous niveaux')
  const [period, setPeriod] = useState('Toutes périodes')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDictee, setSelectedDictee] = useState<DicteeApi | null>(null)

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

  const filtered = dictees.filter(d =>
    d.titre.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
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
          description={selectedDictee.description ?? ''}
          texte={selectedDictee.texte}
          wordCount={countWords(selectedDictee.texte)}
          duration={selectedDictee.duree}
          badges={getDicteeBadges(selectedDictee)}
          errors={selectedDictee.errors}
          onClose={() => setSelectedDictee(null)}
          onPlan={() => setSelectedDictee(null)}
        />
      )}

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Total dictées"
          value={dictees.length}
          subtitle="Textes disponibles"
          icon={BookOpen}
          iconBg="var(--aqua-mist-100)"
          iconColor="var(--aqua-mist-700)"
        />
        <StatCard
          title="Publiées"
          value={dictees.length}
          subtitle="Accessibles aux classes"
          icon={CheckCircle}
          iconBg="var(--soft-blush-500)"
          iconColor="var(--sunlight-sand-900)"
        />
        <StatCard
          title="En attente"
          value={0}
          subtitle="Brouillons non publiés"
          icon={Clock}
          iconBg="var(--sunlight-sand-100)"
          iconColor="var(--sunlight-sand-900)"
        />
        <StatCard
          title="Classes assignées"
          value={3}
          subtitle="Utilisant la bibliothèque"
          icon={Users}
          iconBg="var(--electric-pink-100)"
          iconColor="var(--electric-pink-700)"
        />
      </div>

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
        <div className="grid grid-cols-4 gap-4">
          {filtered.map((dictee) => (
            <CardDictee
              key={dictee.id}
              title={dictee.titre}
              description={dictee.description ?? ''}
              badges={getDicteeBadges(dictee)}
              wordCount={countWords(dictee.texte)}
              duration={dictee.duree}
              onPlan={() => {}}
              onView={() => setSelectedDictee(dictee)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
