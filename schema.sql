-- ==========================================================================
-- HAZEL STREETWEAR // PRODUCTION SUPABASE DATABASE & STORAGE SCHEMA
-- Egyptian High-Demand Streetwear Brand • @fire_hazel1 • Cairo Flagship
-- Lead Architect: Full-Stack Architecture & Cloud CMS
-- ==========================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================================================
-- 2. PRODUCTS TABLE
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Outerwear',
    tag TEXT NOT NULL,
    price NUMERIC NOT NULL CHECK (price >= 0),
    sizes TEXT[] NOT NULL DEFAULT ARRAY['S', 'M', 'L', 'XL'],
    images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    status TEXT NOT NULL DEFAULT 'DROP 004 // ACTIVE',
    status_type TEXT NOT NULL DEFAULT 'badge-warning',
    in_stock BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==========================================================================
-- 3. SITE SETTINGS TABLE (LIVE CONTENT CMS ENGINE & SHOWROOM GALLERY)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'main_config',
    ticker_text TEXT NOT NULL DEFAULT 'DROP 004 IS LIVE • CAIRO FLAGSHIP SHOWROOM OPEN NOW • SHIPPING AVAILABLE FOR CAIRO & GIZA • خدمة الشحن متوفرة للقاهرة والجيزة • INSTAPAY & VODAFONE CASH ACCEPTED',
    hero_headline TEXT NOT NULL DEFAULT 'RAW CUTS. HIGH DENSITY. NO COMPROMISE.',
    hero_subheadline TEXT NOT NULL DEFAULT 'Forged in Cairo. Heavyweight textiles, architectural streetwear silhouettes, and unfiltered energy from the flagship showroom floor to the digital feed.',
    showroom_hours TEXT NOT NULL DEFAULT 'Mon – Sun: 14:00 – 23:00 CAI',
    showroom_coords TEXT NOT NULL DEFAULT '30.0444° N, 31.2357° E',
    showroom_address TEXT NOT NULL DEFAULT 'Zahraa El Maadi, 50th Street, Next to Ezz El Menoufy — Cairo, Egypt',
    developer_credit TEXT NOT NULL DEFAULT 'DEVELOPED BY MOHAMED TAMER',
    developer_phone TEXT NOT NULL DEFAULT '+201129333453',
    whatsapp_number TEXT NOT NULL DEFAULT '201282350233',
    vip_alert_status TEXT NOT NULL DEFAULT 'ACTIVE // CAIRO METROPOLITAN',
    showroom_gallery TEXT[] NOT NULL DEFAULT ARRAY['./assets/cairo-showroom.jpg']::TEXT[],
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==========================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Products Policies: Public Read + Authenticated/Admin CRUD
CREATE POLICY "Allow public read access on products"
    ON public.products FOR SELECT
    USING (true);

CREATE POLICY "Allow all insert on products"
    ON public.products FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow all update on products"
    ON public.products FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all delete on products"
    ON public.products FOR DELETE
    USING (true);

-- Site Settings Policies: Public Read + Authenticated/Admin Management
CREATE POLICY "Allow public read access on site_settings"
    ON public.site_settings FOR SELECT
    USING (true);

CREATE POLICY "Allow all insert on site_settings"
    ON public.site_settings FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow all update on site_settings"
    ON public.site_settings FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- ==========================================================================
-- 5. STORAGE BUCKET: product-media (PUBLIC)
-- ==========================================================================
-- Insert bucket record into Supabase storage.buckets if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-media',
    'product-media',
    true,
    15728640, -- 15MB limit per image
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies: Public Access to product-media bucket
CREATE POLICY "Public Read Access on product-media"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'product-media');

CREATE POLICY "Public Insert Access on product-media"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'product-media');

CREATE POLICY "Public Update Access on product-media"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'product-media')
    WITH CHECK (bucket_id = 'product-media');

CREATE POLICY "Public Delete Access on product-media"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'product-media');

-- ==========================================================================
-- 6. SEED INITIAL DATA (AUTHENTIC HAZEL DROP 004 CAPSULE)
-- ==========================================================================
INSERT INTO public.products (title, category, tag, price, sizes, images, status, status_type, in_stock)
VALUES
(
    'PERTEX BALACLAVA PUFFER JACKET',
    'Outerwear',
    '[ HEAVY INSULATION // TECHNICAL NYLON ]',
    3850,
    ARRAY['S', 'M', 'L', 'XL'],
    ARRAY['./assets/products/puffer-front.jpg', './assets/products/puffer-back.jpg'],
    'LOW STOCK / DROP 004',
    'badge-warning',
    true
),
(
    'GRADIENT MOHAIR ARROW SWEATER',
    'Knitwear',
    '[ 450 GSM BRUSHED MOHAIR BLEND ]',
    2450,
    ARRAY['M', 'L', 'XL'],
    ARRAY['./assets/products/knit-front.jpg', './assets/products/knit-back.jpg'],
    'EXCLUSIVE ALLOCATION',
    'badge-exclusive',
    true
),
(
    'TECHNICAL UMBRO ARCHIVE TRACKSUIT',
    'Sets & Tracksuits',
    '[ WATER-REPELLENT NYLON SET ]',
    2950,
    ARRAY['S', 'M', 'L'],
    ARRAY['./assets/products/tracksuit.jpg'],
    'LIMITED DROP',
    'badge-limited',
    true
),
(
    'GOTHIC APPLIQUÉ HEAVYWEIGHT DENIM',
    'Bottoms & Denim',
    '[ 14 OZ RAW BLACK DENIM // EMBROIDERED ]',
    2250,
    ARRAY['30', '32', '34', '36'],
    ARRAY['./assets/products/denim-detail.jpg'],
    'RESTOCK COMPLETED',
    'badge-restock',
    true
)
ON CONFLICT DO NOTHING;

-- Seed Single-Row Site Settings
INSERT INTO public.site_settings (
    id,
    ticker_text,
    hero_headline,
    hero_subheadline,
    showroom_hours,
    showroom_coords,
    showroom_address,
    developer_credit,
    developer_phone,
    whatsapp_number,
    vip_alert_status,
    showroom_gallery
)
VALUES (
    'main_config',
    'DROP 004 IS LIVE • CAIRO FLAGSHIP SHOWROOM OPEN NOW • SHIPPING AVAILABLE FOR CAIRO & GIZA • خدمة الشحن متوفرة للقاهرة والجيزة • INSTAPAY & VODAFONE CASH ACCEPTED',
    'RAW CUTS. HIGH DENSITY. NO COMPROMISE.',
    'Forged in Cairo. Heavyweight textiles, architectural streetwear silhouettes, and unfiltered energy from the flagship showroom floor to the digital feed.',
    'Mon – Sun: 14:00 – 23:00 CAI',
    '30.0444° N, 31.2357° E',
    'Zahraa El Maadi, 50th Street, Next to Ezz El Menoufy — Cairo, Egypt',
    'DEVELOPED BY MOHAMED TAMER',
    '+201129333453',
    '201282350233',
    'ACTIVE // CAIRO METROPOLITAN',
    ARRAY['./assets/cairo-showroom.jpg']::TEXT[]
)
ON CONFLICT (id) DO UPDATE SET updated_at = timezone('utc'::text, now());
