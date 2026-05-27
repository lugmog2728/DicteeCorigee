import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import Button from '../../components/Button'
import CardClasse from './components/CardClasse'
import ModalNouvelleClasse from './components/ModalNouvelleClasse'
import { getClasses, createClasse } from '../../api/classes'
import type { ClasseApi, ClasseCreate } from '../../api/classes'
import type { Niveau } from '../../api/dictees'

type ColorVariant = 'aqua' | 'sand' | 'blush' | 'pink'
const COLORS: ColorVariant[] = ['aqua', 'sand', 'blush', 'pink']

export default function Classes() {
  const navigate = useNavigate()
  const [classes, setClasses] = useState<ClasseApi[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  async function fetchClasses() {
    try {
      const data = await getClasses()
      setClasses(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchClasses() }, [])

  async function handleCreate(data: { nom: string; niveau: Niveau }) {
    const payload: ClasseCreate = { nom: data.nom, niveau: data.niveau }
    await createClasse(payload)
    await fetchClasses()
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[24px] font-semibold text-black leading-9">Classes</h1>
          <p className="text-[18px] font-medium text-[#ff9ad6] leading-[27px]">
            Gérez vos classes et suivez leur progression
          </p>
        </div>
        <Button
          label="Ajouter une nouvelle classe"
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => setIsModalOpen(true)}
        />
      </div>

      {isModalOpen && (
        <ModalNouvelleClasse
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreate}
        />
      )}

      {loading ? (
        <p className="text-sm text-(--text)">Chargement...</p>
      ) : classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <p className="text-[16px] font-medium text-[#364153]">Aucune classe pour l'instant</p>
          <p className="text-[14px] text-[#6a7282]">Créez votre première classe pour commencer</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls, i) => (
            <CardClasse
              key={cls.id}
              nom={cls.nom}
              niveau={cls.niveau}
              annee={cls.annee_scolaire}
              nbEleves={cls.nb_eleves}
              moyenne={cls.moyenne}
              colorVariant={COLORS[i % COLORS.length]}
              onClick={() => navigate(`/classes/${cls.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
