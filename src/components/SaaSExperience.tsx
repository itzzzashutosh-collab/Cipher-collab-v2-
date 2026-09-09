import React from "react";
import {
  ShieldCheck,
  Sparkles,
  TrendingUp,
  DollarSign,
  Users,
  Award,
  Clock,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  BarChart3,
  Download,
  Play,
  Zap,
  FileSpreadsheet,
  Lock,
  Activity,
  Layers,
  ArrowUpRight,
  Send,
  SlidersHorizontal,
} from "lucide-react";
import { Creator } from "../types";

interface SaaSExperienceProps {
  creators: Creator[];
  onSelectCreator: (creator: Creator) => void;
  onExplorePlatform: () => void;
  onRequestAccess: () => void;
  onOpenDealRoom: () => void;
  onOpenCreatorPortal: () => void;
}

export const SaaSExperience: React.FC<SaaSExperienceProps> = ({
  creators,
  onSelectCreator,
  onExplorePlatform,
  onRequestAccess,
  onOpenDealRoom,
  onOpenCreatorPortal,
}) => {
  // Highlight top 4 verified creators for discovery section
  const showcaseCreators = creators.slice(0, 4);

  const handleDownloadCsv = () => {
    window.location.href = "/api/creators/export-csv";
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] text-[#FFFFFF] overflow-hidden">
      {/* Dynamic Background Light Beams & Subtle Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-[#6C5CE7]/15 via-[#5B21B6]/10 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-[#5B21B6]/10 blur-[150px] pointer-events-none -z-10" />
      <div className="absolute top-[75%] left-[-10%] w-[600px] h-[600px] bg-[#6C5CE7]/10 blur-[150px] pointer-events-none -z-10" />

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      {/* ---------------------------------------------------- */}
      {/* HERO SECTION */}
      {/* ---------------------------------------------------- */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Hero Content */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Minimalist Trust Eyebrow */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 backdrop-blur-md mb-8 transition-all hover:border-[#6C5CE7]/40">
              <span className="flex h-2 w-2 rounded-full bg-[#6C5CE7] animate-pulse" />
              <span className="text-xs font-medium tracking-wide text-[#A1A1AA]">
                Institutional Creator Infrastructure
              </span>
              <span className="text-[11px] font-semibold text-[#6C5CE7] border-l border-white/10 pl-2">
                Top 1% Only
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-extrabold tracking-[-0.03em] leading-[1.08] text-white">
              Book verified 1% creators.{" "}
              <span className="bg-gradient-to-r from-white via-[#E2E8F0] to-[#A1A1AA] bg-clip-text text-transparent">
                With guaranteed delivery and escrow safety.
              </span>
            </h1>

            {/* Subtext */}
            <p className="mt-6 text-base sm:text-lg lg:text-xl text-[#A1A1AA] font-normal leading-relaxed max-w-2xl">
              CipherCollab eliminates arbitrary agency markups and broken promises. We provide standardized algorithmic rate cards, live YouTube API telemetry, and milestone-locked escrow for serious brand partnerships.
            </p>

            {/* CTAs */}
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <button
                onClick={onRequestAccess}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#5B21B6] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-[#6C5CE7]/30 transition-all hover:shadow-[#6C5CE7]/50 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Request Access</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={onExplorePlatform}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-7 py-4 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/[0.08] hover:border-white/30"
              >
                <span>Explore Platform</span>
                <ChevronRight className="h-4 w-4 text-[#A1A1AA]" />
              </button>
            </div>

            {/* CSV Download Micro-link */}
            <div className="mt-6 flex items-center gap-2 text-xs text-[#A1A1AA]">
              <FileSpreadsheet className="h-4 w-4 text-[#6C5CE7]" />
              <span>Direct Data Access:</span>
              <button
                onClick={handleDownloadCsv}
                className="font-medium text-white hover:text-[#6C5CE7] underline underline-offset-4 transition-colors inline-flex items-center gap-1"
              >
                <span>Download Creators & Intelligence CSV (24 Creators)</span>
                <Download className="h-3 w-3" />
              </button>
            </div>

            {/* 3 Value Pillars */}
            <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-3 gap-6 w-full">
              <div>
                <div className="text-xl sm:text-2xl font-bold tracking-tight text-white">100%</div>
                <div className="text-xs text-[#A1A1AA] mt-0.5">Escrow Protection</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold tracking-tight text-[#6C5CE7]">Top 1%</div>
                <div className="text-xs text-[#A1A1AA] mt-0.5">Vetted Roster</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold tracking-tight text-white">0%</div>
                <div className="text-xs text-[#A1A1AA] mt-0.5">Hidden Markups</div>
              </div>
            </div>
          </div>

          {/* Right Column: Cinematic Visual (Luxury Creator & Live Telemetry Card) */}
          <div className="lg:col-span-5 relative">
            {/* Ambient Purple Glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#6C5CE7]/30 via-[#5B21B6]/20 to-transparent rounded-3xl blur-2xl -z-10 opacity-70" />

            <div className="rounded-2xl border border-white/15 bg-[#121216]/90 p-6 shadow-2xl backdrop-blur-xl transition-all hover:border-[#6C5CE7]/50">
              {/* Card Header with Verified Badge */}
              <div className="flex items-center justify-between pb-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={showcaseCreators[0]?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
                      alt={showcaseCreators[0]?.name || "Creator"}
                      className="h-13 w-13 rounded-xl object-cover border border-white/20"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#6C5CE7] text-[9px] font-bold text-white">
                      ✓
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base text-white">{showcaseCreators[0]?.name || "Marques Brownlee"}</h3>
                      <span className="rounded-full bg-[#6C5CE7]/15 border border-[#6C5CE7]/30 px-2 py-0.5 text-[10px] font-semibold text-[#6C5CE7]">
                        Verified 1%
                      </span>
                    </div>
                    <div className="text-xs text-[#A1A1AA]">{showcaseCreators[0]?.handle || "@mkbhd"} • {showcaseCreators[0]?.niche || "Tech & AI"}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-[#A1A1AA]">Trust Index</div>
                  <div className="text-xl font-bold text-white">98<span className="text-xs text-[#6C5CE7]">/100</span></div>
                </div>
              </div>

              {/* Real-time Telemetry Metrics */}
              <div className="grid grid-cols-2 gap-3 my-5">
                <div className="rounded-xl border border-white/5 bg-black/40 p-3.5">
                  <div className="text-[11px] text-[#A1A1AA] flex items-center justify-between">
                    <span>Subscribers</span>
                    <span className="text-[10px] text-emerald-400 font-medium">Live API</span>
                  </div>
                  <div className="text-lg font-bold text-white mt-0.5">
                    {showcaseCreators[0]?.subscribers.toLocaleString() || "18,400,000"}
                  </div>
                </div>

                <div className="rounded-xl border border-white/5 bg-black/40 p-3.5">
                  <div className="text-[11px] text-[#A1A1AA] flex items-center justify-between">
                    <span>Avg Video Velocity</span>
                    <Activity className="h-3 w-3 text-[#6C5CE7]" />
                  </div>
                  <div className="text-lg font-bold text-[#6C5CE7] mt-0.5">
                    {showcaseCreators[0]?.avgViewsPerVideo.toLocaleString() || "2,850,000"}
                  </div>
                </div>
              </div>

              {/* Escrow Contract Snapshot Box */}
              <div className="rounded-xl border border-[#6C5CE7]/20 bg-gradient-to-b from-[#6C5CE7]/10 to-transparent p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#A1A1AA] flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-[#6C5CE7]" />
                    Milestone Escrow Vault
                  </span>
                  <span className="text-emerald-400 font-medium font-mono text-[11px] bg-emerald-400/10 px-2 py-0.5 rounded">
                    Secured
                  </span>
                </div>
                <div className="mt-2.5 flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-white font-mono">$85,000.00</span>
                  <span className="text-xs text-[#A1A1AA]">60s Dedicated Slot</span>
                </div>
                <div className="mt-3 w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#6C5CE7] h-full w-2/3 rounded-full" />
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-white/50">
                  <span>Script & Outline Approved</span>
                  <span>Deliverable in Production</span>
                </div>
              </div>

              {/* Interactive Trigger Button */}
              <button
                onClick={() => onSelectCreator(showcaseCreators[0])}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-semibold text-white hover:bg-white/10 hover:border-[#6C5CE7]/40 transition-all"
              >
                <span>Inspect Full Creator Dossier & Recharts</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-[#6C5CE7]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* TRUST STRIP */}
      {/* ---------------------------------------------------- */}
      <section className="relative border-y border-white/10 bg-[#0E0E12]/80 backdrop-blur-md py-8">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="flex items-center gap-4 pt-4 md:pt-0 first:pt-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#6C5CE7]/30 bg-[#6C5CE7]/10 text-[#6C5CE7]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Verified 1% Creators</h4>
                <p className="text-xs text-[#A1A1AA] mt-0.5">
                  Every channel is identity-authenticated with real YouTube API statistics.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#6C5CE7]/30 bg-[#6C5CE7]/10 text-[#6C5CE7]">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Escrow-Secured Deals</h4>
                <p className="text-xs text-[#A1A1AA] mt-0.5">
                  Funds stay safely locked in escrow until milestone conditions and live links are verified.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#6C5CE7]/30 bg-[#6C5CE7]/10 text-[#6C5CE7]">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Data-Backed Decisions</h4>
                <p className="text-xs text-[#A1A1AA] mt-0.5">
                  Fair market CPM valuations, audience overlap analysis, and retention forecasting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* FEATURE SECTION (4 LUXURY CARDS) */}
      {/* ---------------------------------------------------- */}
      <section className="relative py-24 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-semibold uppercase tracking-widest text-[#6C5CE7] mb-2">
            Engineered For Precision
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Infrastructure, Not A Content Directory
          </h2>
          <p className="text-base text-[#A1A1AA] mt-3">
            Designed for brands that invest six figures per release and top-tier creators who value professional rigor over inbox chaos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="group relative rounded-2xl border border-white/10 bg-[#121216] p-7 transition-all duration-300 hover:border-[#6C5CE7]/50 hover:shadow-2xl hover:shadow-[#6C5CE7]/10 hover:-translate-y-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#6C5CE7] group-hover:border-[#6C5CE7] group-hover:bg-[#6C5CE7]/10 transition-colors">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-white tracking-tight">Verified Creators</h3>
            <p className="mt-2 text-sm text-[#A1A1AA] leading-relaxed">
              Strict admission threshold. We inspect buying power, audience demographics, and filter out synthetic engagement.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group relative rounded-2xl border border-white/10 bg-[#121216] p-7 transition-all duration-300 hover:border-[#6C5CE7]/50 hover:shadow-2xl hover:shadow-[#6C5CE7]/10 hover:-translate-y-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#6C5CE7] group-hover:border-[#6C5CE7] group-hover:bg-[#6C5CE7]/10 transition-colors">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-white tracking-tight">Structured Deals</h3>
            <p className="mt-2 text-sm text-[#A1A1AA] leading-relaxed">
              Standardized quarter-by-quarter slots with explicit timelines for concept review, first draft, and scheduled live drop.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group relative rounded-2xl border border-white/10 bg-[#121216] p-7 transition-all duration-300 hover:border-[#6C5CE7]/50 hover:shadow-2xl hover:shadow-[#6C5CE7]/10 hover:-translate-y-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#6C5CE7] group-hover:border-[#6C5CE7] group-hover:bg-[#6C5CE7]/10 transition-colors">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-white tracking-tight">Secure Payments</h3>
            <p className="mt-2 text-sm text-[#A1A1AA] leading-relaxed">
              Institutional milestone escrow. Both parties have contractual certainty: work is verified before capital disbursal.
            </p>
          </div>

          {/* Card 4 */}
          <div className="group relative rounded-2xl border border-white/10 bg-[#121216] p-7 transition-all duration-300 hover:border-[#6C5CE7]/50 hover:shadow-2xl hover:shadow-[#6C5CE7]/10 hover:-translate-y-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#6C5CE7] group-hover:border-[#6C5CE7] group-hover:bg-[#6C5CE7]/10 transition-colors">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-white tracking-tight">Performance Tracking</h3>
            <p className="mt-2 text-sm text-[#A1A1AA] leading-relaxed">
              Live YouTube API verification. Measure exact 30-day velocity, engagement trajectories, and sponsored retention curves.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* SPLIT SECTION: FOR BRANDS & FOR CREATORS */}
      {/* ---------------------------------------------------- */}
      <section className="relative py-20 bg-[#0E0E12]/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card Left: For Brands */}
            <div className="relative rounded-2xl border border-white/10 bg-[#121216] p-8 sm:p-10 flex flex-col justify-between overflow-hidden group hover:border-[#6C5CE7]/40 transition-all">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#6C5CE7]/10 rounded-full blur-3xl pointer-events-none -z-10" />

              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-[#6C5CE7] border border-white/5 mb-6">
                  For Enterprise Brands
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  High-Performance Creator Deployments
                </h3>
                <p className="mt-3 text-sm text-[#A1A1AA] leading-relaxed">
                  Stop playing guessing games with agency middlemen. Source pre-vetted YouTube partners with transparent rate cards and guaranteed on-time delivery.
                </p>

                <div className="mt-6 space-y-3.5">
                  <div className="flex items-center gap-3 text-sm text-white/90">
                    <CheckCircle2 className="h-4 w-4 text-[#6C5CE7] shrink-0" />
                    <span>Find & filter top 1% creators with algorithmic CPM benchmarks</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white/90">
                    <CheckCircle2 className="h-4 w-4 text-[#6C5CE7] shrink-0" />
                    <span>Real-time campaign telemetry tracking views and retention</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white/90">
                    <CheckCircle2 className="h-4 w-4 text-[#6C5CE7] shrink-0" />
                    <span>Guaranteed delivery backed by milestone escrow protection</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={onExplorePlatform}
                  className="flex items-center gap-2 text-sm font-semibold text-[#6C5CE7] hover:text-white transition-colors"
                >
                  <span>Launch Brand Directory</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <span className="text-xs text-[#A1A1AA]">300+ Active Brands</span>
              </div>
            </div>

            {/* Card Right: For Creators */}
            <div className="relative rounded-2xl border border-white/10 bg-[#121216] p-8 sm:p-10 flex flex-col justify-between overflow-hidden group hover:border-[#6C5CE7]/40 transition-all">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#5B21B6]/10 rounded-full blur-3xl pointer-events-none -z-10" />

              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-[#6C5CE7] border border-white/5 mb-6">
                  For Verified Creators
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Protect Your Brand, Control Your Inventory
                </h3>
                <p className="mt-3 text-sm text-[#A1A1AA] leading-relaxed">
                  Eliminate unpaid revisions, delayed wire transfers, and unvetted brand requests. Set your quarterly slots and let institutional clients come to you.
                </p>

                <div className="mt-6 space-y-3.5">
                  <div className="flex items-center gap-3 text-sm text-white/90">
                    <CheckCircle2 className="h-4 w-4 text-[#6C5CE7] shrink-0" />
                    <span>Monetize content with institutional, prompt payments</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white/90">
                    <CheckCircle2 className="h-4 w-4 text-[#6C5CE7] shrink-0" />
                    <span>Control availability with scarce quarterly slot reservations</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white/90">
                    <CheckCircle2 className="h-4 w-4 text-[#6C5CE7] shrink-0" />
                    <span>Build and compound your verified Cipher Trust Score</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={onOpenCreatorPortal}
                  className="flex items-center gap-2 text-sm font-semibold text-[#6C5CE7] hover:text-white transition-colors"
                >
                  <span>Enter Creator Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <span className="text-xs text-[#A1A1AA]">Top 1% Exclusive</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* STATS SECTION */}
      {/* ---------------------------------------------------- */}
      <section className="relative py-20 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="rounded-3xl border border-white/10 bg-[#121216] p-10 sm:p-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            <div className="pt-4 sm:pt-0">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">5K+</div>
              <div className="text-xs sm:text-sm font-medium uppercase tracking-wider text-[#A1A1AA] mt-2">
                Verified Creators
              </div>
            </div>

            <div className="pt-4 sm:pt-0 sm:pl-8">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#6C5CE7] tracking-tight">300+</div>
              <div className="text-xs sm:text-sm font-medium uppercase tracking-wider text-[#A1A1AA] mt-2">
                Enterprise Brands
              </div>
            </div>

            <div className="pt-4 sm:pt-0 sm:pl-8">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">95%</div>
              <div className="text-xs sm:text-sm font-medium uppercase tracking-wider text-[#A1A1AA] mt-2">
                Delivery Success
              </div>
            </div>

            <div className="pt-4 sm:pt-0 sm:pl-8">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-emerald-400 tracking-tight">2.5x</div>
              <div className="text-xs sm:text-sm font-medium uppercase tracking-wider text-[#A1A1AA] mt-2">
                Average Brand ROI
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* CREATOR DISCOVERY PREVIEW SECTION */}
      {/* ---------------------------------------------------- */}
      <section className="relative py-20 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-[#6C5CE7] mb-2">
              Curated Roster
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Featured 1% YouTube Creators
            </h2>
            <p className="text-sm text-[#A1A1AA] mt-1.5">
              Live engagement analytics, verified subscriber counts, and standardized rate cards.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-white/90 hover:bg-white/10 transition-all"
            >
              <Download className="h-3.5 w-3.5 text-[#6C5CE7]" />
              <span>Export CSV Dataset</span>
            </button>
            <button
              onClick={onExplorePlatform}
              className="flex items-center gap-1.5 rounded-xl bg-[#6C5CE7] px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#6C5CE7]/30 hover:bg-[#5B21B6] transition-all"
            >
              <span>View All 24 Creators</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {showcaseCreators.map((creator) => (
            <div
              key={creator.id}
              onClick={() => onSelectCreator(creator)}
              className="group cursor-pointer rounded-2xl border border-white/10 bg-[#121216] p-5 transition-all duration-200 hover:border-[#6C5CE7]/50 hover:shadow-xl hover:shadow-[#6C5CE7]/15 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="relative mb-4">
                  <img
                    src={creator.avatarUrl}
                    alt={creator.name}
                    className="h-20 w-20 rounded-xl object-cover border border-white/15 group-hover:border-[#6C5CE7] transition-colors"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-0 right-0 flex items-center gap-1 rounded-full border border-white/10 bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                    <span className="text-[#6C5CE7]">★</span>
                    <span>{creator.cipherScore}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-base text-white group-hover:text-[#6C5CE7] transition-colors truncate">
                    {creator.name}
                  </h4>
                </div>
                <div className="text-xs text-[#A1A1AA] mt-0.5">{creator.handle}</div>

                <div className="mt-3">
                  <span className="inline-block rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-medium text-[#A1A1AA] border border-white/5">
                    {creator.niche}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2 pt-4 border-t border-white/5 text-xs">
                  <div>
                    <div className="text-[10px] text-[#A1A1AA]">Subscribers</div>
                    <div className="font-semibold text-white mt-0.5">
                      {(creator.subscribers / 1000000).toFixed(1)}M
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#A1A1AA]">Engagement</div>
                    <div className="font-semibold text-[#10B981] mt-0.5">
                      {creator.engagementRate}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-medium text-[#6C5CE7]">
                <span>View Analytics Charts</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* HOW IT WORKS (4 HORIZONTAL STEPS) */}
      {/* ---------------------------------------------------- */}
      <section className="relative py-24 bg-[#0E0E12]/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-semibold uppercase tracking-widest text-[#6C5CE7] mb-2">
              Execution Protocol
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              How CipherCollab Works
            </h2>
            <p className="text-sm text-[#A1A1AA] mt-2">
              From initial discovery to verified upload and escrow payout.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="rounded-2xl border border-white/10 bg-[#121216] p-6 relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6C5CE7]/15 text-[#6C5CE7] font-mono text-sm font-bold border border-[#6C5CE7]/30 mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-white">Discover</h3>
              <p className="text-xs text-[#A1A1AA] mt-2 leading-relaxed">
                Filter verified creators by engagement velocity, purchasing power index, and category affinity using live YouTube API data.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl border border-white/10 bg-[#121216] p-6 relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6C5CE7]/15 text-[#6C5CE7] font-mono text-sm font-bold border border-[#6C5CE7]/30 mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-white">Book</h3>
              <p className="text-xs text-[#A1A1AA] mt-2 leading-relaxed">
                Select standardized slots (60s, dedicated video, series) with fair-market rate cards and lock in designated calendar drop dates.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl border border-white/10 bg-[#121216] p-6 relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6C5CE7]/15 text-[#6C5CE7] font-mono text-sm font-bold border border-[#6C5CE7]/30 mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-white">Secure</h3>
              <p className="text-xs text-[#A1A1AA] mt-2 leading-relaxed">
                Deposit campaign capital into structured escrow. Funds are locked safely until creative drafts are reviewed and approved.
              </p>
            </div>

            {/* Step 4 */}
            <div className="rounded-2xl border border-white/10 bg-[#121216] p-6 relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6C5CE7]/15 text-[#6C5CE7] font-mono text-sm font-bold border border-[#6C5CE7]/30 mb-4">
                04
              </div>
              <h3 className="text-base font-bold text-white">Measure</h3>
              <p className="text-xs text-[#A1A1AA] mt-2 leading-relaxed">
                Video goes live. Telemetry logs real-time views, sponsored retention, and conversion lift, triggering automated escrow release.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* FINAL CTA SECTION */}
      {/* ---------------------------------------------------- */}
      <section className="relative py-28 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="relative rounded-3xl border border-white/15 bg-gradient-to-b from-[#16161D] via-[#121216] to-[#0A0A0A] p-12 sm:p-20 text-center overflow-hidden shadow-2xl">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#6C5CE7]/20 rounded-full blur-3xl pointer-events-none -z-10" />

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight max-w-2xl mx-auto leading-tight">
            Ready to collaborate differently?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#A1A1AA] max-w-xl mx-auto leading-relaxed">
            Join the forward-thinking brands and top 1% creators building sustainable, data-backed partnerships without agency friction.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onRequestAccess}
              className="rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#5B21B6] px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-[#6C5CE7]/30 hover:shadow-[#6C5CE7]/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Join Early Access
            </button>

            <button
              onClick={onExplorePlatform}
              className="rounded-xl border border-white/15 bg-white/5 px-8 py-4 text-sm font-medium text-white hover:bg-white/10 hover:border-white/30 transition-all"
            >
              Explore 1% Creator Directory
            </button>
          </div>

          <div className="mt-8 text-xs text-[#A1A1AA]">
            Direct institutional partnerships • Milestone escrow protection • No subscription required
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* FOOTER */}
      {/* ---------------------------------------------------- */}
      <footer className="relative border-t border-white/10 bg-[#070709] py-14">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#6C5CE7] to-[#5B21B6] text-xs font-bold text-white">
                  C
                </div>
                <span className="font-bold text-lg text-white tracking-tight">CipherCollab</span>
              </div>
              <p className="text-xs text-[#A1A1AA] mt-2 max-w-xs">
                The institutional infrastructure layer for serious creator economy collaborations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-8 text-xs text-[#A1A1AA]">
              <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="hover:text-white transition-colors">
                Home
              </button>
              <button onClick={onExplorePlatform} className="hover:text-white transition-colors">
                Creators
              </button>
              <button onClick={onRequestAccess} className="hover:text-white transition-colors">
                For Brands
              </button>
              <button onClick={onOpenCreatorPortal} className="hover:text-white transition-colors">
                For Creators
              </button>
              <button onClick={onOpenDealRoom} className="hover:text-white transition-colors">
                Escrow Deals
              </button>
              <button onClick={handleDownloadCsv} className="hover:text-white text-[#6C5CE7] transition-colors font-medium">
                Download CSV
              </button>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
            <div>
              © {new Date().getFullYear()} CipherCollab Infrastructure Inc. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <span className="hover:text-white/60 cursor-pointer">Terms of Escrow</span>
              <span className="hover:text-white/60 cursor-pointer">Privacy Protocol</span>
              <span className="hover:text-white/60 cursor-pointer">Verification Standards</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
