import { NextResponse } from "next/server";
import { supabaseAdmin, getUserFromAuthHeader } from "../../../../../lib/supabase-server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromAuthHeader(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const challengeId = params.id;
    const { playerId } = await req.json();

    // Validation
    if (!playerId || typeof playerId !== "string") {
      return NextResponse.json(
        { error: "playerId is required and must be a string" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur a les permissions (owner ou admin)
    const { data: membership, error: memError } = await supabaseAdmin
      .from("challenge_members")
      .select("role")
      .eq("challenge_id", challengeId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (memError) {
      return NextResponse.json({ error: memError.message }, { status: 400 });
    }

    if (
      !membership ||
      !["owner", "admin"].includes(membership.role)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Vérifier que le joueur appartient bien au challenge
    const { data: player, error: playerError } = await supabaseAdmin
      .from("players")
      .select("id")
      .eq("id", playerId)
      .eq("challenge_id", challengeId)
      .maybeSingle();

    if (playerError) {
      return NextResponse.json({ error: playerError.message }, { status: 400 });
    }

    if (!player) {
      return NextResponse.json(
        { error: "Player not found in this challenge" },
        { status: 404 }
      );
    }

    // Supprimer le joueur
    const { error: deleteError } = await supabaseAdmin
      .from("players")
      .delete()
      .eq("id", playerId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Player removed successfully", playerId },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("POST /api/challenges/[id]/remove-player error:", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
