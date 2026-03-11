'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip
} from 'recharts'

export default function InvestPage() {

    const STARTING_CAPITAL = 100

    const [joined, setJoined] = useState(false)
    const [loading, setLoading] = useState(true)

    const [available, setAvailable] = useState(0)
    const [invested, setInvested] = useState(0)

    const [joining, setJoining] = useState(false)
    const [leaving, setLeaving] = useState(false)

    const [activeBets, setActiveBets] = useState<any[]>([])
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

            loadActiveBets(user.id)
        }

        setLoading(false)
    }

    async function joinInvesting() {

        setJoining(true)

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        // check if account exists first
        const { data: existing } = await supabase
            .from('user_investment_accounts')
            .select('user_id')
            .eq('user_id', user.id)
            .maybeSingle()

        if (!existing) {

            const { error } = await supabase
                .from('user_investment_accounts')
                .insert({
                    user_id: user.id,
                    balance_available: STARTING_CAPITAL,
                    balance_invested: 0,
                    account_type: 'HYSA'
                })

            if (error) {
                console.error('Insert error:', error)
            }

        } else {

            const { error } = await supabase
                .from('user_investment_accounts')
                .update({
                    balance_available: STARTING_CAPITAL,
                    balance_invested: 0
                })
                .eq('user_id', user.id)

            if (error) {
                console.error('Update error:', error)
            }

        }

        setJoined(true)
        setAvailable(STARTING_CAPITAL)

        setJoining(false)
    }

    async function leaveInvesting() {

        setLeaving(true)

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        const { error } = await supabase
            .from('user_investment_accounts')
            .delete()
            .eq('user_id', user.id)

        if (error) {
            console.error(error)
        }

        setJoined(false)
        setAvailable(0)
        setInvested(0)
        setActiveBets([])

        setLeaving(false)
    }

    async function loadActiveBets(userId: string) {

        const { data } = await supabase
            .from('prediction_investments')
            .select(`
        id,
        amount,
        matches (
          home_team,
          away_team
        )
      `)
            .eq('user_id', userId)
            .eq('status', 'pending')

        if (data) setActiveBets(data)
    }

    async function changeInvestmentType(type: string) {

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        await supabase
            .from('user_investment_accounts')
            .update({ account_type: type })
            .eq('user_id', user.id)

        setInvestmentType(type)
    }

    const portfolioValue = available + invested
    const gain = portfolioValue - STARTING_CAPITAL
    const percent = ((gain / STARTING_CAPITAL) * 100).toFixed(2)

    const exampleChartData = [
        { month: 'Start', value: 100 },
        { month: 'Month 1', value: 102 },
        { month: 'Month 2', value: 106 },
        { month: 'Month 3', value: 110 },
        { month: 'Month 4', value: 118 }
    ]

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white px-6 pt-14">
                Loading...
            </div>
        )
    }

    return (

        <main className="relative min-h-screen bg-black text-zinc-100 px-6 py-16 pb-32 overflow-hidden">

            <div className="relative max-w-4xl mx-auto">

                {!joined && (

                    <>
                        {/* HERO */}

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
                                Turn predictions into a disciplined investing habit.
                            </p>

                            <button
                                onClick={joinInvesting}
                                disabled={joining}
                                className="bg-zinc-900 border border-green-400 text-green-300 font-semibold px-6 py-3 rounded-xl transition hover:shadow-[0_0_12px_rgba(74,222,128,0.6)]"
                            >
                                {joining ? 'Joining...' : 'Join Investing'}
                            </button>

                        </section>

                        {/* Example Chart */}

                        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

                            <h2 className="text-xl font-semibold text-green-400 mb-6">
                                Example Portfolio Growth
                            </h2>

                            <div className="h-48">

                                <ResponsiveContainer width="100%" height="100%">

                                    <AreaChart data={exampleChartData}>

                                        <defs>
                                            <linearGradient id="gainExample" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4ade80" stopOpacity={0.7} />
                                                <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>

                                        <XAxis dataKey="month" stroke="#888" />
                                        <YAxis stroke="#888" />

                                        <Tooltip />

                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#4ade80"
                                            strokeWidth={3}
                                            fill="url(#gainExample)"
                                        />

                                    </AreaChart>

                                </ResponsiveContainer>

                            </div>

                        </section>

                    </>
                )}

                {joined && (

                    <div className="space-y-8">

                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">

                            <div className="text-sm text-zinc-500 mb-1">
                                Portfolio Value
                            </div>

                            <div className="text-3xl font-bold text-green-400 mb-2">
                                ${portfolioValue.toFixed(2)}
                            </div>

                            <div className={`${gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {gain >= 0 ? '+' : ''}{gain.toFixed(2)} ({percent}%)
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