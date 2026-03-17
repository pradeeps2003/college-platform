-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  department TEXT,
  year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resources table
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  semester INTEGER,
  department TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  download_count INTEGER DEFAULT 0,
  tags TEXT[],
  topic TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id)
);

-- Favorites
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

-- Download history
CREATE TABLE downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_resources_status ON resources(status);
CREATE INDEX idx_resources_department ON resources(department);
CREATE INDEX idx_resources_subject ON resources(subject);
CREATE INDEX idx_resources_uploaded_by ON resources(uploaded_by);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all, update own
CREATE POLICY "Public profiles viewable by all" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, department, year, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'department',
    (new.raw_user_meta_data->>'year')::integer,
    LOWER(COALESCE(new.raw_user_meta_data->>'role', 'student'))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Resources: Approved visible to all, own visible to uploader, all visible to admin
CREATE POLICY "Approved resources viewable by all" ON resources FOR SELECT 
  USING (status = 'approved' OR uploaded_by = auth.uid() OR 
         EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can insert resources" ON resources FOR INSERT 
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Admins can update resources" ON resources FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete resources" ON resources FOR DELETE 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Favorites: Users manage own
CREATE POLICY "Users manage own favorites" ON favorites 
  USING (auth.uid() = user_id);

-- Downloads: Users manage own
CREATE POLICY "Users manage own downloads" ON downloads 
  USING (auth.uid() = user_id);

-- STORAGE POLICIES (Note: Run this in the Storage -> Policies section if the SQL editor fails for storage objects, or ensure the extension is enabled)
-- Create a storage bucket named 'resources' first in the dashboard.

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'resources' AND auth.role() = 'authenticated');

-- Allow users to read approved files
CREATE POLICY "Users can read files" ON storage.objects FOR SELECT 
  USING (bucket_id = 'resources');

-- Allow admins to delete
CREATE POLICY "Admins can delete files" ON storage.objects FOR DELETE 
  USING (bucket_id = 'resources' AND 
         EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
