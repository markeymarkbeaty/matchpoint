import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // 🔥 IMPORTANT
  )

  const { data, error } = await supabase.rpc("get_leaderboard")

  if (error) {
    console.error("Leaderboard RPC error:", error)
    return NextResponse.json([], { status: 500 })
  }

  return NextResponse.json(data || [])

}