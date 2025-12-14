'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Mail, Users, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

interface Coach {
  id: string
  name: string | null
  email: string | null
  clients: string[] | null
  sessionLinks: string | null
  createdAt: string | null
  updatedAt: string | null
}

interface ClientDetail {
  id: string
  name: string | null
  email: string
  createdAt: string | null
}

interface CoachDetail extends Coach {
  clientDetails: ClientDetail[]
}

const CoachDetailPage: React.FC<{ params: Promise<{ id: string }> }> = ({
  params
}) => {
  const router = useRouter()
  const [coach, setCoach] = useState<CoachDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [coachId, setCoachId] = useState<string | null>(null)

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params
      setCoachId(resolved.id)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (!coachId) return

    const fetchCoach = async () => {
      try {
        const response = await fetch(`/api/coaches/${coachId}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        const data = await response.json()

        if (data.success) {
          setCoach(data.data)
        } else {
          setError(data.error || 'Failed to fetch coach')
        }
      } catch (err) {
        setError('Failed to fetch coach')
        console.error('Error fetching coach:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCoach()
  }, [coachId])

  if (loading) {
    return (
      <div className='container mx-auto py-10'>
        <div className='flex h-64 items-center justify-center'>
          <div className='text-lg'>Loading coach details...</div>
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

  if (!coach) {
    return (
      <div className='container mx-auto py-10'>
        <div className='flex h-64 items-center justify-center'>
          <div className='text-lg'>Coach not found</div>
        </div>
      </div>
    )
  }

  // Parse session links if it's a string (could be JSON or comma-separated)
  const parseSessionLinks = (links: string | null): string[] => {
    if (!links) return []
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(links)
      return Array.isArray(parsed) ? parsed : [parsed]
    } catch {
      // If not JSON, treat as comma-separated or single string
      return links
        .split(',')
        .map(link => link.trim())
        .filter(link => link)
    }
  }

  const sessionLinks = parseSessionLinks(coach.sessionLinks)

  return (
    <div className='container mx-auto py-10'>
      <div className='mb-6'>
        <Button
          variant='ghost'
          onClick={() => router.push('/coaches')}
          className='mb-4'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Coaches
        </Button>
        <h1 className='text-3xl font-bold'>{coach.name || 'Coach Details'}</h1>
        <p className='mt-2 text-muted-foreground'>
          View coach information, clients, and session links
        </p>
      </div>

      {/* Coach Information and Session Links */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Users className='h-5 w-5' />
            Coach Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap items-center gap-6'>
            <div className='flex items-center gap-2'>
              <Mail className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium text-muted-foreground'>
                Email:
              </span>
              <span className='text-lg'>{coach.email || 'N/A'}</span>
            </div>
            {sessionLinks.length > 0 && (
              <div className='flex items-center gap-2'>
                <LinkIcon className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium text-muted-foreground'>
                  Session Links:
                </span>
                <div className='flex flex-wrap gap-2'>
                  {sessionLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='break-all text-primary hover:underline'
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Clients Details */}
      <Card className='mt-6'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Users className='h-5 w-5' />
            Clients Details
          </CardTitle>
          <CardDescription>
            List of clients assigned to this coach
          </CardDescription>
        </CardHeader>
        <CardContent>
          {coach.clientDetails && coach.clientDetails.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coach.clientDetails.map(client => (
                  <TableRow key={client.id}>
                    <TableCell className='font-medium'>
                      {client.name || 'N/A'}
                    </TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>
                      <Button
                        variant='ghost'
                        size='sm'
                        // onClick={() => router.push(`/person/${client.id}`)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className='py-8 text-center text-muted-foreground'>
              No clients assigned to this coach
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default CoachDetailPage
