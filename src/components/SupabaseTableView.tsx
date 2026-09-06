import React, { useState, useMemo } from "react";
import {
  Database,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  Copy,
  Check,
  Search,
  Filter,
  Eye,
  ExternalLink,
  Code,
  Table as TableIcon,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Calendar,
  DollarSign,
  TrendingUp,
  X,
  FileJson,
  Key,
} from "lucide-react";
import {
  Creator,
  CollaborationDeal,
  CollaborationRequest,
  CampaignKPI,
  SupabaseConfigState,
} from "../types";
import {
  getSupabaseSQLMigration,
  getSupabaseFullSeedSQL,
  pushAllDataToSupabase,
  pullFromSupabase,
  testSupabaseConnection,
  fetchSupabaseTablesStatus,
  executeSupabaseMigration,
} from "../lib/supabaseClient";

interface SupabaseTableViewProps {
  creators: Creator[];
  deals: CollaborationDeal[];
  requests: CollaborationRequest[];
  campaigns: CampaignKPI[];
  config: SupabaseConfigState;
  onSaveConfig: (url: string, key: string) => void;
  onDataImported?: (creators: Creator[], deals: CollaborationDeal[]) => void;
  onUpdateRequestStatus?: (id: string, status: "Pending" | "Accepted" | "Declined") => void;
  onOpenCollabDeal?: (dealId: string) => void;
}

type ActiveTable = "creators" | "collaborations" | "deals" | "requests" | "kpis" | "sql";

export const SupabaseTableView: React.FC<SupabaseTableViewProps> = ({
  creators,
  deals,
  requests,
  campaigns,
  config,
  onSaveConfig,
  onDataImported,
}) => {
  const [activeTable, setActiveTable] = useState<ActiveTable>("creators");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<{
    table: string;
    id: string;
    data: any;
  } | null>(null);

  // Sync / Push state
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [pushStatus, setPushStatus] = useState<{
    step: string;
    success?: boolean;
    message?: string;
  } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedMigrationSql, setCopiedMigrationSql] = useState(false);
  const [sqlMode, setSqlMode] = useState<"migration" | "seed">("migration");
  const [showConfigDrawer, setShowConfigDrawer] = useState(!config.isConnected);

  // Table Verification & Direct Migration state
  const [tableStatus, setTableStatus] = useState<Record<string, { exists: boolean; count: number; error?: string }> | null>(null);
  const [isCheckingTables, setIsCheckingTables] = useState(false);
  const [pgConnString, setPgConnString] = useState("");
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{ success: boolean; message: string } | null>(null);

  // Inline Quick Config state
  const [urlInput, setUrlInput] = useState(config.url || "");
  const [keyInput, setKeyInput] = useState(config.anonKey || "");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectMessage, setConnectMessage] = useState<{ success: boolean; text: string } | null>(
    null
  );

  const totalRowCount =
    creators.length + deals.length + requests.length + campaigns.length;

  const handleCheckTables = async () => {
    setIsCheckingTables(true);
    try {
      const res = await fetchSupabaseTablesStatus();
      setTableStatus(res.tables);
    } catch (err) {
      console.warn("Table verification failed:", err);
    } finally {
      setIsCheckingTables(false);
    }
  };

  React.useEffect(() => {
    handleCheckTables();
  }, []);

  const handleExecuteMigration = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsMigrating(true);
    setMigrationResult(null);
    try {
      const res = await executeSupabaseMigration(pgConnString);
      setIsMigrating(false);
      setMigrationResult({ success: res.success, message: res.message });
      if (res.tableVerification) {
        setTableStatus(res.tableVerification);
      } else {
        handleCheckTables();
      }
    } catch (err: any) {
      setIsMigrating(false);
      setMigrationResult({ success: false, message: err.message || "Failed to execute migration." });
    }
  };

  const handleConnectAndSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsConnecting(true);
    setConnectMessage(null);

    const testRes = await testSupabaseConnection(urlInput, keyInput);
    setIsConnecting(false);

    if (testRes.success) {
      onSaveConfig(urlInput, keyInput);
      setConnectMessage({
        success: true,
        text: "Connected to Supabase! Ready to synchronize data.",
      });
      setShowConfigDrawer(false);
    } else {
      setConnectMessage({
        success: false,
        text: testRes.message || "Failed to connect to Supabase. Check URL & Key.",
      });
    }
  };

  const handlePushAllData = async () => {
    setIsPushing(true);
    setPushStatus({
      step: `Packaging ${creators.length} creators, ${deals.length} deals, ${requests.length} requests, ${campaigns.length} KPIs...`,
    });

    try {
      const res = await pushAllDataToSupabase(
        creators,
        deals,
        requests,
        campaigns,
        urlInput || config.url,
        keyInput || config.anonKey
      );

      setIsPushing(false);
      if (res.success) {
        setPushStatus({
          step: "Complete",
          success: true,
          message: `Successfully synchronized all ${totalRowCount} records to Supabase!`,
        });
      } else {
        setPushStatus({
          step: "Notice",
          success: false,
          message: res.message || "Could not push to Supabase. Stored in staged local repository.",
        });
      }
    } catch (err: any) {
      setIsPushing(false);
      setPushStatus({
        step: "Failed",
        success: false,
        message: err.message || "Network error while syncing data to Supabase.",
      });
    }
  };

  const handlePullCloudData = async () => {
    setIsPulling(true);
    setPushStatus(null);
    try {
      const res = await pullFromSupabase();
      setIsPulling(false);
      if (res.success && res.creators && onDataImported) {
        onDataImported(res.creators, res.deals || []);
        setPushStatus({
          step: "Pull Successful",
          success: true,
          message: `Refreshed ${res.creators.length} creators and ${res.deals?.length || 0} deals from Supabase!`,
        });
      } else {
        setPushStatus({
          step: "Pull Notice",
          success: false,
          message: res.message || "No external records retrieved.",
        });
      }
    } catch (err: any) {
      setIsPulling(false);
      setPushStatus({
        step: "Pull Failed",
        success: false,
        message: err.message || "Error pulling records from Supabase.",
      });
    }
  };

  const handleCopyFullSeedSql = () => {
    const fullSql = getSupabaseFullSeedSQL(creators, deals, requests, campaigns);
    navigator.clipboard.writeText(fullSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // Filtered rows for each table
  const filteredCreators = useMemo(() => {
    if (!searchQuery) return creators;
    const q = searchQuery.toLowerCase();
    return creators.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.handle.toLowerCase().includes(q) ||
        c.niche.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
    );
  }, [creators, searchQuery]);

  const filteredDeals = useMemo(() => {
    if (!searchQuery) return deals;
    const q = searchQuery.toLowerCase();
    return deals.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.brandName.toLowerCase().includes(q) ||
        d.dealType.toLowerCase().includes(q) ||
        d.status.toLowerCase().includes(q)
    );
  }, [deals, searchQuery]);

  const filteredRequests = useMemo(() => {
    if (!searchQuery) return requests;
    const q = searchQuery.toLowerCase();
    return requests.filter(
      (r) =>
        r.brandName.toLowerCase().includes(q) ||
        r.campaignTitle.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
    );
  }, [requests, searchQuery]);

  const filteredKpis = useMemo(() => {
    if (!searchQuery) return campaigns;
    const q = searchQuery.toLowerCase();
    return campaigns.filter(
      (k) =>
        k.campaignName.toLowerCase().includes(q) ||
        k.creatorName.toLowerCase().includes(q) ||
        k.platform.toLowerCase().includes(q)
    );
  }, [campaigns, searchQuery]);

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-sm border border-white/10 bg-[#0a0a0a] p-6 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-[#3ECF8E]/30 bg-[#3ECF8E]/10 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#3ECF8E]">
                <Database className="h-3 w-3" />
                PostgreSQL Relational Schema
              </span>
              <span className="text-[10px] uppercase tracking-wider text-white/40">
                {totalRowCount} Total Database Rows Loaded
              </span>
            </div>

            <h1 className="font-serif text-3xl font-light tracking-tight text-[#f5f2ed] sm:text-4xl">
              Supabase Tables & Live Data Explorer
            </h1>
            <p className="max-w-2xl text-xs leading-relaxed text-white/60">
              Interactive cloud database inspector for CipherCollab. View, filter, and synchronize the four core relational tables:{" "}
              <code className="rounded bg-white/5 px-1 py-0.5 text-[#c5a059]">public.creators</code>,{" "}
              <code className="rounded bg-white/5 px-1 py-0.5 text-[#c5a059]">public.collaborations</code>,{" "}
              <code className="rounded bg-white/5 px-1 py-0.5 text-[#c5a059]">public.collaboration_requests</code>, and{" "}
              <code className="rounded bg-white/5 px-1 py-0.5 text-[#c5a059]">public.campaign_kpis</code>.
            </p>
          </div>

          {/* High Impact Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handlePushAllData}
              disabled={isPushing}
              className="flex items-center gap-2 rounded-sm border border-[#3ECF8E] bg-[#3ECF8E] px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-black shadow-lg shadow-[#3ECF8E]/10 transition-all hover:bg-[#4ee59f] hover:shadow-[#3ECF8E]/20 disabled:opacity-50"
            >
              <UploadCloud className={`h-4 w-4 ${isPushing ? "animate-bounce" : ""}`} />
              <span>{isPushing ? "Pushing Data..." : "Push All Data to Supabase"}</span>
            </button>

            <button
              onClick={handlePullCloudData}
              disabled={isPulling}
              className="flex items-center gap-2 rounded-sm border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-medium uppercase tracking-widest text-white/90 transition-all hover:border-[#c5a059] hover:bg-white/10 hover:text-[#c5a059] disabled:opacity-50"
            >
              <DownloadCloud className={`h-4 w-4 ${isPulling ? "animate-spin" : ""}`} />
              <span>Pull Cloud Data</span>
            </button>

            <button
              onClick={handleCopyFullSeedSql}
              className="flex items-center gap-2 rounded-sm border border-[#c5a059]/40 bg-[#c5a059]/10 px-4 py-2.5 text-xs font-medium uppercase tracking-widest text-[#c5a059] transition-all hover:bg-[#c5a059]/20"
            >
              {copiedSql ? (
                <>
                  <Check className="h-4 w-4 text-[#00ff88]" />
                  <span>Copied All SQL!</span>
                </>
              ) : (
                <>
                  <Code className="h-4 w-4" />
                  <span>Copy SQL Seed</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sync Status Banner */}
        {pushStatus && (
          <div
            className={`mt-6 flex items-center justify-between rounded-sm border p-4 text-xs ${
              pushStatus.success
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                : "border-amber-500/30 bg-amber-500/10 text-amber-200"
            }`}
          >
            <div className="flex items-center gap-3">
              {pushStatus.success ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-400" />
              )}
              <div>
                <p className="font-semibold">{pushStatus.step}</p>
                {pushStatus.message && <p className="text-[11px] opacity-80">{pushStatus.message}</p>}
              </div>
            </div>

            <button
              onClick={() => setPushStatus(null)}
              className="rounded p-1 text-white/40 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Quick Connection Bar / Toggle */}
        <div className="mt-6 border-t border-white/10 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  config.isConnected ? "bg-[#00ff88] shadow-sm shadow-[#00ff88]" : "bg-amber-400"
                }`}
              />
              <span className="text-xs text-white/80">
                Connection Status:{" "}
                <strong className={config.isConnected ? "text-[#00ff88]" : "text-amber-400"}>
                  {config.isConnected
                    ? `Connected to Supabase (${config.url.replace(/^https?:\/\//, "").split(".")[0]})`
                    : "Local Staged Store Active (Enter credentials below to connect remote project)"}
                </strong>
              </span>
            </div>

            <button
              onClick={() => setShowConfigDrawer(!showConfigDrawer)}
              className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#c5a059] hover:underline"
            >
              <Key className="h-3.5 w-3.5" />
              <span>{showConfigDrawer ? "Hide Supabase Settings" : "Configure Supabase Credentials"}</span>
            </button>
          </div>

          {/* Expandable Credentials Drawer */}
          {showConfigDrawer && (
            <form
              onSubmit={handleConnectAndSave}
              className="mt-4 grid grid-cols-1 gap-3 rounded-sm border border-white/10 bg-[#050505] p-4 sm:grid-cols-12 sm:items-end"
            >
              <div className="sm:col-span-5">
                <label className="block text-[9px] uppercase tracking-widest text-white/40 font-medium">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  placeholder="https://xyzproject.supabase.co"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="mt-1 w-full rounded-sm border border-white/10 bg-[#0a0a0a] px-3 py-1.5 font-mono text-xs text-[#f5f2ed] focus:border-[#3ECF8E] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-5">
                <label className="block text-[9px] uppercase tracking-widest text-white/40 font-medium">
                  Public Anon / Service Key
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  className="mt-1 w-full rounded-sm border border-white/10 bg-[#0a0a0a] px-3 py-1.5 font-mono text-xs text-[#f5f2ed] focus:border-[#3ECF8E] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 flex gap-2">
                <button
                  type="submit"
                  disabled={isConnecting || !urlInput || !keyInput}
                  className="w-full rounded-sm border border-[#3ECF8E] bg-[#3ECF8E]/20 py-2 text-[10px] uppercase tracking-widest font-semibold text-[#3ECF8E] hover:bg-[#3ECF8E] hover:text-black transition-colors disabled:opacity-50"
                >
                  {isConnecting ? "Testing..." : "Save & Sync"}
                </button>
              </div>

              {connectMessage && (
                <div
                  className={`sm:col-span-12 text-xs p-2 rounded-sm ${
                    connectMessage.success ? "text-emerald-300" : "text-red-300"
                  }`}
                >
                  {connectMessage.text}
                </div>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Relational Table Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-2 gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTable("creators")}
            className={`flex items-center gap-2 rounded-sm px-4 py-2.5 text-xs font-medium uppercase tracking-widest transition-all ${
              activeTable === "creators"
                ? "border border-[#c5a059] bg-[#c5a059]/10 text-[#c5a059]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <TableIcon className="h-3.5 w-3.5" />
            <span>public.creators</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold">
              {creators.length}
            </span>
            {tableStatus?.creators?.exists && (
              <span className="h-2 w-2 rounded-full bg-[#00ff88]" title="Live on Supabase" />
            )}
          </button>

          <button
            onClick={() => setActiveTable("collaborations")}
            className={`flex items-center gap-2 rounded-sm px-4 py-2.5 text-xs font-medium uppercase tracking-widest transition-all ${
              activeTable === "collaborations" || activeTable === "deals"
                ? "border border-[#c5a059] bg-[#c5a059]/10 text-[#c5a059]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>public.deals</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold">
              {deals.length}
            </span>
            {(tableStatus?.deals?.exists || tableStatus?.collaborations?.exists) && (
              <span className="h-2 w-2 rounded-full bg-[#00ff88]" title="Live on Supabase" />
            )}
          </button>

          <button
            onClick={() => setActiveTable("requests")}
            className={`flex items-center gap-2 rounded-sm px-4 py-2.5 text-xs font-medium uppercase tracking-widest transition-all ${
              activeTable === "requests"
                ? "border border-[#c5a059] bg-[#c5a059]/10 text-[#c5a059]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>public.requests</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold">
              {requests.length}
            </span>
            {(tableStatus?.requests?.exists || tableStatus?.collaboration_requests?.exists) && (
              <span className="h-2 w-2 rounded-full bg-[#00ff88]" title="Live on Supabase" />
            )}
          </button>

          <button
            onClick={() => setActiveTable("kpis")}
            className={`flex items-center gap-2 rounded-sm px-4 py-2.5 text-xs font-medium uppercase tracking-widest transition-all ${
              activeTable === "kpis"
                ? "border border-[#c5a059] bg-[#c5a059]/10 text-[#c5a059]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>public.campaign_kpis</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold">
              {campaigns.length}
            </span>
            {tableStatus?.campaign_kpis?.exists && (
              <span className="h-2 w-2 rounded-full bg-[#00ff88]" title="Live on Supabase" />
            )}
          </button>

          <button
            onClick={() => setActiveTable("sql")}
            className={`flex items-center gap-2 rounded-sm px-4 py-2.5 text-xs font-medium uppercase tracking-widest transition-all ${
              activeTable === "sql"
                ? "border border-[#3ECF8E] bg-[#3ECF8E]/10 text-[#3ECF8E]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Code className="h-3.5 w-3.5 text-[#3ECF8E]" />
            <span>SQL Schema & Seed Studio</span>
          </button>
        </div>

        {/* Search Input */}
        {activeTable !== "sql" && (
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-white/40" />
            <input
              type="text"
              placeholder={`Search in ${activeTable}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-sm border border-white/10 bg-[#0a0a0a] py-2 pl-9 pr-3 text-xs text-[#f5f2ed] placeholder:text-white/40 focus:border-[#c5a059] focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* TABLE 1: public.creators */}
      {activeTable === "creators" && (
        <div className="overflow-hidden rounded-sm border border-white/10 bg-[#0a0a0a]">
          <div className="border-b border-white/10 bg-[#050505] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-white/60 uppercase tracking-widest">
                Table: <span className="text-[#3ECF8E] font-bold">public.creators</span>
              </span>
              <span className="text-[10px] rounded bg-white/5 px-2 py-0.5 text-white/40">
                Primary Key: id (text)
              </span>
            </div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider">
              Showing {filteredCreators.length} of {creators.length} verified creators
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-[#080808] text-[9px] uppercase tracking-widest text-white/40 font-mono">
                <tr>
                  <th className="py-3 px-4">id (UUID/Text)</th>
                  <th className="py-3 px-4">creator / handle</th>
                  <th className="py-3 px-4">niche</th>
                  <th className="py-3 px-4 text-right">subscribers</th>
                  <th className="py-3 px-4 text-right">views</th>
                  <th className="py-3 px-4 text-right">engagement</th>
                  <th className="py-3 px-4 text-center">score</th>
                  <th className="py-3 px-4 text-right">base rate (60s)</th>
                  <th className="py-3 px-4 text-center">actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                {filteredCreators.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-white/50">{c.id}</td>
                    <td className="py-3 px-4 font-sans font-medium text-[#f5f2ed]">
                      <div className="flex items-center gap-2">
                        <img
                          src={c.avatarUrl}
                          alt={c.name}
                          referrerPolicy="no-referrer"
                          className="h-6 w-6 rounded-full border border-white/10 object-cover"
                        />
                        <div>
                          <div>{c.name}</div>
                          <div className="text-[10px] text-white/40 font-mono">{c.handle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className="rounded-sm border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-[#c5a059]">
                        {c.niche}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-[#00ff88] font-semibold">
                      {(c.subscribers || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-white/70">
                      {(c.totalViews || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-[#c5a059]">
                      {c.engagementRate}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="rounded-full bg-[#c5a059]/20 px-2 py-0.5 text-[10px] font-bold text-[#c5a059]">
                        {c.cipherScore}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-white/90">
                      ${c.rateCard?.integration60s?.recommended?.toLocaleString() || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() =>
                          setSelectedRecord({
                            table: "creators",
                            id: c.id,
                            data: c,
                          })
                        }
                        className="flex items-center gap-1 mx-auto rounded-sm border border-white/10 bg-[#050505] px-2.5 py-1 text-[10px] text-white/70 hover:border-[#c5a059] hover:text-[#c5a059]"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Inspect JSONB</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLE 2: public.deals / public.collaborations */}
      {(activeTable === "collaborations" || activeTable === "deals") && (
        <div className="overflow-hidden rounded-sm border border-white/10 bg-[#0a0a0a]">
          <div className="border-b border-white/10 bg-[#050505] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-white/60 uppercase tracking-widest">
                Table: <span className="text-[#3ECF8E] font-bold">public.deals</span>
                <span className="text-white/40 ml-1.5 font-normal">(view: public.collaborations)</span>
              </span>
              <span className="text-[10px] rounded bg-white/5 px-2 py-0.5 text-white/40">
                PK: id | FK: creator_id -&gt; creators(id)
              </span>
            </div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider">
              Showing {filteredDeals.length} deal records
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-[#080808] text-[9px] uppercase tracking-widest text-white/40 font-mono">
                <tr>
                  <th className="py-3 px-4">id</th>
                  <th className="py-3 px-4">title</th>
                  <th className="py-3 px-4">brand</th>
                  <th className="py-3 px-4">creator_id</th>
                  <th className="py-3 px-4">deal_type</th>
                  <th className="py-3 px-4 text-right">compensation</th>
                  <th className="py-3 px-4 text-center">status</th>
                  <th className="py-3 px-4 text-center">milestones</th>
                  <th className="py-3 px-4 text-center">actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                {filteredDeals.map((d) => (
                  <tr key={d.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-white/50">{d.id}</td>
                    <td className="py-3 px-4 font-sans font-medium text-[#f5f2ed]">{d.title}</td>
                    <td className="py-3 px-4 font-sans text-white/80">{d.brandName}</td>
                    <td className="py-3 px-4 text-[#c5a059]">{d.creatorId}</td>
                    <td className="py-3 px-4 text-white/60">{d.dealType}</td>
                    <td className="py-3 px-4 text-right text-[#00ff88] font-semibold">
                      ${d.compensation?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`rounded-sm px-2 py-0.5 text-[10px] font-sans font-semibold ${
                          d.status === "Active" || d.status === "Draft"
                            ? "bg-[#c5a059]/20 text-[#c5a059]"
                            : d.status === "In Escrow"
                            ? "bg-blue-500/20 text-blue-300"
                            : "bg-emerald-500/20 text-emerald-300"
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-white/60">
                      {d.milestones?.length || 0} stages
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() =>
                          setSelectedRecord({
                            table: "collaborations",
                            id: d.id,
                            data: d,
                          })
                        }
                        className="flex items-center gap-1 mx-auto rounded-sm border border-white/10 bg-[#050505] px-2.5 py-1 text-[10px] text-white/70 hover:border-[#c5a059] hover:text-[#c5a059]"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLE 3: public.requests / public.collaboration_requests */}
      {activeTable === "requests" && (
        <div className="overflow-hidden rounded-sm border border-white/10 bg-[#0a0a0a]">
          <div className="border-b border-white/10 bg-[#050505] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-white/60 uppercase tracking-widest">
                Table: <span className="text-[#3ECF8E] font-bold">public.requests</span>
                <span className="text-white/40 ml-1.5 font-normal">(view: public.collaboration_requests)</span>
              </span>
              <span className="text-[10px] rounded bg-white/5 px-2 py-0.5 text-white/40">
                PK: id | FK: creator_id -&gt; creators(id), associated_deal_id -&gt; deals(id)
              </span>
            </div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider">
              Showing {filteredRequests.length} proposal records
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-[#080808] text-[9px] uppercase tracking-widest text-white/40 font-mono">
                <tr>
                  <th className="py-3 px-4">id</th>
                  <th className="py-3 px-4">brand_name</th>
                  <th className="py-3 px-4">campaign_title</th>
                  <th className="py-3 px-4">creator_id</th>
                  <th className="py-3 px-4 text-right">budget range</th>
                  <th className="py-3 px-4 text-center">status</th>
                  <th className="py-3 px-4">created_at</th>
                  <th className="py-3 px-4 text-center">actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                {filteredRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-white/50">{r.id}</td>
                    <td className="py-3 px-4 font-sans font-medium text-[#f5f2ed]">{r.brandName}</td>
                    <td className="py-3 px-4 font-sans text-white/80">{r.campaignTitle}</td>
                    <td className="py-3 px-4 text-[#c5a059]">{r.creatorId}</td>
                    <td className="py-3 px-4 text-right text-[#00ff88]">
                      ${r.proposedBudgetRange?.min?.toLocaleString()} - ${r.proposedBudgetRange?.max?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`rounded-sm px-2 py-0.5 text-[10px] font-sans font-semibold ${
                          r.status === "Pending"
                            ? "bg-amber-500/20 text-amber-300"
                            : r.status === "Accepted"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white/40">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "Recent"}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() =>
                          setSelectedRecord({
                            table: "collaboration_requests",
                            id: r.id,
                            data: r,
                          })
                        }
                        className="flex items-center gap-1 mx-auto rounded-sm border border-white/10 bg-[#050505] px-2.5 py-1 text-[10px] text-white/70 hover:border-[#c5a059] hover:text-[#c5a059]"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLE 4: public.campaign_kpis */}
      {activeTable === "kpis" && (
        <div className="overflow-hidden rounded-sm border border-white/10 bg-[#0a0a0a]">
          <div className="border-b border-white/10 bg-[#050505] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-white/60 uppercase tracking-widest">
                Table: <span className="text-[#3ECF8E] font-bold">public.campaign_kpis</span>
              </span>
              <span className="text-[10px] rounded bg-white/5 px-2 py-0.5 text-white/40">
                Primary Key: id (text)
              </span>
            </div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider">
              Showing {filteredKpis.length} performance tracking records
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-[#080808] text-[9px] uppercase tracking-widest text-white/40 font-mono">
                <tr>
                  <th className="py-3 px-4">id</th>
                  <th className="py-3 px-4">campaign_name</th>
                  <th className="py-3 px-4">creator_name</th>
                  <th className="py-3 px-4">platform</th>
                  <th className="py-3 px-4 text-right">views / impressions</th>
                  <th className="py-3 px-4 text-right">target</th>
                  <th className="py-3 px-4 text-center">status</th>
                  <th className="py-3 px-4 text-center">actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                {filteredKpis.map((k) => (
                  <tr key={k.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-white/50">{k.id}</td>
                    <td className="py-3 px-4 font-sans font-medium text-[#f5f2ed]">{k.campaignName}</td>
                    <td className="py-3 px-4 font-sans text-white/80">{k.creatorName}</td>
                    <td className="py-3 px-4 text-red-400 font-sans">{k.platform}</td>
                    <td className="py-3 px-4 text-right text-[#00ff88] font-semibold">
                      {(k.metrics?.impressions?.actual || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-white/60">
                      {(k.metrics?.impressions?.target || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="rounded-sm bg-emerald-500/20 px-2 py-0.5 text-[10px] font-sans font-semibold text-emerald-300">
                        {k.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() =>
                          setSelectedRecord({
                            table: "campaign_kpis",
                            id: k.id,
                            data: k,
                          })
                        }
                        className="flex items-center gap-1 mx-auto rounded-sm border border-white/10 bg-[#050505] px-2.5 py-1 text-[10px] text-white/70 hover:border-[#c5a059] hover:text-[#c5a059]"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 5: SQL MIGRATION & SEED STUDIO */}
      {activeTable === "sql" && (
        <div className="space-y-6">
          {/* Migration Control & Overview Card */}
          <div className="rounded-sm border border-white/10 bg-[#0a0a0a] p-6 space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-white/10 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-[#3ECF8E]/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#3ECF8E]">
                    Supabase DDL & Relational Schema
                  </span>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">
                    PostgreSQL 15+ Compatible
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-light text-[#f5f2ed] mt-1">
                  Supabase SQL Migration & Schema Engine
                </h3>
                <p className="text-xs text-white/60 max-w-2xl mt-1 leading-relaxed">
                  Defines the tables for <code className="text-[#3ECF8E]">creators</code>,{" "}
                  <code className="text-[#3ECF8E]">deals</code>,{" "}
                  <code className="text-[#3ECF8E]">requests</code>, and{" "}
                  <code className="text-[#3ECF8E]">campaign_kpis</code> with foreign keys,
                  automatic <code className="text-white/80">updated_at</code> triggers, and Row Level Security (RLS) policies.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href="https://supabase.com/dashboard/project/rnooqbnuhafktgaxwklq/sql/new"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-sm border border-[#3ECF8E] bg-[#3ECF8E] px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-black shadow-lg hover:bg-[#4ee59f]"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Open Supabase SQL Editor</span>
                </a>

                <button
                  onClick={() => {
                    const content = sqlMode === "migration"
                      ? getSupabaseSQLMigration()
                      : getSupabaseFullSeedSQL(creators, deals, requests, campaigns);
                    navigator.clipboard.writeText(content);
                    setCopiedMigrationSql(true);
                    setTimeout(() => setCopiedMigrationSql(false), 2500);
                  }}
                  className="flex items-center gap-2 rounded-sm border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-medium uppercase tracking-widest text-white hover:border-[#c5a059] hover:text-[#c5a059]"
                >
                  {copiedMigrationSql ? <Check className="h-3.5 w-3.5 text-[#00ff88]" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedMigrationSql ? "Copied SQL!" : "Copy Active SQL"}</span>
                </button>

                <button
                  onClick={() => {
                    const content = sqlMode === "migration"
                      ? getSupabaseSQLMigration()
                      : getSupabaseFullSeedSQL(creators, deals, requests, campaigns);
                    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = sqlMode === "migration" ? "supabase_migration.sql" : "supabase_seed_full.sql";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-2 rounded-sm border border-white/10 bg-[#050505] px-3.5 py-2.5 text-xs font-medium uppercase tracking-widest text-white/70 hover:text-white"
                >
                  <DownloadCloud className="h-3.5 w-3.5" />
                  <span>Download .sql</span>
                </button>
              </div>
            </div>

            {/* Live Table Existence Verification Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-widest text-white/60">
                  Supabase Live Table Verification Status
                </span>
                <button
                  onClick={handleCheckTables}
                  disabled={isCheckingTables}
                  className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#3ECF8E] hover:underline disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 ${isCheckingTables ? "animate-spin" : ""}`} />
                  <span>{isCheckingTables ? "Verifying Tables..." : "Re-check Supabase Status"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 font-mono text-xs">
                {/* Creators status */}
                <div className="rounded-sm border border-white/10 bg-[#050505] p-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white/90">public.creators</span>
                    {tableStatus?.creators?.exists ? (
                      <span className="flex items-center gap-1 text-[10px] text-[#00ff88]">
                        <CheckCircle2 className="h-3 w-3" /> Exists
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-amber-400">
                        <AlertCircle className="h-3 w-3" /> Not Found
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-white/40 font-sans">
                    Primary Key: <code className="text-[#c5a059]">id</code> | Count: {tableStatus?.creators?.count ?? creators.length}
                  </p>
                </div>

                {/* Deals status */}
                <div className="rounded-sm border border-white/10 bg-[#050505] p-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white/90">public.deals</span>
                    {(tableStatus?.deals?.exists || tableStatus?.collaborations?.exists) ? (
                      <span className="flex items-center gap-1 text-[10px] text-[#00ff88]">
                        <CheckCircle2 className="h-3 w-3" /> Exists
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-amber-400">
                        <AlertCircle className="h-3 w-3" /> Not Found
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-white/40 font-sans">
                    FK: <code className="text-[#3ECF8E]">creator_id -&gt; creators(id)</code>
                  </p>
                </div>

                {/* Requests status */}
                <div className="rounded-sm border border-white/10 bg-[#050505] p-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white/90">public.requests</span>
                    {(tableStatus?.requests?.exists || tableStatus?.collaboration_requests?.exists) ? (
                      <span className="flex items-center gap-1 text-[10px] text-[#00ff88]">
                        <CheckCircle2 className="h-3 w-3" /> Exists
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-amber-400">
                        <AlertCircle className="h-3 w-3" /> Not Found
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-white/40 font-sans">
                    FK: <code className="text-[#3ECF8E]">creator_id, deal_id</code>
                  </p>
                </div>

                {/* KPIs status */}
                <div className="rounded-sm border border-white/10 bg-[#050505] p-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white/90">public.campaign_kpis</span>
                    {tableStatus?.campaign_kpis?.exists ? (
                      <span className="flex items-center gap-1 text-[10px] text-[#00ff88]">
                        <CheckCircle2 className="h-3 w-3" /> Exists
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-amber-400">
                        <AlertCircle className="h-3 w-3" /> Not Found
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-white/40 font-sans">
                    FK: <code className="text-[#3ECF8E]">creator_id -&gt; creators(id)</code>
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Execution via Postgres Connection Form */}
            <div className="rounded-sm border border-white/10 bg-[#050505] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-[#f5f2ed]">
                    Direct Migration Execution (Optional)
                  </h4>
                  <p className="text-[11px] text-white/50 mt-0.5">
                    Execute DDL directly if you have the direct PostgreSQL connection string (from Supabase Settings -&gt; Database -&gt; Connection string URI):
                  </p>
                </div>
                <span className="text-[10px] font-mono text-[#3ECF8E] bg-[#3ECF8E]/10 px-2 py-0.5 rounded">
                  Direct Migration Engine
                </span>
              </div>

              <form onSubmit={handleExecuteMigration} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="password"
                  placeholder="postgresql://postgres:[password]@db.rnooqbnuhafktgaxwklq.supabase.co:5432/postgres"
                  value={pgConnString}
                  onChange={(e) => setPgConnString(e.target.value)}
                  className="flex-1 rounded-sm border border-white/10 bg-[#0a0a0a] px-3 py-2 font-mono text-xs text-[#f5f2ed] placeholder:text-white/30 focus:border-[#3ECF8E] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isMigrating || !pgConnString}
                  className="flex items-center justify-center gap-2 rounded-sm border border-[#3ECF8E] bg-[#3ECF8E] px-5 py-2 text-xs font-semibold uppercase tracking-widest text-black hover:bg-[#4ee59f] disabled:opacity-40"
                >
                  <UploadCloud className={`h-3.5 w-3.5 ${isMigrating ? "animate-spin" : ""}`} />
                  <span>{isMigrating ? "Executing SQL..." : "Execute Migration"}</span>
                </button>
              </form>

              {migrationResult && (
                <div
                  className={`p-3 rounded-sm text-xs font-mono ${
                    migrationResult.success
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                      : "bg-amber-500/10 border border-amber-500/30 text-amber-200"
                  }`}
                >
                  {migrationResult.message}
                </div>
              )}
            </div>

            {/* SQL Mode Switcher */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSqlMode("migration")}
                  className={`rounded-sm px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors ${
                    sqlMode === "migration"
                      ? "border border-[#3ECF8E] bg-[#3ECF8E]/10 text-[#3ECF8E]"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  1. DDL Migration Script (Tables, FKs, Triggers, RLS)
                </button>
                <button
                  onClick={() => setSqlMode("seed")}
                  className={`rounded-sm px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors ${
                    sqlMode === "seed"
                      ? "border border-[#3ECF8E] bg-[#3ECF8E]/10 text-[#3ECF8E]"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  2. Full SQL Script with Data Seed ({totalRowCount} Records)
                </button>
              </div>

              <span className="text-[10px] font-mono text-white/40">
                {sqlMode === "migration" ? "DDL Schema" : `Includes ${totalRowCount} rows`}
              </span>
            </div>

            {/* SQL Code Block */}
            <div className="max-h-[500px] overflow-y-auto rounded-sm border border-white/10 bg-[#050505] p-4 font-mono text-[11px] text-white/80 leading-relaxed">
              <pre>
                {sqlMode === "migration"
                  ? getSupabaseSQLMigration()
                  : getSupabaseFullSeedSQL(creators, deals, requests, campaigns)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* JSONB Record Inspector Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="relative my-8 w-full max-w-3xl overflow-hidden rounded-sm border border-white/10 bg-[#0a0a0a] p-6 text-xs text-[#f5f2ed] shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#3ECF8E] uppercase tracking-widest">
                  public.{selectedRecord.table}
                </span>
                <h3 className="font-serif text-lg font-light text-[#f5f2ed]">
                  Record Inspector: {selectedRecord.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="rounded p-1 text-white/40 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto rounded-sm border border-white/10 bg-[#050505] p-4 font-mono text-[11px] text-emerald-300">
              <pre>{JSON.stringify(selectedRecord.data, null, 2)}</pre>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-[10px] text-white/40 uppercase tracking-wider">
                PostgreSQL JSONB Representation
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(selectedRecord.data, null, 2));
                  alert("Copied JSON to clipboard!");
                }}
                className="flex items-center gap-1.5 rounded-sm border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] uppercase tracking-widest text-[#c5a059] hover:border-[#c5a059]"
              >
                <Copy className="h-3 w-3" />
                <span>Copy JSON</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
