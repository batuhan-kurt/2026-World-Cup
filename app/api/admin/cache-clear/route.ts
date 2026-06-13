import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const globalAny: any = global;
    
    // Clear the memory cache
    globalAny.hybridMatchCache = {};
    globalAny.apiFootballDailyMap = {};

    return NextResponse.json({ success: true, message: "Önbellek başarıyla temizlendi." });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Önbellek temizlenirken hata oluştu." }, { status: 500 });
  }
}
