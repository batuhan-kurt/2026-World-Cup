import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

const REDIS_KEY = "worldcup:predictions";

export async function GET() {
  try {
    const data = await redis.get(REDIS_KEY);
    return NextResponse.json(data || []);
  } catch (error) {
    return NextResponse.json({ error: "Veri okunamadı." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    let data: any[] = (await redis.get(REDIS_KEY)) || [];
    if (!Array.isArray(data)) data = [];
    
    const newPrediction = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...body
    };
    
    data.push(newPrediction);
    await redis.set(REDIS_KEY, data);
    
    return NextResponse.json({ success: true, prediction: newPrediction });
  } catch (error) {
    return NextResponse.json({ error: "Veri kaydedilemedi." }, { status: 500 });
  }
}
