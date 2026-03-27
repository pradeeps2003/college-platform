import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase with Service Role to bypass RLS for OTP storage
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
    try {
        const { email, otp } = await req.json()

        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 })
        }

        // 1. Check if OTP is valid and not expired
        const { data: storedOtp, error: otpError } = await supabaseAdmin
            .from('password_reset_otps')
            .select('*')
            .eq('email', email)
            .eq('otp', otp)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (otpError || !storedOtp) {
            return NextResponse.json({ error: 'Invalid or expired code.' }, { status: 400 })
        }

        // OTP is valid. We don't delete yet because we need it for the final reset step
        // OR we can return a temporary token. For simplicity, just return success.

        return NextResponse.json({ success: true, message: 'OTP verified' })
    } catch (err) {
        console.error('[API] Unexpected error in verify-otp:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
