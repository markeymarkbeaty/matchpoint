'use client'

import BottomNav from '../../components/BottomNav'

export default function FriendsPage() {
    return (
        <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

            <h1 className="text-3xl font-semibold mb-6">
                My Friends
            </h1>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <p className="text-zinc-400">
                    Friend connections will appear here.
                </p>
            </div>

            <BottomNav />

        </div>
    )
}