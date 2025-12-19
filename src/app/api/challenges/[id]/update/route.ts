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

    // Extract allowed fields
    const { name, visibility, start_at, end_at } = body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (visibility !== undefined) updates.visibility = visibility;
    if (start_at !== undefined) updates.start_at = start_at;
    if (end_at !== undefined) updates.end_at = end_at;

    // Validate dates if both are present or being updated
    // Note: This is a basic check. Ideal would be fetching current if one is missing, but for now we assume simple updates.
    if (updates.start_at && updates.end_at) {
      if (new Date(updates.start_at) >= new Date(updates.end_at)) {
        return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
      }
    }

    const { data: updated, error } = await supabaseAdmin
      .from("challenges")
      .update(updates)
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
