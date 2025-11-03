'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { ChevronDown, User } from 'lucide-react'

interface Coach {
  id: string
  name: string | null
  email: string | null
}

interface CoachAssignmentProps {
  userId: string
  initialCoachId?: string | null
  coaches: Coach[]
  onUpdate: (coachId: string | null) => void
}

export function CoachAssignment({
  userId,
  initialCoachId,
  coaches,
  onUpdate
}: CoachAssignmentProps) {
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Set the initially selected coach when coaches data or initialCoachId changes
  useEffect(() => {
    if (initialCoachId && coaches.length > 0) {
      const coach = coaches.find(c => c.id === initialCoachId)
      setSelectedCoach(coach || null)
    } else {
      setSelectedCoach(null)
    }
  }, [initialCoachId, coaches])

  const handleCoachSelect = async (coach: Coach | null) => {
    setSelectedCoach(coach)
    setIsLoading(true)

    try {
      const response = await fetch('/api/clients/assign-coach', {
        method: 'PUT',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          userId,
          coachId: coach?.id || null
        })
      })

      const data = await response.json()

      if (data.success) {
        onUpdate(coach?.id || null)
      } else {
        console.error('Failed to assign coach:', data.error)
        // Revert the selection on error
        setSelectedCoach(
          initialCoachId
            ? coaches.find(c => c.id === initialCoachId) || null
            : null
        )
      }
    } catch (error) {
      console.error('Error updating coach assignment:', error)
      // Revert the selection on error
      setSelectedCoach(
        initialCoachId
          ? coaches.find(c => c.id === initialCoachId) || null
          : null
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (coaches.length === 0) {
    return (
      <div className='flex items-center gap-2'>
        <span className='text-sm text-muted-foreground'>
          No coaches available
        </span>
      </div>
    )
  }

  return (
    <div className='flex items-center gap-2'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
            size='sm'
            disabled={isLoading}
            className='h-8 min-w-[120px] justify-between'
          >
            <div className='flex items-center gap-2'>
              <User className='h-3 w-3' />
              <span className='text-sm'>
                {selectedCoach
                  ? selectedCoach.name || 'Unnamed Coach'
                  : 'Select Coach'}
              </span>
            </div>
            <ChevronDown className='h-3 w-3' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start' className='w-56'>
          <DropdownMenuItem onClick={() => handleCoachSelect(null)}>
            <span className='text-sm text-muted-foreground'>
              No Coach Assigned
            </span>
          </DropdownMenuItem>
          {coaches.map(coach => (
            <DropdownMenuItem
              key={coach.id}
              onClick={() => handleCoachSelect(coach)}
              className={selectedCoach?.id === coach.id ? 'bg-accent' : ''}
            >
              <div className='flex flex-col'>
                <span className='text-sm font-medium'>
                  {coach.name || 'Unnamed Coach'}
                </span>
                {coach.email && (
                  <span className='text-xs text-muted-foreground'>
                    {coach.email}
                  </span>
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
