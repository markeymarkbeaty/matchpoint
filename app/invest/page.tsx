'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

export default function InvestPage() {

    const STARTING_CAPITAL = 100

    const [joined, setJoined] = useState(false)
    const [loading, setLoading] = useState(true)

    const [available, setAvailable] = useState(0)
    const [invested, setInvested] = useState(0)

    const [joining, setJoining] = useState(false)
    const [leaving, setLeaving] = useState(false)

    const [investmentType, setInvestmentType] = useState('HYSA')

    useEffect(() => {
        initialize()
    }, [])

    async function initialize() {

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

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

        }

        setLoading(false)
    }

    async function joinInvesting() {

        setJoining(true)

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        const { data: existing } = await supabase
            .from('user_investment_accounts')
            .select('user_id')
            .eq('user_id', user.id)
            .maybeSingle()

        if (!existing) {

            await supabase
                .from('user_investment_accounts')
                .insert({
                    user_id: user.id,
                    balance_available: STARTING_CAPITAL,
                    balance_invested: 0,
                    account_type: 'HYSA'
                })

        } else {

            await supabase
                .from('user_investment_accounts')
                .update({
                    balance_available: STARTING_CAPITAL,
                    balance_invested: 0
                })
                .eq('user_id', user.id)

        }

        setJoined(true)
        setAvailable(STARTING_CAPITAL)

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

        setLeaving(false)
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

                {/* LANDING PAGE */}

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

                        <div className="h-px w-full bg-gradient-to-r from-transparent via-green-400 to-transparent mb-16 opacity-40" />

                        {/* FEATURES */}

                        <section className="grid md:grid-cols-3 gap-8 mb-20">

                            <Feature
                                title="Make Your Picks"
                                description="Continue predicting matches exactly as you do now."
                            />

                            <Feature
                                title="Correct Picks Invest"
                                description="Winning predictions automatically move funds into your investment account."
                            />

                            <Feature
                                title="Incorrect Picks Return"
                                description="If your prediction is wrong, your original money simply returns to your balance."
                            />

                        </section>

                        {/* HOW IT WORKS */}

                        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

                            <h2 className="text-2xl font-semibold mb-6 text-green-400">
                                How It Works
                            </h2>

                            <div className="space-y-4 text-zinc-400">

                                <p>
                                    Example match:
                                </p>

                                <p className="text-zinc-300 font-medium">
                                    Washington Spirit vs Portland Thorns
                                </p>

                                <div className="space-y-2 text-sm">

                                    <p>1️⃣ You predict <span className="text-green-400">Washington Spirit</span></p>

                                    <p>2️⃣ You allocate <span className="text-green-400">$10</span> to the prediction</p>

                                    <p>3️⃣ If your pick is correct → <span className="text-green-400">$10 is invested</span></p>

                                    <p>4️⃣ If your pick is incorrect → <span className="text-zinc-300">$10 returns to your balance</span></p>

                                </div>

                            </div>

                        </section>

                    </>
                )}

                {/* DASHBOARD */}

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
                                            onClick={() => setInvestmentType(type)}
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

                        </div>

                        <button
                            onClick={leaveInvesting}
                            disabled={leaving}
                            className="w-full py-3 rounded-xl border border-red-500 text-red-400 hover:shadow-[0_0_16px_rgba(239,68,68,0.6)] transition"
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

function Feature({ title, description }: { title: string; description: string }) {

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 transition hover:border-green-400 hover:shadow-[0_0_14px_rgba(74,222,128,0.3)]">

            <h3 className="text-lg font-semibold mb-2 text-green-400">
                {title}
            </h3>

            <p className="text-zinc-400 text-sm leading-relaxed">
                {description}
            </p>

        </div>
    )
}