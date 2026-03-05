'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function ConfirmPage() {
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()

      if (data.session) {
        router.push('/home')
      }
    }

    checkSession()
  }, [router])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">

      <div className="max-w-md text-center">

        <h1 className="text-3xl font-semibold mb-6">
          Confirm Your Email
        </h1>

        <p className="text-zinc-400 mb-8">
          We've sent a confirmation email to your inbox.
          Please open the email and click the confirmation link
          to activate your account.
        </p>

        <button
          onClick={() => router.push('/auth')}
          className="bg-green-500 text-black px-6 py-3 rounded-xl"
        >
          Back to Login
        </button>

      </div>

    </div>
  )
}