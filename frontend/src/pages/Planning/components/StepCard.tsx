import type { ReactNode } from 'react'

interface StepCardProps {
  step:     number
  title:    string
  children: ReactNode
}

export default function StepCard({ step, title, children }: StepCardProps) {
  return (
    <div className="bg-white border border-black/10 rounded-[14px] flex flex-col gap-6 overflow-hidden">
      <div className="flex items-center gap-2 px-6 pt-6">
        <div className="w-8 h-8 rounded-full bg-[#0091ad] flex items-center justify-center shrink-0">
          <span className="text-[14px] font-semibold text-white leading-5">{step}</span>
        </div>
        <span className="text-[16px] font-medium text-[#0a0a0a]">{title}</span>
      </div>
      <div className="px-6 pb-6 flex flex-col gap-4">
        {children}
      </div>
    </div>
  )
}
