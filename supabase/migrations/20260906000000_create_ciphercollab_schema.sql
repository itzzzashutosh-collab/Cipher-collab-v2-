-- ============================================================================
-- CipherCollab Relational Database Migration for Supabase
-- Tables: creators, deals, requests, campaign_kpis
-- Target: PostgreSQL / Supabase
-- Based on types in: src/types.ts
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TABLE: creators
-- Holds verified creator dossier, channel statistics, rate cards, and metrics
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.creators (
    id VARCHAR(255) PRIMARY KEY,
    channel_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    handle VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    banner_url TEXT,
    bio TEXT,
    niche VARCHAR(100) NOT NULL,
    subscribers BIGINT NOT NULL DEFAULT 0,
    video_count INT NOT NULL DEFAULT 0,
    total_views BIGINT NOT NULL DEFAULT 0,
    avg_views_per_video BIGINT NOT NULL DEFAULT 0,
    engagement_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    cipher_score INT NOT NULL DEFAULT 0,
    country VARCHAR(100) DEFAULT 'United States',
    language VARCHAR(100) DEFAULT 'English',
    primary_audience JSONB NOT NULL DEFAULT '{}'::jsonb,
    rate_card JSONB NOT NULL DEFAULT '{}'::jsonb,
    availability JSONB NOT NULL DEFAULT '{"currentStatus":"Available","nextOpenQuarter":"Q4 2026","slots":[]}'::jsonb,
    delivery_metrics JSONB NOT NULL DEFAULT '{"onTimeDeliveryRate":100,"averageProductionDays":14,"completedDealsCount":0,"disputeRate":0}'::jsonb,
    sample_recent_videos JSONB NOT NULL DEFAULT '[]'::jsonb,
    brand_affinity TEXT[] DEFAULT ARRAY[]::TEXT[],
    past_collaborations JSONB NOT NULL DEFAULT '[]'::jsonb,
    content_specialization TEXT[] DEFAULT ARRAY[]::TEXT[],
    preferred_collaboration_types TEXT[] DEFAULT ARRAY[]::TEXT[],
    audience_demographics JSONB DEFAULT '{}'::jsonb,
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    is_custom_added BOOLEAN DEFAULT FALSE,
    raw_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for creators
CREATE INDEX IF NOT EXISTS idx_creators_niche ON public.creators(niche);
CREATE INDEX IF NOT EXISTS idx_creators_cipher_score ON public.creators(cipher_score DESC);
CREATE INDEX IF NOT EXISTS idx_creators_subscribers ON public.creators(subscribers DESC);
CREATE INDEX IF NOT EXISTS idx_creators_handle ON public.creators(handle);

-- ============================================================================
-- 2. TABLE: deals
-- Holds brand collaboration deals, milestones, and contracts
-- Foreign Key: creator_id -> creators(id) ON DELETE CASCADE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.deals (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    creator_id VARCHAR(255) NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE ON UPDATE CASCADE,
    creator_name VARCHAR(255),
    creator_avatar TEXT,
    creator_handle VARCHAR(255),
    creator_niche VARCHAR(100),
    brand_name VARCHAR(255) NOT NULL,
    deal_type VARCHAR(100) NOT NULL,
    compensation NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft',
    milestones JSONB NOT NULL DEFAULT '[]'::jsonb,
    contract_terms JSONB NOT NULL DEFAULT '{}'::jsonb,
    target_live_date TIMESTAMPTZ,
    campaign_goal TEXT,
    notes TEXT,
    raw_deal JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for deals
CREATE INDEX IF NOT EXISTS idx_deals_creator_id ON public.deals(creator_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON public.deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_brand_name ON public.deals(brand_name);
CREATE INDEX IF NOT EXISTS idx_deals_deal_type ON public.deals(deal_type);

-- Backwards compatibility view: collaborations -> deals
CREATE OR REPLACE VIEW public.collaborations AS SELECT * FROM public.deals;

-- ============================================================================
-- 3. TABLE: requests
-- Inbound brand proposals and sponsorship inquiries
-- Foreign Keys: creator_id -> creators(id), associated_deal_id -> deals(id)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.requests (
    id VARCHAR(255) PRIMARY KEY,
    brand_name VARCHAR(255) NOT NULL,
    brand_contact VARCHAR(255),
    creator_id VARCHAR(255) NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE ON UPDATE CASCADE,
    creator_name VARCHAR(255),
    creator_handle VARCHAR(255),
    creator_avatar TEXT,
    campaign_title VARCHAR(255) NOT NULL,
    campaign_objectives TEXT[] DEFAULT ARRAY[]::TEXT[],
    target_audience JSONB NOT NULL DEFAULT '{}'::jsonb,
    desired_deliverables JSONB NOT NULL DEFAULT '[]'::jsonb,
    budget_min NUMERIC(12, 2) DEFAULT 0.00,
    budget_max NUMERIC(12, 2) DEFAULT 0.00,
    proposed_budget_range JSONB NOT NULL DEFAULT '{"min":0,"max":0,"currency":"USD"}'::jsonb,
    timeline JSONB NOT NULL DEFAULT '{}'::jsonb,
    brief_guidelines TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    counter_offer JSONB,
    decline_reason TEXT,
    associated_deal_id VARCHAR(255) REFERENCES public.deals(id) ON DELETE SET NULL ON UPDATE CASCADE,
    raw_request JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for requests
CREATE INDEX IF NOT EXISTS idx_requests_creator_id ON public.requests(creator_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_brand_name ON public.requests(brand_name);
CREATE INDEX IF NOT EXISTS idx_requests_associated_deal ON public.requests(associated_deal_id);

-- Backwards compatibility view: collaboration_requests -> requests
CREATE OR REPLACE VIEW public.collaboration_requests AS SELECT * FROM public.requests;

-- ============================================================================
-- 4. TABLE: campaign_kpis
-- Live performance tracking and deliverables metrics
-- Foreign Key: creator_id -> creators(id) ON DELETE CASCADE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.campaign_kpis (
    id VARCHAR(255) PRIMARY KEY,
    campaign_name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255) NOT NULL,
    creator_id VARCHAR(255) NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE ON UPDATE CASCADE,
    creator_name VARCHAR(255),
    creator_handle VARCHAR(255),
    creator_avatar TEXT,
    platform VARCHAR(100) NOT NULL DEFAULT 'YouTube',
    youtube_video_id VARCHAR(100),
    youtube_video_url TEXT,
    start_date TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'Live Tracking',
    views_delivered BIGINT DEFAULT 0,
    metrics JSONB NOT NULL DEFAULT '{"impressions":{"target":0,"actual":0},"engagementRate":{"target":0,"actual":0},"websiteClicks":{"target":0,"actual":0},"conversions":{"target":0,"actual":0}}'::jsonb,
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    sync_source VARCHAR(100) DEFAULT 'YouTube Data API v3',
    notes TEXT,
    raw_kpi JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for campaign_kpis
CREATE INDEX IF NOT EXISTS idx_kpis_creator_id ON public.campaign_kpis(creator_id);
CREATE INDEX IF NOT EXISTS idx_kpis_status ON public.campaign_kpis(status);
CREATE INDEX IF NOT EXISTS idx_kpis_platform ON public.campaign_kpis(platform);

-- ============================================================================
-- 5. AUTOMATIC TIMESTAMP TRIGGER (updated_at)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_creators_updated_at ON public.creators;
CREATE TRIGGER trg_creators_updated_at
BEFORE UPDATE ON public.creators
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_deals_updated_at ON public.deals;
CREATE TRIGGER trg_deals_updated_at
BEFORE UPDATE ON public.deals
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_requests_updated_at ON public.requests;
CREATE TRIGGER trg_requests_updated_at
BEFORE UPDATE ON public.requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_kpis_updated_at ON public.campaign_kpis;
CREATE TRIGGER trg_kpis_updated_at
BEFORE UPDATE ON public.campaign_kpis
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- Configure open read/write access for authenticated & anon clients
-- ============================================================================
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_kpis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read creators" ON public.creators;
CREATE POLICY "Allow anon read creators" ON public.creators FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon modify creators" ON public.creators;
CREATE POLICY "Allow anon modify creators" ON public.creators FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon read deals" ON public.deals;
CREATE POLICY "Allow anon read deals" ON public.deals FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon modify deals" ON public.deals;
CREATE POLICY "Allow anon modify deals" ON public.deals FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon read requests" ON public.requests;
CREATE POLICY "Allow anon read requests" ON public.requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon modify requests" ON public.requests;
CREATE POLICY "Allow anon modify requests" ON public.requests FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon read kpis" ON public.campaign_kpis;
CREATE POLICY "Allow anon read kpis" ON public.campaign_kpis FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon modify kpis" ON public.campaign_kpis;
CREATE POLICY "Allow anon modify kpis" ON public.campaign_kpis FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
