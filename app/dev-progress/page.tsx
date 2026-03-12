'use client'

import BottomNav from '../../components/BottomNav'

export default function DevProgressPage() {

    return (

        <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

            <h1 className="text-3xl font-semibold mb-6">
                Developer Goals & Progress
            </h1>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-8">

                {/* COMPLETED */}

                <div>
                    <h2 className="text-lg font-semibold text-green-400 mb-3">
                        Completed
                    </h2>

                    <ul className="text-zinc-400 space-y-1">

                        <li>✔ Authentication system</li>
                        <li>✔ Username profile system</li>
                        <li>✔ Update username page</li>
                        <li>✔ Reset password page</li>

                        <li>✔ Picks system</li>
                        <li>✔ Pick locking</li>
                        <li>✔ Match grouping by week</li>
                        <li>✔ Correct / incorrect pick scoring</li>

                        <li>✔ Global leaderboard</li>

                        <li>✔ League creation</li>
                        <li>✔ League membership system</li>
                        <li>✔ League page routing</li>
                        <li>✔ League member leaderboard</li>
                        <li>✔ League invite code system</li>
                        <li>✔ Invite-to-league button flow</li>

                        <li>✔ League UX improvements</li>
                        <li>✔ Create League inline UI</li>
                        <li>✔ Create League button moved to bottom</li>
                        <li>✔ Invite Friends → Invite Friends to League</li>

                        <li>✔ Feedback system</li>
                        <li>✔ Feedback email alerts</li>
                        <li>✔ Admin feedback dashboard</li>

                        <li>✔ Home navigation stabilization</li>
                        <li>✔ Bottom navigation component</li>

                        <li>✔ Glow UI design system</li>
                        <li>✔ Hover glow UI standardization</li>

                        <li>✔ League database cleanup & stabilization</li>

                        <li>✔ Investing tab</li>
                        <li>✔ Investing landing page</li>
                        <li>✔ Investing join / opt-out system</li>
                        <li>✔ Portfolio dashboard</li>
                        <li>✔ HYSA / ETF investment selection</li>
                        <li>✔ Investment descriptions + risk disclaimer</li>

                        <li>✔ Invest page navigation bug fix</li>
                        <li>✔ HYSA auto-selection bug fix</li>

                    </ul>
                </div>

                {/* IN PROGRESS */}

                <div>
                    <h2 className="text-lg font-semibold text-yellow-400 mb-3">
                        In Progress
                    </h2>

                    <ul className="text-zinc-400 space-y-1">

                        <li>• Investing mechanics integration with Picks page</li>
                        <li>• Real investment tracking</li>
                        <li>• Portfolio value based on prediction outcomes</li>
                        <li>• Investment history tracking</li>
                        <li>• Portfolio graph from real investment data</li>

                    </ul>
                </div>

                {/* NEXT DEVELOPMENT / TODO */}

                <div>
                    <h2 className="text-lg font-semibold text-orange-400 mb-3">
                        Next Development (To-Do)
                    </h2>

                    <ul className="text-zinc-400 space-y-1">

                        <li>• Add optional investment toggle on Picks page</li>
                        <li>• Allow selecting investment amount per pick</li>
                        <li>• Store prediction investments in database</li>
                        <li>• Track invested vs returned funds</li>
                        <li>• Build investment event history table</li>
                        <li>• Generate real portfolio growth chart</li>

                        <li>• Add MatchPoint soccer-themed logo to landing page</li>
                        <li>• Improve landing page hero branding</li>

                        <li>• Move global leaderboard into Leagues section</li>
                        <li>• Reorder Home social section (Leagues → Friends → Invite)</li>

                        <li>• Improve league UX</li>
                        <li>• Member counts on league cards</li>
                        <li>• Highlight current user in league leaderboard</li>

                        <li>• Friends system</li>
                        <li>• Friend invites</li>
                        <li>• Notifications</li>

                    </ul>
                </div>

                {/* LONG TERM */}

                <div>
                    <h2 className="text-lg font-semibold text-blue-400 mb-3">
                        Long Term Vision
                    </h2>

                    <ul className="text-zinc-400 space-y-1">

                        <li>• Competitive NWSL prediction platform</li>
                        <li>• Social competition between friends and leagues</li>
                        <li>• Community-driven prediction rankings</li>

                        <li>• Optional gamified investing layer</li>
                        <li>• Correct picks automatically invest funds</li>
                        <li>• Incorrect picks return original principal</li>

                        <li>• Integration with HYSA providers</li>
                        <li>• ETF brokerage integration</li>
                        <li>• Real portfolio tracking</li>

                        <li>• Encourage disciplined saving instead of gambling</li>

                    </ul>
                </div>

            </div>

            <BottomNav />

        </div>

    )

}