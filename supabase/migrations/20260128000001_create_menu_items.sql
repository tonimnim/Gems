-- Menu Items table (for eat_drink gems only)
CREATE TABLE public.menu_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gem_id UUID REFERENCES public.gems(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'KES' NOT NULL,
    category TEXT NOT NULL, -- e.g., 'Starters', 'Main Course', 'Desserts', 'Drinks', 'Sides'
    image_url TEXT, -- Optional image
    is_available BOOLEAN DEFAULT TRUE NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE NOT NULL, -- Featured/signature dishes
    "order" INTEGER DEFAULT 0 NOT NULL, -- For custom ordering within category
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_menu_items_gem ON public.menu_items(gem_id);
CREATE INDEX idx_menu_items_category ON public.menu_items(category);
CREATE INDEX idx_menu_items_available ON public.menu_items(is_available);

-- Update timestamp trigger
CREATE TRIGGER update_menu_items_updated_at
    BEFORE UPDATE ON public.menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone can view menu items for approved gems
CREATE POLICY "Anyone can view menu items"
    ON public.menu_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.gems
            WHERE id = gem_id AND status = 'approved'
        )
    );

-- Owners can view their own gem's menu items (even if gem not approved)
CREATE POLICY "Owners can view their gem menu items"
    ON public.menu_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.gems
            WHERE id = gem_id AND owner_id = auth.uid()
        )
    );

-- Owners can insert menu items for their gems
CREATE POLICY "Owners can insert menu items"
    ON public.menu_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.gems
            WHERE id = gem_id AND owner_id = auth.uid()
        )
    );

-- Owners can update their gem's menu items
CREATE POLICY "Owners can update menu items"
    ON public.menu_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.gems
            WHERE id = gem_id AND owner_id = auth.uid()
        )
    );

-- Owners can delete their gem's menu items
CREATE POLICY "Owners can delete menu items"
    ON public.menu_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.gems
            WHERE id = gem_id AND owner_id = auth.uid()
        )
    );

-- Admins can manage all menu items
CREATE POLICY "Admins can manage all menu items"
    ON public.menu_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
