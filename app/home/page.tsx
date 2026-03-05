'use client'

import { useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import BottomNav from '../../components/BottomNav'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push('/auth')
      }
    }

    checkUser()
  }, [router])

  return (
    <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

      <h1 className="text-3xl font-semibold mb-10">
        Account
      </h1>

      <div className="space-y-4">

        <button
          onClick={() => router.push('/username')}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3"
        >
          Update Username
        </button>

        <button
          onClick={() => router.push('/notifications')}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3"
        >
          Notification Settings
        </button>

        <button
          onClick={() => router.push('/reset-password')}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3"
        >
          Reset Password
        </button>

      </div>

      <BottomNav />

    </div>
  )
}