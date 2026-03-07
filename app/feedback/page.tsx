'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import BottomNav from '../../components/BottomNav'

export default function FeedbackPage() {

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const submitFeedback = async () => {

    if (!message.trim()) return

    setLoading(true)

    const { data } = await supabase.auth.getUser()
    const user = data.user

    if (!user) return

    // store in database
    await supabase.from('feedback').insert({
      user_id: user.id,
      message
    })

    // send email
    await fetch('/api/send-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        user_id: user.id
      })
    })

    setMessage('')
    setLoading(false)

    alert('Feedback sent. Thank you!')
  }

  return (

    <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

      <h1 className="text-3xl font-semibold mb-8">
        Beta Feedback
      </h1>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Report bugs, suggest features, or share feedback..."
        className="w-full h-40 bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4 focus:outline-none focus:border-green-400"
      />

      <button
        onClick={submitFeedback}
        disabled={loading}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 transition hover:border-green-400 hover:shadow-[0_0_12px_rgba(74,222,128,0.6)]"
      >
        {loading ? 'Sending...' : 'Submit Feedback'}
      </button>

      <BottomNav />

    </div>

  )

}