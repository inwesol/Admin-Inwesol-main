"use client"
import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'

interface PersonRow {
  id: string
  name: string
  email?: string
  role?: string
  [key: string]: any
}

interface CoachRow {
  id: string
  name: string
  email?: string
  role?: string
  [key: string]: any
}

export default function MappingPage() {
  const { user, isLoaded } = useUser()
  const [people, setPeople] = useState<PersonRow[]>([])
  const [coaches, setCoaches] = useState<CoachRow[]>([])
  const [mappings, setMappings] = useState<Record<string, any>>({})
  const [selectedCoach, setSelectedCoach] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!isLoaded || !user) return
    async function loadAll() {
      setLoading(true)
      try {
        if (!user) {
          setLoading(false)
          return
        }
        const uid = user.id
        const [pRes, cRes, mRes] = await Promise.all([
          fetch(`/api/people?userId=${uid}`),
          fetch(`/api/coaches?userId=${uid}`),
          
          fetch(`/api/mappings?userId=${uid}`)
        ])
        const [pJson, cJson, mJson] = await Promise.all([pRes.json(), cRes.json(), mRes.json()])
        const mappedPeople = Array.isArray(pJson) ? pJson.map((r:any)=>({ id:String(r.id), name: r.name || r.data?.Name || r.data?.name || '', email: r.email || r.data?.Email || r.data?.email || '', role: r.role || r.data?.Role || '' , ...r.data })) : []
        const mappedCoaches = Array.isArray(cJson) ? cJson.map((r:any)=>({ id:String(r.id), name: r.name || r.data?.Name || r.data?.name || '', email: r.email || r.data?.Email || r.data?.email || '', role: r.role || r.data?.Role || '' , ...r.data })) : []
        const mappedMappings: Record<string, any> = {}
        if (Array.isArray(mJson)) {
          for (const m of mJson) mappedMappings[String(m.person_id)] = m
        }

        setPeople(mappedPeople)
        setCoaches(mappedCoaches)
        setMappings(mappedMappings)
        // initialize seen ids to current set so nothing shows as new initially
        setSeenIds(new Set(mappedPeople.map(p=>p.id)))
      } catch (err) {
        console.error('Error loading mapping data', err)
      } finally {
        setLoading(false)
      }
    }
    loadAll()

    // polling every 10s for new people
    const interval = setInterval(async () => {
      if (!user) return
      try {
        const uid = user.id
        const res = await fetch(`/api/people?userId=${uid}`)
        const pJson = await res.json()
        const mappedPeople = Array.isArray(pJson) ? pJson.map((r:any)=>({ id:String(r.id), name: r.name || r.data?.Name || r.data?.name || '', email: r.email || r.data?.Email || r.data?.email || '', role: r.role || r.data?.Role || '' , ...r.data })) : []
        // detect new ids and update people list; new ids will not be in seenIds so will show as "New"
        setPeople(mappedPeople)
      } catch (err) {
        console.warn('Polling failed', err)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [isLoaded, user])

  const handleMap = async (person: PersonRow) => {
    const coachEmail = selectedCoach[person.id]
    if (!coachEmail) {
      alert('Please select a coach')
      return
    }
    try {
      await fetch('/api/mappings', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ userId: user?.id, personId: person.id, coachEmail, personData: person }) })
      // update local mapping state
      setMappings(prev => ({ ...prev, [person.id]: { person_id: person.id, coach_email: coachEmail, person_data: person, mapped_at: new Date().toISOString() } }))
      // mark as seen so New badge disappears
      setSeenIds(prev => {
        const s = new Set(prev)
        s.add(person.id)
        return s
      })
      alert('Mapped successfully')
    } catch (err) {
      console.error('Map failed', err)
      alert('Mapping failed')
    }
  }

  const handleRemap = (personId: string) => {
    // simply allow selecting another coach and pressing Map
    // UI will reuse same Map button
  }

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>Mapping</h1>
      {loading && <p>Loading...</p>}
      {Array.from(seenIds).length < people.length && (
        <div className='mb-4 text-sm text-white bg-red-500 inline-block px-2 py-1 rounded'>
          {people.length - Array.from(seenIds).length} New
        </div>
      )}

      <div className='space-y-4'>
        {people.length === 0 && <p>No people found.</p>}
        {people.map(person => (
          <div key={person.id} className='rounded border p-4 shadow-sm flex items-start justify-between'>
            <div>
              <h3 className='font-medium'>{person.name || 'Unnamed'} {(!seenIds.has(person.id)) && <span className='ml-2 inline-block text-xs bg-yellow-300 px-2 py-0.5 rounded'>New</span>}</h3>
              <p className='text-sm text-gray-600'>{person.email}</p>
              <p className='text-sm text-gray-500'>Role: {person.role || '—'}</p>
              <div className='mt-2'>
                <label className='text-sm mr-2'>Assign coach:</label>
                <select value={selectedCoach[person.id] || ''} onChange={(e)=> setSelectedCoach(prev => ({ ...prev, [person.id]: e.target.value }))} className='border rounded p-1'>
                  <option value=''>Select coach</option>
                  {coaches.map(c => (
                    <option key={c.email || c.id} value={c.email}>{c.name} ({c.email})</option>
                  ))}
                </select>
                <button onClick={()=> handleMap(person)} className='ml-2 rounded bg-blue-600 text-white px-3 py-1'>Map</button>
              </div>
            </div>
            <div className='text-right'>
              {mappings[person.id] ? (
                <div>
                  <p className='text-sm text-gray-700'>Mapped to:</p>
                  <p className='font-medium'>{mappings[person.id].coach_email}</p>
                  <p className='text-xs text-gray-500'>{new Date(mappings[person.id].mapped_at).toLocaleString()}</p>
                </div>
              ) : (
                <div className='text-sm text-gray-500'>Not mapped</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
