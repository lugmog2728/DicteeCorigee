import { useState } from 'react'
import Typography from '../../components/Typography'
import StatCard from '../../components/StatCard'
import CardDictee from './components/CardDictee'
import LibraryFilters from './components/LibraryFilters'
import { BookOpen, CheckCircle, Clock, Users } from 'lucide-react'

const dictees = [
  {
    title: 'Le printemps',
    description: 'Dictée simple sur le printemps avec un vocabulaire adapté au CE2',
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Typography variant="h1">Bibliothèque</Typography>
        <Typography variant="subtitle">Gérez vos textes de dictées et planifiez-les pour vos classes</Typography>
      </div>

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
            onView={() => {}}
          />
        ))}
      </div>
    </div>
  )
}
