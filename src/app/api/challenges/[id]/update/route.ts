import { NextResponse } from "next/server";
import { supabaseAdmin, getUserFromAuthHeader } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const user = await getUserFromAuthHeader(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: membership } = await supabaseAdmin
      .from("challenge_members")
      .select("role")
      .eq("challenge_id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const { data: updated, error } = await supabaseAdmin
      .from("challenges")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ challenge: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
