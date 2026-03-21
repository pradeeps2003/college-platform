// import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = async (email: string, fullName: string) => {
  try {
     console.log('Mock welcome email to:', email, fullName);
     return { success: true };
  } catch (err) {
    console.error('Unexpected error in sendWelcomeEmail mock:', err);
    return { success: false, error: err };
  }
};
