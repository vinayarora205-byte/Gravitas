/* eslint-disable */
// @ts-nocheck
export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { email, amount, secret } = await req.json();
    console.log("=== ADMIN ADD HIRIES ===");
    console.log("Email:", email, "Amount:", amount);

    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!email || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid email or amount" }, { status: 400 });
    }

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("id, hiries_balance")
      .eq("email", email)
      .maybeSingle();

    if (profileErr || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newBalance = (profile.hiries_balance || 0) + amount;

    await supabaseAdmin
      .from("profiles")
      .update({ hiries_balance: newBalance })
      .eq("id", profile.id);

    await supabaseAdmin.from("hiries_transactions").insert({
      user_id: profile.id,
      amount,
      type: "ADMIN_CREDIT",
      description: `Admin added ${amount} Hiries`,
    });

    await supabaseAdmin.from("notifications").insert({
      user_id: profile.id,
      title: "💎 Hiries Added!",
      message: `💎 ${amount} Hiries have been added to your account!`,
      type: "HIRIES",
      is_read: false,
    });

    return NextResponse.json({
      success: true,
      newBalance,
      message: `Added ${amount} Hiries to ${email}`,
    });
  } catch (error) {
    console.error("Admin Hiries Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
