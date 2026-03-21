import { NextRequest, NextResponse } from "next/server";
import { processNewMatch } from "../gaia/route";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const profileId = "00000000-0000-0000-0000-000000000001";
    console.log("--- TEST PROCESS NEW MATCH (CANDIDATE) ---");
    const result = await processNewMatch(profileId, "CANDIDATE");
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Test match error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
