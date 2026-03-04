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

    // Look back 14 days for completed matches
    const past = new Date()
    past.setDate(past.getDate() - 14)

    const from = formatDate(past)

    const response = await fetch(
      `${API_URL}/fixtures?league=${LEAGUE_ID}&season=${SEASON}&from=${from}&status=FT`,
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

    let updated = 0

    for (const f of fixtures) {
      const fixtureId = f.fixture.id
      const homeGoals = f.goals.home
      const awayGoals = f.goals.away

      let result: 'home' | 'away' | 'draw' | null = null

      if (homeGoals !== null && awayGoals !== null) {
        if (homeGoals > awayGoals) result = 'home'
        else if (awayGoals > homeGoals) result = 'away'
        else result = 'draw'
      }

      // Only update rows where result is currently null
      const { data: existing } = await supabase
        .from('matches')
        .select('result')
        .eq('external_id', fixtureId)
        .single()

      if (existing && existing.result === null) {
        await supabase
          .from('matches')
          .update({ result })
          .eq('external_id', fixtureId)

        updated++
      }
    }

    return NextResponse.json({
      success: true,
      updated,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}