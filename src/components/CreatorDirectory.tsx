import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Calendar,
  DollarSign,
  ExternalLink,
  ChevronRight,
  Youtube,
  Users,
  Eye,
  Percent,
  CheckCircle,
  LayoutGrid,
  ListFilter,
  ArrowUpDown,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { Creator, CreatorNiche } from "../types";

interface CreatorDirectoryProps {
  creators: Creator[];
  onSelectCreator: (creator: Creator) => void;
  onInitiateCollab: (creator: Creator) => void;
  onRunAiEvaluation: (creator: Creator) => void;
  onPerformYouTubeLiveSearch: (query: string) => Promise<void>;
  isSearchingYouTube: boolean;
}

const ALL_NICHES: (CreatorNiche | "All Niches")[] = [
  "All Niches",
  "Tech & AI",
  "Luxury & Fashion",
  "Wealth & Finance",
  "Design & Architecture",
  "Automotive & Prestige",
  "SaaS & Productivity",
  "Wellness & Longevity",
  "Culinary Arts",
  "Travel & Heritage",
  "Gaming & Culture",
];

const SUBSCRIBER_TIERS = [
  { label: "All Tiers (>10K)", min: 10000, max: Infinity },
  { label: "Micro (10K - 50K)", min: 10000, max: 50000 },
  { label: "Mid (50K - 250K)", min: 50000, max: 250000 },
  { label: "Macro (250K - 1M)", min: 250000, max: 1000000 },
  { label: "Hero (1M+)", min: 1000000, max: Infinity },
];

export const CreatorDirectory: React.FC<CreatorDirectoryProps> = ({
  creators,
  onSelectCreator,
  onInitiateCollab,
  onRunAiEvaluation,
  onPerformYouTubeLiveSearch,
  isSearchingYouTube,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNiche, setSelectedNiche] = useState<string>("All Niches");
  const [selectedTierIndex, setSelectedTierIndex] = useState(0);
  const [sortBy, setSortBy] = useState<"cipherScore" | "subscribers" | "engagement" | "rate">(
    "cipherScore"
  );
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Filtering & Sorting
  const filteredCreators = useMemo(() => {
    const tier = SUBSCRIBER_TIERS[selectedTierIndex];
    return creators
      .filter((c) => {
        // Enforce >10k requirement strictly
        if (c.subscribers < 10000) return false;

        // Tier filter
        if (c.subscribers < tier.min || c.subscribers > tier.max) return false;

        // Niche filter
        if (selectedNiche !== "All Niches" && c.niche !== selectedNiche) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = c.name.toLowerCase().includes(q);
          const matchHandle = c.handle.toLowerCase().includes(q);
          const matchBio = c.bio.toLowerCase().includes(q);
          const matchNiche = c.niche.toLowerCase().includes(q);
          if (!matchName && !matchHandle && !matchBio && !matchNiche) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "cipherScore") return b.cipherScore - a.cipherScore;
        if (sortBy === "subscribers") return b.subscribers - a.subscribers;
        if (sortBy === "engagement") return b.engagementRate - a.engagementRate;
        if (sortBy === "rate")
          return (
            (b.rateCard?.integration60s?.recommended || 0) -
            (a.rateCard?.integration60s?.recommended || 0)
          );
        return 0;
      });
  }, [creators, searchQuery, selectedNiche, selectedTierIndex, sortBy]);

  // Aggregate stats
  const totalTrackedReach = useMemo(
    () => creators.reduce((acc, c) => acc + c.subscribers, 0),
    [creators]
  );
  const avgTrustScore = useMemo(() => {
    if (creators.length === 0) return 0;
    return (creators.reduce((acc, c) => acc + c.cipherScore, 0) / creators.length).toFixed(1);
  }, [creators]);

  return (
    <div className="space-y-12 pb-20">
      {/* Bold Typography Editorial Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-4">
        {/* Left Column: Bold Headline & Editorial Metrics */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <span className="text-[#c5a059] text-[11px] uppercase tracking-[0.4em] mb-4 block font-medium">
            Building the Standard
          </span>
          <h1 className="text-5xl sm:text-7xl lg:text-[84px] leading-[0.88] font-serif font-light tracking-tight mb-8 text-[#f5f2ed]">
            Discipline <br />
            In Every <br />
            <span className="italic text-[#c5a059]">Influence.</span>
          </h1>
          <p className="text-base sm:text-lg text-[#f5f2ed]/60 max-w-md font-light leading-relaxed mb-10">
            Transforming fragmented creator deals into a reliable, data-driven infrastructure for
            the world's leading brands. Every profile is audited with verified metrics above 10K subscribers.
          </p>

          <div className="flex flex-wrap gap-8 sm:gap-12 border-t border-white/10 pt-8">
            <div>
              <div className="text-3xl font-serif mb-1 text-[#f5f2ed]">
                {(totalTrackedReach / 1000000).toFixed(1)}M+
              </div>
              <div className="text-[10px] uppercase tracking-wider opacity-40">
                Verified Creators Reach
              </div>
            </div>
            <div>
              <div className="text-3xl font-serif mb-1 text-[#f5f2ed]">$4.8B</div>
              <div className="text-[10px] uppercase tracking-wider opacity-40">
                Managed GTV Benchmark
              </div>
            </div>
            <div>
              <div className="text-3xl font-serif mb-1 text-[#c5a059]">{avgTrustScore}</div>
              <div className="text-[10px] uppercase tracking-wider opacity-40">
                Avg Cipher Index / 100
              </div>
            </div>
            <div>
              <div className="text-3xl font-serif mb-1 text-[#00ff88]">98.2%</div>
              <div className="text-[10px] uppercase tracking-wider opacity-40">
                Fulfillment Rate
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Market Intelligence Feed & Predictable Scaling Card */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Market Intelligence Live Feed Card */}
          <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-sm">
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-medium">
                Market Intelligence
              </h3>
              <div className="text-[10px] uppercase tracking-widest text-[#c5a059] font-medium flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c5a059] animate-pulse" />
                LIVE DATA FEED
              </div>
            </div>

            <div className="space-y-4">
              {creators.slice(0, 3).map((creator, i) => {
                const sampleDeltas = ["+12.4%", "$1.2K", "840K"];
                const sampleLabels = ["ENGAGEMENT", "BASE CPM", "REACH INDEX"];
                const isGreen = i === 0 || i === 2;
                return (
                  <div
                    key={creator.id}
                    onClick={() => onSelectCreator(creator)}
                    className="flex items-center justify-between py-3 border-b border-white/5 cursor-pointer hover:bg-white/[0.02] transition-colors px-1"
                  >
                    <div>
                      <div className="text-sm font-medium text-[#f5f2ed]">{creator.name}</div>
                      <div className="text-[10px] opacity-40 uppercase tracking-wider">
                        {creator.niche}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-sm font-mono font-medium ${
                          isGreen ? "text-[#00ff88]" : "text-[#c5a059]"
                        }`}
                      >
                        {sampleDeltas[i]}
                      </div>
                      <div className="text-[10px] opacity-40 tracking-wider">
                        {sampleLabels[i]}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Predictable Scaling Feature Card */}
          <div className="relative overflow-hidden bg-[#111] border border-white/10 rounded-sm p-6 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#c5a059]/20 to-transparent opacity-40 pointer-events-none" />
            <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
              <div>
                <h2 className="text-2xl font-serif font-light mb-2 text-[#f5f2ed]">
                  Predictable Scaling.
                </h2>
                <p className="text-xs opacity-60 leading-relaxed font-light">
                  Our proprietary decision engine converts raw YouTube API metrics into actionable
                  performance profiles. Standardized pricing starts here.
                </p>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#c5a059]">
                  Standardized Rate Protocol
                </span>
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-[#f5f2ed] group-hover:border-[#c5a059] group-hover:text-[#c5a059] transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Surface: Search, Niche Selector, Tier Filter, Sorting */}
      <div className="space-y-4 rounded-sm border border-white/10 bg-[#0a0a0a] p-5 sm:p-6">
        {/* Search Input and YouTube live trigger */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search creator name, @handle, niche, or keywords..."
              className="w-full rounded-sm border border-white/10 bg-[#050505] py-2.5 pl-10 pr-4 text-xs sm:text-sm text-[#f5f2ed] placeholder-white/30 transition-colors focus:border-[#c5a059] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Live YouTube Search Button */}
            {searchQuery.trim() && (
              <button
                disabled={isSearchingYouTube}
                onClick={() => onPerformYouTubeLiveSearch(searchQuery)}
                className="flex items-center gap-2 rounded-sm border border-red-500/40 bg-red-500/10 px-4 py-2 text-[10px] uppercase tracking-wider font-medium text-red-300 transition-colors hover:bg-red-500/20 disabled:opacity-50"
              >
                <Youtube className="h-3.5 w-3.5 text-red-400" />
                <span>{isSearchingYouTube ? "Querying API..." : "Live YouTube Query"}</span>
              </button>
            )}

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 rounded-sm border border-white/10 bg-[#050505] px-3 py-2 text-[10px] uppercase tracking-wider text-white/60">
              <ArrowUpDown className="h-3.5 w-3.5 text-[#c5a059]" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-transparent text-[10px] uppercase tracking-wider text-[#f5f2ed] focus:outline-none"
              >
                <option value="cipherScore" className="bg-[#050505]">Sort: Cipher Trust</option>
                <option value="subscribers" className="bg-[#050505]">Sort: Subscribers</option>
                <option value="engagement" className="bg-[#050505]">Sort: Engagement %</option>
                <option value="rate" className="bg-[#050505]">Sort: 60s Rate</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-sm border border-white/10 bg-[#050505] p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-sm p-1.5 transition-colors ${
                  viewMode === "grid"
                    ? "bg-[#6C5CE7] text-white"
                    : "text-white/40 hover:text-white"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`rounded-sm p-1.5 transition-colors ${
                  viewMode === "table"
                    ? "bg-[#6C5CE7] text-white"
                    : "text-white/40 hover:text-white"
                }`}
                title="Institutional Table View"
              >
                <ListFilter className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Export CSV Dataset Button */}
            <a
              href="/api/creators/export-csv"
              download="ciphercollab_creators_intelligence.csv"
              className="flex items-center gap-1.5 rounded-sm border border-[#6C5CE7]/40 bg-[#6C5CE7]/10 px-3 py-2 text-[10px] uppercase tracking-wider font-medium text-[#A78BFA] hover:bg-[#6C5CE7]/20 transition-colors"
              title="Download full CSV dataset with all creator analytics"
            >
              <Download className="h-3.5 w-3.5 text-[#6C5CE7]" />
              <span className="hidden sm:inline">Export CSV</span>
            </a>
          </div>
        </div>

        {/* Subscriber Tier Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-white/5 pt-3">
          <span className="text-[10px] font-medium tracking-[0.2em] uppercase opacity-40 mr-2">
            Subscriber Tier:
          </span>
          {SUBSCRIBER_TIERS.map((tier, idx) => (
            <button
              key={tier.label}
              onClick={() => setSelectedTierIndex(idx)}
              className={`rounded-sm px-3 py-1 text-[10px] uppercase tracking-wider transition-all ${
                selectedTierIndex === idx
                  ? "border border-[#c5a059] bg-[#c5a059]/15 font-semibold text-[#c5a059]"
                  : "border border-white/5 bg-[#050505] text-white/50 hover:text-white"
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>

        {/* Niche Filter Ribbon */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-white/5 pt-3 overflow-x-auto">
          <span className="text-[10px] font-medium tracking-[0.2em] uppercase opacity-40 mr-2">
            Niche:
          </span>
          {ALL_NICHES.map((niche) => (
            <button
              key={niche}
              onClick={() => setSelectedNiche(niche)}
              className={`whitespace-nowrap rounded-sm px-3 py-1 text-[10px] uppercase tracking-wider transition-all ${
                selectedNiche === niche
                  ? "border border-[#c5a059] bg-[#c5a059]/15 font-semibold text-[#c5a059]"
                  : "border border-white/5 bg-[#050505] text-white/50 hover:text-white"
              }`}
            >
              {niche}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count & Status Summary */}
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-white/40 px-1">
        <div>
          Showing <span className="font-semibold text-[#f5f2ed]">{filteredCreators.length}</span>{" "}
          verified creators (&gt;10K)
          {selectedNiche !== "All Niches" && (
            <span>
              {" "}
              in <span className="text-[#c5a059] font-medium">{selectedNiche}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#00ff88]" />
          <span>Real-time market valuation active</span>
        </div>
      </div>

      {/* Content Rendering: Grid vs Table */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCreators.map((creator) => {
            const subsFormatted =
              creator.subscribers >= 1000000
                ? `${(creator.subscribers / 1000000).toFixed(1)}M`
                : `${(creator.subscribers / 1000).toFixed(0)}K`;

            const viewsFormatted =
              creator.avgViewsPerVideo >= 1000000
                ? `${(creator.avgViewsPerVideo / 1000000).toFixed(1)}M`
                : `${(creator.avgViewsPerVideo / 1000).toFixed(0)}K`;

            return (
              <div
                key={creator.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-sm border border-white/10 bg-[#0a0a0a] p-6 transition-all hover:border-[#c5a059]/40 hover:bg-[#0f0f0f]"
              >
                {/* Top Section: Avatar, Name, Trust Badge */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={creator.avatarUrl}
                          alt={creator.name}
                          className="h-12 w-12 rounded-sm border border-white/10 object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div
                          className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#c5a059] text-[9px] font-bold text-black"
                          title="Verified Cipher Creator"
                        >
                          ✓
                        </div>
                      </div>
                      <div>
                        <h3 className="font-serif text-lg font-normal text-[#f5f2ed] group-hover:text-[#c5a059] transition-colors line-clamp-1">
                          {creator.name}
                        </h3>
                        <p className="font-mono text-xs text-white/50">{creator.handle}</p>
                      </div>
                    </div>

                    {/* Cipher Trust Score Badge */}
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 rounded-sm border border-[#c5a059]/40 bg-[#c5a059]/10 px-2 py-0.5">
                        <ShieldCheck className="h-3 w-3 text-[#c5a059]" />
                        <span className="font-mono text-xs font-bold text-[#c5a059]">
                          {creator.cipherScore}
                        </span>
                      </div>
                      <span className="text-[9px] uppercase tracking-wider text-white/40 mt-0.5">
                        Cipher Index
                      </span>
                    </div>
                  </div>

                  {/* Niche & Buying Power Pills */}
                  <div className="mt-4 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-sm border border-white/10 bg-[#050505] px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium text-white/70">
                      {creator.niche}
                    </span>
                    <span className="rounded-sm border border-white/10 bg-[#050505] px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/50">
                      {creator.country}
                    </span>
                    <span className="rounded-sm border border-[#c5a059]/30 bg-[#c5a059]/10 px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium text-[#c5a059]">
                      {creator.primaryAudience?.buyingPowerIndex || "High Power"}
                    </span>
                  </div>

                  {/* Bio */}
                  <p className="mt-3.5 text-xs leading-relaxed text-white/60 line-clamp-2 font-light">
                    {creator.bio}
                  </p>

                  {/* Key Metrics Strip */}
                  <div className="mt-4 grid grid-cols-3 gap-2 rounded-sm border border-white/5 bg-[#050505] p-3 text-center">
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-white/40">Subscribers</div>
                      <div className="font-serif text-sm font-medium text-[#f5f2ed] mt-0.5">
                        {subsFormatted}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-white/40">Avg Views</div>
                      <div className="font-serif text-sm font-medium text-[#f5f2ed] mt-0.5">
                        {viewsFormatted}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-white/40">Engagement</div>
                      <div className="font-mono text-xs font-medium text-[#00ff88] mt-0.5">
                        {creator.engagementRate}%
                      </div>
                    </div>
                  </div>

                  {/* Standardized Rate Card Preview */}
                  <div className="mt-3.5 space-y-1.5 rounded-sm border border-white/5 bg-[#080808] p-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-white/50">60s Integration Standard:</span>
                      <span className="font-serif font-medium text-[#c5a059]">
                        ${creator.rateCard?.integration60s?.recommended?.toLocaleString() || "15,000"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-white/50">Dedicated Feature Video:</span>
                      <span className="font-serif font-medium text-[#f5f2ed]">
                        ${creator.rateCard?.dedicatedVideo?.recommended?.toLocaleString() || "40,000"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-white/40 pt-1.5 border-t border-white/5">
                      <span>Est. Effective CPM:</span>
                      <span className="font-mono text-white/70">${creator.rateCard?.estimatedCPM || 45}/1k views</span>
                    </div>
                  </div>

                  {/* Availability Badge */}
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[#c5a059]" />
                      <span className="text-[10px] uppercase tracking-wider text-white/50">Slot Availability:</span>
                    </div>
                    <span
                      className={`rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium ${
                        creator.availability?.currentStatus === "Available"
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {creator.availability?.nextOpenQuarter || "Q2 2026"} (
                      {creator.availability?.currentStatus || "Available"})
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 space-y-2 border-t border-white/10 pt-4">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onSelectCreator(creator)}
                      className="flex items-center justify-center gap-1.5 rounded-sm border border-white/10 bg-[#050505] py-2 text-[10px] uppercase tracking-widest text-white/70 transition-colors hover:border-white/30 hover:text-white"
                    >
                      <span>Dossier</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => onRunAiEvaluation(creator)}
                      className="flex items-center justify-center gap-1.5 rounded-sm border border-[#c5a059]/40 bg-[#c5a059]/10 py-2 text-[10px] uppercase tracking-widest text-[#c5a059] transition-colors hover:bg-[#c5a059]/20 font-medium"
                    >
                      <Sparkles className="h-3 w-3 text-[#c5a059]" />
                      <span>AI Valuation</span>
                    </button>
                  </div>

                  <button
                    onClick={() => onInitiateCollab(creator)}
                    className="w-full rounded-sm border border-[#c5a059] bg-[#c5a059] py-2.5 text-[10px] uppercase tracking-widest font-semibold text-black transition-all hover:bg-[#d5b069] active:scale-[0.99]"
                  >
                    Propose Collab
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Institutional Table View */
        <div className="overflow-x-auto rounded-sm border border-white/10 bg-[#0a0a0a]">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-[#050505] text-[10px] uppercase tracking-[0.2em] text-white/40">
              <tr>
                <th className="px-4 py-3.5 font-medium">Creator</th>
                <th className="px-4 py-3.5 font-medium">Niche & Region</th>
                <th className="px-4 py-3.5 font-medium text-right">Subscribers</th>
                <th className="px-4 py-3.5 font-medium text-right">Avg Views</th>
                <th className="px-4 py-3.5 font-medium text-right">Engagement</th>
                <th className="px-4 py-3.5 font-medium text-center">Cipher Index</th>
                <th className="px-4 py-3.5 font-medium text-right">60s Integration Rate</th>
                <th className="px-4 py-3.5 font-medium">Availability</th>
                <th className="px-4 py-3.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCreators.map((creator) => (
                <tr
                  key={creator.id}
                  className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                  onClick={() => onSelectCreator(creator)}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={creator.avatarUrl}
                        alt={creator.name}
                        className="h-8 w-8 rounded-sm border border-white/10 object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="font-serif font-medium text-[#f5f2ed]">
                          {creator.name}
                        </div>
                        <div className="font-mono text-[11px] text-white/40">{creator.handle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-white/60">
                    <span className="font-medium text-[#f5f2ed]">{creator.niche}</span>
                    <span className="block text-[11px] text-white/40">{creator.country}</span>
                  </td>
                  <td className="px-4 py-3.5 font-serif text-right text-[#f5f2ed]">
                    {creator.subscribers >= 1000000
                      ? `${(creator.subscribers / 1000000).toFixed(1)}M`
                      : `${(creator.subscribers / 1000).toFixed(0)}K`}
                  </td>
                  <td className="px-4 py-3.5 font-serif text-right text-[#f5f2ed]">
                    {creator.avgViewsPerVideo >= 1000000
                      ? `${(creator.avgViewsPerVideo / 1000000).toFixed(1)}M`
                      : `${(creator.avgViewsPerVideo / 1000).toFixed(0)}K`}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-right text-[#00ff88]">
                    {creator.engagementRate}%
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-block rounded-sm border border-[#c5a059]/40 bg-[#c5a059]/10 px-2 py-0.5 font-mono text-xs font-bold text-[#c5a059]">
                      {creator.cipherScore}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-serif font-medium text-right text-[#c5a059]">
                    ${creator.rateCard?.integration60s?.recommended?.toLocaleString() || "15,000"}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-[10px] uppercase tracking-wider text-emerald-300">
                      {creator.availability?.nextOpenQuarter || "Q2 2026"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onInitiateCollab(creator);
                      }}
                      className="rounded-sm border border-[#c5a059] px-3 py-1 text-[10px] uppercase tracking-widest text-[#c5a059] hover:bg-[#c5a059] hover:text-black font-semibold transition-colors"
                    >
                      Collab
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
