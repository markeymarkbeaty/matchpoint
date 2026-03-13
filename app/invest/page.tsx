'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

export default function InvestPage() {

    const pathname = usePathname()
    const router = useRouter()

    const INITIAL_DEPOSIT = 100

    const [loading, setLoading] = useState(true)
    const [joined, setJoined] = useState(false)

    const [wallet, setWallet] = useState(0)
    const [totalInvested, setTotalInvested] = useState(0)

    const [investmentType, setInvestmentType] = useState('HYSA')

    useEffect(() => {
        initialize()
    }, [pathname])

    async function initialize() {

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            setLoading(false)
            return
        }

        const { data: account } = await supabase
            .from('user_investment_accounts')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle()

        if (account) {

            setJoined(true)

            if (account.account_type) {
                setInvestmentType(account.account_type)
            }

            const { data: bets } = await supabase
                .from('prediction_investments')
                .select('*')
                .eq('user_id', user.id)

            let invested = 0

            bets?.forEach(b => {
                invested += Number(b.amount)
            })

            setTotalInvested(invested)
            setWallet(INITIAL_DEPOSIT - invested)

        }

        setLoading(false)
    }

    async function updateInvestmentType(type: string) {

        setInvestmentType(type)

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        await supabase
            .from('user_investment_accounts')
            .update({ account_type: type })
            .eq('user_id', user.id)

        router.push(`/invest-picks?mode=${type}`)
    }

    async function leaveInvesting() {

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        await supabase
            .from('user_investment_accounts')
            .update({
                balance_available: 0,
                account_type: null
            })
            .eq('user_id', user.id)

        setJoined(false)
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

                {/* Investment Type */}

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">

                    <div className="text-xs text-zinc-500 mb-3">
                        Investment Type
                    </div>

                    <div className="grid grid-cols-2 gap-3">

                        {['HYSA', 'ETF'].map(type => {

                            const selected = investmentType === type

                            return (

                                <button
                                    key={type}
                                    onClick={() => updateInvestmentType(type)}
                                    className={`py-3 rounded-xl border ${selected
                                        ? 'border-green-400 text-green-300 shadow-[0_0_10px_rgba(74,222,128,0.6)]'
                                        : 'border-zinc-700 hover:border-green-400'
                                        }`}
                                >
                                    {type}
                                </button>

                            )

                        })}

                    </div>

                </div>

                {/* Wallet Stats */}

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">

                    <Stat
                        label="Initial Deposit"
                        value={`$${INITIAL_DEPOSIT}`}
                    />

                    <Stat
                        label="Wallet Available to Invest"
                        value={`$${wallet}`}
                    />

                    <Stat
                        label="Total Invested"
                        value={`$${totalInvested}`}
                    />

                </div>

                {/* Buttons */}

                <button
                    onClick={() => router.push('/invest/returns')}
                    className="w-full py-3 rounded-xl border border-green-400 text-green-300 hover:shadow-[0_0_12px_rgba(74,222,128,0.6)]"
                >
                    View Returns
                </button>

                <button
                    onClick={leaveInvesting}
                    className="w-full py-3 rounded-xl border border-red-500 text-red-400"
                >
                    Opt Out of Investing
                </button>

            </div>

            <BottomNav />

        </div>

    )
}

function Stat({ label, value }: { label: string, value: string }) {

    return (

        <div className="flex justify-between text-sm">

            <div className="text-white">
                {label}
            </div>

            <div className="text-green-400 font-semibold">
                {value}
            </div>

        </div>

    )
}