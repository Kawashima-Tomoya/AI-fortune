import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Mode } from "@/app/page";

type ReqBody = {
  birthDate?: string;
  bloodType?: string;
  mode?: Mode;
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

function buildPrompt(birthDate: string, bloodType: string, mode: Mode) {
  const base = `
    与えられた情報をもとに今日の運勢を占ってください。
    - 生年月日: ${birthDate}
    - 血液型: ${bloodType}

    占い結果は簡潔に50字以内で。
    luckyItemとluckyColorは奇をてらって提案して。
    JSONのみ返して:{"overall":"総合運","love":"恋愛運","work":"仕事運","luckyItem":"アイテム","luckyColor":"色","rating":数値1-100}`;

  if (mode === "yumekawa") {
    return (
      `あなたはユーモアのある、ゆめかわギャル占い師です。` + base
    );
  } else {
    return  `あなたは皮肉をよく言う、ベテラン占い師です。` + base;
  }
}


export async function POST(req: Request) {
  try {
    const { birthDate, bloodType, mode } = await req.json();

    if (!birthDate || !bloodType) {
      return NextResponse.json({ error: "生年月日と血液型を入力してください。" }, { status: 400 });
    }
    const prompt = buildPrompt(birthDate, bloodType, mode || "normal");
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'AI応答の解析に失敗しました' },
        { status: 500 }
      );
    }

    const fortune = JSON.parse(jsonMatch[0]);
    return NextResponse.json(fortune);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "占いの生成に失敗しました。" }, { status: 500 });
  }
}
