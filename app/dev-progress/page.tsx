'use client'

import BottomNav from '../../components/BottomNav'

export default function DevProgressPage() {

    return (

        <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

            <h1 className="text-3xl font-semibold mb-6">
                Developer Goals & Progress
            </h1>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">

                <div>
                    <h2 className="text-lg font-semibold text-green-400 mb-2">
                        Completed
                    </h2>

                    <ul className="text-zinc-400 space-y-1">
                        <li>✔ Authentication system</li>
                        <li>✔ Picks system</li>
                        <li>✔ Pick locking</li>
                        <li>✔ Match grouping by week</li>
                        <li>✔ Leaderboard system</li>
                        <li>✔ League creation</li>
                        <li>✔ League invites</li>
                        <li>✔ League membership</li>
                        <li>✔ Feedback system</li>
                        <li>✔ Feedback email alerts</li>
                        <li>✔ Admin feedback dashboard</li>
                        <li>✔ Home navigation stabilization</li>
                        <li>✔ Glow UI standardization</li>
                        <li>✔ Picks hover glow restoration</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-yellow-400 mb-2">
                        In Progress
                    </h2>

                    <ul className="text-zinc-400 space-y-1">
                        <li>• Invite friends system</li>
                        <li>• League leaderboard stability</li>
                        <li>• Member display improvements</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-zinc-300 mb-2">
                        Planned
                    </h2>

                    <ul className="text-zinc-400 space-y-1">
                        <li>• Favorite teams system</li>
                        <li>• Notifications</li>
                        <li>• Friend connections</li>
                        <li>• Match data automation</li>
                        <li>• Improved league UX</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-blue-400 mb-2">
                        Long Term Vision
                    </h2>

                    <p className="text-zinc-400">
                        MatchPoint will evolve into a behavioral finance platform through
                        gamified investing, where correct picks invest funds into ETFs or
                        high-yield savings accounts while incorrect picks return principal.
                    </p>
                </div>

            </div>

            <BottomNav />

        </div>

    )

}