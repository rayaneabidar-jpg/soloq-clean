// src/app/api/cron/sync-all-challenges/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { fetchRankedSoloSnapshot, getPuuidByRiotId, getPuuidBySummoner } from "@/lib/riot";

export const runtime = "nodejs";

// Rate limiter simple en mémoire (reset toutes les 10s)
const rateLimitMap = new Map<string, number>();

function riotRateLimit(key: string): boolean {
  const now = Date.now();
  const lastCall = rateLimitMap.get(key) || 0;
  
  if (now - lastCall < 100) { // Min 100ms entre calls
    return false;
  }
  
  rateLimitMap.set(key, now);
  
  // Cleanup old entries
  if (rateLimitMap.size > 1000) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (now - v > 60000) rateLimitMap.delete(k);
    }
  }
  
  return true;
}

export async function POST(req: Request) {
  try {
    // ✅ Vérifier header cron (Vercel utilise X-Vercel-Cron)
    const cronSecret = req.headers.get("authorization");
    if (process.env.CRON_SECRET && cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🔄 [CRON] Sync started...");
    
    // 1️⃣ Récupérer tous les challenges actifs
    const { data: challenges, error: chalErr } = await supabaseAdmin
      .from("challenges")
      .select("id, name, ranking_rule")
      .lte("start_at", new Date().toISOString())
      .or(`end_at.is.null,end_at.gte.${new Date().toISOString()}`);

    if (chalErr) {
      console.error("❌ Error fetching challenges:", chalErr);
      return NextResponse.json({ error: chalErr.message }, { status: 500 });
    }

    let totalInserted = 0;
    let totalErrors = 0;

    // 2️⃣ Pour chaque challenge actif
    for (const challenge of challenges || []) {
      try {
        // Récupérer les joueurs
        const { data: players, error: playErr } = await supabaseAdmin
          .from("players")
          .select("id, puuid, region, name")
          .eq("challenge_id", challenge.id)
          .eq("active", true);

        if (playErr) throw playErr;

        // Syncer chaque joueur
        for (const player of players || []) {
          try {
            // Rate limiting
            if (!riotRateLimit(`riot-${player.puuid}`)) {
              await new Promise(resolve => setTimeout(resolve, 150));
            }

            // Récupérer le snapshot actuel
            const snapshot = await fetchRankedSoloSnapshot(player.region as any, player.puuid);
            
            if (!snapshot) {
              console.log(`⚠️ [CRON] No rank for ${player.name}`);
              continue;
            }

            // Insérer le snapshot
            const { error: snapErr } = await supabaseAdmin
              .from("rank_snapshots")
              .upsert(
                {
                  player_id: player.id,
                  challenge_id: challenge.id,
                  tier: snapshot.tier,
                  division: snapshot.division,
                  lp: snapshot.lp,
                  timestamp: new Date().toISOString(),
                },
                { onConflict: "player_id,challenge_id,timestamp" }
              );

            if (snapErr && snapErr.code !== "23505") throw snapErr;
            totalInserted++;
          } catch (e: any) {
            console.error(`❌ Error syncing ${player.name}:`, e.message);
            totalErrors++;
          }
        }
      } catch (e: any) {
        console.error(`❌ Error in challenge ${challenge.id}:`, e.message);
        totalErrors++;
      }
    }

    console.log(`✅ [CRON] Completed: ${totalInserted} inserted, ${totalErrors} errors`);
    return NextResponse.json({ 
      success: true, 
      inserted: totalInserted, 
      errors: totalErrors,
      timestamp: new Date().toISOString()
    });
  } catch (e: any) {
    console.error("❌ [CRON] Fatal error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
