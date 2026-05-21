import { Check, ArrowRight } from 'lucide-react'
import { STEPS } from '../constants'

export default function Stepper({ activeStep }: { activeStep: number }) {
  return (
    <div className="flex items-center gap-2 sm:gap-4">
      {STEPS.map((step, i) => {
        const done = i < activeStep
        const active = i === activeStep
        return (
          <div key={step} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className={`size-7 sm:size-8 rounded-full flex items-center justify-center text-[13px] sm:text-[14px] font-semibold ${done ? 'bg-[#00a63e]' : active ? 'bg-(--ocean-blue-500) text-white' : 'bg-[#e5e7eb] text-[#4a5565]'}`}>
                {done ? <Check size={14} className="text-white" /> : i + 1}
              </div>
              <span className={`hidden sm:inline text-[14px] font-medium ${done ? 'text-[#00a63e]' : active ? 'text-(--ocean-blue-500)' : 'text-[#99a1af]'}`}>
                {step}
              </span>
              <span className={`sm:hidden text-[12px] font-medium ${done ? 'text-[#00a63e]' : active ? 'text-(--ocean-blue-500)' : 'text-[#99a1af]'}`}>
                {step.slice(0, 4)}
              </span>
            </div>
            {i < STEPS.length - 1 && <ArrowRight size={14} className="text-[#d1d5dc]" />}
          </div>
        )
      })}
    </div>
  )
}
