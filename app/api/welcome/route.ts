import { NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/resend'

export async function POST(req: Request) {
    try {
        const { email, fullName } = await req.json()
        
        console.log(`[API] Initiating welcome email for: ${email} (${fullName})`);
        
        const result = await sendWelcomeEmail(email, fullName)

        if (!result.success) {
            console.error('[API] Resend failed:', result.error)
            return NextResponse.json({ success: false, error: result.error }, { status: 400 })
        }

        if (result.mocked) {
            console.warn('[API] Resend API key missing, mock email logged.');
            return NextResponse.json({ success: true, message: 'Welcome process mocked (key missing)' })
        }

        console.log('[API] Welcome email sent successfully');
        return NextResponse.json({ success: true, message: 'Welcome email sent' })
    } catch (err) {
        console.error('[API] Unexpected error in welcome route:', err)
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}

