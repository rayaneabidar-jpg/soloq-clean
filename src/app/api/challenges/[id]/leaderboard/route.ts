import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { ordinalFromRank } from "@/lib/riot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { data: challenge, error: chalErr } = await supabaseAdmin
      .from("challenges")
      .select("id, name, ranking_rule, start_at, end_at")
      .eq("id", id)
      .single();

    if (chalErr || !challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    const { data: players, error: playErr } = await supabaseAdmin
      .from("players")
      .select("id, puuid, name, region, team, active")
      .eq("challenge_id", id);

    if (playErr) {
      return NextResponse.json({ error: playErr.message }, { status: 500 });
    }

    if (!players || players.length === 0) {
      return NextResponse.json({ leaderboard: [] });
    }

    const leaderboardRows: any[] = [];

    for (const player of players) {
      try {
        const { data: initialSnapArray } = await supabaseAdmin
          .from("rank_snapshots")
          .select("*")
          .eq("player_id", player.id)
          .eq("challenge_id", id)
          .order("timestamp", { ascending: true })
          .limit(1);

        const initialSnap = initialSnapArray && initialSnapArray.length > 0 ? initialSnapArray[0] : null;

        const { data: finalSnapArray } = await supabaseAdmin
          .from("rank_snapshots")
          .select("*")
          .eq("player_id", player.id)
          .eq("challenge_id", id)
          .order("timestamp", { ascending: false })
          .limit(1);

        const finalSnap = finalSnapArray && finalSnapArray.length > 0 ? finalSnapArray[0] : null;

        const { data: matches } = await supabaseAdmin
          .from("player_matches")
          .select("*")
          .eq("player_id", player.id)
          .eq("challenge_id", id)
          .order("timestamp", { ascending: false })
          .limit(100);

        let wins = 0, losses = 0;
        for (const match of matches || []) {
          if (match.result === "WIN") wins++;
          else if (match.result === "LOSS") losses++;
        }

        let lpGained = 0;
        if (initialSnap && finalSnap) {
          lpGained = (finalSnap.lp as number || 0) - (initialSnap.lp as number || 0);
        }

        let ordinal = 0;
        let rankLabel = "Pas de données";
        let mainRank = initialSnap ? `${initialSnap.tier} ${initialSnap.division}` : "N/A";

        if (challenge.ranking_rule === "fresh_rank") {
          if (finalSnap) {
            ordinal = ordinalFromRank(finalSnap.tier as string, finalSnap.division as string, finalSnap.lp as number);
            rankLabel = `${finalSnap.tier} ${finalSnap.division} (${finalSnap.lp} LP)`;
          }
        } else if (challenge.ranking_rule === "wins_losses") {
          const winrate = wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0;
          ordinal = wins * 10000 + (winrate * 100) + losses;
          rankLabel = `${wins}W ${losses}L (${winrate.toFixed(1)}%)`;
        } else {
          ordinal = lpGained;
          rankLabel = `${lpGained > 0 ? "+" : ""}${lpGained} LP`;
        }

        leaderboardRows.push({
          playerId: player.id,
          name: player.name,
          team: player.team || null,
          puuid: player.puuid,
          wins,
          losses,
          lpGained,
          ordEnd: ordinal,
          rankLabel,
          mainRank,
          initialRank: initialSnap ? `${initialSnap.tier} ${initialSnap.division}` : null,
          finalRank: finalSnap ? `${finalSnap.tier} ${finalSnap.division}` : null,
        });
      } catch (e: any) {
        console.error(`Error for player ${player.id}:`, e.message);
      }
    }

    if (challenge.ranking_rule === "wins_losses") {
      leaderboardRows.sort((a, b) => {
        const aWr = a.wins + a.losses > 0 ? a.wins / (a.wins + a.losses) : 0;
        const bWr = b.wins + b.losses > 0 ? b.wins / (b.wins + b.losses) : 0;
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (bWr !== aWr) return bWr - aWr;
        return b.wins + b.losses - (a.wins + a.losses);
      });
    } else {
      leaderboardRows.sort((a, b) => b.ordEnd - a.ordEnd);
    }

    return NextResponse.json({ leaderboard: leaderboardRows });
  } catch (e: any) {
    console.error("Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
