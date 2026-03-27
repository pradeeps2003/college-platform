import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase with Service Role to bypass RLS for password reset
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
    try {
        const { email, otp, newPassword } = await req.json()

        if (!email || !otp || !newPassword) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
        }

        // 1. Re-verify OTP for security (don't trust client-side only verification)
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
            return NextResponse.json({ error: 'Verification failed. Try sending code again.' }, { status: 400 })
        }

        // 2. Clear all OTPs for this email after it's been used
        await supabaseAdmin
            .from('password_reset_otps')
            .delete()
            .eq('email', email)

        // 3. Find User ID by email
        // We use supabase.auth.admin.listUsers() or query public.profiles if mapped
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single()

        if (!profile) {
            return NextResponse.json({ error: 'User not found.' }, { status: 404 })
        }

        // 4. Reset User Password via Admin API
        const { error: resetError } = await supabaseAdmin.auth.admin.updateUserById(
            profile.id,
            { password: newPassword }
        )

        if (resetError) {
            console.error('[API] Reset Error:', resetError)
            return NextResponse.json({ error: 'Failed to reset password.' }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: 'Password reset successfully' })
    } catch (err) {
        console.error('[API] Unexpected error in reset-api:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
