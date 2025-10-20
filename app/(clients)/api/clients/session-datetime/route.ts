import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/connection';
import { userSessionFormProgress } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PUT(request: NextRequest) {
  try {
    const { userId, sessionDatetime } = await request.json();

    if (!userId || !sessionDatetime) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID and session datetime are required',
        },
        { status: 400 }
      );
    }

    // First, get the existing insights data to preserve other keys
    const existingForm = await db
      .select({ insights: userSessionFormProgress.insights })
      .from(userSessionFormProgress)
      .where(
        and(
          eq(userSessionFormProgress.userId, userId),
          eq(userSessionFormProgress.formId, 'schedule-call'),
          eq(userSessionFormProgress.status, 'pending')
        )
      )
      .limit(1);

    if (existingForm.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No pending schedule-call form found for this user',
        },
        { status: 404 }
      );
    }

    // Merge the new session_datetime with existing insights
    const existingInsights = existingForm[0].insights || {};
    const updatedInsights = {
      ...existingInsights,
      session_datetime: sessionDatetime
    };

    // Update the insights field with the merged data
    const updatedForm = await db
      .update(userSessionFormProgress)
      .set({
        insights: updatedInsights,
        updatedAt: new Date().toISOString(),
      })
      .where(
        and(
          eq(userSessionFormProgress.userId, userId),
          eq(userSessionFormProgress.formId, 'schedule-call'),
          eq(userSessionFormProgress.status, 'pending')
        )
      )
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedForm[0],
    });
  } catch (error) {
    console.error('Error updating session datetime:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update session datetime',
      },
      { status: 500 }
    );
  }
}
