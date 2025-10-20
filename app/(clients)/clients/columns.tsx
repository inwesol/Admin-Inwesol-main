'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { EditableSessionDatetime } from '@/components/editable-session-datetime'
import { CoachAssignment } from '@/components/coach-assignment'

interface Coach {
  id: string
  name: string | null
  email: string | null
}

export type Client = {
  id: string
  name: string | null
  email: string
  createdAt: string | null
  currentSession?: number | null
  totalScore?: number | null
  lastActiveDate?: string | null
  hasPendingScheduleCall?: boolean
  sessionDatetime?: string | null
  formStatus?: string | null
  assignedCoachId?: string | null
}

export const createColumns = (
  onUpdate: (userId: string, newValue: string) => void,
  coaches: Coach[],
  onCoachAssign?: (userId: string, coachId: string | null) => void
): ColumnDef<Client>[] => [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => {
      const id = row.getValue('id') as string
      return <div className='text-sm text-muted-foreground'>{id}</div>
    },
    enableHiding: false,
    meta: {
      isHidden: true
    }
  },
  {
    accessorKey: 'name',
    header: 'Client',
    cell: ({ row }) => {
      const name = row.getValue('name') as string
      const email = row.getValue('email') as string
      const hasPending = row.getValue('hasPendingScheduleCall') as boolean

      // Alternative way to access email data
      const emailFromOriginal = (row.original as any)?.email

      return (
        <div className='flex flex-col gap-1'>
          <div className='font-medium'>{name || 'N/A'}</div>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>
              {email || emailFromOriginal || 'N/A'}
            </span>
            {hasPending && (
              <Badge variant='pending' className='text-xs'>
                pending
              </Badge>
            )}
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: 'hasPendingScheduleCall',
    header: 'Has Pending',
    cell: ({ row }) => {
      const hasPending = row.getValue('hasPendingScheduleCall') as boolean
      return <div className='text-sm'>{hasPending ? 'Yes' : 'No'}</div>
    },
    enableHiding: false,
    meta: {
      isHidden: true
    }
  },
  {
    accessorKey: 'currentSession',
    header: 'Current Session',
    cell: ({ row }) => {
      const session = row.getValue('currentSession') as number
      return (
        <div className='text-sm text-muted-foreground'>
          {session !== null && session !== undefined
            ? `Session ${session + 1}`
            : 'N/A'}
        </div>
      )
    }
  },
  {
    accessorKey: 'sessionDatetime',
    header: 'Session Datetime',
    cell: ({ row }) => {
      const sessionDatetime = row.getValue('sessionDatetime') as string
      const hasPending = row.getValue('hasPendingScheduleCall') as boolean
      const userId = row.getValue('id') as string

      if (!hasPending) {
        return <div className='text-sm text-muted-foreground'>N/A</div>
      }

      return (
        <EditableSessionDatetime
          userId={userId}
          initialValue={sessionDatetime}
          onUpdate={newValue => onUpdate(userId, newValue)}
        />
      )
    }
  },
  {
    accessorKey: 'assignedCoachId',
    header: 'Assign Coach',
    cell: ({ row }) => {
      const assignedCoachId = row.getValue('assignedCoachId') as string | null
      const userId = row.getValue('id') as string

      return (
        <CoachAssignment
          userId={userId}
          initialCoachId={assignedCoachId}
          coaches={coaches}
          onUpdate={coachId => {
            if (onCoachAssign) {
              onCoachAssign(userId, coachId)
            }
          }}
        />
      )
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string
      return (
        <div className='text-sm text-muted-foreground'>
          {date ? new Date(date).toLocaleDateString() : 'N/A'}
        </div>
      )
    }
  }
]
