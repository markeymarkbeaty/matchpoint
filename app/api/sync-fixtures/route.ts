import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const API_URL = 'https://v3.football.api-sports.io'
const LEAGUE_ID = 254
const SEASON = 2026

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

    const response = await fetch(
      `${API_URL}/fixtures?league=${LEAGUE_ID}&season=${SEASON}`,
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

    const mapped = fixtures.map((f: any) => {
      const fixtureId = f.fixture.id
      const date = f.fixture.date
      const home = f.teams.home.name
      const away = f.teams.away.name
      const status = f.fixture.status.short
      const homeGoals = f.goals.home
      const awayGoals = f.goals.away

      let result: 'home' | 'away' | 'draw' | null = null

      if (status === 'FT' && homeGoals !== null && awayGoals !== null) {
        if (homeGoals > awayGoals) result = 'home'
        else if (awayGoals > homeGoals) result = 'away'
        else result = 'draw'
      }

      return {
        external_id: fixtureId,
        date,
        home_team: home,
        away_team: away,
        result,
      }
    })

    const { error } = await supabase
      .from('matches')
      .upsert(mapped, { onConflict: 'external_id' })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      synced: mapped.length,
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}