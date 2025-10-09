'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Apple, Briefcase, Flame, Heart, Palette, Sparkles, Star, Zap } from 'lucide-react';
import { useState } from 'react';
import BackGround from '@/components/layout/back-ground';

interface FortuneResult {
  overall: string;
  love: string;
  work: string;
  luckyItem: string;
  luckyColor: string;
  rating: number;
}

type Mode = "normal" | "yumekawa" ;

export default function Page() {
  const [birthDate, setBirthDate] = useState('2000-10-07');
  const [bloodType, setBloodType] = useState('');
  const [fortune, setFortune] = useState<FortuneResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const todayKey = (birthDate: string, bloodType: string, mode: Mode) => {
    const t = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    return `fortune:${birthDate}:${bloodType}:${t}:${mode}`;
  };

  const callApi = async (mode: Mode) => {
    setError(null);
    
    if (!birthDate) return setError('生年月日を選んでください。');
    if (!bloodType) return setError('血液型を選んでください。');

    const key = todayKey(birthDate, bloodType, mode);
    const cached = localStorage.getItem(key);
    if (cached) {
      setFortune(JSON.parse(cached));
      return;
    }

    setLoading(true);
    setFortune(null);
    setError('');
    try {
      const res = await fetch('/api/fortune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthDate, bloodType, mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error('サーバーエラー');
      
      if (data) {
        setFortune(data);
        localStorage.setItem(key, data);
      } else {
        throw new Error('占いの結果が得られませんでした。');
      }
    } catch (e: any) {
      setError(e.message || '通信エラー');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    await callApi("normal");
  };

  return (
    <div className="min-h-screen bg-black/90 relative overflow-hidden">
      <BackGround />
      <div className='max-w-xl mx-auto p-10 '>
        <div className="flex items-center justify-center gap-3 mb-8">
          {/* <Zap className="w-10 h-10 text-cyan-400 animate-bounce" /> */}
          <h1 className="animate-pulse text-4xl text-center tracking-wider bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            今日のAI占い
          </h1>
          {/* <Flame className="w-10 h-10 text-orange-400 animate-pulse" /> */}
        </div>

        <div className='p-10 space-y-10 bg-gray-900/90 border-2 border-cyan-500/50 shadow-2xl shadow-cyan-500/20 rounded-lg'>
          <div>
            <label className="block">
              <div className="text-cyan-400 tracking-wide">生年月日</div>
              <input
                type="date"
                value={birthDate}
                max="9999-12-31"
                onChange={(e) => setBirthDate(e.target.value)}
                className="mt-2 w-full border rounded px-4 py-3"
              />
            </label>
          </div>

          <div>
            <label className="block">
              <div className="text-cyan-400 tracking-wide">血液型</div>
            </label>
            <div className="mt-2 grid grid-cols-4 gap-3 ">
              {['A', 'B', 'O', 'AB'].map((type) => (
                <Button
                  key={type}
                  onClick={() => setBloodType(type)}
                  className={`h-12 text-gray-200 tracking-wider border-2 transition-all duration-300 ${
                    bloodType === type
                      ? 'bg-black/30 border-cyan-400 shadow-lg shadow-cyan-400/50 scale-105'
                      : 'bg-black/50 border-gray-600  hover:border-cyan-500 hover:text-cyan-400 hover:shadow-lg hover:shadow-cyan-500/30'
                  }`}
                >
                  {type}型
                </Button>
              ))}
            </div>
          </div>
      
          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="h-12 text-white rounded disabled:opacity-50 col-span-2 text-lg bg-gradient-to-r from-purple-700 to-cyan-700 hover:from-purple-600 hover:to-cyan-600"
            >
              {loading ? '占っています...' : '占う'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setBirthDate('');
                setBloodType('');
                setFortune(null);
                setError(null);
              }}
              className="h-12 px-4 rounded text-white hover:text-white bg-gray-800 hover:bg-gray-900 border-2 border-gray-400 hover:border-white transition-all duration-300"

            >
              リセット
            </Button>
          </div>
        </div>
        {error && <p className="mt-6 text-red-600 font-semibold">{error}</p>}
       
        {fortune && (
          <Card className='mt-6 bg-gradient-to-br from-gray-900/80 to-black/80 border-2 border-orange-500/50 shadow-2xl shadow-orange-500/20 backdrop-blur-sm'>
            <CardHeader className="text-center border-b border-orange-500/50">
              <CardTitle className="text-2xl text-cyan-400/90">占い結果</CardTitle>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Star className="animate-pulse text-yellow-500 fill-yellow-500/70" />
                <span className="text-4xl text-center tracking-wider bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">{fortune.rating}点</span>
                <Star className="animate-pulse text-yellow-500 fill-yellow-500/70" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <Card className="text-gray-200 bg-transparent border-orange-600/40">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="animate-pulse text-purple-600" size={18} />
                    総合運
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{fortune.overall}</p>
                </CardContent>
              </Card>

              <Card className="text-gray-200 bg-transparent border-orange-600/40">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Heart className="animate-pulse text-pink-600" size={18} />
                    恋愛運
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{fortune.love}</p>
                </CardContent>
              </Card>

              <Card className="text-gray-200 bg-transparent border-orange-600/40">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Briefcase className="animate-pulse text-blue-600" size={18} />
                    仕事運
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{fortune.work}</p>
                </CardContent>
              </Card>

              <Card className="text-gray-200 bg-transparent border-orange-600/40">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Apple className="animate-pulse text-red-600" size={18} />
                    ラッキーアイテム
                  </CardTitle>
                </CardHeader>
                <CardContent >
                  <p className="text-sm">{fortune.luckyItem}</p>
                </CardContent>
              </Card>

              <Card className="text-gray-200 bg-transparent border-orange-600/40">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Palette className="animate-pulse text-teal-600" size={18} />
                    ラッキーカラー
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{fortune.luckyColor}</p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        )}
      </div>
      <Button
        onClick={() => callApi("yumekawa")}
        disabled={loading}
        className="
          h-12 text-white rounded disabled:opacity-50 col-span-2 text-lg 
          bg-gradient-to-r from-fuchsia-300 to-violet-400 hover:from-fuchsia-200 hover:to-violet-300"
      >
        {loading ? 'めっちゃ占い中...' : '夢かわモードで再度占う'}
      </Button>
    </div>
  );
}
