import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/connection'
import { users, userSessionFormProgress, coaches } from '@/lib/db/schema'
import { eq, and, sql, isNotNull } from 'drizzle-orm'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    // Fetch all scheduled sessions with all statuses
    const schedules = await db
      .select({
        id: userSessionFormProgress.id,
        userId: userSessionFormProgress.userId,
        sessionId: userSessionFormProgress.sessionId,
        status: userSessionFormProgress.status,
        sessionDatetime: sql<string | null>`${userSessionFormProgress.insights}->>'session_datetime'`,
        assignedCoachId: sql<string | null>`${userSessionFormProgress.insights}->>'assignedCoachId'`,
        meetingLink: sql<string | null>`${userSessionFormProgress.insights}->>'meeting_link'`,
        clientName: users.name,
        clientEmail: users.email,
        coachName: coaches.name,
        coachEmail: coaches.email,
        updatedAt: userSessionFormProgress.updatedAt,
      })
      .from(userSessionFormProgress)
      .innerJoin(users, eq(userSessionFormProgress.userId, users.id))
      .leftJoin(
        coaches,
        sql`${userSessionFormProgress.insights}->>'assignedCoachId' = ${coaches.id}::text`
      )
      .where(
        and(
          eq(userSessionFormProgress.formId, 'schedule-call'),
          sql`${userSessionFormProgress.insights}->>'session_datetime' IS NOT NULL`
        )
      )
      .orderBy(userSessionFormProgress.updatedAt)

    // Transform data for FullCalendar events
    const events = schedules
      .filter((schedule) => schedule.sessionDatetime) // Filter out null datetimes
      .map((schedule) => {
        const date = new Date(schedule.sessionDatetime!)
        return {
          id: schedule.id,
          title: `${schedule.clientName || schedule.clientEmail}${schedule.coachName ? ` - ${schedule.coachName}` : ''}`,
          start: date.toISOString(),
          end: new Date(date.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
          extendedProps: {
            userId: schedule.userId,
            clientName: schedule.clientName,
            clientEmail: schedule.clientEmail,
            coachName: schedule.coachName,
            coachEmail: schedule.coachEmail,
            coachId: schedule.assignedCoachId,
            status: schedule.status,
            meetingLink: schedule.meetingLink,
            sessionId: schedule.sessionId,
          },
          color: schedule.status === 'pending' 
            ? '#3b82f6' // blue
            : schedule.status === 'assigned' 
            ? '#10b981' // green
            : '#6b7280', // gray for completed/cancelled
        }
      })

    const response = NextResponse.json({
      success: true,
      data: events,
      count: events.length,
    })

    // Set cache control headers to prevent caching
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    )
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    return response
  } catch (error) {
    console.error('Error fetching schedules:', error)
    const errorResponse = NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch schedules',
      },
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

