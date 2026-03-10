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
                        <li>✔ Username profile system</li>
                        <li>✔ Picks system</li>
                        <li>✔ Pick locking</li>
                        <li>✔ Match grouping by week</li>
                        <li>✔ Global leaderboard</li>
                        <li>✔ League creation</li>
                        <li>✔ League membership system</li>
                        <li>✔ League page routing</li>
                        <li>✔ League member leaderboard foundation</li>
                        <li>✔ Feedback system</li>
                        <li>✔ Feedback email alerts</li>
                        <li>✔ Admin feedback dashboard</li>
                        <li>✔ Home navigation stabilization</li>
                        <li>✔ Glow UI design system</li>
                        <li>✔ Hover glow UI standardization</li>
                        <li>✔ Picks page UI restoration</li>
                        <li>✔ League database cleanup & stabilization</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-yellow-400 mb-2">
                        In Progress
                    </h2>

                    <ul className="text-zinc-400 space-y-1">
                        <li>• League member display</li>
                        <li>• League leaderboard accuracy</li>
                        <li>• League page UI improvements</li>
                        <li>• Filtering leagues to only show user leagues</li>
                        <li>• Invite friends flow</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-zinc-300 mb-2">
                        Planned
                    </h2>

                    <ul className="text-zinc-400 space-y-1">
                        <li>• League invite codes and share links</li>
                        <li>• Favorite teams system</li>
                        <li>• Notifications</li>
                        <li>• Friend connections</li>
                        <li>• Match data automation</li>
                        <li>• Improved league UX</li>
                        <li>• Member counts on league cards</li>
                        <li>• Highlight current user in league leaderboard</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-blue-400 mb-2">
                        Long Term Vision
                    </h2>

                    <ul className="text-zinc-400 space-y-1">
                        <li>• Competitive NWSL prediction platform</li>
                        <li>• Social competition between friends and leagues</li>
                        <li>• Community-driven prediction rankings</li>
                        <li>• Optional gamified investing layer added later</li>
                        <li>• Correct picks automatically invest funds into ETFs or a high-yield savings account</li>
                        <li>• Incorrect picks return the original principal</li>
                        <li>• Encourages disciplined saving and investing rather than gambling</li>
                    </ul>
                </div>

            </div>

            <BottomNav />

        </div>

    )

}