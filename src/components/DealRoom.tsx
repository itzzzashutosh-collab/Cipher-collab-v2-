import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  Lock,
  Unlock,
  ChevronRight,
  Plus,
  Sparkles,
  Calendar,
  ExternalLink,
  ArrowUpRight,
  X,
} from "lucide-react";
import { CollaborationDeal, Creator, DealMilestone } from "../types";

interface DealRoomProps {
  deals: CollaborationDeal[];
  creators: Creator[];
  onUpdateDeal: (updatedDeal: CollaborationDeal) => void;
  onCreateNewDeal: (deal: CollaborationDeal) => void;
  selectedDealId?: string | null;
}

export const DealRoom: React.FC<DealRoomProps> = ({
  deals,
  creators,
  onUpdateDeal,
  onCreateNewDeal,
  selectedDealId,
}) => {
  const [activeDealId, setActiveDealId] = useState<string>(
    selectedDealId || (deals.length > 0 ? deals[0].id : "")
  );
  const [filterStage, setFilterStage] = useState<string>("All");
  const [showTermSheetModal, setShowTermSheetModal] = useState(false);
  const [showNewCollabModal, setShowNewCollabModal] = useState(false);

  // New Deal Form State
  const [newDealCreatorId, setNewDealCreatorId] = useState(creators[0]?.id || "");
  const [newDealBrandName, setNewDealBrandName] = useState("Vanguard Digital Assets");
  const [newDealType, setNewDealType] = useState<CollaborationDeal["dealType"]>("60s Integration");
  const [newDealComp, setNewDealComp] = useState(25000);
  const [newDealTargetDate, setNewDealTargetDate] = useState("2026-10-24");
  const [isGeneratingAiTerms, setIsGeneratingAiTerms] = useState(false);

  const activeDeal = deals.find((d) => d.id === activeDealId) || deals[0];

  // Pipeline Filter
  const filteredDeals = deals.filter((d) => {
    if (filterStage === "All") return true;
    return d.status === filterStage;
  });

  // Calculate Metrics
  const totalEscrowLocked = deals
    .filter((d) => d.status === "Escrow Funded" || d.status === "In Production")
    .reduce((acc, d) => acc + d.compensation, 0);

  const completedDealsTotal = deals
    .filter((d) => d.status === "Completed")
    .reduce((acc, d) => acc + d.compensation, 0);

  // Milestone Status Handler
  const handleAdvanceMilestone = (milestoneId: string) => {
    if (!activeDeal) return;
    const updatedMilestones = activeDeal.milestones.map((m) => {
      if (m.id === milestoneId) {
        if (m.status === "Pending") return { ...m, status: "In Progress" as const };
        if (m.status === "In Progress") return { ...m, status: "Submitted" as const };
        if (m.status === "Submitted") return { ...m, status: "Approved" as const };
        if (m.status === "Approved") return { ...m, status: "Released" as const };
      }
      return m;
    });

    // If all released, mark deal completed
    const allReleased = updatedMilestones.every((m) => m.status === "Released");
    const updatedDeal: CollaborationDeal = {
      ...activeDeal,
      milestones: updatedMilestones,
      status: allReleased ? "Completed" : activeDeal.status,
    };

    onUpdateDeal(updatedDeal);
  };

  const handleFundEscrow = () => {
    if (!activeDeal) return;
    onUpdateDeal({
      ...activeDeal,
      status: "Escrow Funded",
    });
  };

  const handleCreateDealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const creator = creators.find((c) => c.id === newDealCreatorId);
    if (!creator) return;

    setIsGeneratingAiTerms(true);
    let contractTerms = {
      deliverables: [
        `1x ${newDealType} in 4K UHD format`,
        "Pre-release private unlisted draft link for brand verification",
        "Permanent tracking link placed above fold in video description",
      ],
      exclusivityDays: 30,
      usageRightsMonths: 6,
      ftcComplianceClause: true,
      paymentTerms: "CipherCollab Standard 3-Tier Escrow Protocol",
    };

    try {
      const res = await fetch("/api/gemini/generate-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: newDealBrandName,
          creatorName: creator.name,
          dealType: newDealType,
          compensation: newDealComp,
          targetDate: newDealTargetDate,
        }),
      });
      const data = await res.json();
      if (data.deliverables) {
        contractTerms.deliverables = data.deliverables;
      }
    } catch (err) {
      console.warn("Using default agreement clauses:", err);
    } finally {
      setIsGeneratingAiTerms(false);
    }

    const newDeal: CollaborationDeal = {
      id: `deal-${Date.now()}`,
      title: `${newDealType} Agreement — ${newDealBrandName}`,
      creatorId: creator.id,
      creatorName: creator.name,
      creatorAvatar: creator.avatarUrl,
      creatorHandle: creator.handle,
      creatorNiche: creator.niche,
      brandName: newDealBrandName,
      dealType: newDealType,
      compensation: newDealComp,
      status: "Proposed",
      milestones: [
        {
          id: `m-1-${Date.now()}`,
          title: "Milestone 1: Creative Concept & Script Sign-off",
          description: "Submit 60s narrative talking points, camera angles, and messaging guidelines.",
          percentage: 30,
          amount: Math.round(newDealComp * 0.3),
          dueDate: "2026-10-10",
          status: "Pending",
        },
        {
          id: `m-2-${Date.now()}`,
          title: "Milestone 2: 4K Rough Cut & Product Placement Review",
          description: "Creator shares private unlisted draft with sponsor segment embedded.",
          percentage: 40,
          amount: Math.round(newDealComp * 0.4),
          dueDate: "2026-10-18",
          status: "Pending",
        },
        {
          id: `m-3-${Date.now()}`,
          title: "Milestone 3: Live YouTube Publication & Tracking Verification",
          description: "Video released live with tracked referral URL and pinned comment.",
          percentage: 30,
          amount: Math.round(newDealComp * 0.3),
          dueDate: newDealTargetDate,
          status: "Pending",
        },
      ],
      contractTerms: contractTerms,
      createdAt: new Date().toISOString().split("T")[0],
      targetLiveDate: newDealTargetDate,
    };

    onCreateNewDeal(newDeal);
    setActiveDealId(newDeal.id);
    setShowNewCollabModal(false);
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/10 pb-8">
        <div className="space-y-2 max-w-2xl">
          <span className="text-[#c5a059] text-[11px] uppercase tracking-[0.4em] block font-medium">
            Execution Protocol
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif font-light text-[#f5f2ed] tracking-tight">
            Deal Room & Escrow
          </h1>
          <p className="text-xs sm:text-sm text-white/50 leading-relaxed font-light">
            Replacing chaotic DMs with standardized contracts, 3-tier milestone disbursements, and
            transparent delivery audits. Brands ensure guaranteed delivery; creators ensure guaranteed payment.
          </p>
        </div>

        <button
          onClick={() => setShowNewCollabModal(true)}
          className="flex items-center gap-2 rounded-sm border border-[#c5a059] bg-[#c5a059] px-5 py-3 text-[10px] uppercase tracking-widest font-semibold text-black transition-all hover:bg-[#d5b069] self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Structured Collab</span>
        </button>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-sm border border-white/10 bg-[#0a0a0a] p-5">
          <div className="text-[9px] uppercase tracking-[0.2em] text-white/40">Active Escrow Locked</div>
          <div className="mt-1 font-serif text-2xl font-light text-[#c5a059]">
            ${totalEscrowLocked.toLocaleString()}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-white/40 mt-1">Held in smart escrow</div>
        </div>

        <div className="rounded-sm border border-white/10 bg-[#0a0a0a] p-5">
          <div className="text-[9px] uppercase tracking-[0.2em] text-white/40">Active Pipeline Deals</div>
          <div className="mt-1 font-serif text-2xl font-light text-[#f5f2ed]">
            {deals.length}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-[#00ff88] mt-1">100% structured terms</div>
        </div>

        <div className="rounded-sm border border-white/10 bg-[#0a0a0a] p-5">
          <div className="text-[9px] uppercase tracking-[0.2em] text-white/40">Settled Volume</div>
          <div className="mt-1 font-serif text-2xl font-light text-[#00ff88]">
            ${completedDealsTotal.toLocaleString()}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-white/40 mt-1">Released milestones</div>
        </div>

        <div className="rounded-sm border border-white/10 bg-[#0a0a0a] p-5">
          <div className="text-[9px] uppercase tracking-[0.2em] text-white/40">Delivery Guarantee</div>
          <div className="mt-1 font-serif text-2xl font-light text-[#f5f2ed]">
            100%
          </div>
          <div className="text-[10px] uppercase tracking-wider text-[#00ff88] mt-1">Escrow backed</div>
        </div>
      </div>

      {/* Main Deal Room Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Deal Pipeline List */}
        <div className="lg:col-span-5 space-y-4">
          {/* Stage Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {["All", "Proposed", "Escrow Funded", "In Production", "Completed"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStage(st)}
                className={`whitespace-nowrap rounded-sm px-3 py-1 text-[10px] uppercase tracking-wider transition-colors ${
                  filterStage === st
                    ? "border border-[#c5a059] bg-[#c5a059]/15 font-semibold text-[#c5a059]"
                    : "border border-white/5 bg-[#0a0a0a] text-white/50 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Deal Cards List */}
          <div className="space-y-3">
            {filteredDeals.map((deal) => (
              <div
                key={deal.id}
                onClick={() => setActiveDealId(deal.id)}
                className={`cursor-pointer rounded-sm border p-4 transition-all ${
                  activeDealId === deal.id
                    ? "border-[#c5a059] bg-[#0f0f0f]"
                    : "border-white/10 bg-[#0a0a0a] hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={deal.creatorAvatar}
                      alt={deal.creatorName}
                      className="h-10 w-10 rounded-sm border border-white/10 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-serif text-sm font-medium text-[#f5f2ed] line-clamp-1">
                        {deal.title}
                      </h4>
                      <div className="font-mono text-xs text-white/40">
                        {deal.brandName} • {deal.creatorName}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`rounded-sm px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold ${
                      deal.status === "Completed"
                        ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                        : deal.status === "Escrow Funded" || deal.status === "In Production"
                        ? "bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/30"
                        : "bg-white/5 text-white/60 border border-white/10"
                    }`}
                  >
                    {deal.status}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2.5 text-xs">
                  <span className="font-serif font-medium text-[#c5a059]">
                    ${deal.compensation.toLocaleString()}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-white/40">
                    Live: {deal.targetLiveDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Active Deal Management & Milestone Escrow Protocol */}
        <div className="lg:col-span-7 space-y-6">
          {activeDeal ? (
            <div className="rounded-sm border border-white/10 bg-[#0a0a0a] p-6 space-y-6">
              {/* Deal Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-2xl font-light text-[#f5f2ed]">
                      {activeDeal.title}
                    </h3>
                    <span className="rounded-sm border border-[#c5a059]/40 bg-[#c5a059]/10 px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium text-[#c5a059]">
                      {activeDeal.dealType}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-white/50">
                    Brand: <span className="text-[#f5f2ed] font-medium">{activeDeal.brandName}</span> •
                    Creator:{" "}
                    <span className="text-[#f5f2ed] font-medium">{activeDeal.creatorName}</span> (
                    {activeDeal.creatorHandle})
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">Total Compensation</div>
                  <div className="font-serif text-3xl font-light text-[#c5a059]">
                    ${activeDeal.compensation.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Escrow Status Banner */}
              <div className="flex items-center justify-between rounded-sm border border-white/10 bg-[#050505] p-4 text-xs">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-sm ${
                      activeDeal.status === "Escrow Funded" || activeDeal.status === "In Production"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-[#c5a059]/20 text-[#c5a059]"
                    }`}
                  >
                    {activeDeal.status === "Escrow Funded" || activeDeal.status === "In Production" ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Unlock className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-[#f5f2ed]">
                      Escrow State:{" "}
                      <span className="text-[#c5a059]">{activeDeal.status}</span>
                    </div>
                    <div className="text-[11px] text-white/40">
                      Funds disbursed sequentially upon mutual milestone sign-off.
                    </div>
                  </div>
                </div>

                {activeDeal.status === "Proposed" && (
                  <button
                    onClick={handleFundEscrow}
                    className="rounded-sm border border-[#c5a059] bg-[#c5a059] px-4 py-2 text-[10px] uppercase tracking-widest font-semibold text-black transition-all hover:bg-[#d5b069]"
                  >
                    Lock & Fund Escrow (${activeDeal.compensation.toLocaleString()})
                  </button>
                )}
              </div>

              {/* 3-Tier Milestone Protocol */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-base font-light text-[#f5f2ed]">
                    Standardized Milestone Schedule (3-Tier Escrow)
                  </h4>
                  <span className="text-[10px] uppercase tracking-wider text-white/40">
                    Delivery verification
                  </span>
                </div>

                <div className="space-y-3">
                  {activeDeal.milestones.map((m, index) => {
                    return (
                      <div
                        key={m.id}
                        className="rounded-sm border border-white/5 bg-[#050505] p-4 transition-all hover:border-white/10"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-sm border border-[#c5a059]/40 bg-[#c5a059]/10 font-mono text-xs font-bold text-[#c5a059]">
                              {index + 1}
                            </div>
                            <div>
                              <div className="text-xs font-medium text-[#f5f2ed]">
                                {m.title}
                              </div>
                              <p className="text-[11px] text-white/50 mt-1 leading-relaxed font-light">
                                {m.description}
                              </p>
                              <div className="mt-2 flex items-center gap-3 text-[10px] uppercase tracking-wider text-white/40">
                                <span>Due: {m.dueDate}</span>
                                <span>•</span>
                                <span>Disbursement: {m.percentage}%</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <span className="font-serif text-sm font-semibold text-[#c5a059]">
                              ${m.amount.toLocaleString()}
                            </span>
                            <span
                              className={`rounded-sm px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold ${
                                m.status === "Released" || m.status === "Approved"
                                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                                    : m.status === "Submitted"
                                    ? "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                                    : "bg-white/5 text-white/60"
                              }`}
                            >
                              {m.status}
                            </span>
                          </div>
                        </div>

                        {/* Milestone Action Button */}
                        <div className="mt-3 flex items-center justify-end gap-2 border-t border-white/5 pt-2.5">
                          {m.status === "Pending" && (
                            <button
                              onClick={() => handleAdvanceMilestone(m.id)}
                              className="rounded-sm border border-white/10 bg-[#0a0a0a] px-3 py-1 text-[10px] uppercase tracking-wider text-white/70 hover:text-white"
                            >
                              Start Working
                            </button>
                          )}
                          {m.status === "In Progress" && (
                            <button
                              onClick={() => handleAdvanceMilestone(m.id)}
                              className="rounded-sm border border-amber-500/30 bg-amber-500/20 px-3 py-1 text-[10px] uppercase tracking-wider font-medium text-amber-300 hover:bg-amber-500/30"
                            >
                              Submit for Review
                            </button>
                          )}
                          {m.status === "Submitted" && (
                            <button
                              onClick={() => handleAdvanceMilestone(m.id)}
                              className="rounded-sm border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-[10px] uppercase tracking-wider font-semibold text-emerald-300 hover:bg-emerald-500/30"
                            >
                              Approve & Release ${m.amount.toLocaleString()}
                            </button>
                          )}
                          {m.status === "Approved" && (
                            <button
                              onClick={() => handleAdvanceMilestone(m.id)}
                              className="rounded-sm border border-[#c5a059] bg-[#c5a059] px-3 py-1 text-[10px] uppercase tracking-widest font-semibold text-black hover:bg-[#d5b069]"
                            >
                              Confirm Escrow Payout
                            </button>
                          )}
                          {m.status === "Released" && (
                            <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-emerald-300 font-medium">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Funds Disbursed
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Term Sheet Button */}
              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <button
                  onClick={() => setShowTermSheetModal(true)}
                  className="flex items-center gap-2 text-xs text-[#c5a059] hover:underline"
                >
                  <FileText className="h-4 w-4" />
                  <span>Inspect Standardized Master Agreement & FTC Clauses</span>
                </button>

                <div className="text-[10px] uppercase tracking-wider text-white/40">
                  Agreement ID: {activeDeal.id}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-white/10 bg-[#0a0a0a] p-12 text-center text-xs text-white/40">
              Select a collaboration deal from the pipeline or create a new one to view milestones.
            </div>
          )}
        </div>
      </div>

      {/* Term Sheet Modal */}
      {showTermSheetModal && activeDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-sm border border-white/10 bg-[#0a0a0a] p-6 text-xs text-[#f5f2ed] shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="font-serif text-xl font-light text-[#f5f2ed]">
                  Master Structured Collaboration Agreement
                </h3>
                <p className="text-[10px] uppercase tracking-wider text-white/40">
                  Standardized CipherCollab Legal Standard • Non-Hostile Terms
                </p>
              </div>
              <button
                onClick={() => setShowTermSheetModal(false)}
                className="rounded-sm p-1 text-white/40 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs leading-relaxed text-white/70 font-light">
              <div className="rounded-sm border border-white/10 bg-[#050505] p-3.5 space-y-1">
                <div className="font-semibold text-[#f5f2ed]">Parties & Engagement</div>
                <div>Brand: {activeDeal.brandName}</div>
                <div>Creator: {activeDeal.creatorName} ({activeDeal.creatorHandle})</div>
                <div>Format: {activeDeal.dealType}</div>
                <div>Total Consideration: ${activeDeal.compensation.toLocaleString()} USD</div>
              </div>

              <div>
                <div className="font-semibold text-[#c5a059] uppercase tracking-wider text-[10px] mb-1">
                  1. Agreed Deliverables
                </div>
                <ul className="list-disc list-inside space-y-1 text-white/60">
                  {activeDeal.contractTerms?.deliverables?.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="font-semibold text-[#c5a059] uppercase tracking-wider text-[10px] mb-1">
                  2. Exclusivity & Category Protection
                </div>
                <p className="text-white/60">
                  Creator agrees to a {activeDeal.contractTerms?.exclusivityDays || 30}-day direct category exclusivity
                  window surrounding the public release date of the integration.
                </p>
              </div>

              <div>
                <div className="font-semibold text-[#c5a059] uppercase tracking-wider text-[10px] mb-1">
                  3. Digital Usage & Whitelisting Rights
                </div>
                <p className="text-white/60">
                  Brand is granted a {activeDeal.contractTerms?.usageRightsMonths || 6}-month non-exclusive digital
                  whitelisting and organic embedding right for promotional clips and quotes.
                </p>
              </div>

              <div>
                <div className="font-semibold text-[#c5a059] uppercase tracking-wider text-[10px] mb-1">
                  4. FTC Disclosure Standard
                </div>
                <p className="text-white/60">
                  Creator must display clear and conspicuous audible and visual sponsorship disclosures
                  consistent with FTC guidelines ("Sponsored by {activeDeal.brandName}").
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end border-t border-white/10 pt-4">
              <button
                onClick={() => setShowTermSheetModal(false)}
                className="rounded-sm border border-[#c5a059] bg-[#c5a059] px-4 py-2 text-[10px] uppercase tracking-widest font-semibold text-black"
              >
                Close Agreement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Collaboration Modal */}
      {showNewCollabModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-sm border border-white/10 bg-[#0a0a0a] p-6 text-xs text-[#f5f2ed] shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="font-serif text-xl font-light text-[#f5f2ed]">
                  Initiate Structured Collaboration
                </h3>
                <p className="text-[10px] uppercase tracking-wider text-white/40">
                  Lock in availability and milestone escrow terms
                </p>
              </div>
              <button
                onClick={() => setShowNewCollabModal(false)}
                className="rounded-sm p-1 text-white/40 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDealSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-white/40">
                  Select Creator
                </label>
                <select
                  value={newDealCreatorId}
                  onChange={(e) => {
                    setNewDealCreatorId(e.target.value);
                    const sel = creators.find((c) => c.id === e.target.value);
                    if (sel) {
                      setNewDealComp(sel.rateCard?.integration60s?.recommended || 25000);
                    }
                  }}
                  className="mt-1.5 w-full rounded-sm border border-white/10 bg-[#050505] px-3.5 py-2 text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
                >
                  {creators.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#050505]">
                      {c.name} ({c.niche} • {c.subscribers.toLocaleString()} subs)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-white/40">
                  Brand or Organization Name
                </label>
                <input
                  type="text"
                  required
                  value={newDealBrandName}
                  onChange={(e) => setNewDealBrandName(e.target.value)}
                  className="mt-1.5 w-full rounded-sm border border-white/10 bg-[#050505] px-3.5 py-2 text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-white/40">
                    Format
                  </label>
                  <select
                    value={newDealType}
                    onChange={(e: any) => setNewDealType(e.target.value)}
                    className="mt-1.5 w-full rounded-sm border border-white/10 bg-[#050505] px-3 py-2 text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
                  >
                    <option value="60s Integration" className="bg-[#050505]">60s Integration</option>
                    <option value="Dedicated Video" className="bg-[#050505]">Dedicated Video</option>
                    <option value="Multi-Part Series" className="bg-[#050505]">Multi-Part Series</option>
                    <option value="Shorts / Reels" className="bg-[#050505]">Shorts / Reels</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-white/40">
                    Compensation ($)
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={500}
                    value={newDealComp}
                    onChange={(e) => setNewDealComp(parseFloat(e.target.value) || 0)}
                    className="mt-1.5 w-full rounded-sm border border-white/10 bg-[#050505] px-3.5 py-2 font-mono text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-white/40">
                  Target Live Release Date
                </label>
                <input
                  type="date"
                  required
                  value={newDealTargetDate}
                  onChange={(e) => setNewDealTargetDate(e.target.value)}
                  className="mt-1.5 w-full rounded-sm border border-white/10 bg-[#050505] px-3.5 py-2 font-mono text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isGeneratingAiTerms}
                  className="w-full flex items-center justify-center gap-2 rounded-sm border border-[#c5a059] bg-[#c5a059] py-3 text-[10px] uppercase tracking-widest font-semibold text-black transition-all hover:bg-[#d5b069] disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>
                    {isGeneratingAiTerms
                      ? "Drafting Agreement Terms..."
                      : "Create Agreement & Escrow"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
