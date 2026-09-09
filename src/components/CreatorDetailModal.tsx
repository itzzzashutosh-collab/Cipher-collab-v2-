import React, { useState, useEffect } from "react";
import {
  X,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Calendar,
  DollarSign,
  Globe,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  ExternalLink,
  ChevronRight,
  BarChart3,
  Send,
  Users,
  Briefcase,
  Layers,
  Activity,
  Zap,
} from "lucide-react";
import { Creator, CreatorMarketplaceIntelligence } from "../types";
import { CreatorAnalyticsCharts } from "./CreatorAnalyticsCharts";
import { fetchCreatorMarketplaceIntelligence } from "../lib/marketplaceIntelligence";

interface CreatorDetailModalProps {
  creator: Creator | null;
  allCreators?: Creator[];
  onClose: () => void;
  onInitiateCollab: (creator: Creator) => void;
  onOpenCollabRequest?: (creator: Creator) => void;
}

export const CreatorDetailModal: React.FC<CreatorDetailModalProps> = ({
  creator,
  allCreators = [],
  onClose,
  onInitiateCollab,
  onOpenCollabRequest,
}) => {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [aiEvaluation, setAiEvaluation] = useState<any | null>(null);
  const [intelligence, setIntelligence] = useState<CreatorMarketplaceIntelligence | null>(null);
  const [isRefreshingIntelligence, setIsRefreshingIntelligence] = useState(false);
  const [activeDossierTab, setActiveDossierTab] = useState<"charts" | "rates" | "audience" | "calendar">("charts");

  useEffect(() => {
    if (!creator) {
      setIntelligence(null);
      return;
    }

    let isMounted = true;
    fetchCreatorMarketplaceIntelligence(creator, { peerPool: allCreators })
      .then((data) => {
        if (isMounted) {
          setIntelligence(data);
        }
      })
      .catch((err) => console.warn("Could not fetch marketplace intelligence:", err));

    return () => {
      isMounted = false;
    };
  }, [creator?.id]);

  if (!creator) return null;

  const handleRefreshIntelligence = async () => {
    if (!creator) return;
    setIsRefreshingIntelligence(true);
    try {
      const fresh = await fetchCreatorMarketplaceIntelligence(
        creator,
        { peerPool: allCreators, forceRefresh: true }
      );
      setIntelligence(fresh);
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setIsRefreshingIntelligence(false);
    }
  };

  const handleRunAiEvaluation = async () => {
    setIsEvaluating(true);
    try {
      const res = await fetch("/api/gemini/evaluate-creator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creator,
          campaignContext: "Luxury and high-conversion institutional sponsorship",
        }),
      });
      const data = await res.json();
      setAiEvaluation(data);
    } catch (err) {
      console.error("AI Evaluation failed:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative my-8 w-full max-w-4xl overflow-hidden rounded-sm border border-white/10 bg-[#0a0a0a] shadow-2xl text-[#f5f2ed]">
        {/* Banner with Close button */}
        <div className="relative h-44 w-full overflow-hidden bg-[#111]">
          <img
            src={creator.bannerUrl}
            alt={creator.name}
            className="h-full w-full object-cover opacity-50 filter grayscale contrast-125"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-black/60" />
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm border border-white/10 bg-black/60 p-2 text-white/70 backdrop-blur transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Profile Header */}
        <div className="relative px-6 sm:px-8 pb-8">
          <div className="-mt-14 flex flex-col sm:flex-row sm:items-end justify-between gap-5 border-b border-white/10 pb-6">
            <div className="flex items-end gap-5">
              <div className="relative">
                <img
                  src={creator.avatarUrl}
                  alt={creator.name}
                  className="h-24 w-24 rounded-sm border-2 border-[#c5a059] object-cover shadow-2xl"
                  referrerPolicy="no-referrer"
                />
                <div
                  className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-sm bg-[#c5a059] text-[10px] font-bold text-black"
                  title="Cipher Verified"
                >
                  ✓
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-serif text-3xl font-light text-[#f5f2ed] tracking-tight">
                    {creator.name}
                  </h2>
                  <span className="rounded-sm border border-[#c5a059]/40 bg-[#c5a059]/10 px-2 py-0.5 text-[9px] uppercase tracking-widest font-mono text-[#c5a059]">
                    {creator.niche}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-white/40 mt-1 font-mono">
                  <span>{creator.handle}</span>
                  <span>•</span>
                  <span>{creator.country}</span>
                  <span>•</span>
                  <span>{creator.language}</span>
                </div>
              </div>
            </div>

            {/* Cipher Trust Score Badge */}
            <div className="flex items-center gap-3 rounded-sm border border-white/10 bg-[#050505] p-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-sm border border-[#c5a059]/40 bg-[#c5a059]/10 font-serif text-2xl font-light text-[#c5a059]">
                {creator.cipherScore}
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/60">Cipher Trust Index</div>
                <div className="text-[10px] uppercase tracking-wider text-[#00ff88]">
                  Top 2% reliability tier
                </div>
              </div>
            </div>
          </div>

          <p className="mt-5 text-xs sm:text-sm text-white/60 leading-relaxed font-light">
            {creator.bio}
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-sm border border-white/5 bg-[#050505] p-4 text-center">
            <div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-white/40">
                Subscribers
              </div>
              <div className="mt-1 font-serif text-xl font-light text-[#f5f2ed]">
                {creator.subscribers.toLocaleString()}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-white/30 mt-0.5">Verified YouTube Data</div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-white/40">
                Avg Video Velocity
              </div>
              <div className="mt-1 font-serif text-xl font-light text-[#f5f2ed]">
                {creator.avgViewsPerVideo.toLocaleString()}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-white/30 mt-0.5">Views past 90 days</div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-white/40">
                Engagement Rate
              </div>
              <div className="mt-1 font-serif text-xl font-light text-[#00ff88]">
                {creator.engagementRate}%
              </div>
              <div className="text-[9px] uppercase tracking-wider text-[#00ff88] mt-0.5">3.4x benchmark</div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-white/40">
                Audience Profile
              </div>
              <div className="mt-1 font-serif text-xl font-light text-[#c5a059]">
                {creator.primaryAudience?.buyingPowerIndex || "Ultra Luxury"}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-white/30 mt-0.5">High discretionary spend</div>
            </div>
          </div>

          {/* Dossier Navigation Segmented Tabs */}
          <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
            <button
              onClick={() => setActiveDossierTab("charts")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold tracking-wide transition-all ${
                activeDossierTab === "charts"
                  ? "bg-[#6C5CE7] text-white shadow-lg shadow-[#6C5CE7]/25"
                  : "bg-white/5 text-[#A1A1AA] hover:bg-white/10 hover:text-white"
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>YouTube Analytics & Growth Charts</span>
              <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[9px] font-bold uppercase">
                Recharts
              </span>
            </button>

            <button
              onClick={() => setActiveDossierTab("rates")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium tracking-wide transition-all ${
                activeDossierTab === "rates"
                  ? "bg-[#6C5CE7] text-white shadow-lg shadow-[#6C5CE7]/25"
                  : "bg-white/5 text-[#A1A1AA] hover:bg-white/10 hover:text-white"
              }`}
            >
              <DollarSign className="h-3.5 w-3.5" />
              <span>Institutional Rate Card</span>
            </button>

            <button
              onClick={() => setActiveDossierTab("audience")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium tracking-wide transition-all ${
                activeDossierTab === "audience"
                  ? "bg-[#6C5CE7] text-white shadow-lg shadow-[#6C5CE7]/25"
                  : "bg-white/5 text-[#A1A1AA] hover:bg-white/10 hover:text-white"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Audience Demographics</span>
            </button>

            <button
              onClick={() => setActiveDossierTab("calendar")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium tracking-wide transition-all ${
                activeDossierTab === "calendar"
                  ? "bg-[#6C5CE7] text-white shadow-lg shadow-[#6C5CE7]/25"
                  : "bg-white/5 text-[#A1A1AA] hover:bg-white/10 hover:text-white"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Availability & Slots</span>
            </button>
          </div>

          {/* Dedicated Recharts Analytics Charts Section */}
          {activeDossierTab === "charts" && (
            <div className="mt-6">
              <CreatorAnalyticsCharts
                creator={creator}
                intelligence={intelligence || undefined}
                onRefresh={handleRefreshIntelligence}
                isRefreshing={isRefreshingIntelligence}
              />
            </div>
          )}

          {/* Tabbed / Segmented Sections */}
          <div className={`mt-6 space-y-6 ${activeDossierTab === "charts" ? "hidden" : "block"}`}>
            {/* Section 1: Standardized Rate Card Matrix */}
            <div className={`rounded-xl border border-white/10 bg-[#0E0E12] p-5 shadow-lg ${activeDossierTab === "rates" ? "ring-1 ring-[#6C5CE7]/30" : ""}`}>
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div>
                  <h3 className="font-serif text-base font-light text-[#f5f2ed]">
                    Standardized Institutional Rate Card
                  </h3>
                  <p className="text-xs text-white/40 font-light mt-0.5">
                    Algorithmic fair market pricing calculated against CPM, CPV, and category demand.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-[9px] uppercase tracking-wider text-white/40">Effective CPM</div>
                  <div className="font-serif text-base font-medium text-[#c5a059]">
                    ${creator.rateCard?.estimatedCPM || 45} / 1k views
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-sm border border-white/10 bg-[#0a0a0a] p-3.5">
                  <div className="text-[10px] uppercase tracking-wider text-white/50">60s Integration</div>
                  <div className="mt-1 font-serif text-xl font-light text-[#c5a059]">
                    ${creator.rateCard?.integration60s?.recommended?.toLocaleString() || "24,000"}
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-white/40 mt-1">
                    Band: ${creator.rateCard?.integration60s?.min?.toLocaleString()} - $
                    {creator.rateCard?.integration60s?.max?.toLocaleString()}
                  </div>
                </div>

                <div className="rounded-sm border border-white/10 bg-[#0a0a0a] p-3.5">
                  <div className="text-[10px] uppercase tracking-wider text-white/50">Dedicated Video</div>
                  <div className="mt-1 font-serif text-xl font-light text-[#f5f2ed]">
                    ${creator.rateCard?.dedicatedVideo?.recommended?.toLocaleString() || "60,000"}
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-white/40 mt-1">
                    Band: ${creator.rateCard?.dedicatedVideo?.min?.toLocaleString()} - $
                    {creator.rateCard?.dedicatedVideo?.max?.toLocaleString()}
                  </div>
                </div>

                <div className="rounded-sm border border-white/10 bg-[#0a0a0a] p-3.5">
                  <div className="text-[10px] uppercase tracking-wider text-white/50">Short / Reel</div>
                  <div className="mt-1 font-serif text-xl font-light text-[#f5f2ed]">
                    ${creator.rateCard?.shortOrReel?.recommended?.toLocaleString() || "14,000"}
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-white/40 mt-1">
                    Band: ${creator.rateCard?.shortOrReel?.min?.toLocaleString()} - $
                    {creator.rateCard?.shortOrReel?.max?.toLocaleString()}
                  </div>
                </div>

                <div className="rounded-sm border border-white/10 bg-[#0a0a0a] p-3.5">
                  <div className="text-[10px] uppercase tracking-wider text-white/50">Multi-Video Series</div>
                  <div className="mt-1 font-serif text-xl font-light text-[#c5a059]">
                    ${creator.rateCard?.multiVideoSeries?.recommended?.toLocaleString() || "120,000"}
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-white/40 mt-1">
                    3x integrations + social
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Availability Calendar & Delivery Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Availability Calendar */}
              <div className="rounded-sm border border-white/10 bg-[#050505] p-5">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#c5a059]" />
                    <h4 className="font-serif text-sm font-medium text-[#f5f2ed]">
                      Quarterly Availability Windows
                    </h4>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-[#00ff88]">
                    Next Open: {creator.availability?.nextOpenQuarter || "Q2 2026"}
                  </span>
                </div>

                <div className="space-y-2">
                  {creator.availability?.slots?.map((slot) => {
                    const availableSlots = slot.totalSlots - slot.bookedSlots;
                    return (
                      <div
                        key={slot.quarter}
                        className="flex items-center justify-between rounded-sm border border-white/5 bg-[#0a0a0a] px-3 py-2 text-xs"
                      >
                        <span className="font-mono text-white/70">
                          {slot.quarter}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-white/40 text-[10px] uppercase tracking-wider">
                            {slot.bookedSlots}/{slot.totalSlots} booked
                          </span>
                          <span
                            className={`rounded-sm px-2 py-0.5 text-[9px] uppercase tracking-wider font-medium ${
                              slot.status === "Open"
                                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                                : "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {slot.status} ({availableSlots} left)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Track Record */}
              <div className="rounded-sm border border-white/10 bg-[#050505] p-5">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
                  <Award className="h-4 w-4 text-[#c5a059]" />
                  <h4 className="font-serif text-sm font-medium text-[#f5f2ed]">
                    Milestone Delivery Track Record
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="rounded-sm border border-white/5 bg-[#0a0a0a] p-3">
                    <div className="text-[9px] uppercase tracking-wider text-white/40">
                      On-Time Delivery Rate
                    </div>
                    <div className="font-serif text-xl font-light text-[#00ff88] mt-1">
                      {creator.deliveryMetrics?.onTimeDeliveryRate || 99}%
                    </div>
                    <div className="text-[9px] text-white/30 mt-0.5">Verified escrow history</div>
                  </div>

                  <div className="rounded-sm border border-white/5 bg-[#0a0a0a] p-3">
                    <div className="text-[9px] uppercase tracking-wider text-white/40">
                      Avg Turnaround
                    </div>
                    <div className="font-serif text-xl font-light text-[#f5f2ed] mt-1">
                      {creator.deliveryMetrics?.averageProductionDays || 14} days
                    </div>
                    <div className="text-[9px] text-white/30 mt-0.5">Concept to live</div>
                  </div>

                  <div className="rounded-sm border border-white/5 bg-[#0a0a0a] p-3">
                    <div className="text-[9px] uppercase tracking-wider text-white/40">
                      Completed Deals
                    </div>
                    <div className="font-serif text-xl font-light text-[#c5a059] mt-1">
                      {creator.deliveryMetrics?.completedDealsCount || 34}+
                    </div>
                    <div className="text-[9px] text-white/30 mt-0.5">Institutional campaigns</div>
                  </div>

                  <div className="rounded-sm border border-white/5 bg-[#0a0a0a] p-3">
                    <div className="text-[9px] uppercase tracking-wider text-white/40">Dispute Rate</div>
                    <div className="font-serif text-xl font-light text-[#00ff88] mt-1">
                      0.0%
                    </div>
                    <div className="text-[9px] text-white/30 mt-0.5">Zero arbitration claims</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Content Specialization & Preferred Collaboration Types */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-sm border border-white/10 bg-[#050505] p-5">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
                  <Layers className="h-4 w-4 text-[#c5a059]" />
                  <h4 className="font-serif text-sm font-medium text-[#f5f2ed]">
                    Content Specializations
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(creator.contentSpecialization || [creator.niche, "Flagship Reviews", "Technical Deep-Dives"]).map((spec, i) => (
                    <span
                      key={i}
                      className="rounded-sm border border-[#c5a059]/30 bg-[#c5a059]/10 px-2.5 py-1 text-xs text-[#c5a059] font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-sm border border-white/10 bg-[#050505] p-5">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
                  <Briefcase className="h-4 w-4 text-[#c5a059]" />
                  <h4 className="font-serif text-sm font-medium text-[#f5f2ed]">
                    Preferred Collaboration Types
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(creator.preferredCollaborationTypes || ["Full Dedicated Video", "60s Dedicated Integration", "Multi-Video Series"]).map((pref, i) => (
                    <span
                      key={i}
                      className="rounded-sm border border-white/10 bg-[#0a0a0a] px-2.5 py-1 text-xs text-white/80"
                    >
                      ✓ {pref}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 4: Detailed Audience Demographics Breakdown */}
            <div className="rounded-sm border border-white/10 bg-[#050505] p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#c5a059]" />
                  <h4 className="font-serif text-sm font-medium text-[#f5f2ed]">
                    Audience Demographics & Psychographics
                  </h4>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#00ff88]">
                  Verified YouTube Analytics Sync
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {/* Age Distribution */}
                <div className="rounded-sm border border-white/5 bg-[#0a0a0a] p-3.5 space-y-2">
                  <span className="text-[9px] uppercase tracking-wider text-white/40 block">
                    Age Distribution
                  </span>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    {creator.audienceDemographics?.ageGroups ? (
                      Object.entries(creator.audienceDemographics.ageGroups).map(([age, pct]) => (
                        <div key={age} className="flex items-center justify-between">
                          <span className="text-white/60">{age}</span>
                          <span className="text-[#f5f2ed] font-medium">{pct}%</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex justify-between text-white/60"><span>18-24</span><span>12%</span></div>
                        <div className="flex justify-between text-white/60"><span>25-34</span><span className="text-[#00ff88]">48%</span></div>
                        <div className="flex justify-between text-white/60"><span>35-44</span><span>28%</span></div>
                        <div className="flex justify-between text-white/60"><span>45+</span><span>12%</span></div>
                      </>
                    )}
                  </div>
                </div>

                {/* Top Geographic Locations */}
                <div className="rounded-sm border border-white/5 bg-[#0a0a0a] p-3.5 space-y-2">
                  <span className="text-[9px] uppercase tracking-wider text-white/40 block">
                    Top Geographic Markets
                  </span>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    {creator.audienceDemographics?.topLocations?.map((loc) => (
                      <div key={loc.country} className="flex items-center justify-between">
                        <span className="text-white/60">{loc.country}</span>
                        <span className="text-[#c5a059] font-medium">{loc.percentage}%</span>
                      </div>
                    )) || (
                      <>
                        <div className="flex justify-between text-white/60"><span>United States</span><span>42%</span></div>
                        <div className="flex justify-between text-white/60"><span>United Kingdom</span><span>18%</span></div>
                        <div className="flex justify-between text-white/60"><span>Germany</span><span>12%</span></div>
                        <div className="flex justify-between text-white/60"><span>Switzerland</span><span>10%</span></div>
                      </>
                    )}
                  </div>
                </div>

                {/* Interests & Affinity */}
                <div className="rounded-sm border border-white/5 bg-[#0a0a0a] p-3.5 space-y-2">
                  <span className="text-[9px] uppercase tracking-wider text-white/40 block">
                    Core Audience Affinities
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(creator.audienceDemographics?.interests || [
                      "Mechanical Watches",
                      "Precision Engineering",
                      "Luxury Travel",
                      "Industrial Design",
                      "High-End Audio",
                    ]).map((interest, i) => (
                      <span
                        key={i}
                        className="rounded-sm border border-white/10 bg-[#050505] px-2 py-0.5 text-[10px] text-white/70"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Past Collaborations Portfolio */}
            <div className="rounded-sm border border-white/10 bg-[#050505] p-5 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-[#c5a059]" />
                  <h4 className="font-serif text-sm font-medium text-[#f5f2ed]">
                    Verified Past Collaborations & Case Studies
                  </h4>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">
                  {creator.pastCollaborations?.length || 0} Institutional Releases
                </span>
              </div>

              <div className="space-y-2.5">
                {creator.pastCollaborations && creator.pastCollaborations.length > 0 ? (
                  creator.pastCollaborations.map((collab) => (
                    <div
                      key={collab.id}
                      className="rounded-sm border border-white/5 bg-[#0a0a0a] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-sm font-medium text-[#f5f2ed]">
                            {collab.brandName}
                          </span>
                          <span className="text-white/30">•</span>
                          <span className="text-white/60 font-light">{collab.campaignTitle}</span>
                          <span className="font-mono text-[9px] text-white/40">({collab.year})</span>
                        </div>
                        <p className="text-[11px] text-white/50">{collab.deliverables}</p>
                        {collab.outcomeMetric && (
                          <div className="font-mono text-[10px] text-[#00ff88]">
                            Verified Outcome: {collab.outcomeMetric}
                          </div>
                        )}
                      </div>

                      {collab.link && (
                        <a
                          href={collab.link}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 rounded-sm border border-white/10 bg-[#050505] px-2.5 py-1 text-[10px] uppercase font-mono text-[#c5a059] hover:bg-white/5 transition-colors self-start sm:self-center"
                        >
                          <span>View Release</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="rounded-sm border border-white/5 bg-[#0a0a0a] p-4 text-center text-xs text-white/40">
                    No public past collaborations listed.
                  </div>
                )}
              </div>
            </div>

            {/* Section 6: Gemini AI Institutional Valuation Box */}
            <div className="rounded-sm border border-white/10 bg-[#050505] p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#c5a059]/20 text-[#c5a059]">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-light text-[#f5f2ed]">
                      Gemini Institutional Valuation Engine
                    </h4>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">
                      Audience quality, fair pricing, and projected ROAS
                    </p>
                  </div>
                </div>

                <button
                  disabled={isEvaluating}
                  onClick={handleRunAiEvaluation}
                  className="flex items-center justify-center gap-1.5 rounded-sm border border-[#c5a059] bg-[#c5a059] px-4 py-2 text-[10px] uppercase tracking-widest font-semibold text-black transition-all hover:bg-[#d5b069] disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{isEvaluating ? "Analyzing Intelligence..." : "Run AI Valuation"}</span>
                </button>
              </div>

              {aiEvaluation ? (
                <div className="mt-4 space-y-3 text-xs font-light">
                  <div className="rounded-sm border border-white/10 bg-[#0a0a0a] p-4 text-white/80 leading-relaxed">
                    <span className="font-medium text-[#c5a059] uppercase tracking-wider text-[10px] block mb-1">
                      Summary Verdict:
                    </span>
                    {aiEvaluation.summary}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-sm border border-white/10 bg-[#0a0a0a] p-4">
                      <div className="text-[10px] font-medium text-[#c5a059] uppercase tracking-wider mb-1">
                        Pricing Equilibrium
                      </div>
                      <p className="text-white/60">{aiEvaluation.fairPricingVerdict}</p>
                      <div className="mt-3 text-xs font-mono font-medium text-[#00ff88]">
                        Projected ROAS: {aiEvaluation.projectedROAS || 3.2}x
                      </div>
                    </div>

                    <div className="rounded-sm border border-white/10 bg-[#0a0a0a] p-4">
                      <div className="text-[10px] font-medium text-[#c5a059] uppercase tracking-wider mb-1">
                        Strategic Negotiation Leverage
                      </div>
                      <ul className="space-y-1 text-white/60 list-disc list-inside">
                        {aiEvaluation.negotiationAdvice?.map((adv: string, i: number) => (
                          <li key={i}>{adv}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-xs text-white/40 font-light">
                  Click "Run AI Valuation" to execute a deep neural analysis with Gemini on this creator's
                  fair market value, audience retention, and contract negotiation levers.
                </p>
              )}
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 pt-5">
            <button
              onClick={onClose}
              className="rounded-sm border border-white/10 bg-transparent px-4 py-2.5 text-[10px] uppercase tracking-wider text-white/50 transition-colors hover:text-white"
            >
              Close Dossier
            </button>

            <div className="flex flex-wrap items-center gap-2.5">
              {onOpenCollabRequest && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenCollabRequest(creator);
                  }}
                  className="flex items-center gap-2 rounded-sm border border-white/20 bg-white/5 px-4 py-2.5 text-[10px] uppercase tracking-widest font-medium text-white transition-all hover:bg-white/10 hover:border-[#c5a059]"
                >
                  <Send className="h-3.5 w-3.5 text-[#c5a059]" />
                  <span>Send Collaboration Request</span>
                </button>
              )}

              <button
                onClick={() => {
                  onClose();
                  onInitiateCollab(creator);
                }}
                className="flex items-center gap-2 rounded-sm border border-[#c5a059] bg-[#c5a059] px-5 py-2.5 text-[10px] uppercase tracking-widest font-semibold text-black transition-all hover:bg-[#d5b069]"
              >
                <span>Direct Deal Room Escrow</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
