import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { redis } from "@/lib/redis";

const CACHE_KEY_PREFIX = "worldcup:h2h:";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const t1 = searchParams.get("t1");
  const t2 = searchParams.get("t2");
  const t1Name = searchParams.get("t1Name");
  const t2Name = searchParams.get("t2Name");
  
  if (!t1 || !t2 || !t1Name || !t2Name) return NextResponse.json({ error: "Missing teams" }, { status: 400 });
  
  const cacheKey = `${CACHE_KEY_PREFIX}${t1}-${t2}`;
  
  try {
    const cachedData = await redis.get(cacheKey);
    let cachedApiT1 = await redis.get(`worldcup:apifootball:team:${t1Name.toLowerCase()}`);
    let cachedApiT2 = await redis.get(`worldcup:apifootball:team:${t2Name.toLowerCase()}`);
    
    if (cachedData && (!cachedApiT1 || !cachedApiT2)) {
       if (Array.isArray(cachedData) && cachedData.length > 0) {
           const firstMatch = cachedData[0];
           const hName = firstMatch.teams.home.name.toLowerCase();
           const t1Lower = t1Name.toLowerCase();
           if (hName.includes(t1Lower) || t1Lower.includes(hName) || (hName.includes('korea') && t1Lower.includes('kore')) || (hName.includes('czech') && t1Lower.includes('çek'))) {
               cachedApiT1 = firstMatch.teams.home.id;
               cachedApiT2 = firstMatch.teams.away.id;
           } else {
               cachedApiT1 = firstMatch.teams.away.id;
               cachedApiT2 = firstMatch.teams.home.id;
           }
       }
    }

    if (cachedData && cachedApiT1 && cachedApiT2) {
      return NextResponse.json({ response: cachedData, apiT1: cachedApiT1, apiT2: cachedApiT2 });
    }
    
    // API-Football
    const apiKey = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY || process.env.API_FOOTBALL_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    // Isimleri kullanarak API-Football IDsini bul (1 haftalık cache)
    const getTeamId = async (name: string) => {
      const teamCacheKey = `worldcup:apifootball:team:${name.toLowerCase()}`;
      let teamId = await redis.get(teamCacheKey);
      if (teamId) return teamId;

      const res = await fetch(`https://v3.football.api-sports.io/teams?search=${name}`, {
        headers: {
          "x-apisports-key": apiKey,
          "x-apisports-host": "v3.football.api-sports.io"
        }
      });
      const data = await res.json();
      if (data && data.response && data.response.length > 0) {
        teamId = data.response[0].team.id;
        await redis.set(teamCacheKey, teamId);
        return teamId;
      }
      return null;
    };

    const apiT1 = await getTeamId(t1Name);
    const apiT2 = await getTeamId(t2Name);

    if (!apiT1 || !apiT2) {
       return NextResponse.json({ response: [] });
    }

    const res = await fetch(`https://v3.football.api-sports.io/fixtures/headtohead?h2h=${apiT1}-${apiT2}`, {
      headers: {
        "x-apisports-key": apiKey,
        "x-apisports-host": "v3.football.api-sports.io"
      }
    });
    
    const data = await res.json();
    
    if (data && data.response && data.response.length > 0) {
      await redis.set(cacheKey, data.response);
    }
    
    return NextResponse.json({
      response: data.response || [],
      apiT1,
      apiT2
    });
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
