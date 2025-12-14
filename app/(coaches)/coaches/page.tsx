'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { DataTable } from './data-table'
import { createColumns, Coach } from './columns'

const CoachesPage: React.FC = () => {
  const router = useRouter()
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      } else {
        setError(data.error || 'Failed to fetch coaches')
      }
    } catch (err) {
      setError('Failed to fetch coaches')
      console.error('Error fetching coaches:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCoachClick = (coachId: string) => {
    router.push(`/coaches/${coachId}`)
  }

  useEffect(() => {
    fetchCoaches()
  }, [])

  if (loading) {
    return (
      <div className='container mx-auto py-10'>
        <div className='flex h-64 items-center justify-center'>
          <div className='text-lg'>Loading coaches...</div>
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
      <div className='mb-8 flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Coaches</h1>
          <p className='text-muted-foreground'>
            Manage and view all your coaches
          </p>
        </div>
      </div>

      <DataTable columns={createColumns(handleCoachClick)} data={coaches} />
    </div>
  )
}

export default CoachesPage
