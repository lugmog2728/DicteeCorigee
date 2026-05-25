import { BookOpen } from 'lucide-react'
import LoginCard from './LoginCard'

const features = [
  {
    title: 'Système C.H.A.M.P.I.O.N',
    description: "Détection et validation automatique des codes d'erreur",
  },
  {
    title: 'Suivi Multi-Classes',
    description: 'Gérez plusieurs classes et élèves en un seul endroit',
  },
  {
    title: 'Analyses Complètes',
    description: 'Tableaux de bord et statistiques détaillées',
  },
]

export default function Login() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          'linear-gradient(147.97deg, rgb(230,247,250) 0%, rgb(255,255,255) 50%, rgb(230,247,250) 100%)',
      }}
    >
      <div className="w-full max-w-[1100px] flex items-center justify-between gap-12 py-16">
        <div className="flex flex-col gap-6 max-w-[456px] shrink-0 hidden lg:flex">
          <div className="flex flex-col gap-4">
            <div className="bg-[#0091ad] rounded-[16px] size-[80px] flex items-center justify-center shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] shrink-0">
              <BookOpen size={40} className="text-white" />
            </div>
            <div>
              <h1 className="text-[36px] font-semibold text-[#101828] leading-10">
                DictéeCorrige
              </h1>
              <p className="text-[18px] text-[#4a5565] leading-7 mt-2 max-w-[429px]">
                La plateforme professionnelle pour gérer la correction de dictées et le suivi des performances de vos élèves.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-2">
            {features.map((feature) => (
              <FeatureBullet key={feature.title} {...feature} />
            ))}
          </div>
        </div>

        <div className="flex-1 flex justify-center lg:justify-end">
          <LoginCard />
        </div>
      </div>
    </div>
  )
}

function FeatureBullet({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="bg-[rgba(0,145,173,0.1)] rounded-[10px] size-8 flex items-center justify-center shrink-0">
        <div className="bg-[#0091ad] rounded-full size-2" />
      </div>
      <div>
        <p className="text-[18px] font-medium text-[#101828] leading-[27px]">{title}</p>
        <p className="text-[14px] text-[#4a5565] leading-5">{description}</p>
      </div>
    </div>
  )
}
