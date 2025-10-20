import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/connection';
import { coaches, userSessionFormProgress } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PUT(request: NextRequest) {
  let userId: string | undefined;
  let coachId: string | null | undefined;
  
  try {
    const requestBody = await request.json();
    userId = requestBody.userId;
    coachId = requestBody.coachId;
    
    console.log('Coach assignment request:', { userId, coachId });

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    // First, let's test basic database connectivity
    console.log('Testing database connection...');
    const testCoaches = await db.select().from(coaches).limit(1);
    console.log('Coaches available:', testCoaches.length);
    
    const testForms = await db.select().from(userSessionFormProgress).limit(1);
    console.log('Forms available:', testForms.length);

    // If coachId is null, we're unassigning the coach
    if (!coachId) {
      // Get the current coach assignment to remove user from their clients list
      const currentForm = await db
        .select({ 
          insights: userSessionFormProgress.insights
        })
        .from(userSessionFormProgress)
        .where(
          and(
            eq(userSessionFormProgress.userId, userId),
            eq(userSessionFormProgress.formId, 'schedule-call'),
            eq(userSessionFormProgress.status, 'pending')
          )
        )
        .limit(1);

      if (currentForm.length > 0) {
        const currentInsights = (currentForm[0].insights as any) || {};
        const currentCoachId = currentInsights?.assignedCoachId;

        if (currentCoachId) {
          // Remove user from current coach's clients list
          const currentCoach = await db
            .select({ clients: coaches.clients })
            .from(coaches)
            .where(eq(coaches.id, currentCoachId))
            .limit(1);

          if (currentCoach.length > 0) {
            const currentClients = currentCoach[0].clients || [];
            const clientsList = Array.isArray(currentClients) 
              ? currentClients.filter(id => id !== userId) 
              : [];

            await db
              .update(coaches)
              .set({ 
                clients: clientsList,
                updatedAt: new Date().toISOString()
              })
              .where(eq(coaches.id, currentCoachId));
          }
        }

        // Remove assignedCoachId and meeting_link from insights, keep other data
        const updatedInsights = { ...currentInsights };
        delete updatedInsights.assignedCoachId;
        delete updatedInsights.meeting_link;

        // Update the form progress
        await db
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
          );
      }

      return NextResponse.json({
        success: true,
        message: 'Coach unassigned successfully',
      });
    }

    // Get coach details including session_links
    const coach = await db
      .select({ 
        id: coaches.id,
        name: coaches.name,
        email: coaches.email,
        clients: coaches.clients,
        sessionLinks: coaches.sessionLinks
      })
      .from(coaches)
      .where(eq(coaches.id, coachId))
      .limit(1);

    if (coach.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Coach not found',
        },
        { status: 404 }
      );
    }

    const coachData = coach[0];

    // Get current form progress to preserve existing insights
    const currentForm = await db
      .select({ 
        insights: userSessionFormProgress.insights
      })
      .from(userSessionFormProgress)
      .where(
        and(
          eq(userSessionFormProgress.userId, userId),
          eq(userSessionFormProgress.formId, 'schedule-call'),
          eq(userSessionFormProgress.status, 'pending')
        )
      )
      .limit(1);

    if (currentForm.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No pending schedule-call form found for this user',
        },
        { status: 404 }
      );
    }

    const currentInsights = (currentForm[0].insights as any) || {};
    const currentCoachId = currentInsights?.assignedCoachId;

    // If there's a current coach, remove user from their clients list
    if (currentCoachId && currentCoachId !== coachId) {
      const currentCoach = await db
        .select({ clients: coaches.clients })
        .from(coaches)
        .where(eq(coaches.id, currentCoachId))
        .limit(1);

      if (currentCoach.length > 0) {
        const currentClients = currentCoach[0].clients || [];
        const clientsList = Array.isArray(currentClients) 
          ? currentClients.filter(id => id !== userId) 
          : [];

        await db
          .update(coaches)
          .set({ 
            clients: clientsList,
            updatedAt: new Date().toISOString()
          })
          .where(eq(coaches.id, currentCoachId));
      }
    }

    // Add user to new coach's clients list
    const currentClients = coachData.clients || [];
    const clientsList = Array.isArray(currentClients) 
      ? currentClients.filter(id => id !== userId) 
      : [];
    clientsList.push(userId);

    await db
      .update(coaches)
      .set({ 
        clients: clientsList,
        updatedAt: new Date().toISOString()
      })
      .where(eq(coaches.id, coachId));

    // Update insights with new coach assignment and meeting link
    const updatedInsights = {
      ...currentInsights,
      assignedCoachId: coachId,
      meeting_link: coachData.sessionLinks
    };

    // Update the form progress
    const updatedForm = await db
      .update(userSessionFormProgress)
      .set({
        insights: updatedInsights,
        status: 'assigned',
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
      data: {
        coach: {
          id: coachData.id,
          name: coachData.name,
          email: coachData.email
        },
        meetingLink: coachData.sessionLinks,
        formStatus: 'assigned'
      },
    });
  } catch (error) {
    console.error('Error assigning coach:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId,
      coachId
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to assign coach',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
