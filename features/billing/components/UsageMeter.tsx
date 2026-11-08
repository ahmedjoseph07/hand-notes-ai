import { cn } from '@/lib/utils'
import type { UsageMeterValue } from '@/types'

/** "7 of 10 uploads": warns at 80%, full at 100% (UI_ENGINEERING.md #14) */
export function UsageMeter({ label, unit, value, compact }: { label: string; unit: string; value: UsageMeterValue; compact?: boolean }) {
  if (value.limit === null) {
    return (
      <div className='text-xs text-[var(--text-secondary)]'>
        <span className='font-semibold text-[var(--text-primary)]'>{label}:</span> unlimited
      </div>
    )
  }
  const pct = Math.min(100, Math.round((value.used / value.limit) * 100))
  const tone = pct >= 100 ? 'bg-[var(--destructive)]' : pct >= 80 ? 'bg-[var(--warning)]' : 'bg-[var(--success)]'
  return (
    <div className='space-y-1'>
      <div className='flex items-baseline justify-between gap-2 text-xs'>
        <span className='font-semibold text-[var(--text-primary)]'>{label}</span>
        <span className={cn('tabular-nums', pct >= 100 ? 'font-semibold text-[var(--destructive)]' : 'text-[var(--text-secondary)]')}>
          {value.used} / {value.limit} {compact ? '' : unit}
        </span>
      </div>
      <div
        role='meter'
        aria-label={`${label}: ${value.used} of ${value.limit} ${unit} used`}
        aria-valuenow={value.used}
        aria-valuemin={0}
        aria-valuemax={value.limit}
        className='h-1.5 overflow-hidden rounded-full bg-[var(--bg-secondary)]'
      >
        <div className={cn('h-full rounded-full transition-[width]', tone)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
