'use client'

import type { ComponentProps } from 'react'
import { Tabs as BaseTabs } from '@base-ui/react/tabs'

import { cn } from '@/lib/utils'

export const Tabs = BaseTabs.Root

export function TabsList({ className, ...props }: ComponentProps<typeof BaseTabs.List>) {
  return (
    <BaseTabs.List
      className={cn(
        'relative flex gap-1 overflow-x-auto border-b border-[var(--border-subtle)] [scrollbar-width:none]',
        className as string,
      )}
      {...props}
    />
  )
}

export function TabsTab({ className, ...props }: ComponentProps<typeof BaseTabs.Tab>) {
  return (
    <BaseTabs.Tab
      className={cn(
        '-mb-px inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 border-b-2 border-transparent px-3 text-sm font-medium whitespace-nowrap text-[var(--text-secondary)] outline-none transition-colors hover:text-[var(--text-primary)] focus-visible:bg-[var(--bg-secondary)] data-active:border-[var(--color-brand)] data-active:text-[var(--color-brand)] [&_svg]:size-4',
        className as string,
      )}
      {...props}
    />
  )
}

export function TabsPanel({ className, ...props }: ComponentProps<typeof BaseTabs.Panel>) {
  return <BaseTabs.Panel className={cn('pt-6 outline-none', className as string)} {...props} />
}
