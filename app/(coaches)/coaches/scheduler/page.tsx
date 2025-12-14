'use client'

import React, { useEffect, useState, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Trash2, Edit2, Calendar } from 'lucide-react'
import type { EventClickArg, EventDropArg } from '@fullcalendar/core'

// Import FullCalendar CSS
// Note: FullCalendar v6 may bundle CSS differently
// If styles don't appear, add to globals.css:
// @import '@fullcalendar/core/index.css';
// @import '@fullcalendar/daygrid/index.css';
// @import '@fullcalendar/timegrid/index.css';

interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  extendedProps: {
    userId: string
    clientName: string | null
    clientEmail: string
    coachName: string | null
    coachEmail: string | null
    coachId: string | null
    status: string
    meetingLink: string | null
    sessionId: number
  }
  color?: string
}

interface Coach {
  id: string
  name: string | null
  email: string | null
}

const CoachesSchedulerPage = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editDateTime, setEditDateTime] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const calendarRef = useRef<FullCalendar>(null)

  // Fetch schedules
  const fetchSchedules = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/coaches/schedules', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const data = await response.json()

      if (data.success) {
        let filteredEvents = data.data as CalendarEvent[]

        // Filter by selected coach if one is selected
        if (selectedCoachId) {
          filteredEvents = filteredEvents.filter(
            event => event.extendedProps.coachId === selectedCoachId
          )
        }

        setEvents(filteredEvents)
      } else {
        setError(data.error || 'Failed to fetch schedules')
      }
    } catch (err) {
      setError('Failed to fetch schedules')
      console.error('Error fetching schedules:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch coaches
  const fetchCoaches = async () => {
    try {
      const response = await fetch('/api/coaches', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const data = await response.json()

      if (data.success) {
        setCoaches(data.data)
      }
    } catch (err) {
      console.error('Error fetching coaches:', err)
    }
  }

  useEffect(() => {
    fetchCoaches()
    fetchSchedules()
  }, [selectedCoachId])

  // Handle event click
  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = events.find(e => e.id === clickInfo.event.id)
    if (event) {
      setSelectedEvent(event)
      setIsEditDialogOpen(true)
      // Format datetime for input
      const date = new Date(event.start)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      setEditDateTime(`${year}-${month}-${day}T${hours}:${minutes}`)
    }
  }

  // Handle event drop (drag and drop)
  const handleEventDrop = async (dropInfo: EventDropArg) => {
    const eventId = dropInfo.event.id
    const newStart = dropInfo.event.start!
    const newEnd =
      dropInfo.event.end || new Date(newStart.getTime() + 60 * 60 * 1000)

    try {
      const response = await fetch(`/api/coaches/schedules/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          sessionDatetime: newStart.toISOString()
        })
      })

      const data = await response.json()

      if (data.success) {
        // Refresh events
        fetchSchedules()
      } else {
        alert('Failed to update schedule: ' + data.error)
        // Revert the change
        dropInfo.revert()
      }
    } catch (err) {
      console.error('Error updating schedule:', err)
      alert('Failed to update schedule')
      dropInfo.revert()
    }
  }

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!selectedEvent || !editDateTime) return

    setIsSaving(true)
    try {
      const localDate = new Date(editDateTime)
      const utcIsoString = localDate.toISOString()

      const response = await fetch(
        `/api/coaches/schedules/${selectedEvent.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          body: JSON.stringify({
            sessionDatetime: utcIsoString
          })
        }
      )

      const data = await response.json()

      if (data.success) {
        setIsEditDialogOpen(false)
        setSelectedEvent(null)
        fetchSchedules()
      } else {
        alert('Failed to update schedule: ' + data.error)
      }
    } catch (err) {
      console.error('Error updating schedule:', err)
      alert('Failed to update schedule')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!selectedEvent) return

    setIsSaving(true)
    try {
      const response = await fetch(
        `/api/coaches/schedules/${selectedEvent.id}`,
        {
          method: 'DELETE',
          headers: {
            'Cache-Control': 'no-cache'
          }
        }
      )

      const data = await response.json()

      if (data.success) {
        setIsDeleteDialogOpen(false)
        setIsEditDialogOpen(false)
        setSelectedEvent(null)
        fetchSchedules()
      } else {
        alert('Failed to delete schedule: ' + data.error)
      }
    } catch (err) {
      console.error('Error deleting schedule:', err)
      alert('Failed to delete schedule')
    } finally {
      setIsSaving(false)
    }
  }

  const selectedCoach = coaches.find(c => c.id === selectedCoachId)

  if (loading && events.length === 0) {
    return (
      <div className='container mx-auto py-10'>
        <div className='flex h-64 items-center justify-center'>
          <div className='text-lg'>Loading schedules...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='container mx-auto py-10'>
        <div className='flex h-64 items-center justify-center'>
          <div className='text-lg text-red-500'>Error: {error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto py-10'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Coach Scheduler</h1>
          <p className='text-muted-foreground'>
            View and manage all coach schedules
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='gap-2'>
              <Calendar className='h-4 w-4' />
              {selectedCoach
                ? selectedCoach.name || selectedCoach.email
                : 'All Coaches'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Filter by Coach</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSelectedCoachId(null)}>
              All Coaches
            </DropdownMenuItem>
            {coaches.map(coach => (
              <DropdownMenuItem
                key={coach.id}
                onClick={() => setSelectedCoachId(coach.id)}
              >
                {coach.name || coach.email}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className='rounded-lg border bg-card p-4'>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView='dayGridMonth'
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          editable={true}
          droppable={true}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          height='auto'
          eventDisplay='block'
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: 'short'
          }}
          slotMinTime='06:00:00'
          slotMaxTime='22:00:00'
          allDaySlot={false}
        />
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
            <DialogDescription>
              Update the session date and time
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className='space-y-4 py-4'>
              <div className='space-y-2'>
                <Label>Client</Label>
                <p className='text-sm font-medium'>
                  {selectedEvent.extendedProps.clientName ||
                    selectedEvent.extendedProps.clientEmail}
                </p>
              </div>
              <div className='space-y-2'>
                <Label>Coach</Label>
                <p className='text-sm font-medium'>
                  {selectedEvent.extendedProps.coachName ||
                    selectedEvent.extendedProps.coachEmail ||
                    'Not assigned'}
                </p>
              </div>
              <div className='space-y-2'>
                <Label>Status</Label>
                <p className='text-sm font-medium'>
                  {selectedEvent.extendedProps.status}
                </p>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='datetime'>Date & Time</Label>
                <Input
                  id='datetime'
                  type='datetime-local'
                  value={editDateTime}
                  onChange={e => setEditDateTime(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter className='gap-2'>
            <Button
              variant='destructive'
              onClick={() => {
                setIsDeleteDialogOpen(true)
              }}
              disabled={isSaving}
            >
              <Trash2 className='mr-2 h-4 w-4' />
              Delete
            </Button>
            <Button
              variant='outline'
              onClick={() => {
                setIsEditDialogOpen(false)
                setSelectedEvent(null)
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isSaving || !editDateTime}
            >
              <Edit2 className='mr-2 h-4 w-4' />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Schedule</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this schedule? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className='py-4'>
              <p className='text-sm'>
                <strong>Client:</strong>{' '}
                {selectedEvent.extendedProps.clientName ||
                  selectedEvent.extendedProps.clientEmail}
              </p>
              <p className='text-sm'>
                <strong>Date:</strong>{' '}
                {new Date(selectedEvent.start).toLocaleString()}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleDelete}
              disabled={isSaving}
            >
              {isSaving ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CoachesSchedulerPage
