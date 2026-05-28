import { useNavigate } from 'react-router-dom'
import { Users } from 'lucide-react'
import type { PlanificationDetail } from '../../../api/planifications'
import StatusBadge from './StatusBadge'
import ProgressionBar from './ProgressionBar'

interface PlanningTableRowProps {
  planif: PlanificationDetail
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function PlanningTableRow({ planif }: PlanningTableRowProps) {
  const navigate = useNavigate()

  function handleAction() {
    if (planif.statut === 'terminee') {
      navigate(`/statistiques/planification/${planif.id}`, {
        state: { titre: planif.dictee_titre, classe: planif.classe_nom },
      })
    } else {
      navigate('/correction', {
        state: {
          planifId:    planif.id,
          classeId:    planif.classe_id,
          dicteeId:    planif.dictee_id,
          nbCorriges:  planif.nb_corriges,
        },
      })
    }
  }

  const actionLabel =
    planif.statut === 'planifiee' ? 'Commencer' :
    planif.statut === 'en_cours'  ? 'Continuer'  :
    'Voir les résultats'

  const actionVariant = planif.statut === 'terminee' ? 'outline' : 'primary'

  return (
    <tr className="border-b border-[#f3f4f6] hover:bg-gray-50 transition-colors">
      {/* Dictée */}
      <td className="px-4 py-3 w-[188px]">
        <div className="flex flex-col gap-1">
          <span className="text-[16px] font-medium text-[#101828] leading-6">
            {planif.dictee_titre}
          </span>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-[8px] border text-[12px] font-medium text-[#0091ad] bg-[#e6f7fa] border-[rgba(0,145,173,0.3)]">
              {planif.dictee_niveau}
            </span>
            {planif.dictee_tag && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-[8px] border text-[12px] font-medium text-[#8200db] bg-[#faf5ff] border-[#e9d4ff]">
                {planif.dictee_tag}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Classe */}
      <td className="px-4 py-3 w-[100px]">
        <div className="flex flex-col gap-1">
          <span className="text-[14px] font-medium text-[#101828]">{planif.classe_nom}</span>
          <div className="flex items-center gap-1 text-[12px] text-[#6a7282]">
            <Users size={12} />
            <span>{planif.nb_eleves} élèves</span>
          </div>
        </div>
      </td>

      {/* Date prévue */}
      <td className="px-4 py-3 w-[120px]">
        <span className="text-[14px] text-[#101828]">{formatDate(planif.date_prevue)}</span>
      </td>

      {/* Progression */}
      <td className="px-4 py-3 w-[116px]">
        <ProgressionBar nbCorriges={planif.nb_corriges} nbEleves={planif.nb_eleves} />
      </td>

      {/* Statut */}
      <td className="px-4 py-3 w-[124px]">
        <StatusBadge statut={planif.statut} />
      </td>

      {/* Actions */}
      <td className="px-6 py-3 w-[149px]">
        <button
          type="button"
          onClick={handleAction}
          className={`w-full h-9 rounded-[8px] px-4 text-[14px] font-medium leading-5 transition-colors ${
            actionVariant === 'primary'
              ? 'bg-[#0091ad] text-white hover:bg-[#007a93]'
              : 'bg-white border border-black/10 text-[#0a0a0a] hover:bg-gray-50'
          }`}
        >
          {actionLabel}
        </button>
      </td>
    </tr>
  )
}
