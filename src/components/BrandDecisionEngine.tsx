import React, { useState } from "react";
import {
  Sparkles,
  Target,
  TrendingUp,
  DollarSign,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Sliders,
  Layers,
  Award,
  Zap,
} from "lucide-react";
import { Creator, CampaignBrief, CampaignEvaluationResult } from "../types";

interface BrandDecisionEngineProps {
  creators: Creator[];
  onSelectCreatorForDeal: (creator: Creator, suggestedOffer?: any) => void;
}

export const BrandDecisionEngine: React.FC<BrandDecisionEngineProps> = ({
  creators,
  onSelectCreatorForDeal,
}) => {
  const [brief, setBrief] = useState<CampaignBrief>({
    brandName: "Aethelgard Swiss Horology",
    brandNiche: "Luxury & Fashion",
    productName: "Chronograph Tourbillon Mark I",
    productPricePoint: 4800,
    targetAudience: "Affluent tech founders, finance executives, and luxury watch connoisseurs aged 28-48",
    budget: 65000,
    goals: "Brand Prestige & Awareness",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [activeResultIndex, setActiveResultIndex] = useState(0);

  const handleRunMatchmaker = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/gemini/match-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief,
          creators,
        }),
      });
      const data = await res.json();
      setResults(data.matches || []);
      setActiveResultIndex(0);
    } catch (err) {
      console.error("Failed to run campaign matchmaker:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentMatch = results && results.length > 0 ? results[activeResultIndex] : null;
  const matchedCreatorObj = currentMatch
    ? creators.find((c) => c.id === currentMatch.creatorId)
    : null;

  return (
    <div className="space-y-10 pb-20">
      {/* Header Banner with Bold Typography */}
      <div className="border-b border-white/10 pb-8">
        <span className="text-[#c5a059] text-[11px] uppercase tracking-[0.4em] mb-2 block font-medium">
          Strategic Arbitration
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif font-light text-[#f5f2ed] tracking-tight mb-3">
          AI Campaign Decision Engine
        </h1>
        <p className="text-xs sm:text-sm text-white/50 max-w-2xl font-light leading-relaxed">
          Eliminate subjective guesswork and informal DM negotiation. Input your campaign specifications,
          demographic cohorts, and commercial goals. The AI Decision Engine calculates real-world
          affinity, projected ROAS, optimal offer bounds, and delivery risks.
        </p>
      </div>

      {/* Main Two-Column Layout: Brief Builder & AI Match Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Campaign Brief Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-sm border border-white/10 bg-[#0a0a0a] p-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-[#c5a059]" />
                <h3 className="font-serif text-base font-medium text-[#f5f2ed]">
                  Campaign Specification
                </h3>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-[#c5a059]">Step 01</span>
            </div>

            <form onSubmit={handleRunMatchmaker} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-white/40">
                  Brand or Organization Name
                </label>
                <input
                  type="text"
                  required
                  value={brief.brandName}
                  onChange={(e) => setBrief({ ...brief, brandName: e.target.value })}
                  className="mt-1.5 w-full rounded-sm border border-white/10 bg-[#050505] px-3.5 py-2 text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-white/40">
                    Industry Niche
                  </label>
                  <select
                    value={brief.brandNiche}
                    onChange={(e) => setBrief({ ...brief, brandNiche: e.target.value })}
                    className="mt-1.5 w-full rounded-sm border border-white/10 bg-[#050505] px-3 py-2 text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
                  >
                    <option value="Luxury & Fashion" className="bg-[#050505]">Luxury & Fashion</option>
                    <option value="Tech & AI" className="bg-[#050505]">Tech & AI</option>
                    <option value="Wealth & Finance" className="bg-[#050505]">Wealth & Finance</option>
                    <option value="Design & Architecture" className="bg-[#050505]">Design & Architecture</option>
                    <option value="Automotive & Prestige" className="bg-[#050505]">Automotive & Prestige</option>
                    <option value="SaaS & Productivity" className="bg-[#050505]">SaaS & Productivity</option>
                    <option value="Wellness & Longevity" className="bg-[#050505]">Wellness & Longevity</option>
                    <option value="Culinary Arts" className="bg-[#050505]">Culinary Arts</option>
                    <option value="Gaming & Culture" className="bg-[#050505]">Gaming & Culture</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-white/40">
                    Total Budget ($)
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={brief.budget}
                    onChange={(e) => setBrief({ ...brief, budget: parseFloat(e.target.value) || 0 })}
                    className="mt-1.5 w-full rounded-sm border border-white/10 bg-[#050505] px-3.5 py-2 font-mono text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-white/40">
                    Product / Service
                  </label>
                  <input
                    type="text"
                    required
                    value={brief.productName}
                    onChange={(e) => setBrief({ ...brief, productName: e.target.value })}
                    className="mt-1.5 w-full rounded-sm border border-white/10 bg-[#050505] px-3 py-2 text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-white/40">
                    Unit Price ($)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={brief.productPricePoint}
                    onChange={(e) =>
                      setBrief({ ...brief, productPricePoint: parseFloat(e.target.value) || 0 })
                    }
                    className="mt-1.5 w-full rounded-sm border border-white/10 bg-[#050505] px-3 py-2 font-mono text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-white/40">
                  Primary Campaign Objective
                </label>
                <select
                  value={brief.goals}
                  onChange={(e: any) => setBrief({ ...brief, goals: e.target.value })}
                  className="mt-1.5 w-full rounded-sm border border-white/10 bg-[#050505] px-3 py-2 text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
                >
                  <option value="Conversions / Sales" className="bg-[#050505]">Direct Conversions & Sales (High ROAS)</option>
                  <option value="Brand Prestige & Awareness" className="bg-[#050505]">
                    Brand Prestige & High-Status Awareness
                  </option>
                  <option value="Product Launch" className="bg-[#050505]">New Flagship Product Launch</option>
                  <option value="Executive Credibility" className="bg-[#050505]">
                    Executive / Institutional Credibility
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-white/40">
                  Target Audience Persona
                </label>
                <textarea
                  rows={3}
                  value={brief.targetAudience}
                  onChange={(e) => setBrief({ ...brief, targetAudience: e.target.value })}
                  className="mt-1.5 w-full rounded-sm border border-white/10 bg-[#050505] p-3 text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none font-light"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-sm border border-[#c5a059] bg-[#c5a059] py-3 text-[10px] uppercase tracking-widest font-semibold text-black transition-all hover:bg-[#d5b069] disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                <span>
                  {isLoading ? "Running Decision Analysis..." : "Execute AI Decision Engine"}
                </span>
              </button>
            </form>
          </div>
        </div>

        {/* Right: AI Match Results & Decision Dossier */}
        <div className="lg:col-span-7 space-y-6">
          {results && results.length > 0 ? (
            <div className="space-y-5">
              {/* Creator Candidates Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {results.map((resItem, i) => (
                  <button
                    key={resItem.creatorId || i}
                    onClick={() => setActiveResultIndex(i)}
                    className={`flex items-center gap-2.5 rounded-sm border px-3.5 py-2 text-[10px] uppercase tracking-wider transition-all ${
                      activeResultIndex === i
                        ? "border-[#c5a059] bg-[#c5a059]/15 text-[#c5a059] font-medium"
                        : "border-white/10 bg-[#0a0a0a] text-white/60 hover:text-white"
                    }`}
                  >
                    <span>{resItem.creatorName}</span>
                    <span className="rounded-sm bg-[#c5a059]/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#c5a059]">
                      {resItem.matchScore}% Fit
                    </span>
                  </button>
                ))}
              </div>

              {/* Selected Candidate Intelligence Dossier */}
              {currentMatch && (
                <div className="rounded-sm border border-white/10 bg-[#0a0a0a] p-6 space-y-6">
                  {/* Top Match Header */}
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-2xl font-light text-[#f5f2ed]">
                          {currentMatch.creatorName}
                        </h3>
                        <span className="rounded-sm border border-[#00ff88]/30 bg-[#00ff88]/10 px-2 py-0.5 font-mono text-xs font-semibold text-[#00ff88]">
                          {currentMatch.matchScore}% Fit
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-white/60 leading-relaxed font-light">
                        {currentMatch.brandFitAnalysis}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">Projected ROAS</div>
                      <div className="font-mono text-3xl font-medium text-[#00ff88] mt-1">
                        {currentMatch.projectedReach?.projectedROAS || 3.4}x
                      </div>
                    </div>
                  </div>

                  {/* Projected Reach Metrics */}
                  <div className="grid grid-cols-3 gap-3 rounded-sm border border-white/5 bg-[#050505] p-3.5 text-center">
                    <div>
                      <div className="text-[9px] text-white/40 uppercase tracking-wider">Est. Video Views</div>
                      <div className="font-serif text-base font-medium text-[#f5f2ed] mt-0.5">
                        {currentMatch.projectedReach?.estimatedViews?.toLocaleString() || "380,000"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-white/40 uppercase tracking-wider">Est. Intent Clicks</div>
                      <div className="font-serif text-base font-medium text-[#c5a059] mt-0.5">
                        {currentMatch.projectedReach?.estimatedClicks?.toLocaleString() || "12,400"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-white/40 uppercase tracking-wider">Est. Conversions</div>
                      <div className="font-mono text-base font-medium text-[#00ff88] mt-0.5">
                        {currentMatch.projectedReach?.estimatedConversions?.toLocaleString() || "420"}
                      </div>
                    </div>
                  </div>

                  {/* Recommended Offer Package */}
                  <div className="rounded-sm border border-white/10 bg-[#050505] p-4">
                    <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-[#c5a059]" />
                        <h4 className="font-serif text-sm font-medium text-[#f5f2ed]">
                          Recommended Structured Valuation
                        </h4>
                      </div>
                      <div className="font-serif text-sm font-semibold text-[#c5a059]">
                        Target: ${currentMatch.recommendedOffer?.targetPrice?.toLocaleString()} (Ceiling: $
                        {currentMatch.recommendedOffer?.ceilingPrice?.toLocaleString()})
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-white/60">
                      <div className="text-[10px] uppercase tracking-wider text-white/40 font-medium">Deliverables Package:</div>
                      {currentMatch.recommendedOffer?.deliverables?.map((del: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#c5a059]" />
                          <span>{del}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Creative Hook Angle */}
                  <div className="rounded-sm border border-white/10 bg-[#050505] p-4 text-xs">
                    <div className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#c5a059] mb-1">
                      Suggested Creative Hook
                    </div>
                    <p className="text-white/80 italic font-serif text-sm">
                      "{currentMatch.suggestedCreativeAngle}"
                    </p>
                  </div>

                  {/* Risk Factors & Strategic Advantages */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="rounded-sm border border-emerald-500/20 bg-emerald-500/5 p-4">
                      <div className="flex items-center gap-1.5 font-medium text-emerald-400 mb-2">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="text-[10px] uppercase tracking-wider">Strategic Advantages</span>
                      </div>
                      <ul className="space-y-1 text-white/70 list-disc list-inside font-light">
                        {currentMatch.strategicAdvantages?.map((adv: string, i: number) => (
                          <li key={i}>{adv}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-sm border border-amber-500/20 bg-amber-500/5 p-4">
                      <div className="flex items-center gap-1.5 font-medium text-amber-300 mb-2">
                        <ShieldAlert className="h-4 w-4" />
                        <span className="text-[10px] uppercase tracking-wider">Risk Factors</span>
                      </div>
                      <ul className="space-y-1 text-white/70 list-disc list-inside font-light">
                        {currentMatch.keyRiskFactors?.map((risk: string, i: number) => (
                          <li key={i}>{risk}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Bottom Action */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        if (matchedCreatorObj) {
                          onSelectCreatorForDeal(matchedCreatorObj, currentMatch.recommendedOffer);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 rounded-sm border border-[#c5a059] bg-[#c5a059] py-3 text-[10px] uppercase tracking-widest font-semibold text-black transition-all hover:bg-[#d5b069]"
                    >
                      <span>Convert Recommendation to Structured Agreement</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-white/10 bg-[#0a0a0a] p-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-[#c5a059]/30 bg-[#c5a059]/10 text-[#c5a059] mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-xl font-light text-[#f5f2ed]">
                Awaiting Campaign Parameters
              </h3>
              <p className="mt-2 max-w-md text-xs text-white/40 leading-relaxed font-light">
                Fill in your campaign specifications on the left and execute the Decision Engine.
                Gemini will parse all verified creators above 10K subscribers to compute match scores,
                expected conversions, and optimal offer terms.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
