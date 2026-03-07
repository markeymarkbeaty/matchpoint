import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {

    try {

        const { message, user_id } = await req.json()

        await resend.emails.send({
            from: 'MatchPoint <onboarding@resend.dev>',
            to: 'Markeymarkbeaty@gmail.com',
            subject: 'New MatchPoint Feedback',
            html: `
        <h2>New MatchPoint Feedback</h2>
        <p><strong>User ID:</strong> ${user_id}</p>
        <p>${message}</p>
      `
        })

        return NextResponse.json({ success: true })

    } catch (error) {

        console.error(error)

        return NextResponse.json(
            { error: 'Email failed' },
            { status: 500 }
        )

    }

}