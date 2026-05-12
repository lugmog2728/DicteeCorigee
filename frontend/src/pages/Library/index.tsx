import { useState } from 'react'
import Typography from '../../components/Typography'
import StatCard from '../../components/StatCard'
import CardDictee from './components/CardDictee'
import LibraryFilters from './components/LibraryFilters'
import ModalNouvelleDictee from './components/ModalNouvelleDictee'
import ModalVoirDictee from './components/ModalVoirDictee'
import Button from '../../components/Button'
import { BookOpen, CheckCircle, Clock, Plus, Users } from 'lucide-react'
import type { BadgeVariant } from '../../components/Badge'

interface Dictee {
  title: string
  description: string
  texte: string
  badges: { label: string; variant: BadgeVariant }[]
  wordCount: number
  duration: number
}

const dictees: Dictee[] = [
  {
    title: 'Le printemps',
    description: 'Dictée simple sur le printemps avec des verbes au présent',
    texte: "Le printemps arrive avec les beaux jours. Les fleurs poussent dans le jardin. Les oiseaux chantent dans les arbres. Les enfants jouent dehors après l'école.",
    badges: [
      { label: 'CE1', variant: 'ocean' as const },
      { label: 'Présent', variant: 'aqua' as const },
      { label: 'Nature', variant: 'purple' as const },
    ],
    wordCount: 28,
    duration: 15,
  },
  {
    title: 'La forêt en hiver',
    description: 'Texte descriptif sur la forêt en hiver, avec des accords complexes',
    texte: "La forêt en hiver est silencieuse et froide. Les arbres ont perdu leurs feuilles. La neige recouvre le sol d'un manteau blanc. Les animaux se cachent dans leurs terriers.",
    badges: [
      { label: 'CE2', variant: 'ocean' as const },
      { label: 'Passé', variant: 'sand' as const },
      { label: 'Nature', variant: 'purple' as const },
    ],
    wordCount: 42,
    duration: 20,
  },
  {
    title: 'La ville de Paris',
    description: 'Dictée sur Paris et ses monuments, vocabulaire de géographie',
    texte: "Paris est la capitale de la France. La tour Eiffel se dresse au bord de la Seine. Des millions de touristes visitent la ville chaque année. Le musée du Louvre abrite de nombreuses œuvres d'art célèbres.",
    badges: [
      { label: 'CM1', variant: 'ocean' as const },
      { label: 'Présent', variant: 'aqua' as const },
      { label: 'Histoire', variant: 'pink' as const },
    ],
    wordCount: 55,
    duration: 25,
  },
  {
    title: 'Les animaux de la ferme',
    description: 'Dictée ludique sur les animaux pour les plus jeunes élèves',
    texte: "À la ferme, il y a des vaches, des moutons et des poules. Le coq chante le matin pour réveiller tout le monde. Les enfants aiment donner à manger aux animaux.",
    badges: [
      { label: 'CP', variant: 'ocean' as const },
      { label: 'Présent', variant: 'aqua' as const },
      { label: 'Nature', variant: 'purple' as const },
    ],
    wordCount: 18,
    duration: 10,
  },
]

export default function Library() {
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('Tous niveaux')
  const [period, setPeriod] = useState('Toutes périodes')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDictee, setSelectedDictee] = useState<Dictee | null>(null)

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
        <ModalNouvelleDictee onClose={() => setIsModalOpen(false)} />
      )}

      {selectedDictee && (
        <ModalVoirDictee
          {...selectedDictee}
          onClose={() => setSelectedDictee(null)}
          onPlan={() => setSelectedDictee(null)}
        />
      )}

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Total dictées"
          value={24}
          subtitle="Textes disponibles"
          icon={BookOpen}
          iconBg="var(--aqua-mist-100)"
          iconColor="var(--aqua-mist-700)"
        />
        <StatCard
          title="Publiées"
          value={18}
          subtitle="Accessibles aux classes"
          icon={CheckCircle}
          iconBg="var(--soft-blush-500)"
          iconColor="var(--sunlight-sand-900)"
        />
        <StatCard
          title="En attente"
          value={6}
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

      <div className="grid grid-cols-4 gap-4">
        {dictees.map((dictee) => (
          <CardDictee
            key={dictee.title}
            {...dictee}
            onPlan={() => {}}
            onView={() => setSelectedDictee(dictee)}
          />
        ))}
      </div>
    </div>
  )
}
