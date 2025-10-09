import { NextResponse } from 'next/server'
import { query } from '@/lib/server/db'

export async function POST(req: Request) {
  const body = await req.json()
  const { userId, kind, items } = body
  if (!userId || !kind || !items) return NextResponse.json({ error: 'userId, kind and items required' }, { status: 400 })

  const table = kind === 'coaches' ? 'coaches' : 'people'

  await query(
    `CREATE TABLE IF NOT EXISTS ${table} (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT,
      email TEXT,
      role TEXT,
      data JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )`
  )

  for (const p of items) {
    const id = String(p.id ?? `${Date.now()}-${Math.floor(Math.random()*10000)}`)
    const name = p.name ?? ''
    const email = p.email ?? ''
    const role = p.role ?? ''
    const data = JSON.stringify(p)
    await query(
      `INSERT INTO ${table}(id, user_id, name, email, role, data) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO UPDATE SET data = ${table}.data || EXCLUDED.data`,
      [id, userId, name, email, role, data]
    )
  }

  return NextResponse.json({ ok: true })
}
