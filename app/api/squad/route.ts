import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getSquad } from "@/lib/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('teamId');

  if (!teamId) {
    return NextResponse.json({ success: false, error: "Team ID is required" }, { status: 400 });
  }

  try {
    const squad = await getSquad(parseInt(teamId));
    return NextResponse.json({ success: true, squad });
  } catch (error) {
    console.error("Squad API Error:", error);
    return NextResponse.json({ success: false, squad: [] }, { status: 500 });
  }
}
