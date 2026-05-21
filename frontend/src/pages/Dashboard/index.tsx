import { useNavigate } from 'react-router-dom'
import Typography from '../../components/Typography'

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Typography variant="h1">Tableau de bord</Typography>
        <Typography variant="subtitle">Vue d'ensemble de votre activité d'enseignement</Typography>
      </div>
      {/* TODO: bouton temporaire */}
      <button
        type="button"
        onClick={() => navigate('/correction')}
        className="self-start bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
      >
        Aller à la correction (temp)
      </button>
    </div>
  )
}
