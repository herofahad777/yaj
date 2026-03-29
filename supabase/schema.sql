-- Sewa Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    age INTEGER CHECK (age >= 18 AND age <= 120),
    avatar_url TEXT,
    roles TEXT[] DEFAULT '{}',
    is_verified BOOLEAN DEFAULT FALSE,
    skills TEXT[] DEFAULT '{}',
    completed BOOLEAN DEFAULT FALSE,
    city TEXT,
    district TEXT,
    state TEXT,
    service_radius TEXT DEFAULT 'city',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    last_location_update TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Problems table
CREATE TABLE problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    story TEXT,
    images TEXT[] DEFAULT '{}',
    proof_documents TEXT[] DEFAULT '{}',
    amount_needed BIGINT NOT NULL DEFAULT 0,
    amount_raised BIGINT NOT NULL DEFAULT 0,
    donors_count INTEGER NOT NULL DEFAULT 0,
    category TEXT NOT NULL CHECK (category IN ('public', 'disaster', 'medical', 'water', 'food', 'shelter', 'education', 'legal', 'other')) DEFAULT 'public',
    location TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES profiles(id),
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'completed')) DEFAULT 'pending',
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Donations table
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    amount BIGINT NOT NULL,
    payment_id TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Problem updates table
CREATE TABLE problem_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Problem helpers table
CREATE TABLE problem_helpers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id),
    role TEXT NOT NULL CHECK (role IN ('professional', 'volunteer')),
    contribution_type TEXT CHECK (contribution_type IN ('financial', 'skills', 'time', 'materials')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(problem_id, profile_id)
);

-- Problem reviews table
CREATE TABLE problem_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES profiles(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disaster chats table (for real-time chat during disasters)
CREATE TABLE disaster_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(problem_id)
);

-- Chat messages table
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    disaster_chat_id UUID NOT NULL REFERENCES disaster_chats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    message TEXT NOT NULL,
    encrypted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_helpers ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE disaster_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Problems policies
CREATE POLICY "Approved problems are viewable by everyone"
    ON problems FOR SELECT
    USING (status = 'approved' OR auth.uid() = created_by);

CREATE POLICY "Authenticated users can create problems"
    ON problems FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own problems"
    ON problems FOR UPDATE
    USING (auth.uid() = created_by);

-- Donations policies
CREATE POLICY "Donations are viewable by donor and problem creator"
    ON donations FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = (SELECT created_by FROM problems WHERE id = problem_id));

CREATE POLICY "Authenticated users can create donations"
    ON donations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Problem updates policies
CREATE POLICY "Updates are viewable by everyone for approved problems"
    ON problem_updates FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM problems 
            WHERE id = problem_id 
            AND (status = 'approved' OR auth.uid() = created_by)
        )
    );

CREATE POLICY "Problem creator can create updates"
    ON problem_updates FOR INSERT
    WITH CHECK (
        auth.uid() = (
            SELECT created_by FROM problems WHERE id = problem_id
        )
    );

-- Problem helpers policies
CREATE POLICY "Helpers are viewable by everyone for approved problems"
    ON problem_helpers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM problems 
            WHERE id = problem_id 
            AND (status = 'approved' OR auth.uid() = created_by)
        )
    );

CREATE POLICY "Authenticated users can join as helpers"
    ON problem_helpers FOR INSERT
    WITH CHECK (auth.uid() = profile_id);

-- Problem reviews policies
CREATE POLICY "Reviews are viewable by everyone for approved problems"
    ON problem_reviews FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM problems 
            WHERE id = problem_id 
            AND (status = 'approved' OR auth.uid() = created_by)
        )
    );

CREATE POLICY "Authenticated users can create reviews"
    ON problem_reviews FOR INSERT
    WITH CHECK (auth.uid() = reviewer_id);

-- Chat policies (simplified - full implementation needs realtime)
CREATE POLICY "Chat messages are viewable by chat participants"
    ON chat_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM disaster_chats dc
            JOIN problems p ON dc.problem_id = p.id
            WHERE dc.id = disaster_chat_id
            AND p.status = 'approved'
        )
    );

CREATE POLICY "Authenticated users can send messages"
    ON chat_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Storage buckets for images
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('problems', 'problems', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true);

-- Storage policies
CREATE POLICY "Anyone can view avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view problem images"
    ON storage.objects FOR SELECT
    USING (bucket_id IN ('problems', 'documents'));

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, full_name, avatar_url, is_verified, roles)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url',
        FALSE,
        ARRAY['person_in_need']
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_problems_updated_at
    BEFORE UPDATE ON problems
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- PROFILES TABLE ADDITIONAL COLUMNS
-- ========================================

-- Run these separately if columns don't exist:
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'none';
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS license_number TEXT;
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_registry TEXT;
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trust_score INT DEFAULT 0;
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS service_radius TEXT DEFAULT 'city';
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS district TEXT;
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state TEXT;

-- ========================================
-- VERIFICATION REQUESTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS helper_verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    profession TEXT NOT NULL,
    specialization TEXT,
    license_number TEXT,
    organization_name TEXT,
    certificate_url TEXT,
    id_proof_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- PROBLEM RESPONSES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS problem_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
    helper_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    response_type TEXT CHECK (response_type IN ('offer_help', 'advice', 'escalate')),
    message TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'accepted', 'completed', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- RLS POLICIES FOR NEW TABLES
-- ========================================

ALTER TABLE helper_verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_responses ENABLE ROW LEVEL SECURITY;

-- Helper verification requests policies
CREATE POLICY "Users can create verification requests"
    ON helper_verification_requests FOR INSERT
    WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can view their own verification requests"
    ON helper_verification_requests FOR SELECT
    USING (auth.uid() = profile_id);

CREATE POLICY "Anyone can view approved verification requests"
    ON helper_verification_requests FOR SELECT
    USING (status = 'approved');

CREATE POLICY "Profile owners can update their own requests"
    ON helper_verification_requests FOR UPDATE
    USING (auth.uid() = profile_id AND status = 'pending');

-- Problem responses policies
CREATE POLICY "Anyone can view problem responses"
    ON problem_responses FOR SELECT USING (true);

CREATE POLICY "Users can create problem responses"
    ON problem_responses FOR INSERT
    WITH CHECK (auth.uid() = helper_id);

CREATE POLICY "Response owners can update their responses"
    ON problem_responses FOR UPDATE
    USING (auth.uid() = helper_id);

-- ========================================
-- STORAGE BUCKET FOR VERIFICATION DOCS
-- ========================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('verification_docs', 'verification_docs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view verification documents"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'verification_docs');

CREATE POLICY "Authenticated users can upload verification documents"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'verification_docs' AND auth.uid() IS NOT NULL);

-- ========================================
-- SOS ALERTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS sos_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT,
    description TEXT,
    affected_count INTEGER DEFAULT 1,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'cancelled')),
    responders_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- ========================================
-- SOS NOTIFICATIONS TABLE (nearby helpers notified)
-- ========================================

CREATE TABLE IF NOT EXISTS sos_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sos_alert_id UUID REFERENCES sos_alerts(id) ON DELETE CASCADE,
    helper_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'arrived')),
    notification_type TEXT DEFAULT 'sos',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    UNIQUE(sos_alert_id, helper_id)
);

-- ========================================
-- RLS POLICIES FOR SOS TABLES
-- ========================================

ALTER TABLE sos_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_notifications ENABLE ROW LEVEL SECURITY;

-- SOS Alerts policies
CREATE POLICY "Anyone can view active SOS alerts"
    ON sos_alerts FOR SELECT
    USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can create SOS alerts"
    ON sos_alerts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "SOS creator can update their alerts"
    ON sos_alerts FOR UPDATE
    USING (auth.uid() = user_id);

-- SOS Notifications policies
CREATE POLICY "Helpers can view their SOS notifications"
    ON sos_notifications FOR SELECT
    USING (auth.uid() = helper_id);

CREATE POLICY "Helpers can update their SOS notification status"
    ON sos_notifications FOR UPDATE
    USING (auth.uid() = helper_id);

-- ========================================
-- ADD LOCATION FIELDS TO PROFILES (if not exist)
-- ========================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_location_update TIMESTAMPTZ;
