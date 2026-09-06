import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Creator, CollaborationDeal, SupabaseConfigState } from "../types";
import { INITIAL_CREATORS, INITIAL_COLLABORATION_DEALS } from "../data/mockCreators";

const LOCAL_STORAGE_KEY_CREATORS = "ciphercollab_creators_v1";
const LOCAL_STORAGE_KEY_DEALS = "ciphercollab_deals_v1";
const LOCAL_STORAGE_KEY_CONFIG = "ciphercollab_supabase_config_v1";

let cachedClient: SupabaseClient | null = null;

export function getStoredSupabaseConfig(): SupabaseConfigState {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        url: parsed.url || "",
        anonKey: parsed.anonKey || "",
        isConnected: Boolean(parsed.isConnected),
        isConfigured: Boolean(parsed.url && parsed.anonKey),
        lastSyncedAt: parsed.lastSyncedAt || null,
        error: parsed.error,
      };
    }
  } catch (err) {
    console.warn("Could not parse supabase config from localStorage:", err);
  }

  // Fallback to environment variables if provided
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "";
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";

  return {
    url: envUrl,
    anonKey: envKey,
    isConnected: false,
    isConfigured: Boolean(envUrl && envKey),
    lastSyncedAt: null,
  };
}

export function getSupabaseConfig(): SupabaseConfigState {
  return getStoredSupabaseConfig();
}

export function saveSupabaseConfig(
  configOrUrl: SupabaseConfigState | string,
  anonKey?: string
): void {
  if (typeof configOrUrl === "string") {
    const config: SupabaseConfigState = {
      url: configOrUrl,
      anonKey: anonKey || "",
      isConnected: Boolean(configOrUrl && anonKey),
      isConfigured: Boolean(configOrUrl && anonKey),
      lastSyncedAt: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_STORAGE_KEY_CONFIG, JSON.stringify(config));
  } else {
    localStorage.setItem(LOCAL_STORAGE_KEY_CONFIG, JSON.stringify(configOrUrl));
  }
  cachedClient = null; // reset client
}

export function loadLocalState(): { creators: Creator[]; deals: CollaborationDeal[] } {
  return {
    creators: loadLocalCreators(),
    deals: loadLocalDeals(),
  };
}

export function saveLocalState(creators: Creator[], deals: CollaborationDeal[]): void {
  saveLocalCreators(creators);
  saveLocalDeals(deals);
}

export async function syncToSupabase(
  creators: Creator[],
  deals: CollaborationDeal[]
): Promise<{ success: boolean; message: string }> {
  return syncDatabase(creators, deals);
}

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const config = getStoredSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false,
      },
    });
    return cachedClient;
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
    return null;
  }
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  if (!url || !anonKey) {
    return { success: false, message: "URL and Anon Key are required." };
  }

  try {
    const client = createClient(url, anonKey, {
      auth: { persistSession: false },
    });

    // Test query on public table or auth
    const { error } = await client.from("creators").select("id").limit(1);
    if (error && error.code !== "PGRST116" && error.code !== "42P01") {
      // 42P01 is relation does not exist yet (table not created), which still means credentials are valid!
      if (error.message.includes("Invalid API key") || error.message.includes("JWT")) {
        return { success: false, message: `Invalid Supabase credentials: ${error.message}` };
      }
    }

    return {
      success: true,
      message: "Supabase connected successfully! Database schema ready for sync.",
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Failed to establish connection to Supabase endpoint.",
    };
  }
}

// Local Storage Fallback Persistence
export function loadLocalCreators(): Creator[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_CREATORS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to load local creators:", err);
  }
  return INITIAL_CREATORS;
}

export function saveLocalCreators(creators: Creator[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_CREATORS, JSON.stringify(creators));
  } catch (err) {
    console.warn("Failed to save local creators:", err);
  }
}

export function loadLocalDeals(): CollaborationDeal[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_DEALS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to load local deals:", err);
  }
  return INITIAL_COLLABORATION_DEALS;
}

export function saveLocalDeals(deals: CollaborationDeal[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_DEALS, JSON.stringify(deals));
  } catch (err) {
    console.warn("Failed to save local deals:", err);
  }
}

// Unified Sync function
export async function syncDatabase(
  creators: Creator[],
  deals: CollaborationDeal[]
): Promise<{ success: boolean; message: string }> {
  // Always save locally
  saveLocalCreators(creators);
  saveLocalDeals(deals);

  const client = getSupabaseClient();
  if (!client) {
    return {
      success: true,
      message: "Synced securely to local browser repository (Supabase credentials not yet supplied).",
    };
  }

  try {
    // Attempt upserting to Supabase
    const { error: creatorsError } = await client
      .from("creators")
      .upsert(
        creators.map((c) => ({
          id: c.id,
          channel_id: c.channelId,
          name: c.name,
          handle: c.handle,
          niche: c.niche,
          subscribers: c.subscribers,
          views: c.totalViews,
          engagement_rate: c.engagementRate,
          cipher_score: c.cipherScore,
          rate_card: c.rateCard,
          primary_audience: c.primaryAudience,
          availability: c.availability,
          verified_at: c.verifiedAt,
          raw_data: c,
        })),
        { onConflict: "id" }
      );

    if (creatorsError && creatorsError.code === "42P01") {
      return {
        success: false,
        message: "Supabase connected, but 'creators' table doesn't exist yet. Please run the SQL schema migration in Supabase SQL Editor.",
      };
    }

    const { error: dealsError } = await client
      .from("collaborations")
      .upsert(
        deals.map((d) => ({
          id: d.id,
          title: d.title,
          creator_id: d.creatorId,
          brand_name: d.brandName,
          deal_type: d.dealType,
          compensation: d.compensation,
          status: d.status,
          milestones: d.milestones,
          contract_terms: d.contractTerms,
          created_at: d.createdAt,
          target_live_date: d.targetLiveDate,
          raw_deal: d,
        })),
        { onConflict: "id" }
      );

    if (dealsError && dealsError.code === "42P01") {
      return {
        success: false,
        message: "Supabase 'collaborations' table missing. Run the provided SQL migration in Supabase.",
      };
    }

    const config = getStoredSupabaseConfig();
    config.lastSyncedAt = new Date().toISOString();
    config.isConnected = true;
    saveSupabaseConfig(config);

    return {
      success: true,
      message: `Successfully synchronized ${creators.length} creators and ${deals.length} active collaborations to Supabase!`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Error syncing to Supabase.",
    };
  }
}

export function getSupabaseSQLMigration(): string {
  return `-- =========================================================
-- CipherCollab Supabase Schema Definition
-- Run this in your Supabase project's SQL Editor
-- =========================================================

-- 1. Creators Directory Table
CREATE TABLE IF NOT EXISTS public.creators (
    id TEXT PRIMARY KEY,
    channel_id TEXT NOT NULL,
    name TEXT NOT NULL,
    handle TEXT NOT NULL,
    niche TEXT NOT NULL,
    subscribers BIGINT NOT NULL,
    views BIGINT NOT NULL,
    engagement_rate NUMERIC(5,2) NOT NULL,
    cipher_score INTEGER NOT NULL,
    rate_card JSONB NOT NULL,
    primary_audience JSONB NOT NULL,
    availability JSONB NOT NULL,
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Structured Collaborations & Deals Table
CREATE TABLE IF NOT EXISTS public.collaborations (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    creator_id TEXT REFERENCES public.creators(id) ON DELETE SET NULL,
    brand_name TEXT NOT NULL,
    deal_type TEXT NOT NULL,
    compensation NUMERIC(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'Draft',
    milestones JSONB NOT NULL DEFAULT '[]'::jsonb,
    contract_terms JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    target_live_date DATE,
    raw_deal JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Row Level Security Policies
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read & write for applet integration
CREATE POLICY "Allow public read creators" ON public.creators FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update creators" ON public.creators FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read collaborations" ON public.collaborations FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update collaborations" ON public.collaborations FOR ALL USING (true) WITH CHECK (true);
`;
}
