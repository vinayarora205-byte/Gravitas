import { NextResponse } from "next/server";
import { processNewMatch } from "../claura/route";

export const dynamic = "force-dynamic";

export async function GET() {
 try {
 const profileId = "00000000-0000-0000-0000-000000000001";
 console.log("--- TEST PROCESS NEW MATCH (CANDIDATE) ---");
 const result = await processNewMatch(profileId, "CANDIDATE");
 return NextResponse.json({ success: true, result });
 } catch (error: unknown) {
 console.error("Test match error:", error);
 return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
 }
}
