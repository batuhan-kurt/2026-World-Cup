import { NextResponse } from "next/server";

export async function GET() {
  try {
    const token = process.env.FOOTBALL_DATA_TOKEN;

    if (!token) {
      return NextResponse.json({ error: "API Token missing" }, { status: 500 });
    }

    // Football-Data.org supports date ranges.
    // Fetch live matches and matches for yesterday & today & tomorrow to ensure we capture all
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 86400000).toISOString().split('T')[0];
    const yesterday = new Date(today.getTime() - 86400000).toISOString().split('T')[0];
    
    // We fetch all matches within the date range, then filter by World Cup internally
    const res = await fetch(`https://api.football-data.org/v4/matches?dateFrom=${yesterday}&dateTo=${tomorrow}`, {
      method: "GET",
      headers: { 
        "X-Auth-Token": token 
      },
      next: { revalidate: 60 } // Cache for 60s
    });

    if (!res.ok) {
      console.error(`API Error: ${res.status}`);
      return NextResponse.json({ fixtures: [] });
    }

    const data = await res.json();
    
    // Filter out World Cup matches. In football-data, competition id for World Cup is 2000.
    const wcMatches = (data.matches || []).filter((m: any) => 
      m.competition?.id === 2000 || m.competition?.code === 'WC'
    );

    return NextResponse.json({ fixtures: wcMatches });
  } catch (error) {
    console.error("Fixtures fetch error:", error);
    return NextResponse.json({ fixtures: [] }); // Hata durumunda boş dizi dönüyoruz.
  }
}
