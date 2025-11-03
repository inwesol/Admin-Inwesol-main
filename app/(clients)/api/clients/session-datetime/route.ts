import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/connection';
import { userSessionFormProgress } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(request: NextRequest) {
  try {
    const { userId, sessionDatetime } = await request.json();

    if (!userId || !sessionDatetime) {
      const errorResponse = NextResponse.json(
        {
          success: false,
          error: 'User ID and session datetime are required',
        },
        { status: 400 }
      );
      errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      errorResponse.headers.set('Pragma', 'no-cache');
      errorResponse.headers.set('Expires', '0');
      return errorResponse;
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
      const errorResponse = NextResponse.json(
        {
          success: false,
          error: 'No pending schedule-call form found for this user',
        },
        { status: 404 }
      );
      errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      errorResponse.headers.set('Pragma', 'no-cache');
      errorResponse.headers.set('Expires', '0');
      return errorResponse;
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

    const response = NextResponse.json({
      success: true,
      data: updatedForm[0],
    });
    
    // Set cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error updating session datetime:', error);
    const errorResponse = NextResponse.json(
      {
        success: false,
        error: 'Failed to update session datetime',
      },
      { status: 500 }
    );
    errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    errorResponse.headers.set('Pragma', 'no-cache');
    errorResponse.headers.set('Expires', '0');
    return errorResponse;
  }
}
