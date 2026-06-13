import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

const REDIS_KEY = "worldcup:predictions";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    let data: any[] = (await redis.get(REDIS_KEY)) || [];
    if (!Array.isArray(data)) data = [];
    
    const newData = data.filter((p: any) => p.id !== params.id);
    await redis.set(REDIS_KEY, newData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Veri silinemedi." }, { status: 500 });
  }
}
