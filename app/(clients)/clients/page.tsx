'use client'

import React, { useEffect, useState } from 'react'
import { DataTable } from './data-table'
import { createColumns, Client } from './columns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Coach {
  id: string
  name: string | null
  email: string | null
}

const ClientsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('journey')
  const [journeyClients, setJourneyClients] = useState<Client[]>([])
  const [allClients, setAllClients] = useState<Client[]>([])
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchJourneyClients = async () => {
    try {
      const response = await fetch('/api/clients/journey', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const data = await response.json()

      if (data.success) {
        setJourneyClients(data.data)
      } else {
        setError(data.error || 'Failed to fetch journey clients')
      }
    } catch (err) {
      setError('Failed to fetch journey clients')
      console.error('Error fetching journey clients:', err)
    }
  }

  const fetchAllClients = async () => {
    try {
      const response = await fetch('/api/clients', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const data = await response.json()

      if (data.success) {
        setAllClients(data.data)
      } else {
        setError(data.error || 'Failed to fetch all clients')
      }
    } catch (err) {
      setError('Failed to fetch all clients')
      console.error('Error fetching all clients:', err)
    }
  }

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
        console.error('Failed to fetch coaches:', data.error)
      }
    } catch (err) {
      console.error('Error fetching coaches:', err)
    }
  }

  const handleSessionDatetimeUpdate = (userId: string, newValue: string) => {
    setJourneyClients(prevClients =>
      prevClients.map(client =>
        client.id === userId ? { ...client, sessionDatetime: newValue } : client
      )
    )
  }

  const handleCoachAssignment = (userId: string, coachId: string | null) => {
    setJourneyClients(prevClients =>
      prevClients.map(client =>
        client.id === userId ? { ...client, assignedCoachId: coachId } : client
      )
    )
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        await Promise.all([
          fetchJourneyClients(),
          fetchAllClients(),
          fetchCoaches()
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className='container mx-auto py-10'>
        <div className='flex h-64 items-center justify-center'>
          <div className='text-lg'>Loading clients...</div>
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
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>Clients</h1>
        <p className='text-muted-foreground'>
          Manage and view all your clients
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='mb-6 grid w-full grid-cols-2'>
          <TabsTrigger value='journey'>
            Journey Clients ({journeyClients.length})
          </TabsTrigger>
          <TabsTrigger value='all'>
            All Clients ({allClients.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value='journey'>
          <DataTable
            key='journey'
            columns={createColumns(
              handleSessionDatetimeUpdate,
              coaches,
              handleCoachAssignment
            )}
            data={journeyClients}
          />
        </TabsContent>

        <TabsContent value='all'>
          <DataTable
            key='all'
            columns={createColumns(
              handleSessionDatetimeUpdate,
              coaches,
              handleCoachAssignment
            )}
            data={allClients}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ClientsPage
