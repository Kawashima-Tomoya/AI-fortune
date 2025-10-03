import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: Request) {
  try {
    const { birthDate, bloodType } = await req.json();

    if (!birthDate || !bloodType) {
      return NextResponse.json({ error: "生年月日と血液型を入力してください。" }, { status: 400 });
    }

    const prompt = `
    あなたは皮肉をよく言う辛口占い師です。
    今日の運勢を占ってください。
    - 生年月日: ${birthDate}
    - 血液型: ${bloodType}
    占い結果は、与えられた情報を繰り返さず、120字以内にまとめてください。
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ fortune: text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "占いの生成に失敗しました。" }, { status: 500 });
  }
}
