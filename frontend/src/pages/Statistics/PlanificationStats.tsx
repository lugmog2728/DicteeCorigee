import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import Typography from '../../components/Typography'
import UnderConstruction from '../../components/UnderConstruction'

export default function PlanificationStats() {
  const { planifId } = useParams<{ planifId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const titre: string = location.state?.titre ?? `Dictée #${planifId}`
  const classe: string = location.state?.classe ?? ''

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
        <Typography variant="h1">Résultats — {titre}</Typography>
        <Typography variant="subtitle">
          {classe ? `Résultats de la classe ${classe}` : 'Résultats et analyse de la dictée'}
        </Typography>
      </div>
      <UnderConstruction pageName={`Résultats · ${titre}`} />
    </div>
  )
}
