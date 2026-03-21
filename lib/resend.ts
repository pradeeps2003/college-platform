import { Resend } from 'resend';

const resendSecret = process.env.RESEND_API_KEY;
const resend = resendSecret ? new Resend(resendSecret) : null;

export const sendWelcomeEmail = async (email: string, fullName: string) => {
  try {
     if (!resend) {
        console.log('RESEND_API_KEY is not defined, mock welcome email to:', email, fullName);
        return { success: true };
     }

     const { data, error } = await resend.emails.send({
         from: 'Clinical Repository <onboarding@resend.dev>',
         to: [email],
         subject: 'Welcome to the Clinical Repository!',
         html: `
           <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
             <h1>Welcome to Clinical Repository, ${fullName}!</h1>
             <p>We're excited to have you on board. You can now start browsing and uploading medical resources.</p>
             <div style="margin: 20px 0;">
               <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" 
                  style="background: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                 Go to Dashboard
               </a>
             </div>
           </div>
         `,
     });

     if (error) {
       console.error('Error sending welcome email:', error);
       return { success: false, error };
     }

     return { success: true, data };
  } catch (err) {
    console.error('Unexpected error in sendWelcomeEmail:', err);
    return { success: false, error: err };
  }
};
