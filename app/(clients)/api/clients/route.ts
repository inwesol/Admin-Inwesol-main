import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/connection';
import { users } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Fetch all users from the database
    const allUsers = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    }).from(users).orderBy(desc(users.createdAt));

    return NextResponse.json({
      success: true,
      data: allUsers,
      count: allUsers.length,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch users',
      },
      { status: 500 }
    );
  }
}
