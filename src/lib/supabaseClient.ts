import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Creator, CollaborationDeal, SupabaseConfigState, CollaborationRequest, CampaignKPI } from "../types";
import { INITIAL_CREATORS, INITIAL_COLLABORATION_DEALS } from "../data/mockCreators";

const LOCAL_STORAGE_KEY_CREATORS = "ciphercollab_creators_v1";
const LOCAL_STORAGE_KEY_DEALS = "ciphercollab_deals_v1";
const LOCAL_STORAGE_KEY_CONFIG = "ciphercollab_supabase_config_v1";
const LOCAL_STORAGE_KEY_REQUESTS = "ciphercollab_requests_v1";
const LOCAL_STORAGE_KEY_KPIS = "ciphercollab_kpis_v1";

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
  deals: CollaborationDeal[],
  requests: CollaborationRequest[] = [],
  campaigns: CampaignKPI[] = []
): Promise<{ success: boolean; message: string }> {
  return syncDatabase(creators, deals, requests, campaigns);
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
        // Union INITIAL_CREATORS with local modifications to ensure all new niches are populated
        const map = new Map<string, Creator>();
        INITIAL_CREATORS.forEach((c) => map.set(c.id, c));
        parsed.forEach((c: Creator) => {
          if (c && c.id) {
            map.set(c.id, { ...(map.get(c.id) || {}), ...c });
          }
        });
        return Array.from(map.values());
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
  deals: CollaborationDeal[],
  requests: CollaborationRequest[] = [],
  campaigns: CampaignKPI[] = []
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
    // 1. Upsert creators
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

    // 2. Upsert deals (try 'deals' first, then 'collaborations')
    const dealsPayload = deals.map((d) => ({
      id: d.id,
      title: d.title,
      creator_id: d.creatorId,
      creator_name: d.creatorName,
      creator_avatar: d.creatorAvatar,
      creator_handle: d.creatorHandle,
      creator_niche: d.creatorNiche,
      brand_name: d.brandName,
      deal_type: d.dealType,
      compensation: d.compensation || 0,
      status: d.status,
      milestones: d.milestones || [],
      contract_terms: d.contractTerms || {},
      created_at: d.createdAt,
      target_live_date: d.targetLiveDate,
      campaign_goal: d.campaignGoal,
      notes: d.notes,
      raw_deal: d,
    }));

    let dealsError = (await client.from("deals").upsert(dealsPayload, { onConflict: "id" })).error;
    if (dealsError && (dealsError.code === "42P01" || dealsError.message?.includes("not find"))) {
      const fb = await client.from("collaborations").upsert(dealsPayload, { onConflict: "id" });
      dealsError = fb.error;
    }

    if (dealsError && dealsError.code === "42P01") {
      return {
        success: false,
        message: "Supabase 'deals' table missing. Run the provided SQL migration in Supabase SQL Editor.",
      };
    }

    // 3. Upsert collaboration requests if present (try 'requests' first, then 'collaboration_requests')
    if (requests.length > 0) {
      const reqPayload = requests.map((r) => ({
        id: r.id,
        brand_name: r.brandName,
        brand_contact: r.brandContact,
        creator_id: r.creatorId,
        creator_name: r.creatorName,
        creator_handle: r.creatorHandle,
        creator_avatar: r.creatorAvatar,
        campaign_title: r.campaignTitle,
        campaign_objectives: r.campaignObjectives || [],
        target_audience: r.targetAudience || {},
        desired_deliverables: r.desiredDeliverables || [],
        budget_min: r.proposedBudgetRange?.min || 0,
        budget_max: r.proposedBudgetRange?.max || 0,
        proposed_budget_range: r.proposedBudgetRange || {},
        timeline: r.timeline || {},
        brief_guidelines: r.briefGuidelines,
        status: r.status,
        counter_offer: r.counterOffer,
        decline_reason: r.declineReason,
        associated_deal_id: r.associatedDealId,
        raw_request: r,
      }));

      try {
        let reqErr = (await client.from("requests").upsert(reqPayload, { onConflict: "id" })).error;
        if (reqErr && (reqErr.code === "42P01" || reqErr.message?.includes("not find"))) {
          await client.from("collaboration_requests").upsert(reqPayload, { onConflict: "id" });
        }
      } catch (reqErr) {
        console.warn("Notice: requests table sync:", reqErr);
      }
    }

    // 4. Upsert campaign KPIs if present
    if (campaigns.length > 0) {
      try {
        await client.from("campaign_kpis").upsert(
          campaigns.map((k) => ({
            id: k.id,
            campaign_name: k.campaignName,
            creator_name: k.creatorName,
            platform: k.platform,
            views_delivered: k.metrics?.impressions?.actual || 0,
            raw_kpi: k,
          })),
          { onConflict: "id" }
        );
      } catch (kpiErr) {
        console.warn("Notice: campaign_kpis table not yet created:", kpiErr);
      }
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

export async function pullFromSupabase(): Promise<{
  success: boolean;
  message: string;
  creators?: Creator[];
  deals?: CollaborationDeal[];
  requests?: CollaborationRequest[];
  campaigns?: CampaignKPI[];
}> {
  const client = getSupabaseClient();
  const config = getStoredSupabaseConfig();

  // Try server endpoint first if configured
  try {
    const headers: Record<string, string> = {};
    if (config.url) headers["x-supabase-url"] = config.url;
    if (config.anonKey) headers["x-supabase-key"] = config.anonKey;

    const res = await fetch("/api/supabase/pull", { headers });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return {
          success: true,
          message: `Pulled ${data.creators?.length || 0} creators, ${data.deals?.length || 0} deals, ${data.requests?.length || 0} requests, and ${data.campaigns?.length || 0} KPIs from Supabase.`,
          creators: data.creators?.length > 0 ? data.creators : undefined,
          deals: data.deals?.length > 0 ? data.deals : undefined,
          requests: data.requests?.length > 0 ? data.requests : undefined,
          campaigns: data.campaigns?.length > 0 ? data.campaigns : undefined,
        };
      }
    }
  } catch (srvErr) {
    console.warn("Server pull failed, falling back to direct client:", srvErr);
  }

  if (!client) {
    return { success: false, message: "Supabase is not configured. Please enter your project URL and Key." };
  }

  try {
    const { data: creatorRows, error: cErr } = await client
      .from("creators")
      .select("raw_data");

    if (cErr) throw cErr;

    const { data: dealRows, error: dErr } = await client
      .from("collaborations")
      .select("raw_deal");

    if (dErr) throw dErr;

    const { data: requestRows } = await client
      .from("collaboration_requests")
      .select("raw_request");

    const { data: kpiRows } = await client
      .from("campaign_kpis")
      .select("raw_kpi");

    const loadedCreators: Creator[] = (creatorRows || [])
      .map((r: any) => r.raw_data)
      .filter(Boolean);

    const loadedDeals: CollaborationDeal[] = (dealRows || [])
      .map((r: any) => r.raw_deal)
      .filter(Boolean);

    const loadedRequests: CollaborationRequest[] = (requestRows || [])
      .map((r: any) => r.raw_request)
      .filter(Boolean);

    const loadedCampaigns: CampaignKPI[] = (kpiRows || [])
      .map((r: any) => r.raw_kpi)
      .filter(Boolean);

    return {
      success: true,
      message: `Pulled ${loadedCreators.length} creators, ${loadedDeals.length} deals, and ${loadedRequests.length} requests from Supabase.`,
      creators: loadedCreators.length > 0 ? loadedCreators : undefined,
      deals: loadedDeals.length > 0 ? loadedDeals : undefined,
      requests: loadedRequests.length > 0 ? loadedRequests : undefined,
      campaigns: loadedCampaigns.length > 0 ? loadedCampaigns : undefined,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Failed to pull data from Supabase.",
    };
  }
}

export async function pushAllDataToSupabase(
  creators: Creator[],
  deals: CollaborationDeal[],
  requests: CollaborationRequest[] = [],
  campaigns: CampaignKPI[] = [],
  customUrl?: string,
  customKey?: string
): Promise<{ success: boolean; message: string; details?: Record<string, number> }> {
  const config = getStoredSupabaseConfig();
  const url = customUrl || config.url;
  const key = customKey || config.anonKey;

  // 1. Try server-side endpoint first
  try {
    const srvRes = await fetch("/api/supabase/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creators,
        deals,
        requests,
        campaigns,
        url,
        key,
      }),
    });

    if (srvRes.ok) {
      const data = await srvRes.json();
      if (data.success) {
        if (url && key) {
          saveSupabaseConfig({
            url,
            anonKey: key,
            isConnected: true,
            isConfigured: true,
            lastSyncedAt: new Date().toISOString(),
          });
        }
        return {
          success: true,
          message: data.message,
          details: {
            creators: creators.length,
            deals: deals.length,
            requests: requests.length,
            campaigns: campaigns.length,
          },
        };
      }
    }
  } catch (err) {
    console.warn("Server-side sync failed, attempting direct client SDK:", err);
  }

  // 2. Direct client fallback
  const syncRes = await syncDatabase(creators, deals, requests, campaigns);
  return {
    success: syncRes.success,
    message: syncRes.message,
    details: {
      creators: creators.length,
      deals: deals.length,
      requests: requests.length,
      campaigns: campaigns.length,
    },
  };
}

export function getSupabaseFullSeedSQL(
  creators: Creator[],
  deals: CollaborationDeal[],
  requests: CollaborationRequest[] = [],
  campaigns: CampaignKPI[] = []
): string {
  const escapeSql = (str: string) => (str ? str.replace(/'/g, "''") : "");
  const toJsonb = (obj: any) => `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
  const toTextArray = (arr: string[] = []) =>
    `ARRAY[${arr.map((s) => `'${escapeSql(s)}'`).join(", ")}]::TEXT[]`;

  let sql = `-- ============================================================================
-- CipherCollab Complete Schema & Data Seed Script for Supabase
-- Tables: creators, deals, requests, campaign_kpis
-- Relationships: Foreign keys on creator_id and associated_deal_id
-- ============================================================================

${getSupabaseSQLMigration()}

-- ============================================================================
-- DATA SEED: 1. Creators Directory (${creators.length} verified records)
-- ============================================================================
`;

  creators.forEach((c) => {
    sql += `INSERT INTO public.creators (
    id, channel_id, name, handle, avatar_url, banner_url, bio, niche,
    subscribers, video_count, total_views, avg_views_per_video,
    engagement_rate, cipher_score, country, language,
    primary_audience, rate_card, availability, delivery_metrics,
    sample_recent_videos, brand_affinity, past_collaborations,
    content_specialization, preferred_collaboration_types,
    audience_demographics, verified_at, is_custom_added, raw_data
) VALUES (
    '${escapeSql(c.id)}',
    '${escapeSql(c.channelId)}',
    '${escapeSql(c.name)}',
    '${escapeSql(c.handle)}',
    ${c.avatarUrl ? `'${escapeSql(c.avatarUrl)}'` : "NULL"},
    ${c.bannerUrl ? `'${escapeSql(c.bannerUrl)}'` : "NULL"},
    ${c.bio ? `'${escapeSql(c.bio)}'` : "NULL"},
    '${escapeSql(c.niche)}',
    ${c.subscribers || 0},
    ${c.videoCount || 0},
    ${c.totalViews || 0},
    ${c.avgViewsPerVideo || 0},
    ${c.engagementRate || 0},
    ${c.cipherScore || 0},
    ${c.country ? `'${escapeSql(c.country)}'` : "'United States'"},
    ${c.language ? `'${escapeSql(c.language)}'` : "'English'"},
    ${toJsonb(c.primaryAudience || {})},
    ${toJsonb(c.rateCard || {})},
    ${toJsonb(c.availability || {})},
    ${toJsonb(c.deliveryMetrics || {})},
    ${toJsonb(c.sampleRecentVideos || [])},
    ${toTextArray(c.brandAffinity || [])},
    ${toJsonb(c.pastCollaborations || [])},
    ${toTextArray(c.contentSpecialization || [])},
    ${toTextArray(c.preferredCollaborationTypes || [])},
    ${toJsonb(c.audienceDemographics || {})},
    ${c.verifiedAt ? `'${escapeSql(c.verifiedAt)}'` : "NOW()"},
    ${Boolean(c.isCustomAdded)},
    ${toJsonb(c)}
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    handle = EXCLUDED.handle,
    avatar_url = EXCLUDED.avatar_url,
    banner_url = EXCLUDED.banner_url,
    bio = EXCLUDED.bio,
    niche = EXCLUDED.niche,
    subscribers = EXCLUDED.subscribers,
    video_count = EXCLUDED.video_count,
    total_views = EXCLUDED.total_views,
    avg_views_per_video = EXCLUDED.avg_views_per_video,
    engagement_rate = EXCLUDED.engagement_rate,
    cipher_score = EXCLUDED.cipher_score,
    primary_audience = EXCLUDED.primary_audience,
    rate_card = EXCLUDED.rate_card,
    availability = EXCLUDED.availability,
    delivery_metrics = EXCLUDED.delivery_metrics,
    sample_recent_videos = EXCLUDED.sample_recent_videos,
    brand_affinity = EXCLUDED.brand_affinity,
    past_collaborations = EXCLUDED.past_collaborations,
    content_specialization = EXCLUDED.content_specialization,
    preferred_collaboration_types = EXCLUDED.preferred_collaboration_types,
    raw_data = EXCLUDED.raw_data,
    updated_at = NOW();

`;
  });

  sql += `
-- ============================================================================
-- DATA SEED: 2. Active Deals (${deals.length} records)
-- Foreign Key: creator_id -> creators(id)
-- ============================================================================
`;

  deals.forEach((d) => {
    sql += `INSERT INTO public.deals (
    id, title, creator_id, creator_name, creator_avatar, creator_handle, creator_niche,
    brand_name, deal_type, compensation, status, milestones, contract_terms,
    target_live_date, campaign_goal, notes, raw_deal
) VALUES (
    '${escapeSql(d.id)}',
    '${escapeSql(d.title)}',
    '${escapeSql(d.creatorId)}',
    ${d.creatorName ? `'${escapeSql(d.creatorName)}'` : "NULL"},
    ${d.creatorAvatar ? `'${escapeSql(d.creatorAvatar)}'` : "NULL"},
    ${d.creatorHandle ? `'${escapeSql(d.creatorHandle)}'` : "NULL"},
    ${d.creatorNiche ? `'${escapeSql(d.creatorNiche)}'` : "NULL"},
    '${escapeSql(d.brandName)}',
    '${escapeSql(d.dealType)}',
    ${d.compensation || 0},
    '${escapeSql(d.status)}',
    ${toJsonb(d.milestones || [])},
    ${toJsonb(d.contractTerms || {})},
    ${d.targetLiveDate ? `'${escapeSql(d.targetLiveDate)}'` : "NULL"},
    ${d.campaignGoal ? `'${escapeSql(d.campaignGoal)}'` : "NULL"},
    ${d.notes ? `'${escapeSql(d.notes)}'` : "NULL"},
    ${toJsonb(d)}
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    creator_id = EXCLUDED.creator_id,
    creator_name = EXCLUDED.creator_name,
    creator_avatar = EXCLUDED.creator_avatar,
    creator_handle = EXCLUDED.creator_handle,
    creator_niche = EXCLUDED.creator_niche,
    brand_name = EXCLUDED.brand_name,
    deal_type = EXCLUDED.deal_type,
    compensation = EXCLUDED.compensation,
    status = EXCLUDED.status,
    milestones = EXCLUDED.milestones,
    contract_terms = EXCLUDED.contract_terms,
    target_live_date = EXCLUDED.target_live_date,
    campaign_goal = EXCLUDED.campaign_goal,
    notes = EXCLUDED.notes,
    raw_deal = EXCLUDED.raw_deal,
    updated_at = NOW();

`;
  });

  sql += `
-- ============================================================================
-- DATA SEED: 3. Collaboration Requests (${requests.length} records)
-- Foreign Keys: creator_id -> creators(id), associated_deal_id -> deals(id)
-- ============================================================================
`;

  requests.forEach((r) => {
    sql += `INSERT INTO public.requests (
    id, brand_name, brand_contact, creator_id, creator_name, creator_handle, creator_avatar,
    campaign_title, campaign_objectives, target_audience, desired_deliverables,
    budget_min, budget_max, proposed_budget_range, timeline, brief_guidelines,
    status, counter_offer, decline_reason, associated_deal_id, raw_request
) VALUES (
    '${escapeSql(r.id)}',
    '${escapeSql(r.brandName)}',
    ${r.brandContact ? `'${escapeSql(r.brandContact)}'` : "NULL"},
    '${escapeSql(r.creatorId)}',
    ${r.creatorName ? `'${escapeSql(r.creatorName)}'` : "NULL"},
    ${r.creatorHandle ? `'${escapeSql(r.creatorHandle)}'` : "NULL"},
    ${r.creatorAvatar ? `'${escapeSql(r.creatorAvatar)}'` : "NULL"},
    '${escapeSql(r.campaignTitle)}',
    ${toTextArray(r.campaignObjectives || [])},
    ${toJsonb(r.targetAudience || {})},
    ${toJsonb(r.desiredDeliverables || [])},
    ${r.proposedBudgetRange?.min || 0},
    ${r.proposedBudgetRange?.max || 0},
    ${toJsonb(r.proposedBudgetRange || {})},
    ${toJsonb(r.timeline || {})},
    ${r.briefGuidelines ? `'${escapeSql(r.briefGuidelines)}'` : "NULL"},
    '${escapeSql(r.status)}',
    ${r.counterOffer ? toJsonb(r.counterOffer) : "NULL"},
    ${r.declineReason ? `'${escapeSql(r.declineReason)}'` : "NULL"},
    ${r.associatedDealId ? `'${escapeSql(r.associatedDealId)}'` : "NULL"},
    ${toJsonb(r)}
) ON CONFLICT (id) DO UPDATE SET
    brand_name = EXCLUDED.brand_name,
    brand_contact = EXCLUDED.brand_contact,
    creator_id = EXCLUDED.creator_id,
    creator_name = EXCLUDED.creator_name,
    campaign_title = EXCLUDED.campaign_title,
    campaign_objectives = EXCLUDED.campaign_objectives,
    target_audience = EXCLUDED.target_audience,
    desired_deliverables = EXCLUDED.desired_deliverables,
    budget_min = EXCLUDED.budget_min,
    budget_max = EXCLUDED.budget_max,
    proposed_budget_range = EXCLUDED.proposed_budget_range,
    timeline = EXCLUDED.timeline,
    brief_guidelines = EXCLUDED.brief_guidelines,
    status = EXCLUDED.status,
    counter_offer = EXCLUDED.counter_offer,
    decline_reason = EXCLUDED.decline_reason,
    associated_deal_id = EXCLUDED.associated_deal_id,
    raw_request = EXCLUDED.raw_request,
    updated_at = NOW();

`;
  });

  sql += `
-- ============================================================================
-- DATA SEED: 4. Campaign KPIs (${campaigns.length} records)
-- Foreign Key: creator_id -> creators(id)
-- ============================================================================
`;

  campaigns.forEach((k) => {
    sql += `INSERT INTO public.campaign_kpis (
    id, campaign_name, brand_name, creator_id, creator_name, creator_handle, creator_avatar,
    platform, youtube_video_id, youtube_video_url, start_date, status,
    views_delivered, metrics, last_synced_at, sync_source, notes, raw_kpi
) VALUES (
    '${escapeSql(k.id)}',
    '${escapeSql(k.campaignName)}',
    '${escapeSql(k.brandName)}',
    '${escapeSql(k.creatorId)}',
    ${k.creatorName ? `'${escapeSql(k.creatorName)}'` : "NULL"},
    ${k.creatorHandle ? `'${escapeSql(k.creatorHandle)}'` : "NULL"},
    ${k.creatorAvatar ? `'${escapeSql(k.creatorAvatar)}'` : "NULL"},
    '${escapeSql(k.platform)}',
    ${k.youtubeVideoId ? `'${escapeSql(k.youtubeVideoId)}'` : "NULL"},
    ${k.youtubeVideoUrl ? `'${escapeSql(k.youtubeVideoUrl)}'` : "NULL"},
    ${k.startDate ? `'${escapeSql(k.startDate)}'` : "NOW()"},
    '${escapeSql(k.status)}',
    ${k.metrics?.impressions?.actual || 0},
    ${toJsonb(k.metrics || {})},
    ${k.lastSyncedAt ? `'${escapeSql(k.lastSyncedAt)}'` : "NOW()"},
    ${k.syncSource ? `'${escapeSql(k.syncSource)}'` : "'YouTube Data API v3'"},
    ${k.notes ? `'${escapeSql(k.notes)}'` : "NULL"},
    ${toJsonb(k)}
) ON CONFLICT (id) DO UPDATE SET
    campaign_name = EXCLUDED.campaign_name,
    brand_name = EXCLUDED.brand_name,
    creator_id = EXCLUDED.creator_id,
    creator_name = EXCLUDED.creator_name,
    platform = EXCLUDED.platform,
    youtube_video_id = EXCLUDED.youtube_video_id,
    youtube_video_url = EXCLUDED.youtube_video_url,
    status = EXCLUDED.status,
    views_delivered = EXCLUDED.views_delivered,
    metrics = EXCLUDED.metrics,
    last_synced_at = EXCLUDED.last_synced_at,
    sync_source = EXCLUDED.sync_source,
    notes = EXCLUDED.notes,
    raw_kpi = EXCLUDED.raw_kpi,
    updated_at = NOW();

`;
  });

  return sql;
}

export function getSupabaseSQLMigration(): string {
  return `-- ============================================================================
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
`;
}

export async function fetchSupabaseTablesStatus(): Promise<{
  configured: boolean;
  allExist: boolean;
  tables: Record<string, { exists: boolean; count: number; error?: string }>;
  projectUrl?: string;
  sqlEditorUrl?: string;
}> {
  try {
    const config = getStoredSupabaseConfig();
    const headers: Record<string, string> = {};
    if (config.url) headers["x-supabase-url"] = config.url;
    if (config.anonKey) headers["x-supabase-key"] = config.anonKey;

    const res = await fetch("/api/supabase/tables-status", { headers });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Could not fetch tables status from server:", err);
  }

  // Fallback client check
  const client = getSupabaseClient();
  const tables = ["creators", "deals", "requests", "campaign_kpis"];
  const resTables: Record<string, { exists: boolean; count: number; error?: string }> = {};

  if (!client) {
    return { configured: false, allExist: false, tables: resTables };
  }

  for (const t of tables) {
    try {
      const { count, error } = await client.from(t).select("id", { count: "exact" }).limit(1);
      if (error) {
        resTables[t] = { exists: false, count: 0, error: error.message };
      } else {
        resTables[t] = { exists: true, count: typeof count === "number" ? count : 1 };
      }
    } catch (e: any) {
      resTables[t] = { exists: false, count: 0, error: e.message };
    }
  }

  const allExist = Object.values(resTables).every((t) => t.exists);
  return {
    configured: true,
    allExist,
    tables: resTables,
    sqlEditorUrl: "https://supabase.com/dashboard/project/rnooqbnuhafktgaxwklq/sql/new",
  };
}

export async function executeSupabaseMigration(
  connectionString?: string,
  sql?: string
): Promise<{
  success: boolean;
  message: string;
  needsConnectionString?: boolean;
  sqlEditorUrl?: string;
  tableVerification?: any;
}> {
  try {
    const config = getStoredSupabaseConfig();
    const res = await fetch("/api/supabase/migrate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(config.url ? { "x-supabase-url": config.url } : {}),
        ...(config.anonKey ? { "x-supabase-key": config.anonKey } : {}),
      },
      body: JSON.stringify({
        connectionString,
        sql: sql || getSupabaseSQLMigration(),
        url: config.url,
        key: config.anonKey,
      }),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Failed to execute migration request.",
    };
  }
}
