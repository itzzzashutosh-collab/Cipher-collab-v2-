import React, { useState } from "react";
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
} from "lucide-react";
import { SupabaseConfigState, Creator, CollaborationDeal } from "../types";
import { getSupabaseSQLMigration, testSupabaseConnection, syncToSupabase } from "../lib/supabaseClient";

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SupabaseConfigState;
  onSaveConfig: (url: string, key: string) => void;
  creators: Creator[];
  deals: CollaborationDeal[];
  onDataImported?: (creators: Creator[], deals: CollaborationDeal[]) => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  creators,
  deals,
  onDataImported,
}) => {
  const [url, setUrl] = useState(config.url || "");
  const [key, setKey] = useState(config.anonKey || "");
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
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
    const res = await syncToSupabase(creators, deals);
    setIsSyncing(false);
    setSyncResult(res);
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
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `ciphercollab-backup-${new Date().toISOString().split("T")[0]}.json`;
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
          alert("Data backup successfully restored!");
        }
      } catch (err) {
        alert("Failed to parse JSON file.");
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
                Supabase Cloud Persistence & SQL Migration
              </h3>
              <p className="text-[10px] uppercase tracking-wider text-white/40 mt-0.5">
                Store verified creator intelligence and active milestone contracts in Postgres
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-sm p-1 text-white/40 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleTestAndSave} className="space-y-4 rounded-sm border border-white/10 bg-[#050505] p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/60">Supabase Project Credentials</span>
            {config.isConnected ? (
              <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#00ff88]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Connected & Synchronized
              </span>
            ) : (
              <span className="text-[10px] uppercase tracking-wider text-amber-400">Not Connected (Local State Active)</span>
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

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isTesting}
              className="flex-1 rounded-sm border border-[#c5a059] bg-[#c5a059] py-2.5 text-[10px] uppercase tracking-widest font-semibold text-black transition-all hover:bg-[#d5b069] disabled:opacity-50"
            >
              {isTesting ? "Testing Connection..." : "Save & Verify Connection"}
            </button>

            {config.isConnected && (
              <button
                type="button"
                disabled={isSyncing}
                onClick={handleSyncNow}
                className="flex items-center justify-center gap-1.5 rounded-sm border border-[#00ff88]/30 bg-[#00ff88]/10 px-4 py-2.5 text-[10px] uppercase tracking-widest font-medium text-[#00ff88] hover:bg-[#00ff88]/20 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                <span>Sync to Cloud</span>
              </button>
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
                Run this script in your Supabase SQL Editor to initialize tables for creators and deals.
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

        {/* Local JSON Backup & Restore */}
        <div className="flex items-center justify-between rounded-sm border border-white/10 bg-[#050505] p-4">
          <div>
            <div className="font-serif text-sm font-light text-[#f5f2ed]">Local State Storage</div>
            <div className="text-[10px] uppercase tracking-wider text-white/40 mt-0.5">
              Currently indexing {creators.length} verified creators and {deals.length} active collaborations.
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
