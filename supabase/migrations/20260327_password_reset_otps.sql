-- Table to store temporary OTPs for password resets
CREATE TABLE IF NOT EXISTS public.password_reset_otps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    otp TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_otps_email ON public.password_reset_otps(email);

-- Optional: Add a function to clean up expired OTPs
CREATE OR REPLACE FUNCTION clean_expired_otps() 
RETURNS void AS $$
BEGIN
    DELETE FROM public.password_reset_otps WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;
