'use client'

import { ColumnDef } from '@tanstack/react-table'

export type Coach = {
  id: string
  name: string | null
  email: string | null
  clients: string[] | null
  createdAt?: string | null
}

export const createColumns = (
  onCoachClick: (coachId: string) => void
): ColumnDef<Coach>[] => [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const name = row.getValue('name') as string | null
      const coach = row.original

      return (
        <div
          className='cursor-pointer font-medium hover:text-primary hover:underline'
          onClick={() => onCoachClick(coach.id)}
        >
          {name || 'N/A'}
        </div>
      )
    }
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => {
      const email = row.getValue('email') as string | null
      return (
        <div className='text-sm text-muted-foreground'>{email || 'N/A'}</div>
      )
    }
  },
  {
    accessorKey: 'clients',
    header: 'Clients Count',
    cell: ({ row }) => {
      const clients = row.getValue('clients') as string[] | null
      const count = clients?.length || 0
      return <div className='text-sm'>{count}</div>
    }
  }
]
