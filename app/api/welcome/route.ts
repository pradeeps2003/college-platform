import { NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/resend'

export async function POST(req: Request) {
    try {
        const { email, fullName } = await req.json()
        
        const result = await sendWelcomeEmail(email, fullName)

        if (!result.success) {
            console.error('Error in welcome route result:', result.error)
            return NextResponse.json({ success: false, error: result.error }, { status: 400 })
        }

        return NextResponse.json({ success: true, message: 'Welcome process initiated' })
    } catch (err) {
        console.error('Unexpected error in welcome route:', err)
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}
