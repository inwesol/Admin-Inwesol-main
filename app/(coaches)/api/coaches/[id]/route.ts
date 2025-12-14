import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/connection'
import { coaches, users } from '@/lib/db/schema'
import { eq, inArray } from 'drizzle-orm'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const coachId = resolvedParams.id

    // Fetch the coach by ID
    const coach = await db
      .select({
        id: coaches.id,
        name: coaches.name,
        email: coaches.email,
        clients: coaches.clients,
        sessionLinks: coaches.sessionLinks,
        createdAt: coaches.createdAt,
        updatedAt: coaches.updatedAt,
      })
      .from(coaches)
      .where(eq(coaches.id, coachId))
      .limit(1)

    if (!coach || coach.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Coach not found',
        },
        { status: 404 }
      )
    }

    const coachData = coach[0]

    // Fetch client details if clients array exists and is not empty
    let clientDetails: any[] = []
    if (coachData.clients && coachData.clients.length > 0) {
      clientDetails = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(inArray(users.id, coachData.clients))
    }

    const response = NextResponse.json({
      success: true,
      data: {
        ...coachData,
        clientDetails,
      },
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
    console.error('Error fetching coach:', error)
    const errorResponse = NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch coach',
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

