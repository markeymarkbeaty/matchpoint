import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const authHeader = req.headers.get('Authorization')

  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.replace('Bearer ', '')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  )

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('picks')
    .select('profit_loss, is_correct')
    .eq('user_id', user.id)
    .not('scored_at', 'is', null)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const totalUnits = data.reduce((sum, p) => sum + (p.profit_loss ?? 0), 0)
  const totalPicks = data.length
  const wins = data.filter(p => p.is_correct).length
  const losses = totalPicks - wins
  const winRate = totalPicks > 0 ? (wins / totalPicks) * 100 : 0

  return NextResponse.json({
    totalUnits,
    totalPicks,
    wins,
    losses,
    winRate: Number(winRate.toFixed(1)),
  })
}