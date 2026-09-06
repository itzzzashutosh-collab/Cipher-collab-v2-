import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Sparkles,
  Database,
  Layers,
  Briefcase,
  UserCheck,
  Search,
  Plus,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Inbox,
  BarChart3,
} from "lucide-react";
import { SupabaseConfigState } from "../types";

export type NavTabType =
  | "directory"
  | "decision-engine"
  | "deal-room"
  | "creator-portal"
  | "requests"
  | "performance";

interface NavbarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  perspective: "brand" | "creator";
  setPerspective: (p: "brand" | "creator") => void;
  onOpenSupabaseModal: () => void;
  onOpenAddCreatorModal: () => void;
  supabaseConfig: SupabaseConfigState;
  activeDealsCount: number;
  pendingRequestsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  perspective,
  setPerspective,
  onOpenSupabaseModal,
  onOpenAddCreatorModal,
  supabaseConfig,
  activeDealsCount,
  pendingRequestsCount = 0,
}) => {
  const [systemStatus, setSystemStatus] = useState<{
    hasGeminiKey: boolean;
    hasYouTubeKey: boolean;
  }>({ hasGeminiKey: true, hasYouTubeKey: false });

  useEffect(() => {
    fetch("/api/system/status")
      .then((res) => res.json())
      .then((data) => {
        setSystemStatus({
          hasGeminiKey: Boolean(data.hasGeminiKey),
          hasYouTubeKey: Boolean(data.hasYouTubeKey),
        });
      })
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#050505]/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Monogram - Bold Typography Theme */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => setActiveTab("directory")}
            className="flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-90"
          >
            <div>
              <div className="text-2xl tracking-tighter font-serif font-light text-[#f5f2ed]">
                CIPHER<span className="font-bold text-[#c5a059]">COLLAB</span>
              </div>
              <p className="text-[9px] uppercase tracking-[0.3em] font-medium text-[#f5f2ed]/50 -mt-0.5">
                Creator Economy Infrastructure
              </p>
            </div>
          </div>

          {/* Perspective Switcher */}
          <div className="hidden lg:flex items-center rounded-sm border border-white/10 bg-[#0a0a0a] p-0.5">
            <button
              onClick={() => {
                setPerspective("brand");
                if (activeTab === "creator-portal") setActiveTab("directory");
              }}
              className={`flex items-center gap-1.5 rounded-sm px-3 py-1 text-[10px] uppercase tracking-[0.15em] font-medium transition-all ${
                perspective === "brand"
                  ? "bg-[#c5a059] text-black font-semibold shadow-sm"
                  : "text-[#f5f2ed]/60 hover:text-[#f5f2ed]"
              }`}
            >
              <Briefcase className="h-3 w-3" />
              Brand Engine
            </button>
            <button
              onClick={() => {
                setPerspective("creator");
                setActiveTab("creator-portal");
              }}
              className={`flex items-center gap-1.5 rounded-sm px-3 py-1 text-[10px] uppercase tracking-[0.15em] font-medium transition-all ${
                perspective === "creator"
                  ? "bg-[#c5a059] text-black font-semibold shadow-sm"
                  : "text-[#f5f2ed]/60 hover:text-[#f5f2ed]"
              }`}
            >
              <UserCheck className="h-3 w-3" />
              Creator Portal
            </button>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab("directory")}
            className={`flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-[10px] uppercase tracking-[0.18em] font-medium transition-all ${
              activeTab === "directory"
                ? "border border-[#c5a059] bg-[#c5a059]/10 text-[#c5a059]"
                : "text-[#f5f2ed]/60 hover:text-[#f5f2ed] border border-transparent"
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-[#c5a059]" />
            <span className="hidden sm:inline">Directory</span>
          </button>

          <button
            onClick={() => setActiveTab("requests")}
            className={`flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-[10px] uppercase tracking-[0.18em] font-medium transition-all relative ${
              activeTab === "requests"
                ? "border border-[#c5a059] bg-[#c5a059]/10 text-[#c5a059]"
                : "text-[#f5f2ed]/60 hover:text-[#f5f2ed] border border-transparent"
            }`}
          >
            <Inbox className="h-3.5 w-3.5 text-[#c5a059]" />
            <span>Requests</span>
            {pendingRequestsCount > 0 && (
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-black">
                {pendingRequestsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("decision-engine")}
            className={`flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-[10px] uppercase tracking-[0.18em] font-medium transition-all ${
              activeTab === "decision-engine"
                ? "border border-[#c5a059] bg-[#c5a059]/10 text-[#c5a059]"
                : "text-[#f5f2ed]/60 hover:text-[#f5f2ed] border border-transparent"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-[#c5a059]" />
            <span className="hidden md:inline">AI</span> Engine
          </button>

          <button
            onClick={() => setActiveTab("deal-room")}
            className={`flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-[10px] uppercase tracking-[0.18em] font-medium transition-all relative ${
              activeTab === "deal-room"
                ? "border border-[#c5a059] bg-[#c5a059]/10 text-[#c5a059]"
                : "text-[#f5f2ed]/60 hover:text-[#f5f2ed] border border-transparent"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-[#c5a059]" />
            <span>Deal Room</span>
            {activeDealsCount > 0 && (
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#c5a059] text-[9px] font-bold text-black">
                {activeDealsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("performance")}
            className={`flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-[10px] uppercase tracking-[0.18em] font-medium transition-all ${
              activeTab === "performance"
                ? "border border-[#c5a059] bg-[#c5a059]/10 text-[#c5a059]"
                : "text-[#f5f2ed]/60 hover:text-[#f5f2ed] border border-transparent"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5 text-[#c5a059]" />
            <span>KPI Tracker</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("creator-portal");
              setPerspective("creator");
            }}
            className={`flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-[10px] uppercase tracking-[0.18em] font-medium transition-all ${
              activeTab === "creator-portal"
                ? "border border-[#c5a059] bg-[#c5a059]/10 text-[#c5a059]"
                : "text-[#f5f2ed]/60 hover:text-[#f5f2ed] border border-transparent"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5 text-[#c5a059]" />
            <span className="hidden md:inline">Availability &</span> Rates
          </button>
        </nav>

        {/* Action Controls & Integrations */}
        <div className="flex items-center gap-3">
          {/* Add Creator Button - Exact theme button style */}
          <button
            onClick={onOpenAddCreatorModal}
            className="flex items-center gap-1.5 rounded-sm border border-[#c5a059] px-4 py-2 text-[10px] uppercase tracking-widest text-[#c5a059] transition-all hover:bg-[#c5a059] hover:text-black font-medium"
            title="Add or import verified YouTube creator"
          >
            <Plus className="h-3 w-3" />
            <span className="hidden sm:inline">Add Creator</span>
          </button>

          {/* Supabase Storage Integration Badge & Trigger */}
          <button
            onClick={onOpenSupabaseModal}
            className={`flex items-center gap-1.5 rounded-sm border px-3 py-2 text-[10px] uppercase tracking-wider font-medium transition-all ${
              supabaseConfig.isConnected
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                : "border-white/10 bg-[#0a0a0a] text-[#f5f2ed]/60 hover:border-white/20 hover:text-[#f5f2ed]"
            }`}
          >
            <Database className="h-3.5 w-3.5 text-[#3ECF8E]" />
            <span className="hidden sm:inline">Supabase</span>
            {supabaseConfig.isConnected ? (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ) : (
              <span className="text-[9px] text-[#f5f2ed]/40">Sync</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
