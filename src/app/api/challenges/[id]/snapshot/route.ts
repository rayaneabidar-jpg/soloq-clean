import { NextResponse } from "next/server";
import { supabaseAdmin, getUserFromAuthHeader } from "@/lib/supabase-server";
import { fetchRankedSoloSnapshot } from "@/lib/riot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const user = await getUserFromAuthHeader(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: membership, error: memErr } = await supabaseAdmin
      .from("challenge_members")
      .select("role")
      .eq("challenge_id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (memErr) return NextResponse.json({ error: memErr.message }, { status: 400 });
    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: players, error: playersErr } = await supabaseAdmin
      .from("players")
      .select("id, puuid, region")
      .eq("challenge_id", id)
      .eq("active", true);

    if (playersErr) {
      return NextResponse.json({ error: playersErr.message }, { status: 400 });
    }

    const nowIso = new Date().toISOString();
    const rows: any[] = [];

    for (const p of players ?? []) {
      if (!p.puuid || !p.id) continue;
      try {
        const snap = await fetchRankedSoloSnapshot(p.region, p.puuid);
        if (snap) {
          rows.push({
            challenge_id: id,
            player_id: p.id,
            tier: snap.tier,
            division: snap.division,
            lp: snap.lp,
            timestamp: nowIso,
          });
        }
      } catch (e: any) {
        console.error(`Error fetching snapshot for player ${p.id}:`, e.message);
      }
    }

    if (rows.length) {
      const { error: insertErr } = await supabaseAdmin
        .from("rank_snapshots")
        .insert(rows);
      if (insertErr) {
        return NextResponse.json({ error: insertErr.message }, { status: 400 });
      }
    }

    return NextResponse.json({ inserted: rows.length }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
