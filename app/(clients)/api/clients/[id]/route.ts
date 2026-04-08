import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/connection'
import {
  users,
  journeyProgress,
  userSessionFormProgress,
  demographicsDetailsForm,
  coaches
} from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function assignedCoachIdFromInsights(insights: unknown): string | null {
  if (
    insights === null ||
    typeof insights !== 'object' ||
    Array.isArray(insights)
  ) {
    return null
  }
  const raw = (insights as Record<string, unknown>).assignedCoachId
  if (typeof raw === 'string' && raw.trim()) return raw.trim()
  return null
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params

    const userRows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!userRows.length) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }

    const user = userRows[0]

    const demographicsRows = await db
      .select({
        id: demographicsDetailsForm.id,
        fullName: demographicsDetailsForm.full_name,
        email: demographicsDetailsForm.email,
        phoneNumber: demographicsDetailsForm.phone_number,
        age: demographicsDetailsForm.age,
        gender: demographicsDetailsForm.gender,
        profession: demographicsDetailsForm.profession,
        previousCoaching: demographicsDetailsForm.previous_coaching,
        education: demographicsDetailsForm.education,
        stressLevel: demographicsDetailsForm.stress_level,
        motivation: demographicsDetailsForm.motivation,
        createdAt: demographicsDetailsForm.created_at,
        updatedAt: demographicsDetailsForm.updated_at
      })
      .from(demographicsDetailsForm)
      .where(eq(demographicsDetailsForm.user_id, userId))
      .limit(1)

    const progressRows = await db
      .select()
      .from(journeyProgress)
      .where(eq(journeyProgress.userId, userId))
      .limit(1)

    const formRows = await db
      .select({
        id: userSessionFormProgress.id,
        sessionId: userSessionFormProgress.sessionId,
        formId: userSessionFormProgress.formId,
        status: userSessionFormProgress.status,
        score: userSessionFormProgress.score,
        completedAt: userSessionFormProgress.completedAt,
        updatedAt: userSessionFormProgress.updatedAt,
        insights: userSessionFormProgress.insights
      })
      .from(userSessionFormProgress)
      .where(eq(userSessionFormProgress.userId, userId))
      .orderBy(desc(userSessionFormProgress.updatedAt))

    let assignedCoachId: string | null = null
    for (const row of formRows) {
      if (row.formId !== 'schedule-call') continue
      const id = assignedCoachIdFromInsights(row.insights)
      if (id) {
        assignedCoachId = id
        break
      }
    }

    let assignedCoach: {
      id: string
      name: string | null
      email: string | null
    } | null = null

    if (assignedCoachId) {
      const coachRows = await db
        .select({
          id: coaches.id,
          name: coaches.name,
          email: coaches.email
        })
        .from(coaches)
        .where(eq(coaches.id, assignedCoachId))
        .limit(1)

      if (coachRows.length) {
        assignedCoach = coachRows[0]
      } else {
        assignedCoach = {
          id: assignedCoachId,
          name: null,
          email: null
        }
      }
    }

    const response = NextResponse.json({
      success: true,
      data: {
        user,
        demographics: demographicsRows[0] ?? null,
        assignedCoach,
        journeyProgress: progressRows[0] ?? null,
        sessionFormProgress: formRows
      }
    })

    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    )
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    return response
  } catch (error) {
    console.error('Error fetching client:', error)
    const errorResponse = NextResponse.json(
      { success: false, error: 'Failed to fetch client' },
      { status: 500 }
    )
    errorResponse.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    )
    errorResponse.headers.set('Pragma', 'no-cache')
    errorResponse.headers.set('Expires', '0')
    return errorResponse
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params
    const body = await request.json()
    const { paymentDone } = body as { paymentDone?: unknown }

    if (typeof paymentDone !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'paymentDone must be a boolean' },
        { status: 400 }
      )
    }

    const existing = await db
      .select({ id: journeyProgress.id })
      .from(journeyProgress)
      .where(eq(journeyProgress.userId, userId))
      .limit(1)

    if (!existing.length) {
      return NextResponse.json(
        { success: false, error: 'Journey progress not found for this client' },
        { status: 404 }
      )
    }

    const updated = await db
      .update(journeyProgress)
      .set({
        paymentDone,
        updatedAt: new Date().toISOString()
      })
      .where(eq(journeyProgress.userId, userId))
      .returning({
        id: journeyProgress.id,
        paymentDone: journeyProgress.paymentDone,
        updatedAt: journeyProgress.updatedAt
      })

    return NextResponse.json({
      success: true,
      data: updated[0]
    })
  } catch (error) {
    console.error('Error updating client payment status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update payment status' },
      { status: 500 }
    )
  }
}
