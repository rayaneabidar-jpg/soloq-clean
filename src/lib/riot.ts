export type Region =
  | "EUW" | "EUNE" | "NA" | "KR" | "JP" | "BR" | "LAN" | "LAS" | "OCE" | "TR" | "RU";
export type Platform =
  | "euw1" | "eune1" | "na1" | "kr" | "jp1" | "br1" | "la1" | "la2" | "oc1" | "tr1" | "ru";

// Map région -> plateforme
export function platformFromRegion(region: Region): Platform {
  const map: Record<Region, Platform> = {
    EUW: "euw1",
    EUNE: "eune1",
    NA: "na1",
    KR: "kr",
    JP: "jp1",
    BR: "br1",
    LAN: "la1",
    LAS: "la2",
    OCE: "oc1",
    TR: "tr1",
    RU: "ru",
  };
  return map[region];
}

// Map région -> route continentale pour Account-v1
function continentFromRegion(region: Region): "ASIA" | "AMERICAS" | "EUROPE" {
  switch (region) {
    case "KR":
    case "JP":
    case "EUW":
    case "EUNE":
    case "TR":
    case "RU":
      return "EUROPE"; // EUW/EUNE/TR/RU sont en EU, KR/JP passent souvent par ASIA mais EU marche aussi via account-v1 multi-route
    case "NA":
    case "BR":
    case "LAN":
    case "LAS":
    case "OCE":
      return "AMERICAS";
    default:
      return "EUROPE";
  }
}

function riotHeaders() {
  const key = process.env.RIOT_API_KEY;
  if (!key) throw new Error("RIOT_API_KEY missing at runtime");
  return { "X-Riot-Token": key };
}

// Fallback A: Summoner v4 (peut 403 chez toi actuellement)
export async function getPuuidBySummoner(region: Region, summonerName: string) {
  const platform = platformFromRegion(region);
  const url = `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(
    summonerName.trim()
  )}`;
  const res = await fetch(url, { headers: riotHeaders(), cache: "no-store" });
  if (res.status === 404) return null;
  if (res.status === 403) {
    const j = await res.json().catch(() => null);
    throw new Error(
      `Riot API key invalid/expired (403). Regenerate your key on the Riot Developer Portal. Raw: ${JSON.stringify(j)}`
    );
  }
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Riot summoner lookup failed: ${res.status} ${txt}`);
  }
  const data = await res.json();
  return { puuid: data.puuid as string, name: data.name as string };
}

// Fallback B: Account-v1 via Riot ID (gameName#tagLine)
export async function getPuuidByRiotId(region: Region, gameName: string, tagLine: string) {
  const continent = continentFromRegion(region);
  const base =
    continent === "ASIA"
      ? "asia"
      : continent === "AMERICAS"
      ? "americas"
      : "europe";

  const url = `https://${base}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
    gameName
  )}/${encodeURIComponent(tagLine)}`;

  const res = await fetch(url, { headers: riotHeaders(), cache: "no-store" });
  if (res.status === 404) return null;
  if (res.status === 403) {
    const j = await res.json().catch(() => null);
    throw new Error(
      `Riot API key invalid/expired (403). Regenerate your key on the Riot Developer Portal. Raw: ${JSON.stringify(j)}`
    );
  }
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Riot account lookup failed: ${res.status} ${txt}`);
  }
  const data = await res.json();
  return { puuid: data.puuid as string, gameName: data.gameName as string, tagLine: data.tagLine as string };
}

// (on garde fetchRankedSoloSnapshot + ordinalFromRank identiques)
export async function fetchRankedSoloSnapshot(region: Region, puuid: string) {
  const platform = platformFromRegion(region);
  const url = `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${encodeURIComponent(
    puuid
  )}`;
  const res = await fetch(url, { headers: riotHeaders(), cache: "no-store" });
  if (!res.ok) {
    if (res.status === 404) return null;
    const txt = await res.text();
    throw new Error(`Riot entries lookup failed: ${res.status} ${txt}`);
  }
  const entries = (await res.json()) as any[];
  const solo = entries.find((e) => e.queueType === "RANKED_SOLO_5x5");
  if (!solo) return null;
  return {
    tier: String(solo.tier ?? "").toUpperCase(),
    division: String(solo.rank ?? "").toUpperCase(),
    lp: Number(solo.leaguePoints) || 0,
  };
}

const TIER_LIST = [
  "IRON","BRONZE","SILVER","GOLD","PLATINUM","EMERALD","DIAMOND",
  "MASTER","GRANDMASTER","CHALLENGER",
] as const;
const DIV_VAL: Record<string, number> = { IV: 0, III: 1, II: 2, I: 3 };

// 🔧 FONCTION CORRIGÉE
export function ordinalFromRank(tier?: string | null, division?: string | null, lp?: number | null): number {
  if (!tier) return 0;
  const t = String(tier).toUpperCase();
  const ti = TIER_LIST.indexOf(t as any);
  if (ti < 0) return 0;
  
  const lpClamped = Math.max(0, Math.min(Number(lp ?? 0), t === "CHALLENGER" ? 3000 : 1000)); // LP plus élevé pour Challenger
  
  // 🔧 FIX: Gestion correcte des tiers sans divisions
  const withDiv = ["IRON","BRONZE","SILVER","GOLD","PLATINUM","EMERALD","DIAMOND"].includes(t);
  
  if (withDiv) {
    // Tiers avec divisions (Iron à Diamond)
    const TIER_STEPS = 5; // 4 divisions + LP
    const di = DIV_VAL[String(division ?? "IV").toUpperCase()] ?? 0;
    return ti * TIER_STEPS + di + lpClamped / 100;
  } else {
    // Tiers sans divisions (Master, Grandmaster, Challenger)
    const TIER_STEPS = 5;
    const baseValue = ti * TIER_STEPS + 4; // +4 car équivalent à Division I
    
    // 🔧 FIX: LP significatif pour Master+
    if (t === "CHALLENGER") {
      return baseValue + lpClamped / 3000; // 0-1 basé sur 3000 LP max
    } else {
      return baseValue + lpClamped / 1000; // 0-1 basé sur 1000 LP max  
    }
  }
}
