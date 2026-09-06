import React, { useState } from "react";
import { X, ArrowRight, DollarSign, Calendar, FileText, CheckCircle2 } from "lucide-react";
import { CollaborationRequest } from "../types";

interface CounterOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: CollaborationRequest | null;
  onSubmitCounterOffer: (
    requestId: string,
    counterOffer: {
      proposedBudget: number;
      modifiedDeliverables: string[];
      proposedLiveDate: string;
      creatorNotes: string;
    }
  ) => void;
}

export const CounterOfferModal: React.FC<CounterOfferModalProps> = ({
  isOpen,
  onClose,
  request,
  onSubmitCounterOffer,
}) => {
  if (!isOpen || !request) return null;

  const [counterBudget, setCounterBudget] = useState<number>(
    Math.round(request.proposedBudgetRange.max * 1.15)
  );
  const [proposedLiveDate, setProposedLiveDate] = useState<string>(
    request.timeline.finalDeliveryDate
  );
  const [deliverablesText, setDeliverablesText] = useState<string>(
    request.desiredDeliverables
      .map((d) => `${d.quantity}x ${d.type} (${d.specifications || "Standard format"})`)
      .join("\n") +
      "\n1x Extended 30-day link in video description + pinned comment"
  );
  const [creatorNotes, setCreatorNotes] = useState<string>(
    `Thank you for reaching out. To deliver the highest production standard for ${request.brandName}, I propose an adjusted budget and tailored deliverable structure that gives optimal conversion velocity.`
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const modifiedList = deliverablesText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    onSubmitCounterOffer(request.id, {
      proposedBudget: Number(counterBudget) || request.proposedBudgetRange.max,
      modifiedDeliverables: modifiedList,
      proposedLiveDate,
      creatorNotes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative my-8 w-full max-w-xl overflow-hidden rounded-sm border border-[#c5a059]/40 bg-[#0a0a0a] shadow-2xl text-[#f5f2ed]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-[#050505]">
          <div>
            <span className="text-[9px] uppercase tracking-[0.2em] font-mono text-[#c5a059]">
              Negotiation Counter-Protocol
            </span>
            <h3 className="font-serif text-lg font-light text-[#f5f2ed] tracking-tight">
              Submit Counter-Offer to {request.brandName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-sm border border-white/10 bg-black/40 p-1 text-white/50 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Summary of Original Request */}
          <div className="rounded-sm border border-white/5 bg-[#050505] p-3.5 text-xs space-y-1">
            <div className="text-[9px] uppercase tracking-wider text-white/40">
              Original Brand Offer
            </div>
            <div className="font-medium text-[#f5f2ed]">{request.campaignTitle}</div>
            <div className="text-white/60 font-mono">
              Budget Range: ${request.proposedBudgetRange.min.toLocaleString()} – $
              {request.proposedBudgetRange.max.toLocaleString()} USD
            </div>
            <div className="text-white/40">
              Proposed Live: {request.timeline.finalDeliveryDate}
            </div>
          </div>

          {/* Adjusted Budget */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-[#c5a059] font-medium block mb-1.5">
              Creator Proposed Budget (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-sm text-white/40">$</span>
              <input
                type="number"
                value={counterBudget}
                onChange={(e) => setCounterBudget(Number(e.target.value))}
                required
                className="w-full rounded-sm border border-white/10 bg-[#050505] pl-7 pr-3 py-2 text-sm font-mono text-[#00ff88] focus:border-[#c5a059] focus:outline-none"
              />
            </div>
            <p className="text-[9px] uppercase tracking-wider text-white/40 mt-1">
              Reflects your standard production, usage rights, and exclusivity value
            </p>
          </div>

          {/* Adjusted Deliverables */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-[#c5a059] font-medium block mb-1.5">
              Modified Deliverables Scope (One per line)
            </label>
            <textarea
              rows={4}
              value={deliverablesText}
              onChange={(e) => setDeliverablesText(e.target.value)}
              required
              className="w-full rounded-sm border border-white/10 bg-[#050505] px-3 py-2 text-xs text-[#f5f2ed] font-mono focus:border-[#c5a059] focus:outline-none"
            />
          </div>

          {/* Proposed Adjusted Live Date */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-[#c5a059] font-medium block mb-1.5">
              Proposed Delivery / Live Date
            </label>
            <input
              type="date"
              value={proposedLiveDate}
              onChange={(e) => setProposedLiveDate(e.target.value)}
              required
              className="w-full rounded-sm border border-white/10 bg-[#050505] px-3 py-2 text-xs text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
            />
          </div>

          {/* Creator Notes & Rationale */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-[#c5a059] font-medium block mb-1.5">
              Creator Notes & Strategic Rationale
            </label>
            <textarea
              rows={3}
              value={creatorNotes}
              onChange={(e) => setCreatorNotes(e.target.value)}
              required
              className="w-full rounded-sm border border-white/10 bg-[#050505] px-3 py-2 text-xs text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
              placeholder="Explain why this deliverable combination or budget serves the brand's campaign objectives..."
            />
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-sm border border-white/10 px-4 py-2 text-xs text-white/50 hover:text-white uppercase tracking-wider"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 rounded-sm border border-[#c5a059] bg-[#c5a059] px-5 py-2 text-xs font-semibold text-black hover:bg-[#d5b069] uppercase tracking-widest"
            >
              <span>Transmit Counter-Offer</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
