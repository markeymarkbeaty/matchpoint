import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: Request) {

    console.log("Feedback email route triggered")

    try {

        const { message, user_id } = await req.json()

        console.log("Request data:", { message, user_id })

        const apiKey = process.env.RESEND_API_KEY
        console.log("API key exists:", !!apiKey)

        const resend = new Resend(apiKey)

        const result = await resend.emails.send({
            from: 'MatchPoint <onboarding@resend.dev>',
            to: 'Markeymarkbeaty@gmail.com',
            subject: 'New MatchPoint Feedback',
            html: `
        <h2>New MatchPoint Feedback</h2>
        <p><strong>User ID:</strong> ${user_id}</p>
        <p>${message}</p>
      `
        })

        console.log("Resend response:", result)

        return NextResponse.json({ success: true })

    } catch (error) {

        console.error("EMAIL ERROR:", error)

        return NextResponse.json(
            { error: 'Email failed' },
            { status: 500 }
        )

    }

}