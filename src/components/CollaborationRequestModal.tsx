import React, { useState } from "react";
import {
  X,
  Send,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Target,
  Users,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import { Creator, CollaborationRequest, CampaignDeliverableItem } from "../types";

interface CollaborationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: Creator | null;
  creators: Creator[];
  onSubmitRequest: (request: CollaborationRequest) => void;
}

const CAMPAIGN_OBJECTIVE_PRESETS = [
  "Brand Prestige & Awareness",
  "Product Launch",
  "Conversions / Sales",
  "Executive Credibility",
  "Audience Education",
  "Retention & Loyalty",
];

const DELIVERABLE_TYPE_OPTIONS = [
  "Full Dedicated Video",
  "60s Dedicated Integration",
  "30s Mention / Shoutout",
  "YouTube Shorts / Vertical",
  "Multi-Video Series",
  "Newsletter Insertion",
  "Community Tab Post",
  "Social Co-Stream / Ambassadorship",
];

export const CollaborationRequestModal: React.FC<CollaborationRequestModalProps> = ({
  isOpen,
  onClose,
  creator,
  creators,
  onSubmitRequest,
}) => {
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>(
    creator ? creator.id : creators[0]?.id || ""
  );

  const activeCreator =
    (creator && creator.id === selectedCreatorId
      ? creator
      : creators.find((c) => c.id === selectedCreatorId)) || creators[0];

  const [brandName, setBrandName] = useState("Acme Luxury Holdings");
  const [brandContact, setBrandContact] = useState("concierge@acmeluxury.com");
  const [campaignTitle, setCampaignTitle] = useState(
    activeCreator ? `${activeCreator.niche} Premiere Campaign Showcase` : "Flagship Brand Integration"
  );

  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([
    "Brand Prestige & Awareness",
    "Product Launch",
  ]);

  // Target audience
  const [audienceDescription, setAudienceDescription] = useState(
    "Discerning consumers and high-earning professionals seeking top-tier quality and design precision."
  );
  const [ageFocus, setAgeFocus] = useState("25-45 Affluent High-Net-Worth");
  const [targetRegions, setTargetRegions] = useState("United States, United Kingdom, Switzerland");

  // Deliverables
  const [deliverables, setDeliverables] = useState<CampaignDeliverableItem[]>([
    {
      id: "del-1",
      type: "Full Dedicated Video",
      quantity: 1,
      specifications: "1x 15-20 minute comprehensive 4K video review highlighting product craftsmanship.",
    },
    {
      id: "del-2",
      type: "YouTube Shorts / Vertical",
      quantity: 2,
      specifications: "2x 60s high-framerate dynamic short clips for viral engagement.",
    },
  ]);

  // Budget
  const defaultRec = activeCreator?.rateCard?.dedicatedVideo?.recommended || 35000;
  const [minBudget, setMinBudget] = useState<number>(Math.round(defaultRec * 0.85));
  const [maxBudget, setMaxBudget] = useState<number>(Math.round(defaultRec * 1.2));

  // Timeline
  const [startDate, setStartDate] = useState("2026-10-01");
  const [draftDueDate, setDraftDueDate] = useState("2026-10-22");
  const [finalDeliveryDate, setFinalDeliveryDate] = useState("2026-11-05");

  // Brief
  const [briefGuidelines, setBriefGuidelines] = useState(
    "Maintain refined brand voice. Focus on technical innovation, aesthetic honesty, and uncompromised build quality. No promotional gimmicks."
  );

  if (!isOpen) return null;

  const toggleObjective = (obj: string) => {
    setSelectedObjectives((prev) =>
      prev.includes(obj) ? prev.filter((o) => o !== obj) : [...prev, obj]
    );
  };

  const handleAddDeliverable = () => {
    setDeliverables((prev) => [
      ...prev,
      {
        id: `del-${Date.now()}`,
        type: "60s Dedicated Integration",
        quantity: 1,
        specifications: "1x 60-second integrated mid-roll segment with bespoke transition.",
      },
    ]);
  };

  const handleUpdateDeliverable = (
    id: string,
    field: keyof CampaignDeliverableItem,
    value: any
  ) => {
    setDeliverables((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  const handleRemoveDeliverable = (id: string) => {
    if (deliverables.length <= 1) return;
    setDeliverables((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCreator) return;

    const newRequest: CollaborationRequest = {
      id: `req-${Date.now()}`,
      brandName: brandName.trim() || "Institutional Sponsor",
      brandContact: brandContact.trim(),
      creatorId: activeCreator.id,
      creatorName: activeCreator.name,
      creatorHandle: activeCreator.handle,
      creatorAvatar: activeCreator.avatarUrl,
      campaignTitle: campaignTitle.trim() || "Brand Partnership",
      campaignObjectives: selectedObjectives.length > 0 ? selectedObjectives : ["Brand Prestige & Awareness"],
      targetAudience: {
        description: audienceDescription,
        ageFocus,
        targetRegions: targetRegions.split(",").map((r) => r.trim()).filter(Boolean),
      },
      desiredDeliverables: deliverables,
      proposedBudgetRange: {
        min: Number(minBudget) || 10000,
        max: Number(maxBudget) || 25000,
        currency: "USD",
      },
      timeline: {
        startDate,
        draftDueDate,
        finalDeliveryDate,
      },
      briefGuidelines,
      status: "Pending",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    onSubmitRequest(newRequest);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative my-8 w-full max-w-3xl overflow-hidden rounded-sm border border-white/10 bg-[#0a0a0a] shadow-2xl text-[#f5f2ed]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 bg-[#050505]">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-[#c5a059]/40 bg-[#c5a059]/10 text-[#c5a059]">
              <Send className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-light text-[#f5f2ed] tracking-tight">
                Initiate Collaboration Request
              </h3>
              <p className="text-[10px] uppercase tracking-widest text-white/40 mt-0.5">
                Standardized proposal delivery directly into creator's dedicated inbox
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-sm border border-white/10 bg-black/40 p-1.5 text-white/50 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Creator Selection Card */}
          <div className="rounded-sm border border-white/10 bg-[#050505] p-4">
            <label className="text-[10px] uppercase tracking-widest text-[#c5a059] font-medium block mb-2">
              Target Creator
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={activeCreator?.avatarUrl}
                  alt={activeCreator?.name}
                  className="h-12 w-12 rounded-sm border border-[#c5a059]/40 object-cover"
                />
                <div>
                  <div className="font-serif text-lg font-light text-[#f5f2ed]">
                    {activeCreator?.name}
                  </div>
                  <div className="text-xs text-white/50 font-mono">
                    {activeCreator?.handle} • {activeCreator?.niche} • {activeCreator?.subscribers.toLocaleString()} subscribers
                  </div>
                </div>
              </div>

              {!creator && (
                <select
                  value={selectedCreatorId}
                  onChange={(e) => setSelectedCreatorId(e.target.value)}
                  className="rounded-sm border border-white/10 bg-[#0a0a0a] px-3 py-1.5 text-xs text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
                >
                  {creators.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.handle})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Brand & Campaign Meta */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1.5">
                Brand / Organization Name
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                required
                className="w-full rounded-sm border border-white/10 bg-[#050505] px-3 py-2 text-xs text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
                placeholder="e.g. Arc'teryx Precision, Linear, Porsche"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1.5">
                Brand Partner Contact Email
              </label>
              <input
                type="email"
                value={brandContact}
                onChange={(e) => setBrandContact(e.target.value)}
                required
                className="w-full rounded-sm border border-white/10 bg-[#050505] px-3 py-2 text-xs text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
                placeholder="partnerships@brand.com"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1.5">
              Campaign Title / Initiative Name
            </label>
            <input
              type="text"
              value={campaignTitle}
              onChange={(e) => setCampaignTitle(e.target.value)}
              required
              className="w-full rounded-sm border border-white/10 bg-[#050505] px-3 py-2 text-xs text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
              placeholder="e.g. Autumn 2026 Flagship Capsule Release"
            />
          </div>

          {/* Campaign Objectives */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-[#c5a059] font-medium block mb-2">
              Campaign Objectives
            </label>
            <div className="flex flex-wrap gap-2">
              {CAMPAIGN_OBJECTIVE_PRESETS.map((obj) => {
                const isSelected = selectedObjectives.includes(obj);
                return (
                  <button
                    type="button"
                    key={obj}
                    onClick={() => toggleObjective(obj)}
                    className={`rounded-sm border px-3 py-1.5 text-xs transition-all ${
                      isSelected
                        ? "border-[#c5a059] bg-[#c5a059]/15 text-[#c5a059] font-medium"
                        : "border-white/10 bg-[#050505] text-white/60 hover:text-white"
                    }`}
                  >
                    {isSelected ? "✓ " : "+ "}
                    {obj}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Audience Profile */}
          <div className="rounded-sm border border-white/10 bg-[#050505] p-4 space-y-3">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#c5a059] font-medium">
              <Users className="h-3.5 w-3.5" />
              <span>Target Audience Specifications</span>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">
                Audience Narrative & Psychographics
              </label>
              <textarea
                rows={2}
                value={audienceDescription}
                onChange={(e) => setAudienceDescription(e.target.value)}
                className="w-full rounded-sm border border-white/10 bg-[#0a0a0a] px-3 py-2 text-xs text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">
                  Age Range Focus
                </label>
                <input
                  type="text"
                  value={ageFocus}
                  onChange={(e) => setAgeFocus(e.target.value)}
                  className="w-full rounded-sm border border-white/10 bg-[#0a0a0a] px-3 py-1.5 text-xs text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">
                  Target Geographic Markets
                </label>
                <input
                  type="text"
                  value={targetRegions}
                  onChange={(e) => setTargetRegions(e.target.value)}
                  className="w-full rounded-sm border border-white/10 bg-[#0a0a0a] px-3 py-1.5 text-xs text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
                  placeholder="e.g. United States, UK, Switzerland, Germany"
                />
              </div>
            </div>
          </div>

          {/* Desired Deliverables List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#c5a059] font-medium">
                <Layers className="h-3.5 w-3.5" />
                <span>Desired Deliverables & Content Formats</span>
              </div>

              <button
                type="button"
                onClick={handleAddDeliverable}
                className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#c5a059] hover:underline"
              >
                <Plus className="h-3 w-3" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {deliverables.map((item, idx) => (
                <div
                  key={item.id}
                  className="rounded-sm border border-white/10 bg-[#050505] p-3 space-y-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-[10px] font-mono text-white/30">
                        #{idx + 1}
                      </span>
                      <select
                        value={item.type}
                        onChange={(e) =>
                          handleUpdateDeliverable(item.id, "type", e.target.value)
                        }
                        className="rounded-sm border border-white/10 bg-[#0a0a0a] px-2.5 py-1 text-xs text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
                      >
                        {DELIVERABLE_TYPE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase tracking-wider text-white/40">
                          Qty:
                        </span>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateDeliverable(
                              item.id,
                              "quantity",
                              parseInt(e.target.value, 10) || 1
                            )
                          }
                          className="w-14 rounded-sm border border-white/10 bg-[#0a0a0a] px-2 py-1 text-xs text-center text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveDeliverable(item.id)}
                        disabled={deliverables.length <= 1}
                        className="p-1 text-white/30 hover:text-red-400 transition-colors disabled:opacity-20"
                        title="Remove deliverable"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={item.specifications}
                    onChange={(e) =>
                      handleUpdateDeliverable(item.id, "specifications", e.target.value)
                    }
                    placeholder="Specific guidelines (length, talking points, macro shots)..."
                    className="w-full rounded-sm border border-white/5 bg-[#0a0a0a] px-3 py-1.5 text-xs text-white/70 focus:border-[#c5a059] focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Budget Range & Timeline */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Proposed Budget Range */}
            <div className="rounded-sm border border-white/10 bg-[#050505] p-4">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#c5a059] font-medium mb-3">
                <DollarSign className="h-3.5 w-3.5" />
                <span>Proposed Budget Range (USD)</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-white/40 block mb-1">
                    Minimum Offer
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs text-white/40">$</span>
                    <input
                      type="number"
                      value={minBudget}
                      onChange={(e) => setMinBudget(Number(e.target.value))}
                      className="w-full rounded-sm border border-white/10 bg-[#0a0a0a] pl-6 pr-2 py-1.5 text-xs text-[#f5f2ed] font-mono focus:border-[#c5a059] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-wider text-white/40 block mb-1">
                    Maximum Ceiling
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs text-white/40">$</span>
                    <input
                      type="number"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(Number(e.target.value))}
                      className="w-full rounded-sm border border-white/10 bg-[#0a0a0a] pl-6 pr-2 py-1.5 text-xs text-[#f5f2ed] font-mono focus:border-[#c5a059] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-2 text-[9px] text-white/40 uppercase tracking-wider">
                Creator Rate Card Benchmark: ${activeCreator?.rateCard?.dedicatedVideo?.recommended?.toLocaleString() || "35,000"} (Dedicated Video)
              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-sm border border-white/10 bg-[#050505] p-4">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#c5a059] font-medium mb-3">
                <Calendar className="h-3.5 w-3.5" />
                <span>Campaign Timeline</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-[10px] uppercase tracking-wider">Start Date:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded-sm border border-white/10 bg-[#0a0a0a] px-2 py-1 text-xs text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-[10px] uppercase tracking-wider">Draft Review Due:</span>
                  <input
                    type="date"
                    value={draftDueDate}
                    onChange={(e) => setDraftDueDate(e.target.value)}
                    className="rounded-sm border border-white/10 bg-[#0a0a0a] px-2 py-1 text-xs text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-[10px] uppercase tracking-wider">Final Live Date:</span>
                  <input
                    type="date"
                    value={finalDeliveryDate}
                    onChange={(e) => setFinalDeliveryDate(e.target.value)}
                    className="rounded-sm border border-white/10 bg-[#0a0a0a] px-2 py-1 text-xs text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Brief Guidelines */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1.5">
              Brief Guidelines & Creative Direction
            </label>
            <textarea
              rows={3}
              value={briefGuidelines}
              onChange={(e) => setBriefGuidelines(e.target.value)}
              className="w-full rounded-sm border border-white/10 bg-[#050505] px-3 py-2 text-xs text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
              placeholder="Outline specific brand guardrails, tone of voice, what to highlight, what to avoid..."
            />
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-sm border border-white/10 bg-transparent px-4 py-2 text-xs text-white/50 hover:text-white transition-colors uppercase tracking-wider"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 rounded-sm border border-[#c5a059] bg-[#c5a059] px-6 py-2.5 text-xs font-semibold text-black hover:bg-[#d5b069] transition-all uppercase tracking-widest"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Submit Request to Creator Inbox</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
