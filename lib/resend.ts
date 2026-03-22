import { Resend } from 'resend';

const resendSecret = process.env.RESEND_API_KEY;
const resend = resendSecret ? new Resend(resendSecret) : null;

export const sendWelcomeEmail = async (email: string, fullName: string) => {
  try {
     if (!resend) {
        console.warn('RESEND_API_KEY is missing. Falling back to mock email for:', email);
        return { success: true, mocked: true };
     }

     const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

     const { data, error } = await resend.emails.send({
         from: 'Clinical Repository <onboarding@resend.dev>',
         to: [email],
         subject: 'Welcome to the Clinical Repository!',
         html: `
           <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a; background-color: #f9fafb; border-radius: 16px;">
             <div style="text-align: center; margin-bottom: 32px;">
               <h1 style="font-size: 32px; font-weight: 800; color: #000; margin: 0; letter-spacing: -0.025em;">Clinical Repository</h1>
               <p style="color: #6b7280; margin-top: 8px;">Your medical knowledge hub</p>
             </div>
             
             <div style="background-color: #ffffff; padding: 32px; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
               <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 16px;">Welcome, ${fullName}!</h2>
               <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 24px;">
                 We're thrilled to have you as part of our community. You now have full access to browse medical resources, upload your own findings, and collaborate with peers.
               </p>
               
               <div style="text-align: center; margin: 32px 0;">
                 <a href="${appUrl}/dashboard" 
                    style="display: inline-block; background-color: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: background-color 0.2s;">
                   Go to Dashboard
                 </a>
               </div>
               
               <p style="font-size: 14px; color: #9ca3af; margin-top: 32px;">
                 If you have any questions, feel free to reply to this email or visit our help center.
               </p>
             </div>
             
             <div style="text-align: center; margin-top: 32px; font-size: 12px; color: #9ca3af;">
               <p>&copy; ${new Date().getFullYear()} Clinical Repository. All rights reserved.</p>
             </div>
           </div>
         `,
     });

     if (error) {
       console.error('Resend error:', error);
       return { success: false, error };
     }

     return { success: true, data };
  } catch (err) {
    console.error('Unexpected error in sendWelcomeEmail:', err);
    return { success: false, error: err };
  }
};
