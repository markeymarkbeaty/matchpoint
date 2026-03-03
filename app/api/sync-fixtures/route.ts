import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const secret = new URL(request.url).searchParams.get('secret')

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const apiKey = process.env.API_SPORTS_KEY

    const response = await fetch(
      'https://v3.football.api-sports.io/fixtures?league=254&season=2024',
      {
        headers: {
          'x-apisports-key': apiKey!,
        },
      }
    )

    const data = await response.json()

    if (!data.response) {
      return NextResponse.json({ error: data.errors || 'API failed' })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    let inserted = 0

    for (const fixture of data.response) {
      const matchId = fixture.fixture.id

      const { data: existingRows, error: selectError } = await supabase
        .from('matches')
        .select('id')
        .eq('external_id', matchId)

      if (selectError) {
        console.log('Select error:', selectError)
        continue
      }

      if (!existingRows || existingRows.length === 0) {
        const { error: insertError } = await supabase.from('matches').insert({
          external_id: matchId,
          date: fixture.fixture.date,
          home_team: fixture.teams.home.name,
          away_team: fixture.teams.away.name,
          result:
            fixture.fixture.status.short === 'FT'
              ? `${fixture.goals.home}-${fixture.goals.away}`
              : null,
        })

        if (insertError) {
          console.log('Insert error:', insertError)
        } else {
          inserted++
        }
      }
    }

    console.log('Inserted matches:', inserted)

    return NextResponse.json({ success: true, inserted })
  } catch (err) {
    console.error('Fatal error:', err)
    return NextResponse.json({ error: 'Server crashed' })
  }
}