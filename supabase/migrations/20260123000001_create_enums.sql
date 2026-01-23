-- Create all enum types used across the application

CREATE TYPE user_role AS ENUM ('visitor', 'owner', 'admin');
CREATE TYPE gem_status AS ENUM ('pending', 'approved', 'rejected', 'expired');
CREATE TYPE gem_tier AS ENUM ('standard', 'featured');
CREATE TYPE gem_category AS ENUM ('eat_drink', 'nature', 'stay', 'culture', 'adventure', 'entertainment');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_type AS ENUM ('new_listing', 'renewal', 'upgrade');
CREATE TYPE media_type AS ENUM ('image', 'video');
