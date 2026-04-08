'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'

export default function InvestLandingPage() {

    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleOptIn() {
        setLoading(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return setLoading(false)

        await supabase
            .from('user_investment_accounts')
            .update({ is_active: true })
            .eq('user_id', user.id)

        router.push('/invest')
    }

    return (
        <main className="relative min-h-screen bg-black text-zinc-100 px-6 py-16 overflow-hidden">

            <div className="absolute inset-0 opacity-10 blur-2xl pointer-events-none">
                <img
                    src="/nwsl-logos-bg.png"
                    className="w-full h-full object-cover"
                    alt=""
                />
            </div>

            <div className="relative max-w-4xl mx-auto">

                <section className="text-center mb-16">

                    <motion.div
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="flex justify-center mb-8"
                    >
                        <img
                            src="/matchpoint-logo.png"
                            alt="MatchPoint Logo"
                            className="w-40 md:w-56"
                        />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="text-4xl md:text-6xl font-bold mb-6"
                    >
                        Turn Predictions Into Progress
                    </motion.h1>

                    <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-8">
                        Add an optional investing layer to your picks. When you're right,
                        your money is allocated. When you're wrong, your principal is returned.
                    </p>

                    <div className="flex justify-center gap-4">

                        <button
                            onClick={handleOptIn}
                            disabled={loading}
                            className="bg-zinc-900 border border-green-400 text-green-300 font-semibold px-6 py-3 rounded-xl transition hover:shadow-[0_0_12px_rgba(74,222,128,0.6)]"
                        >
                            {loading ? 'Loading...' : 'Opt In to Investing'}
                        </button>

                        {/* ✅ FIXED */}
                        <button
                            onClick={() => router.push('/home')}
                            className="bg-zinc-900 border border-zinc-700 px-6 py-3 rounded-xl transition hover:border-green-400 hover:shadow-[0_0_12px_rgba(74,222,128,0.4)]"
                        >
                            Maybe Later
                        </button>

                    </div>

                </section>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-green-400 to-transparent mb-16 opacity-40" />

                <section className="grid md:grid-cols-3 gap-8 mb-20">

                    <Feature
                        title="Make Picks as Usual"
                        description="Your predictions stay the same. Nothing changes about gameplay."
                    />

                    <Feature
                        title="Allocate Small Amounts"
                        description="Attach $5–$20 to your picks across HYSA or ETF accounts."
                    />

                    <Feature
                        title="Outcome Determines Flow"
                        description="Correct picks invest funds. Incorrect picks return them."
                    />

                </section>

                <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 transition hover:border-green-400 hover:shadow-[0_0_16px_rgba(74,222,128,0.3)]">

                    <h2 className="text-2xl font-semibold mb-4 text-green-400">
                        Not Betting. Not Gambling.
                    </h2>

                    <p className="text-zinc-400 leading-relaxed">
                        This system is designed to simulate disciplined saving and investing.
                        You are not risking money — you are deciding how it flows based on your
                        prediction accuracy. The goal is to build better habits, not chase outcomes.
                    </p>

                </section>

            </div>

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