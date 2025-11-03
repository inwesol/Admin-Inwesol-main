import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/connection';
import { users, journeyProgress, userSessionFormProgress } from '@/lib/db/schema';
import { desc, eq, and, sql } from 'drizzle-orm';

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Log request for debugging production vs localhost differences
    if (process.env.NODE_ENV === 'production') {
      console.log('[API] GET /api/clients/journey - Request received at:', new Date().toISOString());
    }
    
    // Fetch users who have journey progress records with pending schedule-call info
    const journeyClients = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        sessionId: userSessionFormProgress.sessionId,
        createdAt: users.createdAt,
        currentSession: journeyProgress.currentSession,
        totalScore: journeyProgress.totalScore,
        lastActiveDate: journeyProgress.lastActiveDate,
        hasPendingScheduleCall: sql<boolean>`CASE WHEN ${userSessionFormProgress.formId} = 'schedule-call' AND ${userSessionFormProgress.status} = 'pending' THEN true ELSE false END`,
        sessionDatetime: sql<string | null>`CASE WHEN ${userSessionFormProgress.formId} = 'schedule-call' AND ${userSessionFormProgress.status} = 'pending' THEN ${userSessionFormProgress.insights}->>'session_datetime' ELSE NULL END`,
        formStatus: userSessionFormProgress.status,
        assignedCoachId: sql<string | null>`CASE WHEN ${userSessionFormProgress.insights}->>'assignedCoachId' IS NOT NULL THEN ${userSessionFormProgress.insights}->>'assignedCoachId' ELSE NULL END`,
      })
      .from(users)
      .innerJoin(journeyProgress, eq(users.id, journeyProgress.userId))
      .leftJoin(
        userSessionFormProgress,
        and(
          eq(users.id, userSessionFormProgress.userId),
          eq(userSessionFormProgress.formId, 'schedule-call'),
          eq(userSessionFormProgress.status, 'pending')
        )
      )
      .orderBy(
        sql`CASE WHEN ${userSessionFormProgress.formId} = 'schedule-call' AND ${userSessionFormProgress.status} = 'pending' THEN 0 ELSE 1 END`,
        sql`CASE WHEN ${userSessionFormProgress.insights}->>'session_datetime' IS NOT NULL THEN ${userSessionFormProgress.insights}->>'session_datetime' ELSE '9999-12-31' END`,
        desc(users.createdAt)
      );

    // Log result for debugging
    if (process.env.NODE_ENV === 'production') {
      console.log('[API] GET /api/clients/journey - Returning', journeyClients.length, 'clients');
    }
    
    const response = NextResponse.json({
      success: true,
      data: journeyClients,
      count: journeyClients.length,
    });
    
    // Set cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error fetching journey clients:', error);
    const errorResponse = NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch journey clients',
      },
      { status: 500 }
    );
    
    // Set cache control headers to prevent caching
    errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    errorResponse.headers.set('Pragma', 'no-cache');
    errorResponse.headers.set('Expires', '0');
    
    return errorResponse;
  }
}
