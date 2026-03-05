'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import BottomNav from '../../components/BottomNav'

export default function FeedbackPage() {
  const [message, setMessage] = useState('')

  const submitFeedback = async () => {
    const { data } = await supabase.auth.getUser()
    const user = data.user

    if (!user || !message) return

    await supabase.from('feedback').insert({
      user_id: user.id,
      message
    })

    setMessage('')
    alert('Feedback submitted!')
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
        className="w-full h-40 bg-zinc-800 p-4 rounded-xl mb-4"
      />

      <button
        onClick={submitFeedback}
        className="w-full bg-green-500 text-black py-3 rounded-xl"
      >
        Submit Feedback
      </button>

      <BottomNav />

    </div>
  )
}