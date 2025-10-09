import { NextResponse } from 'next/server'
import { query } from '@/lib/server/db'

async function ensureTable() {
  await query(
    `CREATE TABLE IF NOT EXISTS mappings (
      mapping_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      person_id TEXT NOT NULL,
      coach_email TEXT NOT NULL,
      person_data JSONB,
      mapped_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )`
  )
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  await ensureTable()
  const res = await query('SELECT * FROM mappings WHERE user_id = $1 ORDER BY mapped_at DESC', [userId])
  return NextResponse.json(res.rows)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { userId, personId, coachEmail, personData } = body
  if (!userId || !personId || !coachEmail) return NextResponse.json({ error: 'userId, personId and coachEmail required' }, { status: 400 })

  await ensureTable()
  const mappingId = String(personId) // use personId as unique mapping key so remapping overwrites

  await query(
    `INSERT INTO mappings(mapping_id, user_id, person_id, coach_email, person_data) VALUES($1,$2,$3,$4,$5)
     ON CONFLICT (mapping_id) DO UPDATE SET coach_email = EXCLUDED.coach_email, person_data = COALESCE(EXCLUDED.person_data, mappings.person_data), mapped_at = now()`,
    [mappingId, userId, personId, coachEmail, JSON.stringify(personData ?? {})]
  )

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const personId = searchParams.get('personId')
  if (!userId || !personId) return NextResponse.json({ error: 'userId and personId required' }, { status: 400 })

  await ensureTable()
  await query('DELETE FROM mappings WHERE mapping_id = $1 AND user_id = $2', [personId, userId])
  return NextResponse.json({ ok: true })
}
