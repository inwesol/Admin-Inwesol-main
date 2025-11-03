import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/connection';
import { coaches } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Fetch all coaches from the database
    const allCoaches = await db.select({
      id: coaches.id,
      name: coaches.name,
      email: coaches.email,
    }).from(coaches).orderBy(desc(coaches.createdAt));

    const response = NextResponse.json({
      success: true,
      data: allCoaches,
      count: allCoaches.length,
    });
    
    // Set cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error fetching coaches:', error);
    const errorResponse = NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch coaches',
      },
      { status: 500 }
    );
    errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    errorResponse.headers.set('Pragma', 'no-cache');
    errorResponse.headers.set('Expires', '0');
    return errorResponse;
  }
}
