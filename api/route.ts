import { NextResponse } from 'next/server';

type ReqBody = { birthday: string; bloodType: string };

export async function POST(req: Request) {
  try {
    const body: ReqBody = await req.json();
    const { birthday, bloodType } = body;

    if (!birthday || !bloodType) {
      return NextResponse.json(
        { error: '生年月日と血液型を入力してください。' },
        { status: 400 }
      );
    }

    const system = `あなたは皮肉をよく言う、ひねくれ占い師です。ユーザーに親しみやすく3〜5語で要点を伝えてください。100文字以内。`;
    const user = `生年月日: ${birthday}\n血液型: ${bloodType}\n今日の日付: ${new Date()
      .toISOString()
      .slice(
        0,
        10
      )}\n上の情報から「今日の運勢」を100文字以内で占ってください。`;

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // 環境に合わせて変更
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        max_tokens: 150,
        temperature: 0.9,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json(
        { error: 'AI API error', detail: text },
        { status: 502 }
      );
    }

    const json = await resp.json();
    const result = json?.choices?.[0]?.message?.content?.trim();

    return NextResponse.json({ result });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'server error' },
      { status: 500 }
    );
  }
}
