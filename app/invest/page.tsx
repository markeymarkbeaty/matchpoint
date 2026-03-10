'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

export default function InvestPage() {

    const [joined, setJoined] = useState(false)
    const [loading, setLoading] = useState(true)
    const [joining, setJoining] = useState(false)

    useEffect(() => {
        checkAccount()
    }, [])

    async function checkAccount() {

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        const { data } = await supabase
            .from('user_investment_accounts')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle()

        if (data) {
            setJoined(true)
        }

        setLoading(false)
    }

    async function joinInvesting() {

        setJoining(true)

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        const { error } = await supabase
            .from('user_investment_accounts')
            .insert({
                user_id: user.id,
                balance_available: 100,
                balance_invested: 0
            })

        if (!error) {
            setJoined(true)
        }

        setJoining(false)
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

            <h1 className="text-3xl font-semibold mb-10">
                Investing
            </h1>

            {!joined && (

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">

                    <h2 className="text-xl font-semibold text-green-400">
                        Bet Against Yourself
                    </h2>

                    <p className="text-zinc-400">
                        MatchPoint Investing allows you to allocate money to your predictions.
                        When your pick is correct, the funds are invested. When your pick is
                        incorrect, the original money is returned.
                    </p>

                    <ul className="text-zinc-400 space-y-1 text-sm">

                        <li>• Allocate money to your picks</li>
                        <li>• Correct picks invest funds</li>
                        <li>• Incorrect picks return your money</li>
                        <li>• No money is lost</li>

                    </ul>

                    <button
                        onClick={joinInvesting}
                        disabled={joining}
                        className="
            w-full py-3 rounded-xl border border-zinc-700
            hover:border-green-400
            hover:shadow-[0_0_16px_rgba(74,222,128,0.5)]
            transition
            "
                    >
                        {joining ? 'Joining...' : 'Join Investing'}
                    </button>

                </div>

            )}

            {joined && (

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">

                    <div className="text-green-400 font-semibold mb-2">
                        Investing Enabled
                    </div>

                    <div className="text-zinc-400 text-sm">
                        Your investing dashboard will appear here.
                    </div>

                </div>

            )}

            <BottomNav />

        </div>

    )

}