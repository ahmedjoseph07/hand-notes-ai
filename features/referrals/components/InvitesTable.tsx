'use client'

import { createColumnHelper } from '@tanstack/react-table'

import { DataTable } from '@/components/data-table/DataTable'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Badge } from '@/components/ui/controls'
import { formatDate } from '@/lib/format'
import type { DataTableFeatures, ReferralInvite } from '@/types'

const STATUS = {
  clicked: { label: 'Clicked link', tone: 'neutral' },
  'signed-up': { label: 'Signed up · reward pending', tone: 'warning' },
  subscribed: { label: 'Upgraded · reward earned', tone: 'success' },
} as const

const helper = createColumnHelper<DataTableFeatures, ReferralInvite>()
const columns = helper.columns([
  helper.accessor('email', { header: 'Friend', sortFn: 'text' }),
  helper.accessor('status', {
    header: 'Status',
    cell: ({ getValue }) => <Badge tone={STATUS[getValue()].tone}>{STATUS[getValue()].label}</Badge>,
  }),
  helper.accessor('date', { header: 'Date', sortFn: 'text', cell: ({ getValue }) => formatDate(getValue()) }),
])

export function InvitesTable({ invites }: { invites: ReferralInvite[] }) {
  return (
    <DataTable
      label='Your invites'
      columns={columns}
      data={invites}
      getRowId={(i) => i.id}
      empty={<EmptyState size='compact' title='No invites yet' description='Share your link and friends who join will show up here.' />}
      renderMobileRow={(i) => (
        <div className='flex flex-col gap-2 rounded-[12px] border border-[var(--border-subtle)] bg-white p-4'>
          <span className='font-medium'>{i.email}</span>
          <span className='flex items-center justify-between gap-2 text-sm text-[var(--text-secondary)]'>
            <Badge tone={STATUS[i.status].tone}>{STATUS[i.status].label}</Badge>
            {formatDate(i.date)}
          </span>
        </div>
      )}
    />
  )
}
