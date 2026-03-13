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
                        <li>✔ Picks state stabilization bug fix</li>

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

                        <li>✔ Landing page redesign</li>
                        <li>✔ MatchPoint logo integration</li>
                        <li>✔ Background logo styling</li>

                        <li>✔ Investing landing page</li>
                        <li>✔ Investing join / opt-out system</li>
                        <li>✔ Portfolio dashboard</li>
                        <li>✔ HYSA / ETF investment selection</li>
                        <li>✔ Investment descriptions + risk disclaimer</li>

                        <li>✔ Investment account auto-creation via database trigger</li>
                        <li>✔ RLS policy fixes for investment accounts</li>
                        <li>✔ Signup database constraint fixes</li>

                        <li>✔ Invest Picks page</li>
                        <li>✔ Investment bet chips ($5 / $25 / $50 / $100)</li>
                        <li>✔ Bet deselection / modification system</li>
                        <li>✔ Investment balance tracking</li>
                        <li>✔ Prediction investment persistence</li>

                        <li>✔ Invest header showing bet mode + available funds</li>
                        <li>✔ Sticky investment header</li>

                        <li>✔ Import picks from Picks page into investment page</li>
                        <li>✔ Display selected team with checkmark</li>

                        <li>✔ Filter invest matches to next two matchweeks</li>
                        <li>✔ Matchweek grouping for invest page</li>

                        <li>✔ HYSA / ETF bet separation system</li>
                        <li>✔ Account-type investment tracking in database</li>
                        <li>✔ Unique constraint for (user_id, match_id, account_type)</li>

                        <li>✔ Invest dashboard redesign</li>
                        <li>✔ Wallet vs invested balance separation</li>
                        <li>✔ Simplified investment dashboard layout</li>
                        <li>✔ Investment type selector moved to top</li>

                        <li>✔ Glowing HYSA / ETF bet chips on invest cards</li>
                        <li>✔ Live chip updates when bet amount changes</li>
                        <li>✔ Real-time available balance recalculation</li>

                        <li>✔ Local development workflow (npm run dev)</li>
                        <li>✔ Reduced Vercel deployment usage</li>

                    </ul>
                </div>

                {/* IN PROGRESS */}

                <div>
                    <h2 className="text-lg font-semibold text-yellow-400 mb-3">
                        In Progress
                    </h2>

                    <ul className="text-zinc-400 space-y-1">

                        <li>• Investment settlement logic</li>
                        <li>• Correct pick → move funds to invested balance</li>
                        <li>• Incorrect pick → return principal to wallet</li>

                        <li>• Investment result processing when match results finalize</li>

                        <li>• Returns analytics page (/invest/returns)</li>
                        <li>• Investment performance tracking</li>

                    </ul>
                </div>

                {/* NEXT DEVELOPMENT / TODO */}

                <div>
                    <h2 className="text-lg font-semibold text-orange-400 mb-3">
                        Next Development (To-Do)
                    </h2>

                    <ul className="text-zinc-400 space-y-1">

                        <li>• Automatic bet settlement engine</li>
                        <li>• Investment event history table</li>
                        <li>• Track invested vs returned funds</li>

                        <li>• Build Returns analytics page</li>
                        <li>• HYSA vs ETF return breakdown</li>
                        <li>• Total portfolio performance metrics</li>

                        <li>• Portfolio growth chart</li>
                        <li>• Investment history timeline</li>

                        <li>• Improve invest page UX</li>
                        <li>• Active bets summary panel</li>
                        <li>• Invested vs available funds display</li>

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