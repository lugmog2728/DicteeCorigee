import Typography from '../../components/Typography'
import UnderConstruction from '../../components/UnderConstruction'

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Typography variant="h1">Tableau de bord</Typography>
        <Typography variant="subtitle">Vue d'ensemble de votre activité d'enseignement</Typography>
      </div>
      <UnderConstruction pageName="Tableau de bord" />
    </div>
  )
}
