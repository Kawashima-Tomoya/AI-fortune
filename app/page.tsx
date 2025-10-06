'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Flame, Heart, Sparkles, Star, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert'
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

export default function FortuneCard() {
  const [birthDate, setBirthDate] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [fortune, setFortune] = useState<FortuneResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const todayKey = (birthDate: string, bloodType: string) => {
    const t = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    return `fortune:${birthDate}:${bloodType}:${t}`;
  };

  const handleSubmit = async () => {
    setError(null);

    console.log("Sending:", { birthDate, bloodType }); // 確認
    
    if (!birthDate) return setError('生年月日を選んでください。');
    if (!bloodType) return setError('血液型を選んでください。');

    const key = todayKey(birthDate, bloodType);
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
        body: JSON.stringify({ birthDate, bloodType }),
      });
      if (!res.ok) throw new Error('サーバーエラー');
      const data = await res.json();
      console.log(data);
      
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

  return (
    <div className="min-h-screen bg-black/90 relative overflow-hidden">
      <BackGround />

      <div className='max-w-xl mx-auto p-6 space-y-6  '>
      <div className="flex items-center justify-center gap-3 mb-4">
        <Zap className="w-10 h-10 text-cyan-400 animate-bounce" />
        <h1 className="text-4xl text-center tracking-wider bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          今日のAI占い
        </h1>
        <Flame className="w-10 h-10 text-orange-400 animate-pulse" />
      </div>

      <div>
        <label className="block">
          <div className="text-cyan-400">生年月日</div>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="mt-2 w-full border rounded px-4 py-3"
          />
        </label>
      </div>

      <div>
        <label className="block">
          <div className="text-cyan-400">血液型</div>
        </label>
        <div className="mt-2 grid grid-cols-4 gap-3 ">
          {['A', 'B', 'O', 'AB'].map((type) => (
            <Button
              key={type}
              onClick={() => setBloodType(type)}
              className={`py-6 font-semibold transition ${
                bloodType === type
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
          className="bg-purple-600 text-white py-6 rounded disabled:opacity-50 col-span-2 text-lg"
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
          className="px-4 py-6 rounded"
        >
          リセット
        </Button>
      </div>

      {error && <p className="text-red-600 font-semibold">{error}</p>}

      {fortune && (
          <Card>
            <CardHeader className="text-center border-b">
              <CardTitle className="text-2xl text-cyan-400">占い結果</CardTitle>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Star className="text-yellow-500 fill-yellow-500" />
                <span className="text-3xl font-bold text-purple-600">{fortune.rating}点</span>
                <Star className="text-yellow-500 fill-yellow-500" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="text-purple-600" size={18} />
                    総合運
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{fortune.overall}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-pink-50 to-red-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Heart className="text-pink-600" size={18} />
                    恋愛運
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{fortune.love}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Briefcase className="text-blue-600" size={18} />
                    仕事運
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{fortune.work}</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-yellow-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">ラッキーアイテム</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary" className="font-medium">
                      {fortune.luckyItem}
                    </Badge>
                  </CardContent>
                </Card>
                <Card className="bg-green-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">ラッキーカラー</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary" className="font-medium">
                      {fortune.luckyColor}
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
           )}
    </div>
    </div>
  );
}
