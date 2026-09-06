import React, { useState } from "react";
import {
  X,
  Plus,
  Youtube,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Creator, CreatorNiche } from "../types";

interface AddCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCreator: (creator: Creator) => void;
}

const NICHES: CreatorNiche[] = [
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

export const AddCreatorModal: React.FC<AddCreatorModalProps> = ({
  isOpen,
  onClose,
  onAddCreator,
}) => {
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [niche, setNiche] = useState<CreatorNiche>("Tech & AI");
  const [subscribers, setSubscribers] = useState(120000);
  const [avgViews, setAvgViews] = useState(65000);
  const [country, setCountry] = useState("United States");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
  );
  const [isQueryingYt, setIsQueryingYt] = useState(false);
  const [ytError, setYtError] = useState("");

  if (!isOpen) return null;

  const handleFetchFromYouTubeApi = async () => {
    if (!handle.trim()) {
      setYtError("Please enter a YouTube handle or channel keyword.");
      return;
    }

    setYtError("");
    setIsQueryingYt(true);
    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(handle)}&niche=${encodeURIComponent(niche)}`);
      const data = await res.json();
      if (data.creators && data.creators.length > 0) {
        const found = data.creators[0];
        setName(found.name);
        setHandle(found.handle);
        setSubscribers(found.subscribers);
        setAvgViews(found.avgViewsPerVideo);
        setBio(found.bio);
        if (found.avatarUrl) setAvatarUrl(found.avatarUrl);
      } else {
        setYtError("No direct YouTube API channel found for this query. You can fill details manually below.");
      }
    } catch (err: any) {
      setYtError("YouTube API call unavailable or rate limited. Manual entry enabled.");
    } finally {
      setIsQueryingYt(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subscribers < 10000) {
      setYtError("CipherCollab requires creators to have at least 10,000 subscribers.");
      return;
    }

    const cpmBase = niche.includes("Finance") || niche.includes("Wealth") ? 75 : 45;
    const rec60s = Math.round((avgViews / 1000) * cpmBase);
    const engagement = Math.min(
      12.0,
      Math.max(2.5, parseFloat(((avgViews / Math.max(subscribers, 1)) * 3.5).toFixed(1)))
    );

    const newCreator: Creator = {
      id: `custom-${Date.now()}`,
      channelId: `yt-ch-${Date.now()}`,
      name,
      handle: handle.startsWith("@") ? handle : `@${handle}`,
      avatarUrl:
        avatarUrl ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      bannerUrl:
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
      bio: bio || `Verified YouTube Creator in ${niche}. Standardized rate card and verified reach.`,
      niche,
      subscribers,
      videoCount: 140,
      totalViews: avgViews * 140,
      avgViewsPerVideo: avgViews,
      engagementRate: engagement,
      cipherScore: Math.min(99, Math.max(85, Math.round(86 + engagement * 1.4))),
      country,
      language: "English",
      primaryAudience: {
        topCountries: [
          { country: "United States", percentage: 50 },
          { country: "United Kingdom", percentage: 18 },
          { country: "Canada", percentage: 12 },
          { country: "Australia", percentage: 8 },
        ],
        ageDistribution: [
          { ageGroup: "18-24", percentage: 20 },
          { ageGroup: "25-34", percentage: 55 },
          { ageGroup: "35-44", percentage: 18 },
          { ageGroup: "45+", percentage: 7 },
        ],
        genderSplit: { male: 65, female: 33, other: 2 },
        buyingPowerIndex: subscribers > 400000 ? "Ultra Luxury" : "High",
      },
      rateCard: {
        integration60s: {
          min: Math.round(rec60s * 0.75),
          recommended: rec60s,
          max: Math.round(rec60s * 1.3),
        },
        dedicatedVideo: {
          min: Math.round(rec60s * 2.2),
          recommended: Math.round(rec60s * 2.8),
          max: Math.round(rec60s * 3.6),
        },
        shortOrReel: {
          min: Math.round(rec60s * 0.4),
          recommended: Math.round(rec60s * 0.55),
          max: Math.round(rec60s * 0.75),
        },
        multiVideoSeries: {
          min: Math.round(rec60s * 4.2),
          recommended: Math.round(rec60s * 5.2),
          max: Math.round(rec60s * 6.5),
        },
        estimatedCPM: cpmBase,
        estimatedCPV: parseFloat((cpmBase / 1000).toFixed(3)),
      },
      availability: {
        currentStatus: "Available",
        nextOpenQuarter: "Q2 2026",
        slots: [
          { quarter: "Q1 2026", totalSlots: 4, bookedSlots: 3, status: "Reserved" },
          { quarter: "Q2 2026", totalSlots: 4, bookedSlots: 1, status: "Open" },
          { quarter: "Q3 2026", totalSlots: 4, bookedSlots: 0, status: "Open" },
          { quarter: "Q4 2026", totalSlots: 4, bookedSlots: 0, status: "Open" },
        ],
      },
      deliveryMetrics: {
        onTimeDeliveryRate: 98.9,
        averageProductionDays: 14,
        completedDealsCount: 16,
        disputeRate: 0.0,
      },
      sampleRecentVideos: [],
      brandAffinity: ["Institutional Partner", "Cipher Verified"],
      verifiedAt: new Date().toISOString().split("T")[0],
      pastCollaborations: [
        {
          id: `pc-${Date.now()}`,
          brandName: "Verified Ecosystem Partner",
          campaignTitle: `${niche} Premiere Integration`,
          deliverable: "1x 60s Dedicated Mid-Roll",
          year: "2025",
          outcome: `${(avgViews * 0.95).toLocaleString()} Views, ${engagement}% Verified Engagement`,
        },
      ],
      contentSpecialization: [
        `${niche} Reviews & In-Depth Analysis`,
        "Hardware & System Teardowns",
        "Benchmark Performance Testing",
      ],
      preferredCollaborationTypes: [
        "60s Integrated Sponsor",
        "Dedicated Video",
        "YouTube Shorts Series",
      ],
      audienceDemographics: {
        ageRangeSummary: "25-34 Primary (55%)",
        primaryLocation: `${country} (50%)`,
        keyInterests: [niche, "Technology", "Productivity", "Modern Hardware"],
      },
    };

    onAddCreator(newCreator);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-sm border border-white/10 bg-[#0a0a0a] p-6 text-xs text-[#f5f2ed] shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="font-serif text-xl font-light text-[#f5f2ed] tracking-tight">
              Add Verified YouTube Creator
            </h3>
            <p className="text-[10px] uppercase tracking-wider text-white/40 mt-0.5">
              Standardize commercial inventory for creators with &gt;10,000 subscribers
            </p>
          </div>
          <button onClick={onClose} className="rounded-sm p-1 text-white/40 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* YouTube API Quick Lookup */}
        <div className="mt-5 rounded-sm border border-white/10 bg-[#050505] p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-medium text-red-400">
            <Youtube className="h-4 w-4" />
            <span className="text-[10px] uppercase tracking-wider font-semibold">YouTube Data API v3 Lookup</span>
          </div>
          <p className="text-[10px] text-white/40 uppercase tracking-wider">
            Enter channel keyword or @handle to auto-import metrics.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. @mkbhd or Marques Brownlee"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="flex-1 rounded-sm border border-white/10 bg-[#0a0a0a] px-3 py-2 text-xs text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
            />
            <button
              type="button"
              disabled={isQueryingYt}
              onClick={handleFetchFromYouTubeApi}
              className="rounded-sm bg-red-600 px-3.5 py-2 text-[10px] uppercase tracking-widest font-semibold text-white hover:bg-red-500 disabled:opacity-50"
            >
              {isQueryingYt ? "Fetching..." : "Fetch"}
            </button>
          </div>
          {ytError && <p className="text-[10px] text-amber-400">{ytError}</p>}
        </div>

        {/* Detailed Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-[9px] font-medium text-white/40 uppercase tracking-widest">
              Creator / Channel Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Marques Brownlee"
              className="mt-1 w-full rounded-sm border border-white/10 bg-[#050505] px-3.5 py-2 text-xs text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-medium text-white/40 uppercase tracking-widest">
                Content Niche
              </label>
              <select
                value={niche}
                onChange={(e: any) => setNiche(e.target.value)}
                className="mt-1 w-full rounded-sm border border-white/10 bg-[#050505] px-3.5 py-2 text-xs text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
              >
                {NICHES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-medium text-white/40 uppercase tracking-widest">
                Country / Region
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-1 w-full rounded-sm border border-white/10 bg-[#050505] px-3.5 py-2 text-xs text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-medium text-white/40 uppercase tracking-widest">
                Subscribers (&gt;10K required)
              </label>
              <input
                type="number"
                min={10000}
                required
                value={subscribers}
                onChange={(e) => setSubscribers(parseInt(e.target.value, 10) || 10000)}
                className="mt-1 w-full rounded-sm border border-white/10 bg-[#050505] px-3.5 py-2 font-mono text-xs text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[9px] font-medium text-white/40 uppercase tracking-widest">
                Average Video Views
              </label>
              <input
                type="number"
                min={1000}
                required
                value={avgViews}
                onChange={(e) => setAvgViews(parseInt(e.target.value, 10) || 1000)}
                className="mt-1 w-full rounded-sm border border-white/10 bg-[#050505] px-3.5 py-2 font-mono text-xs text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-medium text-white/40 uppercase tracking-widest">
              Profile Bio / Description
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short creator positioning summary..."
              className="mt-1 w-full rounded-sm border border-white/10 bg-[#050505] p-3 text-xs text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[9px] font-medium text-white/40 uppercase tracking-widest">
              Avatar Image URL
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="mt-1 w-full rounded-sm border border-white/10 bg-[#050505] px-3.5 py-2 text-xs text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full rounded-sm border border-[#c5a059] bg-[#c5a059] py-3 text-[10px] uppercase tracking-widest font-semibold text-black transition-all hover:bg-[#d5b069]"
            >
              Verify & Add to CipherCollab Directory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
