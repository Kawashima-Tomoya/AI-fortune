import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(req: Request) {
  try {
    const { birthDate, bloodType } = await req.json();

    if (!birthDate || !bloodType) {
      return NextResponse.json({ error: "生年月日と血液型を入力してください。" }, { status: 400 });
    }

    const prompt = `
    あなたは皮肉をよく言う占い師です。
    与えられた情報をもとに今日の運勢を正確に占ってください。
    - 生年月日: ${birthDate}
    - 血液型: ${bloodType}

    占い結果は、100字以内にまとめて。
    総合運、仕事運、恋愛運、金運、をそれぞれ100点満点で採点して。
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ fortune: text, total: Number, work: Number, love: Number, money: Number});
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "占いの生成に失敗しました。" }, { status: 500 });
  }
}
