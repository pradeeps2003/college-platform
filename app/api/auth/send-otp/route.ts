import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendOtpEmail } from '@/lib/resend'

// Initialize Supabase with Service Role to bypass RLS for OTP storage
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
    try {
        const { email } = await req.json()

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        // 1. Check if user exists
        const { data: user, error: userError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('email', email)
            .maybeSingle()

        if (userError || !user) {
            // Don't reveal if user exists for security, or show error if preferred
            return NextResponse.json({ error: 'No account found with this email.' }, { status: 404 })
        }

        // 2. Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        // 3. Store OTP in DB
        const { error: otpError } = await supabaseAdmin
            .from('password_reset_otps')
            .insert({
                email,
                otp,
                expires_at: expiresAt.toISOString()
            })

        if (otpError) {
            console.error('[API] OTP Storage Error:', otpError)
            return NextResponse.json({ error: 'Failed to generate code.' }, { status: 500 })
        }

        // 4. Send Email via Resend
        const emailResult = await sendOtpEmail(email, otp)

        if (!emailResult.success) {
            console.error('[API] Resend Error:', emailResult.error)
            return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: 'OTP sent successfully' })
    } catch (err) {
        console.error('[API] Unexpected error in send-otp:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
