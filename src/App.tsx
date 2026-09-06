/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Navbar, NavTabType } from "./components/Navbar";
import { CreatorDirectory } from "./components/CreatorDirectory";
import { CreatorDetailModal } from "./components/CreatorDetailModal";
import { BrandDecisionEngine } from "./components/BrandDecisionEngine";
import { DealRoom } from "./components/DealRoom";
import { CreatorPortal } from "./components/CreatorPortal";
import { AddCreatorModal } from "./components/AddCreatorModal";
import { SupabaseModal } from "./components/SupabaseModal";
import { CollaborationRequestModal } from "./components/CollaborationRequestModal";
import { CollaborationRequestsHub } from "./components/CollaborationRequestsHub";
import { PerformanceDashboard } from "./components/PerformanceDashboard";
import {
  Creator,
  CollaborationDeal,
  SupabaseConfigState,
  CollaborationRequest,
  CampaignKPI,
} from "./types";
import {
  INITIAL_CREATORS,
  INITIAL_DEALS,
  INITIAL_COLLABORATION_REQUESTS,
  INITIAL_CAMPAIGN_KPIS,
} from "./data/mockCreators";
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  saveLocalState,
  loadLocalState,
  syncToSupabase,
} from "./lib/supabaseClient";
import { ShieldCheck, Sparkles, Youtube, Database, ExternalLink, ArrowRight } from "lucide-react";

const LOCAL_STORAGE_KEY_REQUESTS = "ciphercollab_requests_v1";
const LOCAL_STORAGE_KEY_KPIS = "ciphercollab_kpis_v1";

export default function App() {
  // Navigation & Perspective
  const [activeTab, setActiveTab] = useState<NavTabType>("directory");
  const [perspective, setPerspective] = useState<"brand" | "creator">("brand");

  // Core Data State (Loaded from LocalStorage or Initial Mock)
  const [creators, setCreators] = useState<Creator[]>(() => {
    const saved = loadLocalState();
    return saved.creators && saved.creators.length > 0 ? saved.creators : INITIAL_CREATORS;
  });

  const [deals, setDeals] = useState<CollaborationDeal[]>(() => {
    const saved = loadLocalState();
    return saved.deals && saved.deals.length > 0 ? saved.deals : INITIAL_DEALS;
  });

  const [requests, setRequests] = useState<CollaborationRequest[]>(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY_REQUESTS);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn("Could not load requests from localStorage", e);
    }
    return INITIAL_COLLABORATION_REQUESTS;
  });

  const [campaigns, setCampaigns] = useState<CampaignKPI[]>(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY_KPIS);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn("Could not load KPIs from localStorage", e);
    }
    return INITIAL_CAMPAIGN_KPIS;
  });

  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfigState>(() =>
    getSupabaseConfig()
  );

  // Modals & Selected States
  const [selectedCreatorForModal, setSelectedCreatorForModal] = useState<Creator | null>(null);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [isAddCreatorOpen, setIsAddCreatorOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isSearchingYouTube, setIsSearchingYouTube] = useState(false);
  const [isCollabRequestModalOpen, setIsCollabRequestModalOpen] = useState(false);
  const [collabRequestTargetCreator, setCollabRequestTargetCreator] = useState<Creator | null>(null);

  // Save changes to localStorage whenever data changes
  useEffect(() => {
    saveLocalState(creators, deals);
  }, [creators, deals]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_REQUESTS, JSON.stringify(requests));
    } catch (e) {
      console.warn("Failed to persist requests", e);
    }
  }, [requests]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_KPIS, JSON.stringify(campaigns));
    } catch (e) {
      console.warn("Failed to persist campaigns", e);
    }
  }, [campaigns]);

  // Handle YouTube Live API Search
  const handlePerformYouTubeLiveSearch = async (query: string) => {
    setIsSearchingYouTube(true);
    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.creators && data.creators.length > 0) {
        // Merge with existing list if new
        setCreators((prev) => {
          const existingIds = new Set(prev.map((c) => c.id));
          const newOnes = data.creators.filter((c: Creator) => !existingIds.has(c.id));
          return [...newOnes, ...prev];
        });
      }
    } catch (err) {
      console.warn("YouTube live search failed:", err);
    } finally {
      setIsSearchingYouTube(false);
    }
  };

  // Handlers for Creator & Deal mutations
  const handleAddCreator = (newCreator: Creator) => {
    setCreators((prev) => [newCreator, ...prev]);
  };

  const handleUpdateCreator = (updatedCreator: Creator) => {
    setCreators((prev) =>
      prev.map((c) => (c.id === updatedCreator.id ? updatedCreator : c))
    );
  };

  const handleUpdateDeal = (updatedDeal: CollaborationDeal) => {
    setDeals((prev) =>
      prev.map((d) => (d.id === updatedDeal.id ? updatedDeal : d))
    );
  };

  const handleCreateNewDeal = (newDeal: CollaborationDeal) => {
    setDeals((prev) => [newDeal, ...prev]);
    setSelectedDealId(newDeal.id);
  };

  const handleInitiateCollabFromDirectory = (creator: Creator) => {
    setActiveTab("deal-room");
    // Find existing deal or create pre-fill
    const existing = deals.find((d) => d.creatorId === creator.id);
    if (existing) {
      setSelectedDealId(existing.id);
    } else {
      setSelectedDealId(null);
    }
  };

  const handleUpdateRequest = (updatedReq: CollaborationRequest) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === updatedReq.id ? updatedReq : r))
    );
  };

  const handleCreateDealFromRequest = (
    req: CollaborationRequest,
    agreedBudget?: number
  ) => {
    const creator = creators.find((c) => c.id === req.creatorId);
    const comp =
      agreedBudget ||
      req.counterOffer?.proposedBudget ||
      req.proposedBudgetRange.max;

    const mapDeliverableToDealType = (
      type?: string
    ): "60s Integration" | "Dedicated Video" | "Multi-Part Series" | "Shorts / Reels" => {
      if (!type) return "60s Integration";
      if (type.includes("Dedicated")) return "Dedicated Video";
      if (type.includes("Series") || type.includes("Multi-Part")) return "Multi-Part Series";
      if (type.includes("Shorts") || type.includes("Vertical")) return "Shorts / Reels";
      return "60s Integration";
    };

    const newDeal: CollaborationDeal = {
      id: `deal-req-${Date.now()}`,
      title: `${req.campaignTitle} — Escrow Contract`,
      creatorId: req.creatorId,
      creatorName: req.creatorName,
      creatorAvatar: req.creatorAvatar,
      creatorHandle: req.creatorHandle,
      creatorNiche: creator?.niche || "Luxury Specialist",
      brandName: req.brandName,
      dealType: mapDeliverableToDealType(req.desiredDeliverables[0]?.type),
      compensation: comp,
      status: "Escrow Funded",
      milestones: [
        {
          id: `m-1-${Date.now()}`,
          title: "Milestone 1: Creative Concept & Script Sign-off",
          description: `Brief: ${req.briefGuidelines.slice(0, 90)}...`,
          percentage: 30,
          amount: Math.round(comp * 0.3),
          dueDate: req.timeline.draftDueDate,
          status: "Pending",
        },
        {
          id: `m-2-${Date.now()}`,
          title: "Milestone 2: 4K Rough Cut & Sponsor Product Review",
          description: `Deliverables: ${req.desiredDeliverables
            .map((d) => `${d.quantity}x ${d.type}`)
            .join(", ")}`,
          percentage: 40,
          amount: Math.round(comp * 0.4),
          dueDate: req.timeline.finalDeliveryDate,
          status: "Pending",
        },
        {
          id: `m-3-${Date.now()}`,
          title: "Milestone 3: Live YouTube Publication & Tracking Verification",
          description: "Verified release with tracked bio links and escrow payout trigger.",
          percentage: 30,
          amount: Math.round(comp * 0.3),
          dueDate: req.timeline.finalDeliveryDate,
          status: "Pending",
        },
      ],
      contractTerms: {
        deliverables: req.desiredDeliverables.map(
          (d) => `${d.quantity}x ${d.type} (${d.specifications || "4K UHD"})`
        ),
        exclusivityDays: 30,
        usageRightsMonths: 6,
        ftcComplianceClause: true,
        paymentTerms: "Standard CipherCollab 3-Tier Milestone Escrow",
      },
      createdAt: new Date().toISOString().split("T")[0],
      targetLiveDate:
        req.counterOffer?.proposedLiveDate || req.timeline.finalDeliveryDate,
      campaignGoal: req.campaignObjectives[0] || "Brand Prestige & Awareness",
    };

    setDeals((prev) => [newDeal, ...prev]);
    setSelectedDealId(newDeal.id);
    setActiveTab("deal-room");
  };

  const handleOpenNewRequestModal = (creator?: Creator) => {
    setCollabRequestTargetCreator(creator || null);
    setIsCollabRequestModalOpen(true);
  };

  const handleSubmitCollabRequest = (newRequest: CollaborationRequest) => {
    setRequests((prev) => [newRequest, ...prev]);
    setActiveTab("requests");
  };

  const handleUpdateCampaign = (updatedCampaign: CampaignKPI) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === updatedCampaign.id ? updatedCampaign : c))
    );
  };

  const handleAddCampaign = (newCampaign: CampaignKPI) => {
    setCampaigns((prev) => [newCampaign, ...prev]);
  };

  const handleSelectCreatorForDealFromEngine = (creator: Creator, suggestedOffer?: any) => {
    const comp = suggestedOffer?.targetPrice || creator.rateCard?.integration60s?.recommended || 25000;
    const newDeal: CollaborationDeal = {
      id: `deal-ai-${Date.now()}`,
      title: `${suggestedOffer?.dealType || "60s Integration"} — Brand Partnership`,
      creatorId: creator.id,
      creatorName: creator.name,
      creatorAvatar: creator.avatarUrl,
      creatorHandle: creator.handle,
      creatorNiche: creator.niche,
      brandName: "Acme Luxury Group",
      dealType: suggestedOffer?.dealType || "60s Integration",
      compensation: comp,
      status: "Proposed",
      milestones: [
        {
          id: `m-1-${Date.now()}`,
          title: "Milestone 1: Creative Concept & Script Sign-off",
          description: "Submit 60s narrative talking points, camera angles, and messaging guidelines.",
          percentage: 30,
          amount: Math.round(comp * 0.3),
          dueDate: "2026-10-12",
          status: "Pending",
        },
        {
          id: `m-2-${Date.now()}`,
          title: "Milestone 2: 4K Rough Cut & Product Placement Review",
          description: "Creator shares private unlisted draft with sponsor segment embedded.",
          percentage: 40,
          amount: Math.round(comp * 0.4),
          dueDate: "2026-10-22",
          status: "Pending",
        },
        {
          id: `m-3-${Date.now()}`,
          title: "Milestone 3: Live YouTube Publication & Tracking Verification",
          description: "Video released live with tracked referral URL and pinned comment.",
          percentage: 30,
          amount: Math.round(comp * 0.3),
          dueDate: "2026-10-30",
          status: "Pending",
        },
      ],
      contractTerms: {
        deliverables: suggestedOffer?.deliverables || [
          "1x 60s mid-roll dedicated endorsement in 4K UHD",
          "Permanent tracked link in description and pinned comment",
        ],
        exclusivityDays: 30,
        usageRightsMonths: 6,
        ftcComplianceClause: true,
        paymentTerms: "CipherCollab Standard 3-Tier Escrow Protocol",
      },
      createdAt: new Date().toISOString().split("T")[0],
      targetLiveDate: "2026-10-30",
    };

    setDeals((prev) => [newDeal, ...prev]);
    setSelectedDealId(newDeal.id);
    setActiveTab("deal-room");
  };

  const handleSaveSupabaseConfig = (url: string, key: string) => {
    saveSupabaseConfig(url, key);
    setSupabaseConfig({
      url,
      anonKey: key,
      isConnected: true,
      lastSyncTime: new Date().toISOString(),
    });
  };

  const handleDataImported = (importedCreators: Creator[], importedDeals: CollaborationDeal[]) => {
    setCreators(importedCreators);
    setDeals(importedDeals);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f2ed] font-sans antialiased selection:bg-[#c5a059]/30 selection:text-[#c5a059]">
      {/* Top Luxury Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        perspective={perspective}
        setPerspective={setPerspective}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenAddCreatorModal={() => setIsAddCreatorOpen(true)}
        supabaseConfig={supabaseConfig}
        activeDealsCount={deals.filter((d) => d.status !== "Completed").length}
        pendingRequestsCount={requests.filter((r) => r.status === "Pending").length}
      />

      {/* Main Viewport Container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === "directory" && (
          <CreatorDirectory
            creators={creators}
            onSelectCreator={(c) => setSelectedCreatorForModal(c)}
            onInitiateCollab={handleInitiateCollabFromDirectory}
            onRunAiEvaluation={(c) => setSelectedCreatorForModal(c)}
            onPerformYouTubeLiveSearch={handlePerformYouTubeLiveSearch}
            isSearchingYouTube={isSearchingYouTube}
          />
        )}

        {activeTab === "requests" && (
          <CollaborationRequestsHub
            requests={requests}
            creators={creators}
            perspective={perspective}
            onUpdateRequest={handleUpdateRequest}
            onCreateDealFromRequest={handleCreateDealFromRequest}
            onOpenNewRequestModal={handleOpenNewRequestModal}
          />
        )}

        {activeTab === "decision-engine" && (
          <BrandDecisionEngine
            creators={creators}
            onSelectCreatorForDeal={handleSelectCreatorForDealFromEngine}
          />
        )}

        {activeTab === "deal-room" && (
          <DealRoom
            deals={deals}
            creators={creators}
            onUpdateDeal={handleUpdateDeal}
            onCreateNewDeal={handleCreateNewDeal}
            selectedDealId={selectedDealId}
          />
        )}

        {activeTab === "performance" && (
          <PerformanceDashboard
            campaigns={campaigns}
            creators={creators}
            perspective={perspective}
            onUpdateCampaign={handleUpdateCampaign}
            onAddCampaign={handleAddCampaign}
          />
        )}

        {activeTab === "creator-portal" && (
          <CreatorPortal
            creators={creators}
            deals={deals}
            onUpdateCreator={handleUpdateCreator}
            onUpdateDeal={handleUpdateDeal}
          />
        )}
      </main>

      {/* Creator Detail Dossier Modal */}
      <CreatorDetailModal
        creator={selectedCreatorForModal}
        onClose={() => setSelectedCreatorForModal(null)}
        onInitiateCollab={handleInitiateCollabFromDirectory}
        onOpenCollabRequest={(c) => handleOpenNewRequestModal(c)}
      />

      {/* Collaboration Request Initiation Modal */}
      <CollaborationRequestModal
        isOpen={isCollabRequestModalOpen}
        onClose={() => setIsCollabRequestModalOpen(false)}
        creator={collabRequestTargetCreator}
        creators={creators}
        onSubmitRequest={handleSubmitCollabRequest}
      />

      {/* Add / Import Creator Modal */}
      <AddCreatorModal
        isOpen={isAddCreatorOpen}
        onClose={() => setIsAddCreatorOpen(false)}
        onAddCreator={handleAddCreator}
      />

      {/* Supabase Connection & SQL Migration Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        config={supabaseConfig}
        onSaveConfig={handleSaveSupabaseConfig}
        creators={creators}
        deals={deals}
        onDataImported={handleDataImported}
      />

      {/* Luxury Footer */}
      <footer className="mt-20 border-t border-white/10 bg-[#050505] py-12 text-xs text-white/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-sm border border-[#c5a059]/40 bg-[#0a0a0a] font-serif text-sm font-bold text-[#c5a059]">
                C
              </div>
              <span className="font-serif tracking-wider uppercase text-[#f5f2ed] font-light">
                CipherCollab
              </span>
              <span className="text-white/20">•</span>
              <span className="text-[11px] uppercase tracking-wider text-white/50">Creator Economy Infrastructure Layer</span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-[10px] uppercase tracking-widest text-white/50">
              <span className="text-[#00ff88]">● 100% Escrow Guarantee</span>
              <span>● YouTube API v3 Verified</span>
              <span>● Gemini Decision Engine</span>
              <span>● Supabase Cloud Ready</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-6 text-[10px] uppercase tracking-wider text-white/30">
            <p>
              CipherCollab transforms unstructured brand-creator deals into standardized, data-driven collaboration systems.
            </p>
            <p>© 2026 CipherCollab Technologies. Institutional grade.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

