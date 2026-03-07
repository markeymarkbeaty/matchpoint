'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

export default function InvitePage() {

  const [inviteLink, setInviteLink] = useState('')

  useEffect(() => {
    generateInviteLink()
  }, [])

  async function generateInviteLink() {

    const { data } = await supabase.auth.getUser()
    const user = data.user

    if (!user) return

    const link = `${window.location.origin}/auth?invite=${user.id}`

    setInviteLink(link)

  }

  async function copyLink() {

    await navigator.clipboard.writeText(inviteLink)

    alert('Invite link copied!')

  }

  return (

    <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

      <h1 className="text-3xl font-semibold mb-6">
        Invite Friends
      </h1>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-4">

        <p className="text-zinc-400 mb-4">
          Share this link with friends to invite them to MatchPoint.
        </p>

        <div className="bg-black border border-zinc-800 rounded-lg p-3 text-sm break-all mb-4">
          {inviteLink}
        </div>

        <button
          onClick={copyLink}
          className="w-full bg-zinc-900 border border-green-400 text-green-300 rounded-xl py-3 transition hover:shadow-[0_0_12px_rgba(74,222,128,0.6)]"
        >
          Copy Invite Link
        </button>

      </div>

      <BottomNav />

    </div>

  )

}