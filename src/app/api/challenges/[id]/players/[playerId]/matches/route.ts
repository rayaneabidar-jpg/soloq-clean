import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string; playerId: string }> }
) {
  try {
    const { id, playerId } = await context.params;

    const { data: matches, error } = await supabaseAdmin
      .from("player_matches")
      .select("*")
      .eq("challenge_id", id)
      .eq("player_id", playerId)
      .order("timestamp", { ascending: false })
      .limit(5);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ matches: matches || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
