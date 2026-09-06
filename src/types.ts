export type CreatorNiche =
  | "Tech & AI"
  | "Luxury & Fashion"
  | "Wealth & Finance"
  | "Design & Architecture"
  | "Automotive & Prestige"
  | "SaaS & Productivity"
  | "Wellness & Longevity"
  | "Culinary Arts"
  | "Travel & Heritage"
  | "Gaming & Culture";

export type SubscriberTier = "Micro (10K - 50K)" | "Mid (50K - 250K)" | "Macro (250K - 1M)" | "Hero (1M+)";

export interface PastCollaboration {
  id: string;
  brandName: string;
  campaignTitle: string;
  deliverable: string;
  year: string;
  outcome: string;
  link?: string;
}

export interface CreatorAudience {
  topCountries: { country: string; percentage: number }[];
  ageDistribution: { ageGroup: string; percentage: number }[];
  genderSplit: { male: number; female: number; other: number };
  buyingPowerIndex: "Mid-Market" | "High" | "Very High" | "Ultra Luxury";
  topInterests?: string[];
}

export interface CreatorRateCard {
  integration60s: { min: number; recommended: number; max: number };
  dedicatedVideo: { min: number; recommended: number; max: number };
  shortOrReel: { min: number; recommended: number; max: number };
  multiVideoSeries: { min: number; recommended: number; max: number };
  estimatedCPM: number;
  estimatedCPV: number;
}

export interface AvailabilitySlot {
  quarter: string;
  totalSlots: number;
  bookedSlots: number;
  status: "Open" | "Reserved" | "Waitlist";
}

export interface DeliveryMetrics {
  onTimeDeliveryRate: number; // e.g. 98.5
  averageProductionDays: number; // e.g. 14
  completedDealsCount: number;
  disputeRate: number; // e.g. 0.0
}

export interface SampleVideo {
  id: string;
  title: string;
  views: number;
  publishedAt: string;
  engagement: number;
  duration?: string;
  thumbnailUrl?: string;
}

export interface Creator {
  id: string;
  channelId: string;
  name: string;
  handle: string;
  avatarUrl: string;
  bannerUrl: string;
  bio: string;
  niche: CreatorNiche;
  subscribers: number;
  videoCount: number;
  totalViews: number;
  avgViewsPerVideo: number;
  engagementRate: number; // percentage, e.g. 4.8
  cipherScore: number; // 0-100 composite index
  country: string;
  language: string;
  primaryAudience: CreatorAudience;
  rateCard: CreatorRateCard;
  availability: {
    currentStatus: "Available" | "Limited Slots" | "Booked This Quarter";
    nextOpenQuarter: string;
    slots: AvailabilitySlot[];
  };
  deliveryMetrics: DeliveryMetrics;
  sampleRecentVideos: SampleVideo[];
  brandAffinity: string[];
  verifiedAt: string;
  isCustomAdded?: boolean;
  // Enhanced Profile Attributes
  pastCollaborations: PastCollaboration[];
  contentSpecialization: string[];
  preferredCollaborationTypes: string[];
  audienceDemographics?: {
    ageRangeSummary: string;
    primaryLocation: string;
    keyInterests: string[];
  };
  marketplaceIntelligence?: CreatorMarketplaceIntelligence;
}

export interface DealMilestone {
  id: string;
  title: string;
  description: string;
  percentage: number;
  amount: number;
  dueDate: string;
  status: "Pending" | "In Progress" | "Submitted" | "Approved" | "Released";
}

export interface ContractTerms {
  deliverables: string[];
  exclusivityDays: number;
  usageRightsMonths: number;
  ftcComplianceClause: boolean;
  paymentTerms: string;
}

export interface CollaborationDeal {
  id: string;
  title: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorHandle: string;
  creatorNiche: CreatorNiche;
  brandName: string;
  dealType: "60s Integration" | "Dedicated Video" | "Multi-Part Series" | "Shorts / Reels";
  compensation: number;
  status:
    | "Draft"
    | "Proposed"
    | "In Negotiation"
    | "Escrow Funded"
    | "In Production"
    | "Review Stage"
    | "Completed"
    | "Disputed";
  milestones: DealMilestone[];
  contractTerms: ContractTerms;
  createdAt: string;
  targetLiveDate: string;
  campaignGoal?: string;
  notes?: string;
}

export interface CampaignBrief {
  brandName: string;
  brandNiche: string;
  productName: string;
  productPricePoint: number;
  targetAudience: string;
  budget: number;
  goals: "Conversions / Sales" | "Brand Prestige & Awareness" | "Product Launch" | "Executive Credibility";
  preferredNiche?: string;
  requiredSubTier?: string;
}

export interface CampaignEvaluationResult {
  matchScore: number; // 0-100
  brandFitAnalysis: string;
  projectedReach: {
    estimatedViews: number;
    estimatedClicks: number;
    estimatedConversions: number;
    projectedROAS: number;
  };
  recommendedOffer: {
    dealType: string;
    targetPrice: number;
    ceilingPrice: number;
    deliverables: string[];
  };
  keyRiskFactors: string[];
  strategicAdvantages: string[];
  suggestedCreativeAngle: string;
}

export interface SupabaseConfigState {
  url: string;
  anonKey: string;
  isConnected: boolean;
  isConfigured: boolean;
  lastSyncedAt: string | null;
  error?: string;
}

// ----------------------------------------------------
// Collaboration Request System Types
// ----------------------------------------------------
export interface CampaignDeliverableItem {
  id: string;
  type: "60s Dedicated Integration" | "Full Dedicated Video" | "YouTube Shorts / Vertical" | "Multi-Part Series" | "Co-Branded Social Post" | "Newsletter Insertion";
  quantity: number;
  specifications?: string;
}

export interface CounterOffer {
  proposedBudget: number;
  modifiedDeliverables: string[];
  proposedLiveDate: string;
  creatorNotes: string;
  submittedAt: string;
}

export interface CollaborationRequest {
  id: string;
  brandName: string;
  brandContact: string;
  creatorId: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar: string;
  campaignTitle: string;
  campaignObjectives: string[];
  targetAudience: {
    description: string;
    ageFocus?: string;
    targetRegions?: string[];
  };
  desiredDeliverables: CampaignDeliverableItem[];
  proposedBudgetRange: {
    min: number;
    max: number;
    currency: string;
  };
  timeline: {
    startDate: string;
    draftDueDate: string;
    finalDeliveryDate: string;
  };
  briefGuidelines: string;
  status: "Pending" | "Accepted" | "Declined" | "Counter-Offered";
  counterOffer?: CounterOffer;
  declineReason?: string;
  createdAt: string;
  updatedAt: string;
  associatedDealId?: string;
}

// ----------------------------------------------------
// Performance Tracking & KPI Types
// ----------------------------------------------------
export interface CampaignKPI {
  id: string;
  campaignName: string;
  brandName: string;
  creatorId: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar: string;
  platform: "YouTube" | "Instagram" | "TikTok" | "Cross-Platform";
  youtubeVideoId?: string;
  youtubeVideoUrl?: string;
  startDate: string;
  status: "Live Tracking" | "Milestone Review" | "Completed" | "Underperforming";
  metrics: {
    impressions: { target: number; actual: number };
    engagementRate: { target: number; actual: number }; // Percentage (e.g. 5.5)
    websiteClicks: { target: number; actual: number };
    conversions: { target: number; actual: number };
    attributedRevenue?: { target: number; actual: number };
  };
  lastSyncedAt: string;
  syncSource: "YouTube Data API v3" | "Manual Input" | "Verified Escrow Link";
  notes?: string;
}

// ----------------------------------------------------
// Marketplace Intelligence & Analytical Data Types
// ----------------------------------------------------
export interface EngagementGrowthTrend {
  period: string; // e.g. "30d", "60d", "90d", "180d" or month
  engagementRate: number; // e.g. 5.8
  viewVelocity: number; // daily views or avg views per release
  growthRatePct: number; // e.g. +14.2%
  uploadFrequencyMonthly: number;
  sentimentIndex: number; // 0 - 100 positive reaction score
}

export interface AudienceOverlapPeer {
  peerCreatorId: string;
  peerName: string;
  peerHandle: string;
  peerNiche: CreatorNiche;
  peerAvatarUrl?: string;
  overlapPercentage: number; // 0 - 100
  sharedAudienceEstimate: number;
  exclusiveAudienceEstimate: number;
  affinityIndex: number; // baseline 1.0, e.g. 2.8x higher than average
  sharedDemographicHighlights: string[];
}

export interface ContentFormatPerformance {
  format: "Deep Dive (>15m)" | "Standard Integration (8-15m)" | "Shorts (<60s)" | "Live & Premiere";
  shareOfUploadsPct: number;
  avgViews: number;
  avgEngagementRate: number;
  sponsoredRetentionRate: number; // retention % on branded segments vs overall video
}

export interface CreatorMarketplaceIntelligence {
  creatorId: string;
  channelId: string;
  dataSource: "live_youtube_api" | "verified_statistical_benchmark";
  lastAnalyzedAt: string;
  confidenceScore: number; // 0 - 100
  growthTrends: {
    thirtyDayEngagementRate: number;
    sixtyDayEngagementRate: number;
    ninetyDayEngagementRate: number;
    trailingVelocityViews: number; // 30-day average daily velocity
    subscriberVelocityMonthly: number; // monthly net new subscribers
    velocityMomentum: "Accelerating" | "Stable High" | "Plateau" | "Regrouping";
    historicalGrowth: EngagementGrowthTrend[];
  };
  audienceOverlap: {
    primaryCohortSummary: string;
    crossNicheAffinityRank: string;
    nicheClusterOverlapRate: number; // average overlap within same niche %
    cannibalizationRisk: "Very Low" | "Low" | "Moderate" | "High";
    topOverlapPeers: AudienceOverlapPeer[];
  };
  contentIntelligence: {
    formats: ContentFormatPerformance[];
    optimalUploadSchedule: {
      bestDayOfWeek: string;
      bestTimeUtc: string;
      audienceActiveWindow: string;
    };
    commercialEfficiency: {
      organicBaselineRatio: number; // ratio of sponsored view performance to organic (e.g. 0.98)
      cpmFairMarketEstimate: number; // calculated dollar value
      brandSafetyScore: number; // 0 - 100
      sponsoredSaturationPct: number; // % of videos in last 6 months that carried a sponsor
    };
  };
  executiveIntelligenceSummary: string;
}

