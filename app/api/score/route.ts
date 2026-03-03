import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  // 🔒 CRON AUTH CHECK
  const authHeader = req.headers.get('Authorization')

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // 🔐 Service role client (server only)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1️⃣ Get all matches that have a result
  const { data: matches, error: matchError } = await supabase
    .from('matches')
    .select('id, result')
    .not('result', 'is', null)

  if (matchError) {
    return NextResponse.json(
      { error: matchError.message },
      { status: 500 }
    )
  }

  if (!matches || matches.length === 0) {
    return NextResponse.json({
      message: 'No completed matches to score.',
    })
  }

  let totalScored = 0

  // 2️⃣ Loop each completed match
  for (const match of matches) {
    // Get picks for this match that are not yet scored
    const { data: picks, error: pickError } = await supabase
      .from('picks')
      .select('id, selected_team')
      .eq('match_id', match.id)
      .is('scored_at', null)

    if (pickError) continue
    if (!picks || picks.length === 0) continue

    for (const pick of picks) {
      const isCorrect = pick.selected_team === match.result
      const profitLoss = isCorrect ? 1 : -1

      const { error: updateError } = await supabase
        .from('picks')
        .update({
          is_correct: isCorrect,
          profit_loss: profitLoss,
          scored_at: new Date().toISOString(),
        })
        .eq('id', pick.id)

      if (!updateError) totalScored++
    }
  }

  return NextResponse.json({
    success: true,
    picks_scored: totalScored,
  })
}