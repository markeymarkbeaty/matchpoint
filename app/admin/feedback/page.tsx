'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function AdminFeedbackPage() {

    const [feedback, setFeedback] = useState<any[]>([])

    useEffect(() => {
        loadFeedback()
    }, [])

    async function loadFeedback() {

        const { data } = await supabase
            .from('feedback')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) setFeedback(data)

    }

    return (

        <div className="min-h-screen bg-black text-white px-6 pt-14 pb-20">

            <h1 className="text-3xl font-semibold mb-8">
                Feedback Inbox
            </h1>

            <div className="space-y-4">

                {feedback.map((item) => (

                    <div
                        key={item.id}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
                    >

                        <div className="text-xs text-zinc-500 mb-2">
                            {new Date(item.created_at).toLocaleString()}
                        </div>

                        <div className="text-sm text-zinc-400 mb-2">
                            User: {item.user_id}
                        </div>

                        <div>
                            {item.message}
                        </div>

                    </div>

                ))}

            </div>

        </div>

    )

}