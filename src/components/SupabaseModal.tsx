import React, { useState, useEffect } from "react";
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  Download,
  Upload,
  Layers,
  Key,
  Youtube,
  Cloud,
  Check,
} from "lucide-react";
import { SupabaseConfigState, Creator, CollaborationDeal, CollaborationRequest, CampaignKPI } from "../types";
import {
  getSupabaseSQLMigration,
  testSupabaseConnection,
  syncToSupabase,
  pullFromSupabase,
} from "../lib/supabaseClient";
import {
  getStoredYouTubeKey,
  saveStoredYouTubeKey,
  testYouTubeKey,
} from "../lib/youtubeClient";

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SupabaseConfigState;
  onSaveConfig: (url: string, key: string) => void;
  creators: Creator[];
  deals: CollaborationDeal[];
  requests?: CollaborationRequest[];
  campaigns?: CampaignKPI[];
  onDataImported?: (creators: Creator[], deals: CollaborationDeal[]) => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  creators,
  deals,
  requests = [],
  campaigns = [],
  onDataImported,
}) => {
  const [activeTab, setActiveTab] = useState<"supabase" | "youtube">("supabase");

  // Supabase State
  const [url, setUrl] = useState(config.url || "");
  const [key, setKey] = useState(config.anonKey || "");
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // YouTube State
  const [ytKey, setYtKey] = useState("");
  const [isTestingYt, setIsTestingYt] = useState(false);
  const [ytTestResult, setYtTestResult] = useState<{ success: boolean; message: string; channelSample?: string } | null>(null);

  useEffect(() => {
    setUrl(config.url || "");
    setKey(config.anonKey || "");
    setYtKey(getStoredYouTubeKey());
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleTestAndSaveSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setTestResult(null);

    const res = await testSupabaseConnection(url, key);
    setIsTesting(false);
    setTestResult(res);

    if (res.success) {
      onSaveConfig(url, key);
    }
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    const res = await syncToSupabase(creators, deals, requests, campaigns);
    setIsSyncing(false);
    setSyncResult(res);
  };

  const handlePullFromCloud = async () => {
    setIsPulling(true);
    setSyncResult(null);
    const res = await pullFromSupabase();
    setIsPulling(false);
    if (res.success && res.creators && onDataImported) {
      onDataImported(res.creators, res.deals || []);
      setSyncResult({
        success: true,
        message: `Successfully imported ${res.creators.length} creators and ${res.deals?.length || 0} deals from Supabase!`,
      });
    } else {
      setSyncResult({
        success: false,
        message: res.message || "Failed to load data from Supabase.",
      });
    }
  };

  const handleSaveYouTubeKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTestingYt(true);
    setYtTestResult(null);

    const res = await testYouTubeKey(ytKey);
    setIsTestingYt(false);
    setYtTestResult(res);

    if (res.success) {
      saveStoredYouTubeKey(ytKey);
    }
  };

  const handleCopySql = () => {
    const sql = getSupabaseSQLMigration();
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleExportJson = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      creators,
      deals,
      requests,
      campaigns,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `ciphercollab-database-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(blobUrl);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.creators && onDataImported) {
          onDataImported(parsed.creators, parsed.deals || []);
          alert("Database backup restored successfully!");
        }
      } catch (err) {
        alert("Failed to parse JSON database backup file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative my-8 w-full max-w-2xl overflow-hidden rounded-sm border border-white/10 bg-[#0a0a0a] p-6 text-xs text-[#f5f2ed] shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#c5a059]/30 bg-[#c5a059]/10 text-[#c5a059]">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-light text-[#f5f2ed] tracking-tight">
                Data & API Integrations
              </h3>
              <p className="text-[10px] uppercase tracking-wider text-white/40 mt-0.5">
                Connect Supabase PostgreSQL & Google YouTube Data API v3
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-sm p-1 text-white/40 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 gap-6">
          <button
            onClick={() => setActiveTab("supabase")}
            className={`flex items-center gap-2 pb-3 text-xs uppercase tracking-widest font-medium transition-colors relative ${
              activeTab === "supabase" ? "text-[#c5a059]" : "text-white/40 hover:text-white/70"
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            <span>Supabase Database</span>
            {config.isConnected && (
              <span className="h-1.5 w-1.5 rounded-full bg-[#00ff88]" />
            )}
            {activeTab === "supabase" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#c5a059]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("youtube")}
            className={`flex items-center gap-2 pb-3 text-xs uppercase tracking-widest font-medium transition-colors relative ${
              activeTab === "youtube" ? "text-[#c5a059]" : "text-white/40 hover:text-white/70"
            }`}
          >
            <Youtube className="h-3.5 w-3.5 text-red-400" />
            <span>YouTube Data API v3</span>
            {Boolean(ytKey) && (
              <span className="h-1.5 w-1.5 rounded-full bg-[#00ff88]" />
            )}
            {activeTab === "youtube" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#c5a059]" />
            )}
          </button>
        </div>

        {/* TAB 1: SUPABASE */}
        {activeTab === "supabase" && (
          <div className="space-y-5">
            {/* Supabase Credentials Form */}
            <form onSubmit={handleTestAndSaveSupabase} className="space-y-4 rounded-sm border border-white/10 bg-[#050505] p-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/60">
                  Supabase Project Configuration
                </span>
                {config.isConnected ? (
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#00ff88]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Connected & Verified
                  </span>
                ) : (
                  <span className="text-[10px] uppercase tracking-wider text-amber-400">
                    Local Cache Active (Awaiting Credentials)
                  </span>
                )}
              </div>

              <div>
                <label className="block text-[9px] font-medium text-white/40 uppercase tracking-widest">
                  Project URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://xyzcompany.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="mt-1 w-full rounded-sm border border-white/10 bg-[#0a0a0a] px-3.5 py-2 font-mono text-xs text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-medium text-white/40 uppercase tracking-widest">
                  Public Anon / Publishable API Key
                </label>
                <input
                  type="password"
                  required
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="mt-1 w-full rounded-sm border border-white/10 bg-[#0a0a0a] px-3.5 py-2 font-mono text-xs text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isTesting}
                  className="flex-1 rounded-sm border border-[#c5a059] bg-[#c5a059] py-2.5 text-[10px] uppercase tracking-widest font-semibold text-black transition-all hover:bg-[#d5b069] disabled:opacity-50"
                >
                  {isTesting ? "Testing Connection..." : "Verify & Save Credentials"}
                </button>

                {config.isConnected && (
                  <>
                    <button
                      type="button"
                      disabled={isSyncing}
                      onClick={handleSyncNow}
                      className="flex items-center justify-center gap-1.5 rounded-sm border border-[#00ff88]/30 bg-[#00ff88]/10 px-4 py-2.5 text-[10px] uppercase tracking-widest font-medium text-[#00ff88] hover:bg-[#00ff88]/20 disabled:opacity-50"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                      <span>Sync {creators.length} Creators</span>
                    </button>

                    <button
                      type="button"
                      disabled={isPulling}
                      onClick={handlePullFromCloud}
                      className="flex items-center justify-center gap-1.5 rounded-sm border border-white/20 bg-white/5 px-4 py-2.5 text-[10px] uppercase tracking-widest font-medium text-white/80 hover:bg-white/10 disabled:opacity-50"
                    >
                      <Cloud className={`h-3.5 w-3.5 ${isPulling ? "animate-spin" : ""}`} />
                      <span>Pull Cloud Data</span>
                    </button>
                  </>
                )}
              </div>

              {testResult && (
                <div
                  className={`rounded-sm p-3 text-xs ${
                    testResult.success
                      ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border border-red-500/30 bg-red-500/10 text-red-300"
                  }`}
                >
                  {testResult.message}
                </div>
              )}

              {syncResult && (
                <div
                  className={`rounded-sm p-3 text-xs ${
                    syncResult.success
                      ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border border-amber-500/30 bg-amber-500/10 text-amber-300"
                  }`}
                >
                  {syncResult.message}
                </div>
              )}
            </form>

            {/* Database SQL Migration Script */}
            <div className="rounded-sm border border-white/10 bg-[#050505] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-base font-light text-[#f5f2ed]">Supabase SQL Schema Migration</h4>
                  <p className="text-[10px] uppercase tracking-wider text-white/40 mt-0.5">
                    Execute this SQL script in Supabase SQL Editor to initialize the 4 relational tables (creators, collaborations, requests, campaign_kpis).
                  </p>
                </div>
                <button
                  onClick={handleCopySql}
                  className="flex items-center gap-1.5 rounded-sm border border-white/10 bg-[#0a0a0a] px-3 py-1.5 text-[10px] uppercase tracking-widest font-medium text-[#c5a059] transition-colors hover:border-[#c5a059]"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{copiedSql ? "Copied SQL!" : "Copy SQL Script"}</span>
                </button>
              </div>

              <div className="max-h-40 overflow-y-auto rounded-sm border border-white/10 bg-[#0a0a0a] p-3 font-mono text-[10px] text-white/60">
                <pre>{getSupabaseSQLMigration()}</pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: YOUTUBE DATA API */}
        {activeTab === "youtube" && (
          <div className="space-y-5">
            <form onSubmit={handleSaveYouTubeKey} className="space-y-4 rounded-sm border border-white/10 bg-[#050505] p-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/60">
                  Google YouTube Data API v3 Key
                </span>
                <span className="text-[10px] uppercase tracking-wider text-white/40">
                  Google Cloud Console
                </span>
              </div>

              <p className="text-[11px] text-white/60 leading-relaxed">
                Connect your YouTube Data API v3 key to enable live channel discovery, live subscriber analytics, and automated view-delivery tracking for campaign KPIs.
              </p>

              <div>
                <label className="block text-[9px] font-medium text-white/40 uppercase tracking-widest">
                  API Key (AIzaSy...)
                </label>
                <input
                  type="password"
                  required
                  placeholder="AIzaSyA_..."
                  value={ytKey}
                  onChange={(e) => setYtKey(e.target.value)}
                  className="mt-1 w-full rounded-sm border border-white/10 bg-[#0a0a0a] px-3.5 py-2 font-mono text-xs text-[#f5f2ed] focus:border-[#c5a059] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isTestingYt}
                  className="flex-1 rounded-sm border border-[#c5a059] bg-[#c5a059] py-2.5 text-[10px] uppercase tracking-widest font-semibold text-black transition-all hover:bg-[#d5b069] disabled:opacity-50"
                >
                  {isTestingYt ? "Verifying with Google API..." : "Verify & Save YouTube Key"}
                </button>
              </div>

              {ytTestResult && (
                <div
                  className={`rounded-sm p-3 text-xs ${
                    ytTestResult.success
                      ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border border-red-500/30 bg-red-500/10 text-red-300"
                  }`}
                >
                  <p>{ytTestResult.message}</p>
                  {ytTestResult.channelSample && (
                    <p className="text-[10px] text-emerald-400/80 mt-1">
                      Live probe returned verified channel: <span className="font-semibold">{ytTestResult.channelSample}</span>
                    </p>
                  )}
                </div>
              )}
            </form>

            <div className="rounded-sm border border-white/10 bg-[#050505] p-5 space-y-3">
              <h4 className="font-serif text-base font-light text-[#f5f2ed]">YouTube API Live Integration Capabilities</h4>
              <ul className="space-y-2 text-xs text-white/60">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#c5a059]" />
                  <span>Real-time channel searches filtered for creators with 10k+ subscribers</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#c5a059]" />
                  <span>Automatic video stats refresh in the Campaign Performance Dashboard</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#c5a059]" />
                  <span>Standardized CPM valuation and fair pricing calculations</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Local JSON Backup & Restore Footer */}
        <div className="flex items-center justify-between rounded-sm border border-white/10 bg-[#050505] p-4">
          <div>
            <div className="font-serif text-sm font-light text-[#f5f2ed]">Local State Repository</div>
            <div className="text-[10px] uppercase tracking-wider text-white/40 mt-0.5">
              Indexing {creators.length} verified creators, {deals.length} deals, and {requests.length} requests.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 rounded-sm border border-white/10 bg-[#0a0a0a] px-3 py-1.5 text-[10px] uppercase tracking-widest text-white/70 hover:border-[#c5a059] hover:text-[#c5a059]"
            >
              <Download className="h-3.5 w-3.5 text-[#c5a059]" />
              <span>Export JSON</span>
            </button>

            <label className="flex items-center gap-1.5 cursor-pointer rounded-sm border border-white/10 bg-[#0a0a0a] px-3 py-1.5 text-[10px] uppercase tracking-widest text-white/70 hover:border-[#c5a059] hover:text-[#c5a059]">
              <Upload className="h-3.5 w-3.5 text-[#c5a059]" />
              <span>Import JSON</span>
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
