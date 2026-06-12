import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const isVercel = process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV;
const dataFilePath = isVercel 
  ? path.join("/tmp", "h2h_cache.json")
  : path.join(process.cwd(), "data", "h2h_cache.json");

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const t1 = searchParams.get("t1");
    const t2 = searchParams.get("t2");

    if (!t1 || !t2) {
      return NextResponse.json({ error: "Missing team IDs" }, { status: 400 });
    }

    const cacheKey1 = `${t1}-${t2}`;
    const cacheKey2 = `${t2}-${t1}`;

    // 1. Cache Dosyasını Oku
    if (!fs.existsSync(dataFilePath)) {
      fs.writeFileSync(dataFilePath, "{}");
    }
    const cache = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));

    // 2. Cache'de varsa direkt dön (0 API limit)
    if (cache[cacheKey1]) {
      return NextResponse.json(cache[cacheKey1]);
    }
    if (cache[cacheKey2]) {
      return NextResponse.json(cache[cacheKey2]);
    }

    // 3. Cache'de yoksa API-Football'dan çek
    const apiKey = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY || process.env.API_FOOTBALL_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const res = await fetch(`https://v3.football.api-sports.io/fixtures/headtohead?h2h=${t1}-${t2}`, {
      headers: {
        "x-apisports-key": apiKey,
        "x-apisports-host": "v3.football.api-sports.io"
      }
    });

    if (!res.ok) {
      return NextResponse.json({ error: "API request failed" }, { status: 500 });
    }

    const data = await res.json();
    
    // API limiti uyarısı vb. varsa boş döneriz
    if (data.errors && data.errors.requests) {
      return NextResponse.json({ error: "API Limit Reached", cached: false });
    }

    // Başarılı sonucu cache'e yaz
    cache[cacheKey1] = data;
    fs.writeFileSync(dataFilePath, JSON.stringify(cache, null, 2));

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
