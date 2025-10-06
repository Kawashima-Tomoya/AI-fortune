// app/api/fortune/route.ts
import { NextResponse } from "next/server";

console.log("API route /api/fortune loaded"); // 起動時に出るはず

export async function GET() {
  return NextResponse.json({ ok: true, msg: "fortune API is alive (GET)" });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received body:", body);
    const { birthDate, bloodType } = body || {};
    if (!birthDate || !bloodType) {
      return NextResponse.json({ error: "生年月日と血液型が必要です" }, { status: 400 });
    }
    const fortune = `（ダミー）${birthDate}生まれ・${bloodType}型の今日の運勢はラッキー！`;
    return NextResponse.json({ fortune });
  } catch (err: any) {
    console.error("[/api/fortune] error:", err);
    return NextResponse.json({ error: err.message || "server error" }, { status: 500 });
  }
}
