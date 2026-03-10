'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import BottomNav from '../../components/BottomNav'

export default function UpdatePasswordPage() {

    const router = useRouter()

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    async function updatePassword() {

        if (!password || !confirmPassword) {
            setMessage('Please fill in both fields.')
            return
        }

        if (password !== confirmPassword) {
            setMessage('Passwords do not match.')
            return
        }

        if (password.length < 6) {
            setMessage('Password must be at least 6 characters.')
            return
        }

        setLoading(true)
        setMessage('')

        const { error } = await supabase.auth.updateUser({
            password: password
        })

        if (error) {
            setMessage('Error updating password.')
        } else {
            setMessage('Password updated successfully.')
            setTimeout(() => {
                router.push('/home')
            }, 1500)
        }

        setLoading(false)
    }

    return (

        <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

            <h1 className="text-3xl font-semibold mb-8">
                Set New Password
            </h1>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">

                <div>

                    <label className="text-sm text-zinc-400 mb-2 block">
                        New Password
                    </label>

                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="
                        w-full bg-black border border-zinc-700
                        rounded-lg px-3 py-2 text-white
                        focus:outline-none
                        focus:border-green-400
                        "
                    />

                </div>

                <div>

                    <label className="text-sm text-zinc-400 mb-2 block">
                        Confirm Password
                    </label>

                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="
                        w-full bg-black border border-zinc-700
                        rounded-lg px-3 py-2 text-white
                        focus:outline-none
                        focus:border-green-400
                        "
                    />

                </div>

                <button
                    onClick={updatePassword}
                    disabled={loading}
                    className="
                    w-full py-3 rounded-xl border border-zinc-700
                    hover:border-green-400
                    hover:shadow-[0_0_12px_rgba(74,222,128,0.6)]
                    transition
                    "
                >
                    {loading ? 'Updating...' : 'Update Password'}
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