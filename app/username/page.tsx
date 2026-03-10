'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import BottomNav from '../../components/BottomNav'

export default function UsernamePage() {

    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        loadUsername()
    }, [])

    async function loadUsername() {

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        const { data } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .single()

        if (data?.username) {
            setUsername(data.username)
        }

        setLoading(false)
    }

    async function updateUsername() {

        if (!username.trim()) {
            setMessage('Username cannot be empty.')
            return
        }

        setSaving(true)
        setMessage('')

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        const { error } = await supabase
            .from('profiles')
            .update({ username })
            .eq('id', user.id)

        if (error) {
            setMessage('Error updating username.')
        } else {
            setMessage('Username updated successfully.')
        }

        setSaving(false)
    }

    return (

        <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

            <h1 className="text-3xl font-semibold mb-8">
                Update Username
            </h1>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">

                {loading ? (

                    <div className="text-zinc-400">
                        Loading username...
                    </div>

                ) : (

                    <>
                        <div>

                            <label className="text-sm text-zinc-400 mb-2 block">
                                Username
                            </label>

                            <input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="
                                w-full bg-black border border-zinc-700
                                rounded-lg px-3 py-2 text-white
                                focus:outline-none
                                focus:border-green-400
                                "
                            />

                        </div>

                        <button
                            onClick={updateUsername}
                            disabled={saving}
                            className="
                            w-full py-3 rounded-xl border border-zinc-700
                            hover:border-green-400
                            hover:shadow-[0_0_12px_rgba(74,222,128,0.6)]
                            transition
                            "
                        >
                            {saving ? 'Saving...' : 'Save Username'}
                        </button>

                        {message && (
                            <div className="text-sm text-zinc-400">
                                {message}
                            </div>
                        )}

                    </>

                )}

            </div>

            <BottomNav />

        </div>

    )

}