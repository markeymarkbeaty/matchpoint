'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import BottomNav from '../../components/BottomNav'

export default function ResetPasswordPage() {

    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    async function sendReset() {

        if (!email.trim()) {
            setMessage('Please enter your email.')
            return
        }

        setLoading(true)
        setMessage('')

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`
        })

        if (error) {
            setMessage('Error sending reset email.')
        } else {
            setMessage('Password reset email sent.')
        }

        setLoading(false)
    }

    return (

        <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

            <h1 className="text-3xl font-semibold mb-8">
                Reset Password
            </h1>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">

                <div>

                    <label className="text-sm text-zinc-400 mb-2 block">
                        Email
                    </label>

                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="
                        w-full bg-black border border-zinc-700
                        rounded-lg px-3 py-2 text-white
                        focus:outline-none
                        focus:border-green-400
                        "
                    />

                </div>

                <button
                    onClick={sendReset}
                    disabled={loading}
                    className="
                    w-full py-3 rounded-xl border border-zinc-700
                    hover:border-green-400
                    hover:shadow-[0_0_12px_rgba(74,222,128,0.6)]
                    transition
                    "
                >
                    {loading ? 'Sending...' : 'Send Reset Email'}
                </button>

                {message && (
                    <div className="text-sm text-zinc-400">
                        {message}
                    </div>
                )}

            </div>

            <BottomNav />

        </div>

    )
}