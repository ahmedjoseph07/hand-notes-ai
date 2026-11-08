'use client'

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import type { TooltipProps } from '@/types'

export const TooltipProvider = BaseTooltip.Provider

export function Tooltip({ label, children, side = 'top', disabled }: TooltipProps) {
  if (disabled) return children
  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger render={children} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner side={side} sideOffset={8} className='z-[80]'>
          <BaseTooltip.Popup className='rounded-lg bg-[var(--text-primary)] px-2.5 py-1.5 text-xs font-medium text-white shadow-soft transition-opacity duration-100 data-ending-style:opacity-0 data-starting-style:opacity-0'>
            {label}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  )
}
