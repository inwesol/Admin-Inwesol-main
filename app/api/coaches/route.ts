import { NextResponse } from 'next/server'
import { query } from '@/lib/server/db'

async function ensureTable() {
  await query(
    `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE TABLE IF NOT EXISTS coaches (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT,
      email TEXT UNIQUE,
      clients TEXT,
      session_links TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )`
  )
}

export async function GET() {
  await ensureTable()
  const res = await query('SELECT * FROM coaches ORDER BY created_at DESC')
  return NextResponse.json(res.rows)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { coaches } = body
  if (!coaches) return NextResponse.json({ error: 'coaches array is required' }, { status: 400 })

  await ensureTable()
  const inserted: any[] = []
  
  for (const coach of coaches) {
    const { name, email } = coach
    if (!email) continue // Skip if email is missing as it's required and unique
    
    const res = await query(
      `INSERT INTO coaches (name, email) VALUES ($1, $2) 
       ON CONFLICT (email) DO UPDATE 
       SET name = EXCLUDED.name, updated_at = now()
       RETURNING id, name, email, created_at, updated_at`,
      [name, email]
    )
    
    if (res.rows[0]) {
      inserted.push(res.rows[0])
    }
  }

  return NextResponse.json({ inserted })
}

export async function PUT(req: Request) {
  const body = await req.json()
  const { id, name, email } = body
  if (!id) return NextResponse.json({ error: 'Coach id is required' }, { status: 400 })
  if (!name || !email) return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })

  await ensureTable()
  const res = await query(
    `UPDATE coaches 
     SET name = $1, email = $2, updated_at = now() 
     WHERE id = $3::uuid 
     RETURNING id, name, email, created_at, updated_at`,
    [name, email, id]
  )
  
  if (res.rows.length === 0) {
    return NextResponse.json({ error: 'Coach not found' }, { status: 404 })
  }
  
  return NextResponse.json(res.rows[0])
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Coach id is required' }, { status: 400 })

  await ensureTable()
  const res = await query(
    'DELETE FROM coaches WHERE id = $1::uuid RETURNING id', 
    [id]
  )
  
  if (res.rows.length === 0) {
    return NextResponse.json({ error: 'Coach not found' }, { status: 404 })
  }
  
  return NextResponse.json({ success: true })
}
