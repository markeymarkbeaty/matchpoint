'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

export default function InvestPage() {

    const pathname = usePathname()
    const router = useRouter()

    const INITIAL_DEPOSIT = 1000

    const [loading, setLoading] = useState(true)

    const [wallet, setWallet] = useState(0)
    const [totalInvested, setTotalInvested] = useState(0)

    const [investmentType, setInvestmentType] = useState('HYSA')

    const [hysaInvested, setHysaInvested] = useState(0)
    const [etfInvested, setEtfInvested] = useState(0)
    const [returnedTotal, setReturnedTotal] = useState(0)

    useEffect(() => {
        initialize()
    }, [pathname])

    async function initialize() {

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return setLoading(false)

        const { data: account } = await supabase
            .from('user_investment_accounts')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle()

        if (account?.account_type) {
            setInvestmentType(account.account_type)
        }

        const { data: bets } = await supabase
            .from('prediction_investments')
            .select('*')
            .eq('user_id', user.id)

        const { data: matches } = await supabase
            .from('matches')
            .select('id, result')

        const { data: picks } = await supabase
            .from('picks')
            .select('id, selected_team')

        const matchMap: Record<string, any> = {}
        matches?.forEach(m => {
            matchMap[m.id] = m
        })

        const pickMap: Record<string, string> = {}
        picks?.forEach(p => {
            pickMap[p.id] = p.selected_team
        })

        let invested = 0
        let hysaCorrect = 0
        let etfCorrect = 0
        let returned = 0

        bets?.forEach(b => {

            const amt = Number(b.amount)
            invested += amt

            const match = matchMap[b.match_id]
            const selectedTeam = pickMap[b.pick_id]

            if (!match || !match.result) return

            const isCorrect =
                selectedTeam && selectedTeam === match.result

            if (b.account_type === 'HYSA') {
                if (isCorrect) {
                    hysaCorrect += amt
                } else {
                    returned += amt
                }
            }

            if (b.account_type === 'ETF') {
                if (isCorrect) {
                    etfCorrect += amt
                } else {
                    returned += amt
                }
            }

        })

        setTotalInvested(invested)
        setWallet(INITIAL_DEPOSIT - invested)

        setHysaInvested(hysaCorrect)
        setEtfInvested(etfCorrect)
        setReturnedTotal(returned)

        setLoading(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white px-6 pt-14">
                Loading...
            </div>
        )
    }

    return (

        <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

            <div className="space-y-6">

                {/* ✅ SINGLE ENTRY BUTTON */}
                <button
                    onClick={() => router.push('/invest-picks')}
                    className="w-full py-3 rounded-xl border border-green-400 text-green-300 shadow-[0_0_10px_rgba(74,222,128,0.6)]"
                >
                    Go to Invest Picks
                </button>

                {/* ✅ EXISTING STATS BLOCK (UNCHANGED) */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">

                    <Stat label="Initial Deposit" value={`$${INITIAL_DEPOSIT}`} />
                    <Stat label="Wallet Available to Invest" value={`$${wallet}`} />
                    <Stat label="Total Invested" value={`$${totalInvested}`} />

                    <Stat label="HYSA Invested (Correct Picks)" value={`$${hysaInvested}`} />
                    <Stat label="ETF Invested (Correct Picks)" value={`$${etfInvested}`} />

                    <Stat label="Money Returned to Your Wallet" value={`$${returnedTotal}`} />

                </div>

                <button
                    onClick={() => router.push('/invest/returns')}
                    className="w-full py-3 rounded-xl border border-green-400 text-green-300 shadow-[0_0_10px_rgba(74,222,128,0.6)]"
                >
                    View Returns
                </button>

            </div>

            <BottomNav />

        </div>
    )
}

function Stat({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between text-sm">
            <div>{label}</div>
            <div className="text-green-400 font-semibold">{value}</div>
        </div>
    )
}