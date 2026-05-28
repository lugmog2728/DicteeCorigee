import Typography from '../../components/Typography'
import UnderConstruction from '../../components/UnderConstruction'

export default function Statistics() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Typography variant="h1">Statistiques</Typography>
        <Typography variant="subtitle">Analyses approfondies et insights pédagogiques</Typography>
      </div>
      <UnderConstruction pageName="Statistiques" />
    </div>
  )
}
