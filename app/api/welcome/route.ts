import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
    try {
        const { email, fullName } = await req.json()

        if (!process.env.RESEND_API_KEY) {
            console.error('RESEND_API_KEY is not defined')
            return NextResponse.json({ success: false, error: 'API Key missing' }, { status: 500 })
        }

        const { data, error } = await resend.emails.send({
            from: 'Clinical Repository <onboarding@resend.dev>',
            to: [email],
            subject: 'Welcome to the Clinical Repository!',
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
          <h1 style="color: #0070f3; font-weight: 800; tracking: tight;">Welcome to the Clinical Repository, ${fullName}!</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            We're excited to have you join our clinical knowledge hub. Your account has been successfully initialized.
          </p>
          <div style="background-color: #f0f7ff; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; font-weight: 600; color: #0070f3;">Next Steps:</p>
            <ul style="margin-top: 10px; color: #444;">
              <li>Explore study materials in the browse section</li>
              <li>Upload your own resources to help others</li>
              <li>Collaborate with fellow medical students</li>
            </ul>
          </div>
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            If you have any questions, feel free to reply to this email.
          </p>
          <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
          <p style="text-align: center; font-size: 12px; color: #999;">
            © ${new Date().getFullYear()} Clinical Repository. All rights reserved.
          </p>
        </div>
      `,
        })

        if (error) {
            console.error('Error sending welcome email:', error)
            return NextResponse.json({ success: false, error }, { status: 400 })
        }

        return NextResponse.json({ success: true, data })
    } catch (err) {
        console.error('Unexpected error sending welcome email:', err)
        return NextResponse.json({ success: false, error: err }, { status: 500 })
    }
}
