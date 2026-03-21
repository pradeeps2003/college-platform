import { NextResponse } from 'next/server'
// import { Resend } from 'resend'

// const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
    try {
        const { email, fullName } = await req.json()
        console.log('Welcome email mock:', email, fullName)

        // if (!process.env.RESEND_API_KEY) {
        //     console.error('RESEND_API_KEY is not defined')
        //     return NextResponse.json({ success: false, error: 'API Key missing' }, { status: 500 })
        // }

        // const { data, error } = await resend.emails.send({
        //     from: 'Clinical Repository <onboarding@resend.dev>',
        //     to: [email],
        //     subject: 'Welcome to the Clinical Repository!',
        //     html: `...`,
        // })

        // if (error) {
        //     console.error('Error sending welcome email:', error)
        //     return NextResponse.json({ success: false, error }, { status: 400 })
        // }

        return NextResponse.json({ success: true, message: 'Mock email success' })
    } catch (err) {
        console.error('Unexpected error in welcome route:', err)
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}
