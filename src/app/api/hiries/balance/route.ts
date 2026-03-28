/* eslint-disable */
// @ts-nocheck
export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

const supabaseAdmin = createSupabaseAdmin(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
 try {
 const { userId } = auth();
 if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

 const { data: profile } = await supabaseAdmin
 .from("profiles")
 .select("id, hiries_balance")
 .eq("clerk_user_id", userId)
 .maybeSingle();

 if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

 const { data: transactions } = await supabaseAdmin
 .from("hiries_transactions")
 .select("*")
 .eq("user_id", profile.id)
 .order("created_at", { ascending: false })
 .limit(10);

 return NextResponse.json({
 balance: profile.hiries_balance || 0,
 transactions: transactions || [],
 });
 } catch (error) {
 console.error("Balance API Error:", error);
 return NextResponse.json({ error: "Server error" }, { status: 500 });
 }
}
