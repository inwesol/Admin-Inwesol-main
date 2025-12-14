import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/connection'
import { userSessionFormProgress } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Update session datetime
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const scheduleId = resolvedParams.id
    const { sessionDatetime } = await request.json()

    if (!sessionDatetime) {
      return NextResponse.json(
        {
          success: false,
          error: 'Session datetime is required',
        },
        { status: 400 }
      )
    }

    // Get existing form to preserve insights
    const existingForm = await db
      .select({ insights: userSessionFormProgress.insights })
      .from(userSessionFormProgress)
      .where(eq(userSessionFormProgress.id, scheduleId))
      .limit(1)

    if (existingForm.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Schedule not found',
        },
        { status: 404 }
      )
    }

    // Merge the new session_datetime with existing insights
    const existingInsights = existingForm[0].insights || {}
    const updatedInsights = {
      ...existingInsights,
      session_datetime: sessionDatetime,
    }

    // Update the insights field with the merged data
    const updatedForm = await db
      .update(userSessionFormProgress)
      .set({
        insights: updatedInsights,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(userSessionFormProgress.id, scheduleId))
      .returning()

    const response = NextResponse.json({
      success: true,
      data: updatedForm[0],
    })

    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    )
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    return response
  } catch (error) {
    console.error('Error updating schedule:', error)
    const errorResponse = NextResponse.json(
      {
        success: false,
        error: 'Failed to update schedule',
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

// Delete session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const scheduleId = resolvedParams.id

    // Get existing form to check if it exists
    const existingForm = await db
      .select({ id: userSessionFormProgress.id })
      .from(userSessionFormProgress)
      .where(eq(userSessionFormProgress.id, scheduleId))
      .limit(1)

    if (existingForm.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Schedule not found',
        },
        { status: 404 }
      )
    }

    // Remove session_datetime from insights instead of deleting the entire record
    const existingFormFull = await db
      .select({ insights: userSessionFormProgress.insights })
      .from(userSessionFormProgress)
      .where(eq(userSessionFormProgress.id, scheduleId))
      .limit(1)

    const existingInsights = existingFormFull[0].insights || {}
    const { session_datetime, ...updatedInsights } = existingInsights as any

    // Update the insights field to remove session_datetime
    await db
      .update(userSessionFormProgress)
      .set({
        insights: updatedInsights,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(userSessionFormProgress.id, scheduleId))

    const response = NextResponse.json({
      success: true,
      message: 'Schedule deleted successfully',
    })

    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    )
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    return response
  } catch (error) {
    console.error('Error deleting schedule:', error)
    const errorResponse = NextResponse.json(
      {
        success: false,
        error: 'Failed to delete schedule',
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

