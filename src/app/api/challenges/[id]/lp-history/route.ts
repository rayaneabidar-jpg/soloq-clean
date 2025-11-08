// src/app/api/challenges/[id]/lp-history/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const url = new URL(req.url);
    const playerId = url.searchParams.get("playerId");

    // Récupérer les snapshots
    let query = supabaseAdmin
      .from("rank_snapshots")
      .select("player_id, players(name), lp, timestamp")
      .eq("challenge_id", id)
      .order("timestamp", { ascending: true });

    if (playerId) {
      query = query.eq("player_id", playerId);
    }

    const { data: snapshots } = await query;

    // Transformer pour le chart
    const timelineMap = new Map<string, any>();

    for (const snap of snapshots || []) {
      const time = new Date(snap.timestamp).toLocaleString("fr-FR", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });

      if (!timelineMap.has(time)) {
        timelineMap.set(time, { time });
      }

      const entry = timelineMap.get(time);
      entry[(snap as any).players?.name || "Unknown"] = snap.lp;
    }

    const history = Array.from(timelineMap.values());

    return NextResponse.json({ history });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
