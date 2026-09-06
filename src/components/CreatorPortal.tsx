import React, { useState } from "react";
import {
  UserCheck,
  Calendar,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Settings,
  Share2,
  Lock,
  Plus,
  ArrowRight,
  Sliders,
  ExternalLink,
  Clock,
  Sparkles,
} from "lucide-react";
import { Creator, CollaborationDeal } from "../types";

interface CreatorPortalProps {
  creators: Creator[];
  deals: CollaborationDeal[];
  onUpdateCreator: (creator: Creator) => void;
  onUpdateDeal: (deal: CollaborationDeal) => void;
}

export const CreatorPortal: React.FC<CreatorPortalProps> = ({
  creators,
  deals,
  onUpdateCreator,
  onUpdateDeal,
}) => {
  const [selectedCreatorId, setSelectedCreatorId] = useState(creators[0]?.id || "");
  const [activeSubTab, setActiveSubTab] = useState<"availability" | "ratecard" | "inbound">("availability");
  const [copiedLink, setCopiedLink] = useState(false);

  const activeCreator = creators.find((c) => c.id === selectedCreatorId) || creators[0];
  const creatorDeals = deals.filter((d) => d.creatorId === activeCreator?.id);

  if (!activeCreator) return null;

  // Handle slot update
  const handleUpdateQuarterStatus = (quarter: string, status: "Open" | "Reserved" | "Booked") => {
    const updatedSlots = activeCreator.availability.slots.map((s) => {
      if (s.quarter === quarter) {
        return {
          ...s,
          status,
          bookedSlots: status === "Booked" ? s.totalSlots : status === "Reserved" ? Math.max(1, s.bookedSlots) : 0,
        };
      }
      return s;
    });

    const nextOpen = updatedSlots.find((s) => s.status === "Open")?.quarter || "Waitlist Only";

    onUpdateCreator({
      ...activeCreator,
      availability: {
        ...activeCreator.availability,
        nextOpenQuarter: nextOpen,
        currentStatus: nextOpen === "Waitlist Only" ? "Limited Slots" : "Available",
        slots: updatedSlots,
      },
    });
  };

  const handleShareDossier = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/10 pb-8 pt-4">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-sm border border-[#c5a059]/40 bg-[#c5a059]/10 px-2.5 py-0.5 text-[9px] uppercase tracking-widest font-mono text-[#c5a059]">
            <UserCheck className="h-3 w-3 text-[#c5a059]" />
            <span>CREATOR OPERATING SYSTEM</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-light tracking-tight text-[#f5f2ed]">
            Commercial Inventory & Valuation
          </h1>
          <p className="text-xs sm:text-sm text-white/50 leading-relaxed font-light">
            Take full control of your commercial inventory. Standardize institutional pricing tiers, schedule quarterly
            sponsorship availability windows, and manage verified inbound brand agreements without informal DMs.
          </p>
        </div>

        {/* Creator Selector Dropdown */}
        <div className="rounded-sm border border-white/10 bg-[#050505] p-3.5 text-xs min-w-[280px]">
          <label className="text-[9px] uppercase tracking-[0.2em] font-medium text-white/40">
            Active Creator Profile
          </label>
          <select
            value={selectedCreatorId}
            onChange={(e) => setSelectedCreatorId(e.target.value)}
            className="mt-1.5 block w-full rounded-sm border border-white/10 bg-[#0a0a0a] px-3 py-2 text-xs text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
          >
            {creators.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.handle} • {c.niche})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Creator Profile Overview Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-sm border border-white/10 bg-[#050505] p-5">
        <div className="flex items-center gap-4">
          <img
            src={activeCreator.avatarUrl}
            alt={activeCreator.name}
            className="h-14 w-14 rounded-sm border border-[#c5a059] object-cover"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-serif text-xl font-light text-[#f5f2ed]">{activeCreator.name}</h3>
              <span className="rounded-sm bg-[#c5a059]/10 px-2 py-0.5 text-[9px] uppercase tracking-widest font-mono text-[#c5a059] border border-[#c5a059]/30">
                {activeCreator.niche}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/40 mt-1 font-mono">
              <span>{activeCreator.subscribers.toLocaleString()} subscribers</span>
              <span>•</span>
              <span>{activeCreator.avgViewsPerVideo.toLocaleString()} avg views</span>
              <span>•</span>
              <span className="text-[#00ff88]">{activeCreator.engagementRate}% engagement</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 rounded-sm border border-white/10 bg-[#0a0a0a] px-3.5 py-2 text-xs">
            <ShieldCheck className="h-4 w-4 text-[#c5a059]" />
            <div>
              <div className="text-[9px] uppercase tracking-wider text-white/40">Cipher Trust Score</div>
              <div className="font-serif text-base font-light text-[#c5a059]">{activeCreator.cipherScore}/100</div>
            </div>
          </div>

          <button
            onClick={handleShareDossier}
            className="flex items-center gap-2 rounded-sm border border-white/10 bg-[#0a0a0a] px-4 py-2.5 text-[10px] uppercase tracking-widest font-medium text-white/70 transition-colors hover:border-[#c5a059] hover:text-white"
          >
            <Share2 className="h-3.5 w-3.5 text-[#c5a059]" />
            <span>{copiedLink ? "Link Copied!" : "Public Media Kit"}</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-xs">
        <button
          onClick={() => setActiveSubTab("availability")}
          className={`flex items-center gap-2 rounded-sm px-4 py-2 text-[10px] uppercase tracking-widest font-medium transition-all ${
            activeSubTab === "availability"
              ? "bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]"
              : "text-white/50 hover:text-white border border-transparent"
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>Quarterly Slot Allocation</span>
        </button>

        <button
          onClick={() => setActiveSubTab("ratecard")}
          className={`flex items-center gap-2 rounded-sm px-4 py-2 text-[10px] uppercase tracking-widest font-medium transition-all ${
            activeSubTab === "ratecard"
              ? "bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]"
              : "text-white/50 hover:text-white border border-transparent"
          }`}
        >
          <DollarSign className="h-3.5 w-3.5" />
          <span>Valuation & Standardized Rates</span>
        </button>

        <button
          onClick={() => setActiveSubTab("inbound")}
          className={`flex items-center gap-2 rounded-sm px-4 py-2 text-[10px] uppercase tracking-widest font-medium transition-all ${
            activeSubTab === "inbound"
              ? "bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]"
              : "text-white/50 hover:text-white border border-transparent"
          }`}
        >
          <Lock className="h-3.5 w-3.5" />
          <span>Structured Inbound Deals ({creatorDeals.length})</span>
        </button>
      </div>

      {/* Tab 1: Quarterly Slot Allocation */}
      {activeSubTab === "availability" && (
        <div className="rounded-sm border border-white/10 bg-[#050505] p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div>
              <h3 className="font-serif text-lg font-light text-[#f5f2ed]">
                Commercial Slot Allocation
              </h3>
              <p className="text-xs text-white/40 font-light mt-0.5">
                Manage brand sponsorship windows. Lock slots when booked to prevent unwanted inquiries.
              </p>
            </div>
            <span className="rounded-sm bg-emerald-500/10 px-2.5 py-1 text-[10px] uppercase tracking-wider font-mono font-medium text-[#00ff88] border border-emerald-500/20">
              Next Open: {activeCreator.availability.nextOpenQuarter}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeCreator.availability.slots.map((slot) => (
              <div
                key={slot.quarter}
                className="rounded-sm border border-white/10 bg-[#0a0a0a] p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#c5a059]" />
                    <span className="font-mono text-sm font-medium text-[#f5f2ed]">
                      {slot.quarter}
                    </span>
                  </div>
                  <span
                    className={`rounded-sm px-2 py-0.5 text-[9px] uppercase tracking-wider font-medium ${
                      slot.status === "Open"
                        ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                        : slot.status === "Reserved"
                        ? "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                        : "bg-white/10 text-white/50"
                    }`}
                  >
                    {slot.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-white/40 border-t border-white/5 pt-3">
                  <span className="text-[10px] uppercase tracking-wider">Inventory Capacity:</span>
                  <span className="font-mono text-white/80">
                    {slot.bookedSlots} / {slot.totalSlots} slots taken
                  </span>
                </div>

                {/* Status Toggle Buttons */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                  <button
                    onClick={() => handleUpdateQuarterStatus(slot.quarter, "Open")}
                    className={`rounded-sm py-1.5 text-[9px] uppercase tracking-widest font-medium transition-all ${
                      slot.status === "Open"
                        ? "bg-[#00ff88] text-black font-semibold"
                        : "border border-white/10 bg-[#050505] text-white/50 hover:text-white"
                    }`}
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleUpdateQuarterStatus(slot.quarter, "Reserved")}
                    className={`rounded-sm py-1.5 text-[9px] uppercase tracking-widest font-medium transition-all ${
                      slot.status === "Reserved"
                        ? "bg-amber-500 text-black font-semibold"
                        : "border border-white/10 bg-[#050505] text-white/50 hover:text-white"
                    }`}
                  >
                    Reserved
                  </button>
                  <button
                    onClick={() => handleUpdateQuarterStatus(slot.quarter, "Booked")}
                    className={`rounded-sm py-1.5 text-[9px] uppercase tracking-widest font-medium transition-all ${
                      slot.status === "Booked"
                        ? "bg-[#c5a059] text-black font-semibold"
                        : "border border-white/10 bg-[#050505] text-white/50 hover:text-white"
                    }`}
                  >
                    Booked Out
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Valuation & Standardized Rates */}
      {activeSubTab === "ratecard" && (
        <div className="rounded-sm border border-white/10 bg-[#050505] p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div>
              <h3 className="font-serif text-lg font-light text-[#f5f2ed]">
                Fair Market Valuation & CPM Index
              </h3>
              <p className="text-xs text-white/40 font-light mt-0.5">
                Standardized pricing eliminates undervaluation and prevents protracted rate negotiations.
              </p>
            </div>
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-wider text-white/40">Market CPM Benchmark</div>
              <div className="font-serif text-base font-medium text-[#c5a059]">
                ${activeCreator.rateCard?.estimatedCPM || 45} / 1k views
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-sm border border-white/10 bg-[#0a0a0a] p-4">
              <div className="text-[10px] uppercase tracking-wider text-white/50">60-Second Integration</div>
              <div className="mt-2 font-serif text-2xl font-light text-[#c5a059]">
                ${activeCreator.rateCard?.integration60s?.recommended?.toLocaleString()}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-white/40 mt-1">
                Range: ${activeCreator.rateCard?.integration60s?.min?.toLocaleString()} - $
                {activeCreator.rateCard?.integration60s?.max?.toLocaleString()}
              </div>
            </div>

            <div className="rounded-sm border border-white/10 bg-[#0a0a0a] p-4">
              <div className="text-[10px] uppercase tracking-wider text-white/50">Dedicated Video</div>
              <div className="mt-2 font-serif text-2xl font-light text-[#f5f2ed]">
                ${activeCreator.rateCard?.dedicatedVideo?.recommended?.toLocaleString()}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-white/40 mt-1">
                Range: ${activeCreator.rateCard?.dedicatedVideo?.min?.toLocaleString()} - $
                {activeCreator.rateCard?.dedicatedVideo?.max?.toLocaleString()}
              </div>
            </div>

            <div className="rounded-sm border border-white/10 bg-[#0a0a0a] p-4">
              <div className="text-[10px] uppercase tracking-wider text-white/50">Short / Vertical</div>
              <div className="mt-2 font-serif text-2xl font-light text-[#f5f2ed]">
                ${activeCreator.rateCard?.shortOrReel?.recommended?.toLocaleString()}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-white/40 mt-1">
                Range: ${activeCreator.rateCard?.shortOrReel?.min?.toLocaleString()} - $
                {activeCreator.rateCard?.shortOrReel?.max?.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-white/10 bg-[#0a0a0a] p-5 text-xs font-light">
            <div className="flex items-center gap-2 font-serif text-sm text-[#c5a059] mb-1.5">
              <Sparkles className="h-4 w-4" />
              <span>Valuation Methodology</span>
            </div>
            <p className="text-white/60 leading-relaxed">
              CipherCollab calculates rate recommendations based on 90-day average view velocity (
              {activeCreator.avgViewsPerVideo.toLocaleString()} views), active engagement (
              {activeCreator.engagementRate}%), and the premium purchasing power index of your{" "}
              {activeCreator.niche} cohort.
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Structured Inbound Deals */}
      {activeSubTab === "inbound" && (
        <div className="rounded-sm border border-white/10 bg-[#050505] p-6 space-y-4">
          <div className="pb-3 border-b border-white/5">
            <h3 className="font-serif text-lg font-light text-[#f5f2ed]">
              Inbound Collaboration Pipeline
            </h3>
            <p className="text-xs text-white/40 font-light mt-0.5">
              Deals routed through CipherCollab come pre-funded in escrow with binding deliverables.
            </p>
          </div>

          {creatorDeals.length > 0 ? (
            <div className="space-y-3">
              {creatorDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="rounded-sm border border-white/10 bg-[#0a0a0a] p-5 text-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-serif text-base font-light text-[#f5f2ed]">
                        {deal.title}
                      </div>
                      <div className="text-white/50 mt-1 text-[11px]">
                        Brand: <span className="text-white/80">{deal.brandName}</span> • Target Live:{" "}
                        {deal.targetLiveDate}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-serif text-lg font-light text-[#c5a059]">
                        ${deal.compensation.toLocaleString()}
                      </div>
                      <span className="rounded-sm bg-emerald-500/10 px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold text-[#00ff88] border border-emerald-500/30">
                        {deal.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-3 text-[11px] text-white/50">
                    {deal.milestones.map((m, idx) => (
                      <div key={m.id} className="rounded-sm bg-[#050505] p-2.5 border border-white/5">
                        <div className="font-medium text-white/80">
                          M{idx + 1}: ${m.amount.toLocaleString()} ({m.percentage}%)
                        </div>
                        <div className="text-[9px] uppercase tracking-wider text-white/40 mt-0.5">{m.status}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-sm border border-dashed border-white/10 bg-[#0a0a0a] p-8 text-center text-xs text-white/40">
              No active brand deals pending for {activeCreator.name}. Brands can initiate structured
              collaborations directly from the Directory or Decision Engine.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
