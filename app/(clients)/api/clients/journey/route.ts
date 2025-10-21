import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/connection';
import { users, journeyProgress, userSessionFormProgress } from '@/lib/db/schema';
import { desc, eq, and, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
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

    return NextResponse.json({
      success: true,
      data: journeyClients,
      count: journeyClients.length,
    });
  } catch (error) {
    console.error('Error fetching journey clients:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch journey clients',
      },
      { status: 500 }
    );
  }
}
