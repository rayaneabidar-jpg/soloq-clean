import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { data: challenge, error } = await supabaseAdmin
      .from("challenges")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    return NextResponse.json({ challenge });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
