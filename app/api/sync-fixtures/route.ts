import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function cleanTeamName(name: string) {
  return name.replace(/\sW$/, '')
}

export async function GET() {

  try {

    const res = await fetch(
      'https://v3.football.api-sports.io/fixtures?league=254&season=2026',
      {
        headers: {
          'x-apisports-key': process.env.API_SPORTS_KEY!
        }
      }
    )

    const data = await res.json()

    const fixtures = data.response

    for (const match of fixtures) {

      await supabase.from('matches').upsert({
        external_id: match.fixture.id,
        date: match.fixture.date,
        home_team: cleanTeamName(match.teams.home.name),
        away_team: cleanTeamName(match.teams.away.name),
        home_logo: match.teams.home.logo,
        away_logo: match.teams.away.logo,
        stadium: match.fixture.venue?.name,
        city: match.fixture.venue?.city
      })

    }

    return NextResponse.json({ success: true })

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      { error: 'Fixture sync failed' },
      { status: 500 }
    )

  }

}