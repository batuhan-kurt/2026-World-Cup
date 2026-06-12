import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const dataFilePath = path.join(process.cwd(), "data", "predictions.json");

export async function GET() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      fs.writeFileSync(dataFilePath, "[]");
    }
    const data = fs.readFileSync(dataFilePath, "utf8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({ error: "Veri okunamadı." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!fs.existsSync(dataFilePath)) {
      fs.writeFileSync(dataFilePath, "[]");
    }
    const data = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
    
    const newPrediction = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...body
    };
    
    data.push(newPrediction);
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    
    return NextResponse.json({ success: true, prediction: newPrediction });
  } catch (error) {
    return NextResponse.json({ error: "Veri kaydedilemedi." }, { status: 500 });
  }
}
