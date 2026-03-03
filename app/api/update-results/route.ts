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

    let updated = 0

    for (const fixture of data.response) {
      if (fixture.fixture.status.short === 'FT') {
        const matchId = fixture.fixture.id
        const finalScore = `${fixture.goals.home}-${fixture.goals.away}`

        const { error } = await supabase
          .from('matches')
          .update({ result: finalScore })
          .eq('external_id', matchId)

        if (!error) {
          updated++
        } else {
          console.log('Update error:', error)
        }
      }
    }

    return NextResponse.json({
      success: true,
      updated,
    })
  } catch (err) {
    console.error('Fatal error:', err)
    return NextResponse.json({ error: 'Server crashed' })
  }
}