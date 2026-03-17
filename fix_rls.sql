-- Allow admins to see ALL resources regardless of status
-- First, drop existing select policy if you know its name, or just add a new one.
-- Usually, it's better to update the existing policy.

-- If you have a policy like "Public resources are viewable by everyone"
-- you should update it to allow admins to see everything.

-- 1. DROP old policy (assuming default name from previous steps or common names)
DROP POLICY IF EXISTS "Resources are viewable by everyone" ON resources;
DROP POLICY IF EXISTS "Anyone can view approved resources" ON resources;

-- 2. CREATE new robust policy
-- Everyone can see 'approved' resources.
-- Owners can see their own resources (even if pending).
-- Admins can see EVERYTHING.

CREATE POLICY "Resources are viewable by authorized users"
ON resources FOR SELECT
USING (
  status = 'approved' OR 
  auth.uid() = uploaded_by OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Do the same for profiles if needed (though we already have a public select policy there)
-- Just ensuring admins can update resources (approval/rejection)
DROP POLICY IF EXISTS "Admins can update resources" ON resources;
CREATE POLICY "Admins can update resources" 
ON resources FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
