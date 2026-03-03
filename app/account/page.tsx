'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import BottomNav from '../../components/BottomNav'

export default function Account() {
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-black text-white px-5 pt-14 pb-32">
      <h1 className="text-3xl font-semibold tracking-tight mb-10">
        Account
      </h1>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <button
          onClick={handleLogout}
          className="text-red-400 hover:text-red-300 transition"
        >
          Log Out
        </button>
      </div>

      <BottomNav />
    </div>
  )
}