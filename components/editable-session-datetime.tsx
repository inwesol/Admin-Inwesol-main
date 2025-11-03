'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Check, X, Edit3 } from 'lucide-react'

interface EditableSessionDatetimeProps {
  userId: string
  initialValue: string | null
  onUpdate: (newValue: string) => void
}

export function EditableSessionDatetime({
  userId,
  initialValue,
  onUpdate
}: EditableSessionDatetimeProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(() => {
    if (!initialValue) return ''
    try {
      const date = new Date(initialValue)
      // Convert to YYYY-MM-DDTHH:MM format for datetime-local input
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}`
    } catch (error) {
      console.error('Error formatting date for input:', error)
      return initialValue
    }
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    if (!value.trim()) return

    setIsLoading(true)
    try {
      // Convert local datetime to UTC ISO string
      const localDate = new Date(value)
      const utcIsoString = localDate.toISOString()

      const response = await fetch('/api/clients/session-datetime', {
        method: 'PUT',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          userId,
          sessionDatetime: utcIsoString
        })
      })

      const data = await response.json()

      if (data.success) {
        onUpdate(utcIsoString)
        setIsEditing(false)
      } else {
        console.error('Failed to update session datetime:', data.error)
      }
    } catch (error) {
      console.error('Error updating session datetime:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (!initialValue) {
      setValue('')
    } else {
      try {
        const date = new Date(initialValue)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        setValue(`${year}-${month}-${day}T${hours}:${minutes}`)
      } catch (error) {
        console.error('Error formatting date for cancel:', error)
        setValue(initialValue)
      }
    }
    setIsEditing(false)
  }

  const formatDateTime = (dateTimeString: string | null) => {
    if (!dateTimeString) return 'N/A'

    try {
      const date = new Date(dateTimeString)
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    } catch (error) {
      console.error('Error formatting date:', error)
      return dateTimeString
    }
  }

  if (!isEditing) {
    return (
      <div className='flex items-center gap-2'>
        <span className='text-sm text-muted-foreground'>
          {formatDateTime(initialValue)}
        </span>
        {initialValue && (
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setIsEditing(true)}
            className='h-6 w-6 p-0'
          >
            <Edit3 className='h-3 w-3' />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className='flex items-center gap-2'>
      <Input
        type='datetime-local'
        value={value}
        onChange={e => setValue(e.target.value)}
        className='h-8 text-sm'
        disabled={isLoading}
      />
      <Button
        variant='ghost'
        size='sm'
        onClick={handleSave}
        disabled={isLoading || !value.trim()}
        className='h-6 w-6 p-0'
      >
        <Check className='h-3 w-3' />
      </Button>
      <Button
        variant='ghost'
        size='sm'
        onClick={handleCancel}
        disabled={isLoading}
        className='h-6 w-6 p-0'
      >
        <X className='h-3 w-3' />
      </Button>
    </div>
  )
}
