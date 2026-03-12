'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

export default function InvestPage() {

    const pathname = usePathname()

    const STARTING_CAPITAL = 100

    const [joined, setJoined] = useState(false)
    const [loading, setLoading] = useState(true)

    const [available, setAvailable] = useState(0)
    const [invested, setInvested] = useState(0)

    const [joining, setJoining] = useState(false)
    const [leaving, setLeaving] = useState(false)

    const [investmentType, setInvestmentType] = useState<string | null>(null)

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
            setAvailable(account.balance_available)
            setInvested(account.balance_invested)

            if (account.account_type) {
                setInvestmentType(account.account_type)
            }

        } else {

            setJoined(false)
            setAvailable(0)
            setInvested(0)

        }

        setLoading(false)
    }

    async function joinInvesting() {

        setJoining(true)

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        const { error } = await supabase
            .from('user_investment_accounts')
            .upsert({
                user_id: user.id,
                balance_available: STARTING_CAPITAL,
                balance_invested: 0,
                account_type: null
            })

        if (!error) {
            setJoined(true)
            setAvailable(STARTING_CAPITAL)
            setInvestmentType(null)
        }

        setJoining(false)
    }

    async function leaveInvesting() {

        setLeaving(true)

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        await supabase
            .from('user_investment_accounts')
            .delete()
            .eq('user_id', user.id)

        setJoined(false)
        setAvailable(0)
        setInvested(0)
        setInvestmentType(null)

        setLeaving(false)
    }

    async function updateInvestmentType(type: string) {

        setInvestmentType(type)

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        await supabase
            .from('user_investment_accounts')
            .update({ account_type: type })
            .eq('user_id', user.id)
    }

    const portfolioValue = available + invested
    const gain = portfolioValue - STARTING_CAPITAL
    const percent = ((gain / STARTING_CAPITAL) * 100).toFixed(2)

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white px-6 pt-14">
                Loading...
            </div>
        )
    }

    return (

        <main className="relative min-h-screen bg-black text-zinc-100 px-6 py-16 overflow-hidden">

            <div className="relative max-w-4xl mx-auto">

                {!joined && (

                    <>
                        <section className="text-center mb-16">

                            <motion.h1
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="text-4xl md:text-6xl font-bold mb-6"
                            >
                                Bet Against Yourself
                            </motion.h1>

                            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-8">
                                An optional investing layer where correct picks invest funds and
                                incorrect picks return your original money.
                            </p>

                            <button
                                onClick={joinInvesting}
                                disabled={joining}
                                className="bg-zinc-900 border border-green-400 text-green-300 font-semibold px-6 py-3 rounded-xl transition hover:shadow-[0_0_12px_rgba(74,222,128,0.6)]"
                            >
                                {joining ? 'Joining...' : 'Join Investing'}
                            </button>

                        </section>
                    </>
                )}

                {joined && (

                    <div className="space-y-8">

                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">

                            <div className="text-sm text-zinc-500 mb-1">
                                Portfolio Value
                            </div>

                            <div className="text-4xl font-bold text-green-400 mb-2">
                                ${portfolioValue.toFixed(2)}
                            </div>

                            <div className={`${gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {gain >= 0 ? '+' : ''}{gain.toFixed(2)} ({percent}%)
                            </div>

                        </div>

                        <div>

                            <h2 className="text-sm uppercase text-zinc-500 mb-3">
                                Investment Type
                            </h2>

                            <div className="grid grid-cols-2 gap-3">

                                {['HYSA', 'ETF'].map(type => {

                                    const selected = investmentType === type

                                    return (

                                        <button
                                            key={type}
                                            onClick={() => updateInvestmentType(type)}
                                            className={`py-3 rounded-xl border transition ${selected
                                                ? 'border-green-400 text-green-300 shadow-[0_0_10px_rgba(74,222,128,0.5)]'
                                                : 'border-zinc-700 hover:border-green-400'
                                                }`}
                                        >
                                            {type}
                                        </button>

                                    )

                                })}

                            </div>

                            {/* DESCRIPTORS */}

                            <div className="mt-4 space-y-2 text-sm text-zinc-400">

                                <p>
                                    <span className="text-green-400 font-medium">HYSA:</span> High-yield savings account style growth with lower volatility and steadier returns.
                                </p>

                                <p>
                                    <span className="text-green-400 font-medium">ETF:</span> Invests in a diversified market portfolio with higher long-term growth potential.
                                </p>

                                <p className="text-zinc-500 text-xs">
                                    ETF investments are subject to market volatility and may lose value.
                                </p>

                            </div>

                        </div>

                        <button
                            onClick={leaveInvesting}
                            disabled={leaving}
                            className="
                            w-full py-3 rounded-xl border border-red-500 text-red-400
                            hover:shadow-[0_0_16px_rgba(239,68,68,0.6)]
                            transition
                            "
                        >
                            {leaving ? 'Leaving...' : 'Opt Out of Investing'}
                        </button>

                    </div>

                )}

            </div>

            <BottomNav />

        </main>
    )
}