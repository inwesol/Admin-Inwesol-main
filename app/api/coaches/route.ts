import { NextResponse } from 'next/server'
import { query } from '@/lib/server/db'

async function ensureTable() {
  await query(
    `CREATE TABLE IF NOT EXISTS coaches (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT,
      email TEXT,
      role TEXT,
      data JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )`
  )
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  await ensureTable()
  const res = await query('SELECT * FROM coaches WHERE user_id = $1 ORDER BY created_at DESC', [userId])
  return NextResponse.json(res.rows)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { userId, coaches } = body
  if (!userId || !coaches) return NextResponse.json({ error: 'userId and coaches required' }, { status: 400 })

  await ensureTable()
  const inserted: any[] = []
  for (const p of coaches) {
    const id = String(p.id ?? `${Date.now()}-${Math.floor(Math.random()*10000)}`)
    const name = p.name ?? ''
    const email = p.email ?? ''
    const role = p.role ?? ''
    const data = JSON.stringify(p)
    await query(
      `INSERT INTO coaches(id, user_id, name, email, role, data) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO UPDATE SET data = coaches.data || EXCLUDED.data`,
      [id, userId, name, email, role, data]
    )
    inserted.push({ id, ...p })
  }

  return NextResponse.json({ inserted })
}

export async function PUT(req: Request) {
  const body = await req.json()
  const { userId, coach } = body
  if (!userId || !coach || !coach.id) return NextResponse.json({ error: 'userId and coach with id required' }, { status: 400 })

  await ensureTable()
  const id = String(coach.id)
  const name = coach.name ?? null
  const email = coach.email ?? null
  const role = coach.role ?? null
  const data = JSON.stringify(coach)

  await query(
    `INSERT INTO coaches(id, user_id, name, email, role, data) VALUES($1,$2,$3,$4,$5,$6)
     ON CONFLICT (id) DO UPDATE SET name=COALESCE(EXCLUDED.name, coaches.name), email=COALESCE(EXCLUDED.email, coaches.email), role=COALESCE(EXCLUDED.role, coaches.role), data = coaches.data || EXCLUDED.data`,
    [id, userId, name, email, role, data]
  )

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const id = searchParams.get('id')
  if (!userId || !id) return NextResponse.json({ error: 'userId and id required' }, { status: 400 })

  await ensureTable()
  await query('DELETE FROM coaches WHERE id = $1 AND user_id = $2', [id, userId])
  return NextResponse.json({ ok: true })
}
