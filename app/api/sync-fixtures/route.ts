import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const API_URL = 'https://v3.football.api-sports.io'
const LEAGUE_ID = 254
const SEASON = 2026

function formatDate(date: Date) {
  return date.toISOString().split('T')[0]
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKey = process.env.API_SPORTS_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 500 })
    }

    const today = new Date()
    const future = new Date()
    future.setDate(today.getDate() + 90)

    const from = formatDate(today)
    const to = formatDate(future)

    const response = await fetch(
      `${API_URL}/fixtures?league=${LEAGUE_ID}&season=${SEASON}&from=${from}&to=${to}`,
      {
        headers: {
          'x-apisports-key': apiKey,
        },
      }
    )

    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json({ error: text }, { status: 500 })
    }

    const json = await response.json()
    const fixtures = json.response || []

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const mapped = fixtures.map((f: any) => ({
      external_id: f.fixture.id,
      date: f.fixture.date,
      home_team: f.teams.home.name,
      away_team: f.teams.away.name,
    }))

    const { error } = await supabase
      .from('matches')
      .upsert(mapped, { onConflict: 'external_id' })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      synced: mapped.length,
      from,
      to,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}