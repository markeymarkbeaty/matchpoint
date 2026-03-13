import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {

    try {

        const { data: matches } = await supabase
            .from('matches')
            .select('*')
            .not('result', 'is', null)

        for (const match of matches || []) {

            const { data: bets } = await supabase
                .from('prediction_investments')
                .select('*')
                .eq('match_id', match.id)
                .eq('status', 'pending')

            if (!bets || bets.length === 0) continue

            for (const bet of bets) {

                const { data: pick } = await supabase
                    .from('picks')
                    .select('*')
                    .eq('id', bet.pick_id)
                    .single()

                if (!pick) continue

                const correct = pick.selected_team === match.result

                await supabase
                    .from('picks')
                    .update({
                        is_correct: correct,
                        scored_at: new Date().toISOString()
                    })
                    .eq('id', pick.id)

                const { data: account } = await supabase
                    .from('user_investment_accounts')
                    .select('*')
                    .eq('user_id', bet.user_id)
                    .single()

                if (!account) continue

                if (correct) {

                    await supabase
                        .from('prediction_investments')
                        .update({ status: 'invested' })
                        .eq('id', bet.id)

                    await supabase
                        .from('user_investment_accounts')
                        .update({
                            balance_invested:
                                Number(account.balance_invested) + Number(bet.amount)
                        })
                        .eq('user_id', bet.user_id)

                } else {

                    await supabase
                        .from('prediction_investments')
                        .update({ status: 'returned' })
                        .eq('id', bet.id)

                    await supabase
                        .from('user_investment_accounts')
                        .update({
                            balance_available:
                                Number(account.balance_available) + Number(bet.amount)
                        })
                        .eq('user_id', bet.user_id)

                }

            }

        }

        return NextResponse.json({ success: true })

    } catch (error: any) {

        return NextResponse.json({
            error: error.message
        })

    }

}