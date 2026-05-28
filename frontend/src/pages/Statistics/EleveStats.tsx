import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import Typography from '../../components/Typography'
import UnderConstruction from '../../components/UnderConstruction'

export default function EleveStats() {
  const { eleveId } = useParams<{ eleveId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const nom: string = location.state?.nom ?? `Élève #${eleveId}`

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[14px] text-[#6a7282] hover:text-[#0a0a0a] transition-colors mb-2 w-fit"
        >
          <ChevronLeft size={16} />
          Retour
        </button>
        <Typography variant="h1">Statistiques — {nom}</Typography>
        <Typography variant="subtitle">Historique et progression individuelle</Typography>
      </div>
      <UnderConstruction pageName={`Statistiques · ${nom}`} />
    </div>
  )
}
