import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const token = process.env.FOOTBALL_DATA_TOKEN;

    if (!token) {
      return NextResponse.json({ error: "API Token missing" }, { status: 500 });
    }

    // Fetch all 104 matches for the World Cup
    const res = await fetch(`https://api.football-data.org/v4/competitions/WC/matches`, {
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
    
    // API returns data.matches
    const wcMatches = data.matches || [];

    return NextResponse.json({ fixtures: wcMatches });
  } catch (error) {
    console.error("Fixtures fetch error:", error);
    return NextResponse.json({ fixtures: [] }); // Hata durumunda boş dizi dönüyoruz.
  }
}
