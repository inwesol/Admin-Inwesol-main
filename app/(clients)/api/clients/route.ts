import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/connection';
import { users } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Log request for debugging production vs localhost differences
    if (process.env.NODE_ENV === 'production') {
      console.log('[API] GET /api/clients - Request received at:', new Date().toISOString());
    }
    
    // Fetch all users from the database
    const allUsers = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    }).from(users).orderBy(desc(users.createdAt));

    // Log result for debugging
    if (process.env.NODE_ENV === 'production') {
      console.log('[API] GET /api/clients - Returning', allUsers.length, 'users');
    }
    
    const response = NextResponse.json({
      success: true,
      data: allUsers,
      count: allUsers.length,
    });
    
    // Set cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error fetching users:', error);
    const errorResponse = NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch users',
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
