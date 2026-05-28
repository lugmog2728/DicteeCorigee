import type { ReactNode } from 'react'
import { Check } from 'lucide-react'

interface StepCardProps {
  step:       number
  title:      string
  children:   ReactNode
  completed?: boolean
}

export default function StepCard({ step, title, children, completed = false }: StepCardProps) {
  return (
    <div
      className="bg-white rounded-[14px] flex flex-col gap-6 overflow-hidden transition-colors"
      style={{ border: `1.5px solid ${completed ? 'var(--ocean-blue-200)' : 'rgba(0,0,0,0.08)'}` }}
    >
      <div className="flex items-center gap-3 px-6 pt-6">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors"
          style={{ background: completed ? '#16a34a' : 'var(--ocean-blue-500)' }}
        >
          {completed
            ? <Check size={14} color="white" strokeWidth={3} />
            : <span className="text-[14px] font-semibold text-white leading-5">{step}</span>
          }
        </div>
        <span className="text-[16px] font-medium text-[#0a0a0a] flex-1">{title}</span>
        {completed && (
          <span className="text-[12px] font-medium text-[#16a34a]">Complété</span>
        )}
      </div>
      <div className="px-6 pb-6 flex flex-col gap-4">
        {children}
      </div>
    </div>
  )
}
