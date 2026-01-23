-- Hidden Gems Africa - Database Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE user_role AS ENUM ('visitor', 'owner', 'admin');
CREATE TYPE gem_status AS ENUM ('pending', 'approved', 'rejected', 'expired');
CREATE TYPE gem_tier AS ENUM ('standard', 'featured');
CREATE TYPE gem_category AS ENUM ('eat_drink', 'nature', 'stay', 'culture', 'adventure', 'entertainment');
CREATE TYPE media_type AS ENUM ('image', 'video');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_type AS ENUM ('new_listing', 'renewal', 'upgrade');

-- ============================================
-- TABLES
-- ============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role user_role DEFAULT 'visitor' NOT NULL,
    country TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Gems table
CREATE TABLE public.gems (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category gem_category NOT NULL,
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone TEXT,
    email TEXT,
    website TEXT,
    opening_hours TEXT,
    price_range TEXT,
    status gem_status DEFAULT 'pending' NOT NULL,
    tier gem_tier DEFAULT 'standard' NOT NULL,
    rejection_reason TEXT,
    views_count INTEGER DEFAULT 0 NOT NULL,
    average_rating DECIMAL(2, 1) DEFAULT 0 NOT NULL,
    ratings_count INTEGER DEFAULT 0 NOT NULL,
    current_term_start TIMESTAMPTZ,
    current_term_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Gem media table
CREATE TABLE public.gem_media (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    gem_id UUID REFERENCES public.gems(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    type media_type DEFAULT 'image' NOT NULL,
    is_cover BOOLEAN DEFAULT FALSE NOT NULL,
    "order" INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Ratings table
CREATE TABLE public.ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    gem_id UUID REFERENCES public.gems(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(gem_id, user_id)
);

-- Favorites table
CREATE TABLE public.favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    gem_id UUID REFERENCES public.gems(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, gem_id)
);

-- Payments table
CREATE TABLE public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    gem_id UUID REFERENCES public.gems(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'KES' NOT NULL,
    type payment_type NOT NULL,
    status payment_status DEFAULT 'pending' NOT NULL,
    provider TEXT NOT NULL,
    provider_reference TEXT,
    term_start TIMESTAMPTZ NOT NULL,
    term_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_gems_owner ON public.gems(owner_id);
CREATE INDEX idx_gems_status ON public.gems(status);
CREATE INDEX idx_gems_country ON public.gems(country);
CREATE INDEX idx_gems_category ON public.gems(category);
CREATE INDEX idx_gems_tier ON public.gems(tier);
CREATE INDEX idx_gems_slug ON public.gems(slug);
CREATE INDEX idx_gem_media_gem ON public.gem_media(gem_id);
CREATE INDEX idx_ratings_gem ON public.ratings(gem_id);
CREATE INDEX idx_ratings_user ON public.ratings(user_id);
CREATE INDEX idx_favorites_user ON public.favorites(user_id);
CREATE INDEX idx_favorites_gem ON public.favorites(gem_id);
CREATE INDEX idx_payments_gem ON public.payments(gem_id);
CREATE INDEX idx_payments_user ON public.payments(user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update gem rating stats
CREATE OR REPLACE FUNCTION update_gem_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE public.gems
        SET
            average_rating = COALESCE((SELECT AVG(score)::DECIMAL(2,1) FROM public.ratings WHERE gem_id = OLD.gem_id), 0),
            ratings_count = (SELECT COUNT(*) FROM public.ratings WHERE gem_id = OLD.gem_id)
        WHERE id = OLD.gem_id;
        RETURN OLD;
    ELSE
        UPDATE public.gems
        SET
            average_rating = COALESCE((SELECT AVG(score)::DECIMAL(2,1) FROM public.ratings WHERE gem_id = NEW.gem_id), 0),
            ratings_count = (SELECT COUNT(*) FROM public.ratings WHERE gem_id = NEW.gem_id)
        WHERE id = NEW.gem_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'visitor')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Update timestamps
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_gems_updated_at
    BEFORE UPDATE ON public.gems
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_ratings_updated_at
    BEFORE UPDATE ON public.ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update gem rating stats
CREATE TRIGGER update_gem_rating_stats_on_insert
    AFTER INSERT ON public.ratings
    FOR EACH ROW EXECUTE FUNCTION update_gem_rating_stats();

CREATE TRIGGER update_gem_rating_stats_on_update
    AFTER UPDATE ON public.ratings
    FOR EACH ROW EXECUTE FUNCTION update_gem_rating_stats();

CREATE TRIGGER update_gem_rating_stats_on_delete
    AFTER DELETE ON public.ratings
    FOR EACH ROW EXECUTE FUNCTION update_gem_rating_stats();

-- Handle new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gem_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles"
    ON public.users FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- Gems policies
CREATE POLICY "Anyone can view approved gems"
    ON public.gems FOR SELECT
    USING (status = 'approved');

CREATE POLICY "Owners can view their own gems"
    ON public.gems FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "Admins can view all gems"
    ON public.gems FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Owners can insert their own gems"
    ON public.gems FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their own gems"
    ON public.gems FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Admins can update any gem"
    ON public.gems FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Gem media policies
CREATE POLICY "Anyone can view gem media"
    ON public.gem_media FOR SELECT
    USING (true);

CREATE POLICY "Owners can manage their gem media"
    ON public.gem_media FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.gems
            WHERE id = gem_id AND owner_id = auth.uid()
        )
    );

-- Ratings policies
CREATE POLICY "Anyone can view ratings"
    ON public.ratings FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert ratings"
    ON public.ratings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
    ON public.ratings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
    ON public.ratings FOR DELETE
    USING (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Users can view their own favorites"
    ON public.favorites FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own favorites"
    ON public.favorites FOR ALL
    USING (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Users can view their own payments"
    ON public.payments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments"
    ON public.payments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
    ON public.payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
