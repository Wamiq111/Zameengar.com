-- Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- TABLE: profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  city TEXT,
  role TEXT DEFAULT 'user',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: locations
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  area TEXT,
  society TEXT,
  block TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: properties
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,

  title TEXT NOT NULL,
  description TEXT,

  purpose TEXT NOT NULL,
  property_type TEXT NOT NULL,

  price NUMERIC NOT NULL,
  price_period TEXT,

  city TEXT NOT NULL,
  area TEXT,
  society TEXT,
  block TEXT,
  address TEXT,

  latitude NUMERIC,
  longitude NUMERIC,

  area_value NUMERIC NOT NULL,
  area_unit TEXT NOT NULL,

  bedrooms INTEGER,
  bathrooms INTEGER,
  floors INTEGER,
  parking_spaces INTEGER,

  year_built INTEGER,
  furnished BOOLEAN,

  status TEXT DEFAULT 'pending',
  rejection_reason TEXT,

  is_featured BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- TABLE: property_images
CREATE TABLE property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,

  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: property_features
CREATE TABLE property_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL
);

-- TABLE: favorites
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- TABLE: inquiries
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  name TEXT,
  email TEXT,
  phone TEXT,
  message TEXT,

  status TEXT DEFAULT 'new',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: property_reports
CREATE TABLE property_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'reviewing',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- TABLE: admin_logs
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  description TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_properties_owner ON properties(owner_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_purpose ON properties(purpose);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_created_at ON properties(created_at);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles RLS
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Categories RLS
CREATE POLICY "Categories are viewable by everyone." ON categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories." ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 3. Locations RLS
CREATE POLICY "Locations are viewable by everyone." ON locations FOR SELECT USING (true);
CREATE POLICY "Admins can manage locations." ON locations FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 4. Properties RLS
CREATE POLICY "Approved properties are viewable by everyone." ON properties FOR SELECT USING (status = 'approved');
CREATE POLICY "Users can view own properties." ON properties FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Admins can view all properties." ON properties FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Users can insert own properties." ON properties FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own properties." ON properties FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own properties." ON properties FOR DELETE USING (auth.uid() = owner_id);
CREATE POLICY "Admins can manage all properties." ON properties FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 5. Property Images RLS
CREATE POLICY "Images of approved properties are viewable by everyone." ON property_images FOR SELECT USING (
  EXISTS (SELECT 1 FROM properties WHERE properties.id = property_images.property_id AND properties.status = 'approved')
);
CREATE POLICY "Users can view images of own properties." ON property_images FOR SELECT USING (
  EXISTS (SELECT 1 FROM properties WHERE properties.id = property_images.property_id AND properties.owner_id = auth.uid())
);
CREATE POLICY "Admins can view all images." ON property_images FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Users can insert images for own properties." ON property_images FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM properties WHERE properties.id = property_images.property_id AND properties.owner_id = auth.uid())
);
CREATE POLICY "Users can update images for own properties." ON property_images FOR UPDATE USING (
  EXISTS (SELECT 1 FROM properties WHERE properties.id = property_images.property_id AND properties.owner_id = auth.uid())
);
CREATE POLICY "Users can delete images for own properties." ON property_images FOR DELETE USING (
  EXISTS (SELECT 1 FROM properties WHERE properties.id = property_images.property_id AND properties.owner_id = auth.uid())
);
CREATE POLICY "Admins can manage all images." ON property_images FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 6. Property Features RLS
CREATE POLICY "Features of approved properties are viewable." ON property_features FOR SELECT USING (
  EXISTS (SELECT 1 FROM properties WHERE properties.id = property_features.property_id AND properties.status = 'approved')
);
CREATE POLICY "Users can manage features of own properties." ON property_features FOR ALL USING (
  EXISTS (SELECT 1 FROM properties WHERE properties.id = property_features.property_id AND properties.owner_id = auth.uid())
);
CREATE POLICY "Admins can manage all features." ON property_features FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 7. Favorites RLS
CREATE POLICY "Users can view own favorites." ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites." ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites." ON favorites FOR DELETE USING (auth.uid() = user_id);

-- 8. Inquiries RLS
CREATE POLICY "Users can view inquiries they sent or received." ON inquiries FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can insert inquiries." ON inquiries FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Receivers can update inquiry status." ON inquiries FOR UPDATE USING (auth.uid() = receiver_id);
CREATE POLICY "Admins can manage all inquiries." ON inquiries FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 9. Property Reports RLS
CREATE POLICY "Users can view own reports." ON property_reports FOR SELECT USING (auth.uid() = reported_by);
CREATE POLICY "Users can insert reports." ON property_reports FOR INSERT WITH CHECK (auth.uid() = reported_by);
CREATE POLICY "Admins can manage all reports." ON property_reports FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 10. Admin Logs RLS
CREATE POLICY "Admins can view logs." ON admin_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins can insert logs." ON admin_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Functions and Triggers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: In production you should ensure the trigger runs on auth.users insert.
-- We assume it's set up in Supabase dashboard or via additional migrations.
