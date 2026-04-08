'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Mail,
  User,
  XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface ClientUser {
  id: string
  name: string | null
  email: string
  image: string | null
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

interface JourneyProgressDetail {
  id: string
  userId: string
  currentSession: number
  completedSessions: unknown
  paymentDone: boolean
  lastActiveDate: string
  createdAt: string
  updatedAt: string
  enableByCoach: unknown
}

interface SessionFormProgressRow {
  id: string
  sessionId: number
  formId: string
  status: string
  completedAt: string | null
  updatedAt: string
  insights: unknown
}

interface DemographicsDetail {
  id: string
  fullName: string | null
  email: string | null
  phoneNumber: string | null
  age: number | null
  gender: string | null
  profession: string | null
  previousCoaching: string | null
  education: string | null
  stressLevel: number | null
  motivation: string | null
  createdAt: string
  updatedAt: string
}

interface AssignedCoachSummary {
  id: string
  name: string | null
  email: string | null
}

interface ClientDetailPayload {
  user: ClientUser
  demographics: DemographicsDetail | null
  assignedCoach: AssignedCoachSummary | null
  journeyProgress: JourneyProgressDetail | null
  sessionFormProgress: SessionFormProgressRow[]
}

function assignedCoachDisplayName(coach: AssignedCoachSummary): string {
  if (coach.name?.trim()) return coach.name.trim()
  if (coach.email?.trim()) return coach.email.trim()
  return coach.id
}

function getClientCoachLoginUrls(): { client: string; coach: string } {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
  const defaultSignIn = base ? `${base}/sign-in` : '/sign-in'
  return {
    client: process.env.NEXT_PUBLIC_CLIENT_LOGIN_URL?.trim() || defaultSignIn,
    coach: process.env.NEXT_PUBLIC_COACH_LOGIN_URL?.trim() || defaultSignIn
  }
}

function formatDemographicValue(
  value: string | number | null | undefined
): string {
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

function formatInsights(insights: unknown): string {
  if (
    insights == null ||
    (typeof insights === 'object' &&
      Object.keys(insights as object).length === 0)
  ) {
    return '—'
  }
  try {
    return JSON.stringify(insights, null, 2)
  } catch {
    return String(insights)
  }
}

const ClientDetailPage: React.FC<{ params: Promise<{ id: string }> }> = ({
  params
}) => {
  const router = useRouter()
  const [detail, setDetail] = useState<ClientDetailPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [clientId, setClientId] = useState<string | null>(null)
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false)
  const [paymentUpdateError, setPaymentUpdateError] = useState<string | null>(
    null
  )

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params
      setClientId(resolved.id)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (!clientId) return

    const fetchClient = async () => {
      try {
        const response = await fetch(`/api/clients/${clientId}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        const data = await response.json()

        if (data.success) {
          setDetail(data.data)
        } else {
          setError(data.error || 'Failed to fetch client')
        }
      } catch (err) {
        setError('Failed to fetch client')
        console.error('Error fetching client:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchClient()
  }, [clientId])

  if (loading) {
    return (
      <div className='container mx-auto py-10'>
        <div className='flex h-64 items-center justify-center'>
          <div className='text-lg'>Loading client details...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='container mx-auto py-10'>
        <div className='mb-6'>
          <Button
            variant='ghost'
            onClick={() => router.push('/clients')}
            className='mb-4'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Clients
          </Button>
        </div>
        <div className='flex h-64 items-center justify-center'>
          <div className='text-lg text-red-500'>Error: {error}</div>
        </div>
      </div>
    )
  }

  if (!detail) {
    return (
      <div className='container mx-auto py-10'>
        <div className='flex h-64 items-center justify-center'>
          <div className='text-lg'>Client not found</div>
        </div>
      </div>
    )
  }

  const {
    user,
    demographics,
    assignedCoach,
    journeyProgress,
    sessionFormProgress
  } = detail
  const loginUrls = getClientCoachLoginUrls()

  const handleTogglePaymentDone = async () => {
    if (!clientId || !detail?.journeyProgress || isUpdatingPayment) return

    const previousValue = detail.journeyProgress.paymentDone
    const nextValue = !previousValue

    setPaymentUpdateError(null)
    setIsUpdatingPayment(true)
    setDetail(prev =>
      prev?.journeyProgress
        ? {
            ...prev,
            journeyProgress: {
              ...prev.journeyProgress,
              paymentDone: nextValue
            }
          }
        : prev
    )

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentDone: nextValue })
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update payment status')
      }
    } catch (err) {
      setDetail(prev =>
        prev?.journeyProgress
          ? {
              ...prev,
              journeyProgress: {
                ...prev.journeyProgress,
                paymentDone: previousValue
              }
            }
          : prev
      )
      setPaymentUpdateError(
        'Failed to update payment status. Please try again.'
      )
      console.error('Error updating payment status:', err)
    } finally {
      setIsUpdatingPayment(false)
    }
  }

  return (
    <div className='container mx-auto py-10'>
      <div className='mb-6'>
        <Button
          variant='ghost'
          onClick={() => router.push('/clients')}
          className='mb-4'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Clients
        </Button>
        <h1 className='text-3xl font-bold'>{user.name || 'Client details'}</h1>
        <p className='mt-2 text-muted-foreground'>
          Profile, journey progress, and session form activity
        </p>
      </div>

      <Card>
        <CardHeader className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div className='space-y-1.5'>
            <CardTitle className='flex items-center gap-2'>
              <User className='h-5 w-5' />
              Profile
            </CardTitle>
            <CardDescription>
              Account record, demographics form, and portal login links
            </CardDescription>
          </div>
          <div className='flex flex-wrap items-center justify-end gap-4 sm:gap-6'>
            <div className='text-sm'>
              <div className='text-muted-foreground'>Assigned coach</div>
              <div className='font-medium'>
                {assignedCoach ? assignedCoachDisplayName(assignedCoach) : '—'}
              </div>
              {assignedCoach && !assignedCoach.name && !assignedCoach.email && (
                <div className='mt-0.5 text-xs text-muted-foreground'>
                  Coach record not found for this ID
                </div>
              )}
            </div>
            <div className='flex flex-wrap gap-2'>
              <Button variant='outline' size='sm' asChild>
                <a
                  href={loginUrls.client}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1.5'
                >
                  Client login
                  <ExternalLink className='h-3.5 w-3.5 opacity-70' />
                </a>
              </Button>
              {assignedCoach ? (
                <Button variant='outline' size='sm' asChild>
                  <a
                    href={loginUrls.coach}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-1.5'
                  >
                    Coach login
                    <ExternalLink className='h-3.5 w-3.5 opacity-70' />
                  </a>
                </Button>
              ) : (
                <Button
                  variant='outline'
                  size='sm'
                  disabled
                  className='inline-flex items-center gap-1.5'
                >
                  Coach login
                  <ExternalLink className='h-3.5 w-3.5 opacity-70' />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='space-y-3'>
            <h3 className='text-sm font-semibold'>Account</h3>
            <div className='flex flex-wrap items-center gap-2'>
              <Mail className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium text-muted-foreground'>
                Email:
              </span>
              <span>{user.email}</span>
            </div>
            <div className='flex flex-wrap items-center gap-2 text-sm'>
              <span className='font-medium text-muted-foreground'>
                User ID:
              </span>
              <span className='font-mono text-xs'>{user.id}</span>
            </div>
            <div className='flex flex-wrap items-center gap-2 text-sm'>
              <span className='font-medium text-muted-foreground'>
                Email verified:
              </span>
              <Badge variant={user.emailVerified ? 'default' : 'secondary'}>
                {user.emailVerified ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className='flex flex-wrap items-center gap-2 text-sm'>
              <span className='font-medium text-muted-foreground'>
                Created:
              </span>
              <span>
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleString()
                  : 'N/A'}
              </span>
            </div>
            <div className='flex flex-wrap items-center gap-2 text-sm'>
              <span className='font-medium text-muted-foreground'>
                Updated:
              </span>
              <span>
                {user.updatedAt
                  ? new Date(user.updatedAt).toLocaleString()
                  : 'N/A'}
              </span>
            </div>
          </div>

          <div className='border-t pt-6'>
            <h3 className='mb-3 text-sm font-semibold'>
              Demographics details (form)
            </h3>
            {demographics ? (
              <dl className='grid gap-3 text-sm sm:grid-cols-2'>
                <div>
                  <dt className='text-muted-foreground'>Full name</dt>
                  <dd className='font-medium'>
                    {formatDemographicValue(demographics.fullName)}
                  </dd>
                </div>
                <div>
                  <dt className='text-muted-foreground'>Email (form)</dt>
                  <dd className='font-medium'>
                    {formatDemographicValue(demographics.email)}
                  </dd>
                </div>
                <div>
                  <dt className='text-muted-foreground'>Phone</dt>
                  <dd className='font-medium'>
                    {formatDemographicValue(demographics.phoneNumber)}
                  </dd>
                </div>
                <div>
                  <dt className='text-muted-foreground'>Age</dt>
                  <dd className='font-medium'>
                    {formatDemographicValue(demographics.age)}
                  </dd>
                </div>
                <div>
                  <dt className='text-muted-foreground'>Gender</dt>
                  <dd className='font-medium'>
                    {formatDemographicValue(demographics.gender)}
                  </dd>
                </div>
                <div>
                  <dt className='text-muted-foreground'>Profession</dt>
                  <dd className='font-medium'>
                    {formatDemographicValue(demographics.profession)}
                  </dd>
                </div>
                <div>
                  <dt className='text-muted-foreground'>Previous coaching</dt>
                  <dd className='font-medium'>
                    {formatDemographicValue(demographics.previousCoaching)}
                  </dd>
                </div>
                <div>
                  <dt className='text-muted-foreground'>Education</dt>
                  <dd className='font-medium'>
                    {formatDemographicValue(demographics.education)}
                  </dd>
                </div>
                <div>
                  <dt className='text-muted-foreground'>Stress level</dt>
                  <dd className='font-medium'>
                    {formatDemographicValue(demographics.stressLevel)}
                  </dd>
                </div>
                <div className='sm:col-span-2'>
                  <dt className='text-muted-foreground'>Motivation</dt>
                  <dd className='mt-1 whitespace-pre-wrap font-medium'>
                    {formatDemographicValue(demographics.motivation)}
                  </dd>
                </div>
                <div>
                  <dt className='text-muted-foreground'>Form created</dt>
                  <dd className='font-medium'>
                    {demographics.createdAt
                      ? new Date(demographics.createdAt).toLocaleString()
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt className='text-muted-foreground'>Form updated</dt>
                  <dd className='font-medium'>
                    {demographics.updatedAt
                      ? new Date(demographics.updatedAt).toLocaleString()
                      : '—'}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className='text-sm text-muted-foreground'>
                No demographics details form has been submitted for this client
                yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className='mt-6'>
        <CardHeader>
          <CardTitle>Journey progress</CardTitle>
          <CardDescription>
            Current journey state for this client
          </CardDescription>
        </CardHeader>
        <CardContent>
          {journeyProgress ? (
            <div className='grid gap-3 text-sm sm:grid-cols-2'>
              <div>
                <span className='text-muted-foreground'>Current session</span>
                <p className='font-medium'>
                  Session {journeyProgress.currentSession + 1}
                </p>
              </div>
              <div>
                <span className='text-muted-foreground'>Payment status</span>
                <div className='mt-1'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={handleTogglePaymentDone}
                    disabled={isUpdatingPayment}
                    className={`h-8 gap-1.5 ${
                      journeyProgress.paymentDone
                        ? 'border-green-600 text-green-600 hover:border-green-600 hover:bg-green-300/20 hover:text-green-600'
                        : 'border-red-600 text-red-600 hover:border-red-700 hover:bg-red-300/20 hover:text-red-600'
                    }`}
                  >
                    {journeyProgress.paymentDone ? (
                      <CheckCircle2 className='h-4 w-4 text-green-600' />
                    ) : (
                      <XCircle className='h-4 w-4 text-red-600' />
                    )}
                    <span>
                      {journeyProgress.paymentDone ? 'Done' : 'Pending'}
                    </span>
                  </Button>
                </div>
              </div>
              <div>
                <span className='text-muted-foreground'>Last active</span>
                <p className='font-medium'>{journeyProgress.lastActiveDate}</p>
              </div>
            </div>
          ) : (
            <p className='text-sm text-muted-foreground'>
              No journey progress record for this user yet.
            </p>
          )}
          {paymentUpdateError && (
            <p className='mt-3 text-sm text-red-500'>{paymentUpdateError}</p>
          )}
        </CardContent>
      </Card>

      <Card className='mt-6'>
        <CardHeader>
          <CardTitle>Session form progress</CardTitle>
          <CardDescription>
            Recent form submissions and statuses (newest first)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessionFormProgress.length > 0 ? (
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session</TableHead>
                    <TableHead>Form</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className='min-w-[200px]'>Insights</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessionFormProgress.map(row => (
                    <TableRow key={row.id}>
                      <TableCell>{row.sessionId}</TableCell>
                      <TableCell className='font-mono text-xs'>
                        {row.formId}
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline'>{row.status}</Badge>
                      </TableCell>
                      <TableCell className='whitespace-nowrap text-xs text-muted-foreground'>
                        {row.updatedAt
                          ? new Date(row.updatedAt).toLocaleString()
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <pre className='max-h-32 max-w-md overflow-auto rounded bg-muted/50 p-2 text-xs'>
                          {formatInsights(row.insights)}
                        </pre>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className='text-sm text-muted-foreground'>
              No session form progress rows yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ClientDetailPage
