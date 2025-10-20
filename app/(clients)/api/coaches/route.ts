import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/connection';
import { coaches } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Fetch all coaches from the database
    const allCoaches = await db.select({
      id: coaches.id,
      name: coaches.name,
      email: coaches.email,
    }).from(coaches).orderBy(desc(coaches.createdAt));

    return NextResponse.json({
      success: true,
      data: allCoaches,
      count: allCoaches.length,
    });
  } catch (error) {
    console.error('Error fetching coaches:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch coaches',
      },
      { status: 500 }
    );
  }
}
