export const dynamic = 'force-dynamic'
/* eslint-disable */
// @ts-nocheck
import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

const supabaseAdmin = createSupabaseAdmin(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: Request) {
 try {
 const { searchParams } = new URL(req.url);
 const secret = searchParams.get("secret");

 if (secret !== process.env.ADMIN_SECRET) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const { data, error } = await supabaseAdmin
 .from("hiries_transactions")
 .select(`
 id,
 amount,
 type,
 created_at,
 profiles!user_id (
 email
 )
 `)
 .order("created_at", { ascending: false })
 .limit(20);

 if (error) throw error;

 const transformed = data.map((t: any) => ({
 id: t.id,
 amount: t.amount,
 type: t.type,
 date: t.created_at,
 email: (Array.isArray(t.profiles) ? t.profiles[0]?.email : t.profiles?.email) || "Unknown"
 }));

 return NextResponse.json(transformed);
 } catch (error) {
 console.error("Admin Transactions Error:", error);
 return NextResponse.json({ error: "Server error" }, { status: 500 });
 }
}
