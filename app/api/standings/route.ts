import { NextResponse } from "next/server";

export async function GET() {
  try {
    const token = process.env.FOOTBALL_DATA_TOKEN;

    if (!token) {
      return NextResponse.json({ error: "API Token missing" }, { status: 500 });
    }

    // Football-Data.org endpoint for World Cup standings
    const res = await fetch(`https://api.football-data.org/v4/competitions/WC/standings`, {
      method: "GET",
      headers: {
        "X-Auth-Token": token
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    });

    if (!res.ok) {
      console.error(`API Error: ${res.status}`);
      return NextResponse.json({ standings: [] });
    }

    const data = await res.json();
    
    // Football-Data.org returns data.standings as an array of groups.
    // Each group has a "table" array containing the teams.
    let liveStandings: any[] = [];
    
    if (data.standings && Array.isArray(data.standings)) {
      data.standings.forEach((group: any) => {
        if (group.table && Array.isArray(group.table)) {
          liveStandings = liveStandings.concat(group.table);
        }
      });
    }

    return NextResponse.json({ standings: liveStandings });
  } catch (error) {
    console.error("Standings fetch error:", error);
    return NextResponse.json({ standings: [] });
  }
}
