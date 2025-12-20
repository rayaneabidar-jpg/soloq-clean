import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin, getUserFromAuthHeader } from "@/lib/supabase-server";
import { getPuuidBySummoner, getPuuidByRiotId, getSummonerByPuuid } from "@/lib/riot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RegionEnum = z.enum([
  "EUW", "EUNE", "NA", "KR", "JP", "BR", "LAN", "LAS", "OCE", "TR", "RU",
]);

// On accepte 3 variantes:
// A) { region, summonerName }
// B) { region, riotId: "GameName#TagLine" }
// C) { region, puuid }
const PlayerInput = z.union([
  z.object({ region: RegionEnum, summonerName: z.string().trim().min(2).max(30) }),
  z.object({ region: RegionEnum, riotId: z.string().trim().min(3).max(40) }),
  z.object({ region: RegionEnum, puuid: z.string().trim().min(20).max(80) }),
]);

const AddPlayersSchema = z.object({
  players: z.array(PlayerInput).min(1).max(50),
});

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

    const json = await req.json();
    const body = AddPlayersSchema.parse(json);

    const inserted: any[] = [];
    const skipped: any[] = [];
    const failed: any[] = [];

    for (const p of body.players) {
      try {
        let puuid: string | null = null;
        let displayName: string = "";
        let profileIconId: number | null = null;

        if ("puuid" in p) {
          // C) PUUID direct
          puuid = p.puuid;

          // Récupérer les infos summoner pour le nom et l'icône
          const sum = await getSummonerByPuuid(p.region, puuid);
          if (sum) {
            displayName = sum.name;
            profileIconId = sum.profileIconId;
          } else {
            displayName = p.puuid.slice(0, 12) + "…";
          }
        } else if ("riotId" in p) {
          // B) Riot ID: "GameName#TagLine" via Account-v1
          const [gameName, tagLine] = p.riotId.split("#");
          if (!gameName || !tagLine) throw new Error("Invalid Riot ID format. Use GameName#TagLine");
          const acc = await getPuuidByRiotId(p.region, gameName.trim(), tagLine.trim());
          if (!acc?.puuid) throw new Error("Riot ID not found");
          puuid = acc.puuid;
          displayName = `${acc.gameName}#${acc.tagLine}`;

          // Récupérer l'icône via Summoner API
          const sum = await getSummonerByPuuid(p.region, puuid);
          if (sum) {
            profileIconId = sum.profileIconId;
          }
        } else if ("summonerName" in p) {
          // A) Summoner name
          const res = await getPuuidBySummoner(p.region, p.summonerName);
          if (!res?.puuid) throw new Error("Summoner not found");
          puuid = res.puuid;
          displayName = res.name;
          profileIconId = res.profileIconId; // Déjà dispo ici
        }

        if (!puuid) throw new Error("Unable to resolve PUUID");

        const row = {
          challenge_id: id,
          puuid,
          region: p.region,
          name: displayName,
          summoner_name: displayName,
          active: true,
          profile_icon_id: profileIconId // Ajouté
        };

        const { data, error } = await supabaseAdmin
          .from("players")
          .upsert(row, { onConflict: "challenge_id,puuid", ignoreDuplicates: false })
          .select("*")
          .single();

        if (error) {
          const isConflict =
            (error as any).code === "23505" ||
            /duplicate key|already exists|conflict/i.test(error.message);
          if (isConflict) {
            skipped.push({ ...p, puuid, reason: "duplicate" });
          } else {
            failed.push({ ...p, puuid, reason: error.message });
          }
        } else {
          inserted.push({ ...p, puuid, id: data.id });
        }
      } catch (e: any) {
        failed.push({ ...p, reason: e?.message ?? "error" });
      }
    }

    return NextResponse.json({ inserted, skipped, failed }, { status: 200 });
  } catch (e: any) {
    const msg = e?.issues ? `Invalid payload: ${e.issues.map((i: any) => i.message).join(", ")}` : e?.message;
    return NextResponse.json({ error: msg ?? "Server error" }, { status: 500 });
  }
}
