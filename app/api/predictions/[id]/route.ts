import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const dataFilePath = path.join(process.cwd(), "data", "predictions.json");

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    if (!fs.existsSync(dataFilePath)) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const data = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
    const newData = data.filter((d: any) => d.id !== params.id);
    fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Could not delete" }, { status: 500 });
  }
}
