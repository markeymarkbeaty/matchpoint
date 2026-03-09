'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

export default function LeaguePage() {

    const params = useParams()
    const leagueId = params.id as string

    const [leagueName, setLeagueName] = useState('')

    useEffect(() => {
        loadLeague()
    }, [])

    async function loadLeague() {

        const { data } = await supabase
            .from('leagues')
            .select('name')
            .eq('id', leagueId)
            .single()

        if (data) {
            setLeagueName(data.name)
        }

    }

    return (

        <div className="min-h-screen bg-black text-white px-5 pt-14 pb-32">

            <h1 className="text-3xl font-semibold mb-10">
                {leagueName || 'Loading league...'}
            </h1>

            <BottomNav />

        </div>

    )
}