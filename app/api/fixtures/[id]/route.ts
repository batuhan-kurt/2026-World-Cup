import { NextResponse } from "next/server";
import { getHybridMatchDetails } from "@/lib/hybrid-cache";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const fixtureId = params.id;
    const token = process.env.FOOTBALL_DATA_TOKEN;

    if (!token) {
      return NextResponse.json({ error: "API Token missing" }, { status: 500 });
    }

    // Limitless Polling (Fast data) from Football-Data.org
    const res = await fetch(`https://api.football-data.org/v4/matches/${fixtureId}`, {
      method: "GET",
      headers: {
        "X-Auth-Token": token
      },
      next: { revalidate: 60 } // Cache for 60s
    });

    if (!res.ok) {
      throw new Error(`API responded with status: ${res.status}`);
    }

    const data = await res.json();
    
    // Hybrid Engine: Append events and lineups from API-Football if needed
    const hybridData = await getHybridMatchDetails(data);

    return NextResponse.json({ fixtureDetails: hybridData });
  } catch (error) {
    console.error("Fixture details fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch fixture details" }, { status: 500 });
  }
}
