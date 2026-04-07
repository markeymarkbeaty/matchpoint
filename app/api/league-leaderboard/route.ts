import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(req: Request) {

    try {

        const { searchParams } = new URL(req.url)
        const leagueId = searchParams.get("leagueId")

        if (!leagueId) {
            return NextResponse.json([])
        }

        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        // 🔥 CRITICAL: prevent crash if env missing
        if (!url || !serviceKey) {
            console.error("Missing Supabase env variables")
            return NextResponse.json([])
        }

        const supabase = createClient(url, serviceKey)

        const { data, error } = await supabase.rpc("get_league_leaderboard", {
            league_id_param: leagueId
        })

        if (error) {
            console.error("League leaderboard RPC error:", error)
            return NextResponse.json([])
        }

        return NextResponse.json(data || [])

    } catch (err) {

        console.error("League leaderboard route crash:", err)
        return NextResponse.json([])

    }
}