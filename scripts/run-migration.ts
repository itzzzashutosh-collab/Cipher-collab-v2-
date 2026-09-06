import { Client } from "pg";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || "https://rnooqbnuhafktgaxwklq.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL || "";

async function main() {
  console.log("=================================================");
  console.log("CipherCollab Supabase Migration & Verification Runner");
  console.log("=================================================");
  console.log("Supabase Project URL:", SUPABASE_URL);

  const migrationSqlPath = path.join(process.cwd(), "supabase_migration.sql");
  const sql = fs.readFileSync(migrationSqlPath, "utf8");

  // Step 1: Check if DATABASE_URL is available for direct pg execution
  if (DATABASE_URL) {
    console.log("\n[1/3] Direct PostgreSQL Connection detected. Executing DDL via pg.Client...");
    const client = new Client({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    try {
      await client.connect();
      console.log("Connected to PostgreSQL successfully.");
      await client.query(sql);
      console.log("Migration SQL executed successfully via PostgreSQL connection!");
      await client.end();
    } catch (err: any) {
      console.error("Failed executing via direct connection:", err.message);
    }
  } else {
    console.log("\n[1/3] No direct PostgreSQL connection string (DATABASE_URL) in environment.");
    console.log("      Checking PostgREST schema and table availability...");
  }

  // Step 2: Test Supabase PostgREST tables
  console.log("\n[2/3] Testing PostgREST availability with Supabase SDK...");
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const tablesToCheck = ["creators", "deals", "collaborations", "requests", "collaboration_requests", "campaign_kpis"];
  const statusReport: Record<string, { exists: boolean; rows?: number; error?: string }> = {};

  for (const table of tablesToCheck) {
    const { data, error } = await supabase.from(table).select("*").limit(1);
    if (error) {
      statusReport[table] = { exists: false, error: error.message };
      console.log(`  ❌ Table '${table}': ${error.message}`);
    } else {
      statusReport[table] = { exists: true, rows: data?.length || 0 };
      console.log(`  ✅ Table '${table}': Verified and ready!`);
    }
  }

  console.log("\n[3/3] Migration summary:");
  console.log("Migration file location: ./supabase_migration.sql");
  console.log("Supabase SQL Editor URL: https://supabase.com/dashboard/project/rnooqbnuhafktgaxwklq/sql/new");
  console.log("=================================================\n");
}

main().catch(console.error);
