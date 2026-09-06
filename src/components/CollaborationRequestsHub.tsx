import React, { useState } from "react";
import {
  Inbox,
  Send,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  Calendar,
  DollarSign,
  Layers,
  Sparkles,
  FileText,
  User,
  Plus,
  Clock,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { CollaborationRequest, Creator, CollaborationDeal } from "../types";
import { CounterOfferModal } from "./CounterOfferModal";

interface CollaborationRequestsHubProps {
  requests: CollaborationRequest[];
  creators: Creator[];
  perspective: "brand" | "creator";
  onUpdateRequest: (req: CollaborationRequest) => void;
  onCreateDealFromRequest: (req: CollaborationRequest, agreedBudget?: number) => void;
  onOpenNewRequestModal: (creator?: Creator) => void;
}

export const CollaborationRequestsHub: React.FC<CollaborationRequestsHubProps> = ({
  requests,
  creators,
  perspective,
  onUpdateRequest,
  onCreateDealFromRequest,
  onOpenNewRequestModal,
}) => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    requests[0]?.id || null
  );
  const [counterOfferTargetRequest, setCounterOfferTargetRequest] =
    useState<CollaborationRequest | null>(null);

  const filteredRequests = requests.filter((r) => {
    if (selectedStatusFilter === "all") return true;
    return r.status.toLowerCase() === selectedStatusFilter.toLowerCase();
  });

  const activeRequest =
    requests.find((r) => r.id === selectedRequestId) || filteredRequests[0] || null;

  const handleAcceptRequest = (req: CollaborationRequest) => {
    const updated: CollaborationRequest = {
      ...req,
      status: "Accepted",
      updatedAt: new Date().toISOString().split("T")[0],
    };
    onUpdateRequest(updated);
    onCreateDealFromRequest(updated, req.counterOffer ? req.counterOffer.proposedBudget : req.proposedBudgetRange.max);
  };

  const handleDeclineRequest = (req: CollaborationRequest) => {
    const updated: CollaborationRequest = {
      ...req,
      status: "Declined",
      updatedAt: new Date().toISOString().split("T")[0],
    };
    onUpdateRequest(updated);
  };

  const handleSubmitCounterOffer = (
    requestId: string,
    counterOfferData: {
      proposedBudget: number;
      modifiedDeliverables: string[];
      proposedLiveDate: string;
      creatorNotes: string;
    }
  ) => {
    const target = requests.find((r) => r.id === requestId);
    if (!target) return;

    const updated: CollaborationRequest = {
      ...target,
      status: "Counter-Offered",
      counterOffer: {
        ...counterOfferData,
        submittedAt: new Date().toISOString().split("T")[0],
      },
      updatedAt: new Date().toISOString().split("T")[0],
    };
    onUpdateRequest(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / System Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl font-light text-[#f5f2ed] tracking-tight">
              Collaboration Request System
            </h1>
            <span className="rounded-sm border border-[#c5a059]/40 bg-[#c5a059]/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-[#c5a059]">
              {perspective === "creator" ? "Dedicated Creator Inbox" : "Brand Pipeline Dispatch"}
            </span>
          </div>
          <p className="mt-1 text-xs text-white/50">
            {perspective === "creator"
              ? "Review incoming campaign briefs, evaluate deliverables, and accept or submit counter-offers with standardized terms."
              : "Initiate standardized campaign briefs directly to verified creators with guaranteed milestone delivery."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenNewRequestModal()}
            className="flex items-center gap-2 rounded-sm border border-[#c5a059] bg-[#c5a059] px-4 py-2 text-xs font-semibold text-black transition-all hover:bg-[#d5b069] uppercase tracking-widest"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Initiate New Request</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Quick Counters */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-white/10 bg-[#0a0a0a] p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {["all", "pending", "counter-offered", "accepted", "declined"].map((status) => {
            const count =
              status === "all"
                ? requests.length
                : requests.filter((r) => r.status.toLowerCase() === status).length;
            const isActive = selectedStatusFilter === status;

            return (
              <button
                key={status}
                onClick={() => setSelectedStatusFilter(status)}
                className={`flex items-center gap-2 rounded-sm px-3 py-1.5 text-[10px] uppercase tracking-wider font-medium transition-all ${
                  isActive
                    ? "border border-[#c5a059] bg-[#c5a059]/15 text-[#c5a059]"
                    : "border border-transparent text-white/50 hover:text-white"
                }`}
              >
                <span>{status}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[9px] font-mono ${
                    isActive ? "bg-[#c5a059] text-black font-bold" : "bg-white/10 text-white/70"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-[10px] uppercase tracking-widest text-white/40 font-mono">
          Showing {filteredRequests.length} of {requests.length} Requests
        </div>
      </div>

      {/* Main Grid: Left Request List, Right Request Detailed Dossier */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Request Cards (4 cols on lg) */}
        <div className="space-y-3 lg:col-span-5">
          {filteredRequests.length === 0 ? (
            <div className="rounded-sm border border-white/10 bg-[#0a0a0a] p-8 text-center text-xs text-white/40">
              <Inbox className="mx-auto h-8 w-8 text-white/20 mb-2" />
              <p>No collaboration requests matching filter.</p>
            </div>
          ) : (
            filteredRequests.map((req) => {
              const isSelected = activeRequest?.id === req.id;
              const statusColors: Record<string, string> = {
                Pending: "border-amber-500/40 bg-amber-500/10 text-amber-300",
                "Counter-Offered": "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
                Accepted: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
                Declined: "border-red-500/40 bg-red-500/10 text-red-400",
              };

              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequestId(req.id)}
                  className={`cursor-pointer rounded-sm border p-4 transition-all ${
                    isSelected
                      ? "border-[#c5a059] bg-[#0a0a0a] shadow-lg shadow-[#c5a059]/5"
                      : "border-white/10 bg-[#050505] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={req.creatorAvatar}
                        alt={req.creatorName}
                        className="h-10 w-10 rounded-sm border border-white/10 object-cover"
                      />
                      <div>
                        <div className="font-serif text-sm font-medium text-[#f5f2ed]">
                          {req.campaignTitle}
                        </div>
                        <div className="text-[11px] text-white/50">
                          {perspective === "creator" ? (
                            <span>From: <strong className="text-white/80">{req.brandName}</strong></span>
                          ) : (
                            <span>To: <strong className="text-[#c5a059]">{req.creatorName}</strong></span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`rounded-sm border px-2 py-0.5 text-[9px] uppercase tracking-wider font-mono font-medium ${
                        statusColors[req.status] || "border-white/10 text-white/60"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  {/* Highlights */}
                  <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-[11px] font-mono text-white/40">
                    <div className="flex items-center gap-1 text-[#00ff88]">
                      <DollarSign className="h-3 w-3" />
                      <span>
                        {req.counterOffer
                          ? `$${req.counterOffer.proposedBudget.toLocaleString()}`
                          : `$${req.proposedBudgetRange.min.toLocaleString()} – $${req.proposedBudgetRange.max.toLocaleString()}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Live: {req.timeline.finalDeliveryDate}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Request Dossier (7 cols on lg) */}
        <div className="lg:col-span-7">
          {activeRequest ? (
            <div className="rounded-sm border border-white/10 bg-[#0a0a0a] p-6 space-y-6 text-xs text-[#f5f2ed]">
              {/* Dossier Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#c5a059]">
                      Request ID: {activeRequest.id}
                    </span>
                    <span className="text-white/30">•</span>
                    <span className="text-[10px] text-white/40">
                      Logged {activeRequest.createdAt}
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl font-light text-[#f5f2ed] tracking-tight mt-1">
                    {activeRequest.campaignTitle}
                  </h2>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-sm border px-3 py-1 text-[10px] uppercase tracking-widest font-mono font-medium ${
                      activeRequest.status === "Pending"
                        ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                        : activeRequest.status === "Counter-Offered"
                        ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-300"
                        : activeRequest.status === "Accepted"
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                        : "border-red-500/50 bg-red-500/10 text-red-400"
                    }`}
                  >
                    ● {activeRequest.status}
                  </span>
                </div>
              </div>

              {/* Brand & Creator Metadata Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-sm border border-white/5 bg-[#050505] p-4">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-white/40">
                    Brand Partner
                  </span>
                  <div className="font-serif text-base font-light text-[#f5f2ed]">
                    {activeRequest.brandName}
                  </div>
                  <div className="font-mono text-[10px] text-white/50">
                    Contact: {activeRequest.brandContact}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-white/40">
                    Assigned Creator
                  </span>
                  <div className="flex items-center gap-2">
                    <img
                      src={activeRequest.creatorAvatar}
                      alt={activeRequest.creatorName}
                      className="h-6 w-6 rounded-sm border border-[#c5a059]/40 object-cover"
                    />
                    <span className="font-serif text-base font-light text-[#c5a059]">
                      {activeRequest.creatorName}
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-white/50">
                    Handle: {activeRequest.creatorHandle}
                  </div>
                </div>
              </div>

              {/* Campaign Objectives */}
              <div className="space-y-2">
                <div className="text-[10px] uppercase tracking-widest text-[#c5a059] font-medium">
                  Campaign Objectives
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeRequest.campaignObjectives.map((obj, i) => (
                    <span
                      key={i}
                      className="rounded-sm border border-white/10 bg-[#050505] px-2.5 py-1 text-xs text-white/80"
                    >
                      ✓ {obj}
                    </span>
                  ))}
                </div>
              </div>

              {/* Target Audience Profile */}
              <div className="rounded-sm border border-white/10 bg-[#050505] p-4 space-y-2.5">
                <div className="text-[10px] uppercase tracking-widest text-[#c5a059] font-medium">
                  Target Audience Demographics
                </div>
                <p className="text-xs text-white/70 leading-relaxed font-light">
                  {activeRequest.targetAudience.description}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5 text-[11px]">
                  <div>
                    <span className="text-white/40 text-[9px] uppercase tracking-wider block">
                      Age Bracket Focus:
                    </span>
                    <span className="text-white/90 font-mono">
                      {activeRequest.targetAudience.ageFocus}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/40 text-[9px] uppercase tracking-wider block">
                      Target Geographies:
                    </span>
                    <span className="text-white/90 font-mono">
                      {activeRequest.targetAudience.targetRegions.join(", ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Desired Deliverables */}
              <div className="space-y-2">
                <div className="text-[10px] uppercase tracking-widest text-[#c5a059] font-medium">
                  Desired Deliverables Scope
                </div>
                <div className="space-y-2">
                  {activeRequest.desiredDeliverables.map((del) => (
                    <div
                      key={del.id}
                      className="rounded-sm border border-white/5 bg-[#050505] p-3 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="font-serif text-sm text-[#f5f2ed]">
                          {del.quantity}x {del.type}
                        </div>
                        <p className="text-xs text-white/50">{del.specifications}</p>
                      </div>
                      <span className="rounded-sm border border-[#c5a059]/30 bg-[#c5a059]/5 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#c5a059]">
                        Verified Delivery
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget Range & Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-sm border border-white/10 bg-[#050505] p-4 space-y-1.5">
                  <div className="text-[10px] uppercase tracking-widest text-[#c5a059] font-medium">
                    Proposed Budget Range
                  </div>
                  <div className="font-mono text-xl font-light text-[#00ff88]">
                    ${activeRequest.proposedBudgetRange.min.toLocaleString()} – $
                    {activeRequest.proposedBudgetRange.max.toLocaleString()}{" "}
                    <span className="text-xs text-white/40">USD</span>
                  </div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider">
                    Full escrow milestone protection protocol
                  </div>
                </div>

                <div className="rounded-sm border border-white/10 bg-[#050505] p-4 space-y-1.5">
                  <div className="text-[10px] uppercase tracking-widest text-[#c5a059] font-medium">
                    Campaign Timeline
                  </div>
                  <div className="space-y-1 font-mono text-xs text-white/70">
                    <div>Start: {activeRequest.timeline.startDate}</div>
                    <div>Draft Review: {activeRequest.timeline.draftDueDate}</div>
                    <div className="text-[#c5a059] font-semibold">
                      Final Live: {activeRequest.timeline.finalDeliveryDate}
                    </div>
                  </div>
                </div>
              </div>

              {/* Brief Guidelines */}
              <div className="rounded-sm border border-white/10 bg-[#050505] p-4 space-y-1.5">
                <div className="text-[10px] uppercase tracking-widest text-[#c5a059] font-medium">
                  Creative Brief & Parameters
                </div>
                <p className="text-xs text-white/60 leading-relaxed font-light">
                  {activeRequest.briefGuidelines}
                </p>
              </div>

              {/* Counter-Offer Banner (If exists) */}
              {activeRequest.counterOffer && (
                <div className="rounded-sm border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-cyan-300 font-serif text-sm">
                      <ArrowRightLeft className="h-4 w-4" />
                      <span>Creator Counter-Offer Transmitted</span>
                    </div>
                    <span className="font-mono text-[10px] text-cyan-400">
                      {activeRequest.counterOffer.submittedAt}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-white/40 text-[9px] uppercase tracking-wider block">
                        Adjusted Budget:
                      </span>
                      <span className="font-mono text-lg font-medium text-[#00ff88]">
                        ${activeRequest.counterOffer.proposedBudget.toLocaleString()} USD
                      </span>
                    </div>
                    <div>
                      <span className="text-white/40 text-[9px] uppercase tracking-wider block">
                        Proposed Live Date:
                      </span>
                      <span className="font-mono text-white/80">
                        {activeRequest.counterOffer.proposedLiveDate}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-white/40 text-[9px] uppercase tracking-wider block mb-1">
                      Modified Deliverables:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-white/70 font-mono text-xs">
                      {activeRequest.counterOffer.modifiedDeliverables.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-white/40 text-[9px] uppercase tracking-wider block mb-1">
                      Creator Rationale:
                    </span>
                    <p className="text-xs text-white/60 italic">
                      "{activeRequest.counterOffer.creatorNotes}"
                    </p>
                  </div>

                  {/* Brand Action on Counter-Offer */}
                  {perspective === "brand" && activeRequest.status === "Counter-Offered" && (
                    <div className="pt-3 border-t border-cyan-500/20 flex items-center justify-between">
                      <span className="text-[11px] text-cyan-200">
                        Accept creator's adjusted terms to lock in deal?
                      </span>
                      <button
                        onClick={() => handleAcceptRequest(activeRequest)}
                        className="rounded-sm border border-cyan-400 bg-cyan-500/20 px-4 py-1.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/30 transition-all uppercase tracking-wider"
                      >
                        Accept Counter-Offer & Lock Deal
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons for Creator (Accept, Decline, Counter-Offer) */}
              {perspective === "creator" && activeRequest.status !== "Accepted" && (
                <div className="flex flex-wrap items-center justify-end gap-3 border-t border-white/10 pt-5">
                  <button
                    onClick={() => handleDeclineRequest(activeRequest)}
                    className="rounded-sm border border-red-500/30 bg-red-950/20 px-4 py-2 text-xs text-red-300 hover:bg-red-950/40 transition-colors uppercase tracking-wider"
                  >
                    Decline Brief
                  </button>

                  <button
                    onClick={() => setCounterOfferTargetRequest(activeRequest)}
                    className="flex items-center gap-1.5 rounded-sm border border-white/20 bg-white/5 px-4 py-2 text-xs text-white/80 hover:bg-white/10 hover:text-white transition-colors uppercase tracking-wider"
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5 text-[#c5a059]" />
                    <span>Propose Counter-Offer</span>
                  </button>

                  <button
                    onClick={() => handleAcceptRequest(activeRequest)}
                    className="flex items-center gap-1.5 rounded-sm border border-[#c5a059] bg-[#c5a059] px-6 py-2 text-xs font-semibold text-black hover:bg-[#d5b069] transition-all uppercase tracking-widest"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Accept & Initialize Escrow Deal</span>
                  </button>
                </div>
              )}

              {/* Already Accepted Confirmation */}
              {activeRequest.status === "Accepted" && (
                <div className="flex items-center justify-between rounded-sm border border-emerald-500/30 bg-emerald-950/20 p-4">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <ShieldCheck className="h-5 w-5" />
                    <div>
                      <div className="font-serif text-sm font-medium">
                        Request Formally Accepted & Locked
                      </div>
                      <div className="text-[10px] text-emerald-400/70 font-mono">
                        Escrow-backed collaboration active in Deal Room
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#00ff88]">
                    Escrow Protocol Active
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-sm border border-white/10 bg-[#0a0a0a] p-12 text-center text-xs text-white/40">
              Select a collaboration request to view detailed campaign dossier.
            </div>
          )}
        </div>
      </div>

      {/* Counter Offer Modal */}
      <CounterOfferModal
        isOpen={Boolean(counterOfferTargetRequest)}
        onClose={() => setCounterOfferTargetRequest(null)}
        request={counterOfferTargetRequest}
        onSubmitCounterOffer={handleSubmitCounterOffer}
      />
    </div>
  );
};
