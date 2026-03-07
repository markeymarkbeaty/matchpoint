'use client'

import BottomNav from '../../components/BottomNav'

export default function MatchesPage() {
    return (
        <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

            <h1 className="text-3xl font-semibold mb-6">
                Matches
            </h1>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <p className="text-zinc-400">
                    Match information will appear here in a future update.
                </p>
            </div>

            <BottomNav />

        </div>
    )
}