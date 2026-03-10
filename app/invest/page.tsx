'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import BottomNav from '../../components/BottomNav'

export default function InvestPage() {

    const [available, setAvailable] = useState(0)
    const [invested, setInvested] = useState(0)
    const [positions, setPositions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadAccount()
    }, [])

    async function loadAccount() {

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        const { data: account } = await supabase
            .from('user_investment_accounts')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (account) {
            setAvailable(account.balance_available)
            setInvested(account.balance_invested)
        }

        const { data: portfolio } = await supabase
            .from('portfolio_positions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (portfolio) {
            setPositions(portfolio)
        }

        setLoading(false)
    }

    return (

        <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

            <h1 className="text-3xl font-semibold mb-10">
                Investing
            </h1>

            {loading && (
                <div className="text-zinc-400">
                    Loading account...
                </div>
            )}

            {/* ACCOUNT SUMMARY */}

            <div className="space-y-4 mb-10">

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">

                    <div className="text-sm text-zinc-500 mb-1">
                        Available Capital
                    </div>

                    <div className="text-2xl font-semibold text-green-400">
                        ${available}
                    </div>

                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">

                    <div className="text-sm text-zinc-500 mb-1">
                        Invested Capital
                    </div>

                    <div className="text-2xl font-semibold text-green-400">
                        ${invested}
                    </div>

                </div>

            </div>

            {/* PORTFOLIO */}

            <h2 className="text-sm uppercase text-zinc-500 mb-4">
                Portfolio
            </h2>

            <div className="space-y-3">

                {positions.length === 0 && (

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-zinc-400">
                        No investments yet.
                    </div>

                )}

                {positions.map((p, index) => (

                    <div
                        key={index}
                        className="
                        bg-zinc-900 border border-zinc-800 rounded-xl p-6
                        hover:border-green-400
                        hover:shadow-[0_0_12px_rgba(74,222,128,0.5)]
                        transition
                        "
                    >

                        <div className="flex justify-between">

                            <div>

                                <div className="font-semibold">
                                    {p.asset_type}
                                </div>

                                <div className="text-xs text-zinc-500">
                                    {new Date(p.created_at).toLocaleDateString()}
                                </div>

                            </div>

                            <div className="text-green-400 font-semibold">
                                ${p.amount}
                            </div>

                        </div>

                    </div>

                ))}

            </div>

            <BottomNav />

        </div>

    )

}