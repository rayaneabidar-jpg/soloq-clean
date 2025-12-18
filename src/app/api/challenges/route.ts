import { NextResponse } from "next/server";
import { supabaseAdmin, getUserFromAuthHeader } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


export async function GET(req: Request) {
  try {
    const { data: challenges, error } = await supabaseAdmin
      .from("challenges")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ challenges: challenges || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromAuthHeader(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      start_at,
      end_at,
      ranking_rule,
      mode,
      max_participants,
      visibility,
      scoring_rule,
      disclaimer,
    } = body;

    // Basic validation
    if (!name || name.length < 3) {
      return NextResponse.json(
        { error: "Name must be at least 3 characters" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("challenges")
      .insert({
        name,
        start_at,
        end_at: end_at || null,
        ranking_rule,
        mode,
        max_participants,
        visibility,
        scoring_rule,
        disclaimer,
        owner_id: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, challengeId: data.id }, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/challenges error:", e);
    return NextResponse.json(
      { error: e.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
