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
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { SupabaseConfigState } from "../types";

export type NavTabType =
  | "landing"
  | "directory"
  | "decision-engine"
  | "deal-room"
  | "creator-portal"
  | "requests"
  | "performance"
  | "database";

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

  const handleDownloadCsv = () => {
    window.location.href = "/api/creators/export-csv";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0A0A0A]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Monogram - Ultra-Modern Typography */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => setActiveTab("landing")}
            className="flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-90 group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#6C5CE7] to-[#5B21B6] text-xs font-bold text-white shadow-md shadow-[#6C5CE7]/30 group-hover:scale-105 transition-transform">
              C
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                CIPHER<span className="text-[#6C5CE7]">COLLAB</span>
              </div>
              <p className="text-[9px] uppercase tracking-[0.2em] font-medium text-[#A1A1AA] -mt-0.5">
                Institutional Infrastructure
              </p>
            </div>
          </div>

          {/* Perspective Switcher */}
          <div className="hidden lg:flex items-center rounded-lg border border-white/10 bg-black/40 p-0.5">
            <button
              onClick={() => {
                setPerspective("brand");
                if (activeTab === "creator-portal") setActiveTab("directory");
              }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
                perspective === "brand"
                  ? "bg-[#6C5CE7] text-white shadow-sm"
                  : "text-[#A1A1AA] hover:text-white"
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              Brand Engine
            </button>
            <button
              onClick={() => {
                setPerspective("creator");
                setActiveTab("creator-portal");
              }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
                perspective === "creator"
                  ? "bg-[#6C5CE7] text-white shadow-sm"
                  : "text-[#A1A1AA] hover:text-white"
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              Creator Portal
            </button>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab("landing")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
              activeTab === "landing"
                ? "bg-[#6C5CE7]/15 text-[#6C5CE7] border border-[#6C5CE7]/40 shadow-sm"
                : "text-[#A1A1AA] hover:text-white border border-transparent"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab("directory")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
              activeTab === "directory"
                ? "bg-[#6C5CE7]/15 text-[#6C5CE7] border border-[#6C5CE7]/40 shadow-sm"
                : "text-[#A1A1AA] hover:text-white border border-transparent"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Directory</span>
          </button>

          <button
            onClick={() => setActiveTab("requests")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all relative ${
              activeTab === "requests"
                ? "bg-[#6C5CE7]/15 text-[#6C5CE7] border border-[#6C5CE7]/40 shadow-sm"
                : "text-[#A1A1AA] hover:text-white border border-transparent"
            }`}
          >
            <Inbox className="h-3.5 w-3.5" />
            <span>Requests</span>
            {pendingRequestsCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#6C5CE7] text-[10px] font-bold text-white">
                {pendingRequestsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("decision-engine")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
              activeTab === "decision-engine"
                ? "bg-[#6C5CE7]/15 text-[#6C5CE7] border border-[#6C5CE7]/40 shadow-sm"
                : "text-[#A1A1AA] hover:text-white border border-transparent"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Decision</span> Engine
          </button>

          <button
            onClick={() => setActiveTab("deal-room")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all relative ${
              activeTab === "deal-room"
                ? "bg-[#6C5CE7]/15 text-[#6C5CE7] border border-[#6C5CE7]/40 shadow-sm"
                : "text-[#A1A1AA] hover:text-white border border-transparent"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Deal Room</span>
            {activeDealsCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#6C5CE7] text-[10px] font-bold text-white">
                {activeDealsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("performance")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
              activeTab === "performance"
                ? "bg-[#6C5CE7]/15 text-[#6C5CE7] border border-[#6C5CE7]/40 shadow-sm"
                : "text-[#A1A1AA] hover:text-white border border-transparent"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>KPI Tracker</span>
          </button>

          <button
            onClick={() => setActiveTab("database")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all relative ${
              activeTab === "database"
                ? "bg-[#3ECF8E]/15 text-[#3ECF8E] border border-[#3ECF8E]/40"
                : "text-[#A1A1AA] hover:text-white border border-transparent"
            }`}
            title="View PostgreSQL Relational Tables in Supabase"
          >
            <Database className="h-3.5 w-3.5 text-[#3ECF8E]" />
            <span className="hidden lg:inline font-semibold">Supabase</span>
            <span className="flex h-4 px-1 items-center justify-center rounded-full bg-[#3ECF8E]/20 text-[#3ECF8E] text-[10px] font-bold">
              4
            </span>
          </button>
        </nav>

        {/* Action Controls & Integrations */}
        <div className="flex items-center gap-2.5">
          {/* Download CSV Dataset Button */}
          <button
            onClick={handleDownloadCsv}
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/90 hover:bg-white/10 hover:border-[#6C5CE7]/40 transition-all"
            title="Download CSV file with all 24 YouTube creators & analytics"
          >
            <Download className="h-3.5 w-3.5 text-[#6C5CE7]" />
            <span className="hidden md:inline">Export CSV</span>
          </button>

          {/* Add Creator Button */}
          <button
            onClick={onOpenAddCreatorModal}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#5B21B6] px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-[#6C5CE7]/25 hover:shadow-[#6C5CE7]/40 transition-all"
            title="Add or import verified YouTube creator"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add Creator</span>
          </button>
        </div>
      </div>
    </header>
  );
};
